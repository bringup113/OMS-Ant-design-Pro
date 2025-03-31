import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, In } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { PaymentRecord } from './entities/payment-record.entity';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { CreatePaymentRecordDto } from './dto/create-payment-record.dto';
import { Order } from '../orders/entities/order.entity';
import { BillStyleTemplate } from '../bill-style/entities/bill-style-template.entity';
import { DataPermissionsService } from '../permissions/data-permissions.service';

// 定义账单状态类型
type BillStatus = 'paid' | 'partially_paid' | 'unpaid';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(BillStyleTemplate)
    private billStyleRepository: Repository<BillStyleTemplate>,
    @InjectRepository(PaymentRecord)
    private paymentRecordRepository: Repository<PaymentRecord>,
    private dataSource: DataSource,
    private dataPermissionsService: DataPermissionsService,
  ) {}

  async create(createBillDto: CreateBillDto, userId: number): Promise<Bill> {
    // 使用事务来保证数据一致性
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // 1. 检查是否存在指定的账单样式模板
      const billTemplate = await manager.findOne(BillStyleTemplate, {
        where: { id: createBillDto.templateId },
      });

      if (!billTemplate) {
        throw new NotFoundException(`账单样式模板 #${createBillDto.templateId} 不存在`);
      }

      // 2. 检查订单是否存在且未生成账单
      const orders = await manager.find(Order, {
        where: { id: In(createBillDto.orderIds) },
        relations: ['customer', 'supplier'],  // 添加supplier关联
      });

      if (!orders || orders.length === 0) {
        throw new BadRequestException('未找到有效的订单');
      }

      if (orders.length !== createBillDto.orderIds.length) {
        throw new BadRequestException('部分订单不存在');
      }

      // 检查订单是否已经生成账单
      const billedOrders = orders.filter(order => order.accountStatus === 'billed');
      if (billedOrders.length > 0) {
        throw new BadRequestException(`订单 #${billedOrders.map(o => o.id).join(', ')} 已生成账单`);
      }

      // 检查所有订单是否来自同一个供应商
      const supplierIds = [...new Set(orders.map(order => order.supplierId))];
      if (supplierIds.length > 1) {
        throw new BadRequestException('不能为来自不同供应商的订单创建同一个账单');
      }

      // 3. 计算账单总金额
      const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

      // 4. 创建新账单
      const bill = manager.create(Bill, {
        templateId: createBillDto.templateId,
        totalAmount: totalAmount.toString(),
        status: 'unpaid', // 默认为未支付
        remark: createBillDto.remark || '',
        createdBy: userId,
        // 如果所有订单都来自同一个代理，则设置账单代理为该代理
        agentId: orders.length > 0 && orders.every(o => o.agentId === orders[0].agentId)
          ? orders[0].agentId
          : null,
      });

      // 5. 保存账单
      const savedBill = await manager.save(bill);

      // 6. 更新订单的账单关联和状态
      for (const order of orders) {
        order.billId = savedBill.id;
        order.accountStatus = 'billed';
        await manager.save(order);
      }

      return savedBill;
    });
  }

  async findAll(user?: any): Promise<Bill[]> {
    // 创建查询构建器
    const queryBuilder = this.billRepository.createQueryBuilder('bill')
      .leftJoinAndSelect('bill.orders', 'order')
      .leftJoinAndSelect('order.customer', 'customer')
      .innerJoinAndSelect('order.supplier', 'supplier')  // 使用innerJoin确保只返回有供应商的订单
      .leftJoinAndSelect('bill.paymentRecords', 'paymentRecord')
      .orderBy('bill.createdAt', 'DESC');
    
    // 添加数据权限过滤
    if (user) {
      // 获取数据权限过滤条件
      const dataPermission = await this.dataPermissionsService.getDataFilter(user, 'bill');
      
      // 应用数据权限过滤
      if (dataPermission && dataPermission.filter) {
        queryBuilder.andWhere(dataPermission.filter, dataPermission.params);
      }
    }
    
    // 执行查询
    const bills = await queryBuilder.getMany();

    // 计算每个账单的已付款金额
    const billsWithPayments = await Promise.all(
      bills.map(bill => this.getBillWithPaymentAmount(bill))
    );
    
    // 返回结果
    return billsWithPayments;
  }

  async findOne(id: number): Promise<Bill> {
    const bill = await this.billRepository.createQueryBuilder('bill')
      .leftJoinAndSelect('bill.orders', 'order')
      .leftJoinAndSelect('order.customer', 'customer')
      .innerJoinAndSelect('order.supplier', 'supplier')  // 使用innerJoin确保只返回有供应商的订单
      .leftJoinAndSelect('bill.paymentRecords', 'paymentRecord')
      .where('bill.id = :id', { id })
      .getOne();

    if (!bill) {
      throw new NotFoundException(`账单 #${id} 不存在`);
    }

    return this.getBillWithPaymentAmount(bill);
  }

  async update(id: number, updateBillDto: UpdateBillDto): Promise<Bill> {
    const bill = await this.findOne(id);

    // 确保状态值是有效的枚举值
    if (updateBillDto.status) {
      if (!['paid', 'partially_paid', 'unpaid'].includes(updateBillDto.status)) {
        throw new BadRequestException('无效的账单状态');
      }
      bill.status = updateBillDto.status as BillStatus;
    }

    // 使用事务处理状态更新
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // 更新账单属性
      if (updateBillDto.remark !== undefined) {
        bill.remark = updateBillDto.remark;
      }

      // 状态变更逻辑
      if (updateBillDto.status !== undefined && bill.status !== updateBillDto.status) {
        bill.status = updateBillDto.status as BillStatus;
        
        // 获取关联的订单
        const orders = await manager.find(Order, { where: { billId: id } });
        console.log(`找到 ${orders.length} 个关联订单需要更新支付状态`);
        
        // 更新订单支付状态
        for (const order of orders) {
          // 当账单状态为已结算时，更新订单为已支付
          // 当账单状态为未结算或部分结算时，更新订单为未支付
          order.paymentStatus = updateBillDto.status === 'paid' ? 'paid' : 'unpaid';
          console.log(`更新订单 #${order.id} 的支付状态为 ${order.paymentStatus}`);
          await manager.save(Order, order);
        }
      }
      
      const savedBill = await manager.save(Bill, bill);
      return savedBill;
    });
  }

  async remove(id: number): Promise<void> {
    try {
      console.log(`开始删除账单 #${id}`);
      
      // 先检查账单是否存在
      const bill = await this.billRepository.findOne({
        where: { id },
        relations: ['paymentRecords'] // 加载付款记录关系
      });
      
      if (!bill) {
        throw new NotFoundException(`账单 #${id} 不存在`);
      }
      
      console.log(`找到账单 #${id}，状态: ${bill.status}, 付款记录数: ${bill.paymentRecords?.length || 0}`);
      
      // 使用事务进行删除操作
      await this.dataSource.transaction(async (manager: EntityManager) => {
        try {
          // 1. 先删除所有关联的付款记录
          if (bill.paymentRecords && bill.paymentRecords.length > 0) {
            console.log(`删除账单 #${id} 的 ${bill.paymentRecords.length} 条付款记录`);
            await manager.remove(bill.paymentRecords);
          } else {
            // 即使没有关联的付款记录，也尝试查询并删除可能存在的付款记录
            const paymentRecords = await manager.find(PaymentRecord, {
              where: { billId: id }
            });
            
            if (paymentRecords.length > 0) {
              console.log(`未在账单关系中找到，但通过查询找到 ${paymentRecords.length} 条付款记录，正在删除...`);
              await manager.remove(paymentRecords);
            }
          }
          
          // 2. 将相关订单的账单状态恢复为未生成账单
          const orders = await manager.find(Order, {
            where: { billId: id },
          });
          console.log(`删除账单 #${id}，找到 ${orders.length} 个关联订单需要重置状态`);

          for (const order of orders) {
            console.log(`重置订单 #${order.id} 的账单关联和支付状态`);
            order.accountStatus = 'unbilled';
            order.billId = null;
            
            // 同时更新订单支付状态为未支付
            order.paymentStatus = 'unpaid';
            
            await manager.save(Order, order);
          }

          // 3. 删除账单本身
          console.log(`正在删除账单 #${id}`);
          await manager.remove(bill);
          console.log(`账单 #${id} 删除成功`);
        } catch (error) {
          console.error(`事务内删除账单失败:`, error);
          throw error; // 重新抛出错误以触发事务回滚
        }
      });
    } catch (error) {
      console.error(`删除账单 #${id} 失败:`, error.stack || error.message || error);
      throw error; // 将错误传播给控制器
    }
  }

  async getOrdersByBillId(billId: number): Promise<Order[]> {
    const bill = await this.findOne(billId);
    
    // 查询订单和相关信息
    const orders = await this.orderRepository.find({
      where: { billId: bill.id },
      relations: [
        'customer',
        'businesses',
        'businesses.product',
        'supplier'  // 直接从订单表关联供应商
      ],
      order: {
        id: 'ASC',
        businesses: {
          id: 'ASC'
        }
      }
    });

    // 确保所有需要的关联数据都已加载
    return orders;
  }

  // 获取账单时计算已付款总额
  private async getBillWithPaymentAmount(bill: Bill): Promise<Bill> {
    // 获取所有付款记录
    const paymentRecords = await this.paymentRecordRepository.find({
      where: { billId: bill.id }
    });
    
    // 计算已付款总额
    const paidAmount = paymentRecords.reduce(
      (sum, record) => sum + parseFloat(record.amount), 
      0
    ).toFixed(2);
    
    // 将已付款总额附加到账单对象上
    return {
      ...bill,
      paymentRecords,
      paidAmount
    };
  }

  // 添加付款记录
  async addPaymentRecord(
    billId: number, 
    createPaymentRecordDto: CreatePaymentRecordDto,
    userId: number
  ): Promise<PaymentRecord> {
    const bill = await this.findOne(billId);
    
    // 使用事务进行操作
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // 1. 创建并保存付款记录
      const paymentRecord = new PaymentRecord();
      paymentRecord.billId = billId;
      paymentRecord.amount = createPaymentRecordDto.amount.toString();
      paymentRecord.remark = createPaymentRecordDto.remark || '';
      paymentRecord.paymentMethod = createPaymentRecordDto.paymentMethod || 'cash';
      paymentRecord.createdBy = userId;
      
      // 保存新的付款记录
      console.log(`添加账单 #${billId} 的新付款记录: $${paymentRecord.amount}`);
      const savedRecord = await manager.save(paymentRecord);
      
      // 2. 查询并计算该账单的所有付款记录总金额
      const allPaymentRecords = await manager.find(PaymentRecord, {
        where: { billId }
      });
      
      const totalPaid = allPaymentRecords.reduce(
        (sum, record) => sum + parseFloat(record.amount), 
        0
      );
      
      console.log(`账单 #${billId} 总金额: $${bill.totalAmount}, 已付金额: $${totalPaid}`);
      const billTotalAmount = parseFloat(bill.totalAmount);
      
      // 3. 获取账单当前状态
      const oldStatus = bill.status;
      
      // 4. 确定新的账单状态
      let newStatus: string;
      if (totalPaid >= billTotalAmount) {
        // 如果付款总额大于或等于账单总额，则标记为已付清
        newStatus = 'paid';
      } else if (totalPaid > 0) {
        // 如果付款总额大于0但小于账单总额，则标记为部分付款
        newStatus = 'partially_paid';
      } else {
        newStatus = 'unpaid';
      }
      
      console.log(`账单状态变化: ${oldStatus} -> ${newStatus}`);
      
      // 5. 如果状态发生变化，更新关联订单的支付状态
      if (oldStatus !== newStatus) {
        // 获取所有关联订单
        const orders = await manager.find(Order, { where: { billId } });
        console.log(`付款状态变化：${oldStatus} -> ${newStatus}，找到 ${orders.length} 个关联订单需要更新`);
        
        // 只有在状态变为已结算时，更新订单为已支付
        if (newStatus === 'paid') {
          for (const order of orders) {
            order.paymentStatus = 'paid';
            console.log(`更新订单 #${order.id} 的支付状态为已支付`);
            await manager.save(Order, order);
          }
        } else if (oldStatus === 'paid') {
          // 如果从已结算变为其他状态，将订单改为未支付
          for (const order of orders) {
            order.paymentStatus = 'unpaid';
            console.log(`更新订单 #${order.id} 的支付状态为未支付`);
            await manager.save(Order, order);
          }
        }
      }
      
      // 6. 更新账单状态
      const billToUpdate = await manager.findOne(Bill, { where: { id: billId } });
      if (billToUpdate) {
        billToUpdate.status = newStatus as BillStatus;
        await manager.save(billToUpdate);
      }
      
      return savedRecord;
    });
  }
  
  // 获取账单的付款记录
  async getBillPaymentRecords(billId: number): Promise<PaymentRecord[]> {
    const bill = await this.billRepository.findOne({
      where: { id: billId }
    });
    
    if (!bill) {
      throw new NotFoundException(`账单 #${billId} 不存在`);
    }
    
    return this.paymentRecordRepository.find({
      where: { billId },
      order: { createdAt: 'DESC' }
    });
  }
  
  // 删除付款记录
  async removePaymentRecord(id: number): Promise<void> {
    const paymentRecord = await this.paymentRecordRepository.findOne({
      where: { id },
      relations: ['bill']
    });
    
    if (!paymentRecord) {
      throw new NotFoundException(`付款记录 #${id} 不存在`);
    }
    
    console.log(`删除付款记录 #${id}, 账单ID: ${paymentRecord.billId}, 金额: $${paymentRecord.amount}`);
    
    // 使用事务删除记录并更新账单状态
    await this.dataSource.transaction(async (manager: EntityManager) => {
      // 1. 获取账单当前状态及其关联的付款记录
      const currentBill = await manager.findOne(Bill, {
        where: { id: paymentRecord.billId }
      });
      
      const oldStatus = currentBill?.status || 'unpaid';
      console.log(`删除前账单 #${paymentRecord.billId} 状态: ${oldStatus}`);
      
      // 2. 删除当前付款记录
      await manager.remove(paymentRecord);
      console.log(`付款记录 #${id} 已删除`);
      
      // 3. 获取剩余的付款记录
      const remainingRecords = await manager.find(PaymentRecord, {
        where: { billId: paymentRecord.billId }
      });
      
      console.log(`账单 #${paymentRecord.billId} 剩余 ${remainingRecords.length} 条付款记录`);
      
      // 4. 获取账单实例
      const bill = await manager.findOne(Bill, {
        where: { id: paymentRecord.billId }
      });
      
      if (bill) {
        // 5. 计算剩余付款总额
        const totalPaid = remainingRecords.reduce(
          (sum, record) => sum + parseFloat(record.amount), 
          0
        );
        
        console.log(`账单 #${bill.id} 总金额: $${bill.totalAmount}, 剩余已付金额: $${totalPaid}`);
        const billTotalAmount = parseFloat(bill.totalAmount);
        
        // 6. 确定新的账单状态
        let newStatus: string;
        if (totalPaid >= billTotalAmount) {
          bill.status = 'paid';
          newStatus = 'paid';
        } else if (totalPaid > 0) {
          bill.status = 'partially_paid';
          newStatus = 'partially_paid';
        } else {
          bill.status = 'unpaid';
          newStatus = 'unpaid';
        }
        
        console.log(`删除后账单状态变化: ${oldStatus} -> ${newStatus}`);
        
        // 7. 如果状态发生变化，更新关联订单的支付状态
        if (oldStatus !== newStatus) {
          // 获取所有关联订单
          const orders = await manager.find(Order, { where: { billId: paymentRecord.billId } });
          console.log(`删除付款记录导致状态变化：${oldStatus} -> ${newStatus}，找到 ${orders.length} 个关联订单需要更新`);
          
          // 只有在状态变为已结算时，更新订单为已支付，或从已结算变为其他状态
          if (newStatus === 'paid') {
            for (const order of orders) {
              order.paymentStatus = 'paid';
              console.log(`更新订单 #${order.id} 的支付状态为已支付`);
              await manager.save(Order, order);
            }
          } else if (oldStatus === 'paid') {
            // 如果从已结算变为其他状态，将订单改为未支付
            for (const order of orders) {
              order.paymentStatus = 'unpaid';
              console.log(`更新订单 #${order.id} 的支付状态为未支付`);
              await manager.save(Order, order);
            }
          }
        }
        
        await manager.save(bill);
      }
    });
  }

  async updateStatus(id: number, newStatus: string): Promise<any> {
    const billToUpdate = await this.findOne(id);
    
    // 确保状态值是有效的枚举值
    if (!['paid', 'partially_paid', 'unpaid'].includes(newStatus)) {
      throw new BadRequestException('无效的账单状态');
    }
    
    billToUpdate.status = newStatus as BillStatus;
    
    // ... 其他代码 ...
  }
} 