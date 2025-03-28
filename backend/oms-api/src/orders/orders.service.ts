import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Brackets } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderBusiness } from './entities/order-business.entity';
import { OrderComment } from './entities/order-comment.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CustomersService } from '../customers/customers.service';
import { CreateOrderCommentDto } from './dto/create-order-comment.dto';
import { UsersService } from '../users/users.service';
import { AgentProfitService } from '../profit/agent-profit/agent-profit.service';
import { SupplierProfitService } from '../profit/supplier-profit/supplier-profit.service';
import { Agent } from '../agents/entities/agent.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { AgentProfit } from '../profit/agent-profit/entities/agent-profit.entity';
import { SupplierProfit } from '../profit/supplier-profit/entities/supplier-profit.entity';
import { DataPermissionsService } from '../permissions/data-permissions.service';
import { GetOrdersDto } from './dto/get-orders.dto';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderBusiness)
    private readonly orderBusinessRepository: Repository<OrderBusiness>,
    @InjectRepository(OrderComment)
    private readonly orderCommentRepository: Repository<OrderComment>,
    private readonly customersService: CustomersService,
    private readonly usersService: UsersService,
    private dataSource: DataSource,
    @Inject(forwardRef(() => AgentProfitService))
    private readonly agentProfitService: AgentProfitService,
    @Inject(forwardRef(() => SupplierProfitService))
    private readonly supplierProfitService: SupplierProfitService,
    @InjectRepository(Agent)
    private readonly agentsRepository: Repository<Agent>,
    private readonly dataPermissionsService: DataPermissionsService,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 处理客户信息
      let customerId = createOrderDto.customerId;
      
      // 如果没有客户ID但有客户信息，则创建新客户
      if (!customerId && createOrderDto.customer) {
        const newCustomer = await this.customersService.create(createOrderDto.customer);
        customerId = newCustomer.id;
      } else if (!customerId) {
        throw new BadRequestException('必须提供客户ID或客户信息');
      }

      // 创建订单
      const orderData = {
        customerId,
        totalAmount: createOrderDto.totalAmount,
        paymentStatus: createOrderDto.paymentStatus,
        accountStatus: createOrderDto.accountStatus,
        agentId: createOrderDto.agentId,
        remark: createOrderDto.remark,
        createdBy: user?.id,
      };

      const order = this.orderRepository.create(orderData);
      const savedOrder = await this.orderRepository.save(order);

      // 创建订单业务信息（多条）
      const orderBusinesses: OrderBusiness[] = [];
      for (const business of createOrderDto.businesses) {
        const businessData = {
          orderId: savedOrder.id,
          productId: business.productId,
          supplierId: business.supplierId,
          costPrice: business.costPrice,
          agentPrice: business.agentPrice,
          salePrice: business.salePrice,
          status: business.status,
          remark: business.remark,
        };

        const orderBusiness = this.orderBusinessRepository.create(businessData);
        const savedBusiness = await this.orderBusinessRepository.save(orderBusiness);
        orderBusinesses.push(savedBusiness);
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        data: {
          ...savedOrder,
          businesses: orderBusinesses,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: GetOrdersDto, user: User) {
    try {
      console.log('开始查询订单列表，参数:', JSON.stringify(query));
      
      const { keyword, status, startDate, endDate, customerId, billId } = query;
      const take = query.pageSize ? +query.pageSize : 10;
      const skip = query.current && query.pageSize ? (+query.current - 1) * +query.pageSize : 0;

      // 获取数据权限过滤条件
      const dataPermission = await this.dataPermissionsService.getDataFilter(user, 'order');
      console.log('获取到的数据权限过滤条件:', {
        filter: dataPermission.filter,
        params: dataPermission.params
      });
      
      // 使用标准的find方法而不是queryBuilder，避免复杂JOIN带来的问题
      const findOptions: any = {
        skip,
        take,
        order: { createdAt: 'DESC' },
        relations: ['customer', 'businesses', 'businesses.product', 'businesses.supplier', 'agent']
      };
      
      // 构建查询条件
      const whereConditions: any = {};
      
      // 应用状态筛选
      if (status) {
        whereConditions.status = status;
      }
      
      // 应用客户筛选
      if (customerId) {
        whereConditions.customerId = customerId;
      }
      
      // 应用账单筛选
      if (billId) {
        whereConditions.billId = billId;
      }

      // 添加日期范围筛选
      if (startDate || endDate) {
        whereConditions.createdAt = {};
        if (startDate) {
          whereConditions.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          whereConditions.createdAt.lte = new Date(endDate);
        }
      }
      
      // 如果有数据权限过滤，并且不是"全部数据"
      if (dataPermission.filter && dataPermission.filter !== '1=1') {
        if (dataPermission.params && dataPermission.params.organizationId) {
          // 对于组织数据范围，过滤客户的组织ID
          whereConditions.customer = {
            organizationId: dataPermission.params.organizationId
          };
        }
      }
      
      // 将构建的条件添加到find选项
      findOptions.where = whereConditions;
      
      console.log('执行查询，条件:', JSON.stringify(findOptions));
      
      // 执行查询
      const [orders, total] = await this.orderRepository.findAndCount(findOptions);
      
      // 如果有关键字搜索，我们需要在内存中过滤结果
      // 注意：这种方式不是最高效的，但对于小数据集是可行的
      let filteredOrders = orders;
      if (keyword) {
        filteredOrders = orders.filter(order => 
          (order.customer?.name && order.customer.name.includes(keyword)) || 
          (order.customer?.passportNo && order.customer.passportNo.includes(keyword)) || 
          (order.businesses?.some(b => b.supplier?.name && b.supplier.name.includes(keyword))) ||
          (order.agent?.name && order.agent.name.includes(keyword)) ||
          order.id.toString().includes(keyword)
        );
      }
      
      console.log(`查询到 ${filteredOrders.length} 条订单数据`);
      
      return {
        data: filteredOrders,
        total: keyword ? filteredOrders.length : total,
        success: true,
      };
    } catch (error) {
      console.error('查询订单列表时发生错误:', error);
      throw new Error(`查询订单列表失败: ${error.message}`);
    }
  }

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'businesses', 'businesses.product', 'businesses.supplier'],
    });

    if (!order) {
      throw new NotFoundException(`订单ID ${id} 不存在`);
    }

    // 根据业务状态计算订单状态
    const orderStatus = this.calculateOrderStatus(order.businesses);

    return {
      success: true,
      data: {
        ...order,
        status: orderStatus
      },
    };
  }

  // 计算订单状态的辅助方法
  private calculateOrderStatus(businesses: OrderBusiness[]): string {
    if (!businesses || businesses.length === 0) {
      return 'pending';
    }

    // 检查是否所有业务都是已取消
    const allCancelled = businesses.every(business => business.status === 'cancelled');
    if (allCancelled) {
      return 'cancelled';
    }

    // 检查是否所有业务都是已完成
    const allCompleted = businesses.every(business => business.status === 'completed');
    if (allCompleted) {
      return 'completed';
    }

    // 检查是否有任何业务处于处理中
    const anyProcessing = businesses.some(business => business.status === 'processing');
    if (anyProcessing) {
      return 'processing';
    }

    // 默认情况，有待处理的业务
    return 'pending';
  }

  async update(id: number, updateOrderDto: any) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`订单ID ${id} 不存在`);
    }

    // 更新订单信息
    if (updateOrderDto.totalAmount) order.totalAmount = updateOrderDto.totalAmount;
    if (updateOrderDto.paymentStatus) order.paymentStatus = updateOrderDto.paymentStatus;
    if (updateOrderDto.accountStatus) order.accountStatus = updateOrderDto.accountStatus;
    if (updateOrderDto.agentId !== undefined) order.agentId = updateOrderDto.agentId;
    if (updateOrderDto.remark !== undefined) order.remark = updateOrderDto.remark;
    
    // 处理客户ID变更
    if (updateOrderDto.customerId && updateOrderDto.customerId !== order.customerId) {
      order.customerId = updateOrderDto.customerId;
    }
    
    // 保存订单更新
    await this.orderRepository.save(order);

    // 如果包含客户信息，更新客户信息
    if (updateOrderDto.customer || (updateOrderDto.name && updateOrderDto.passportNo)) {
      let customer;
      // 获取客户实体
      if (order.customerId) {
        customer = await this.customersService.findOne(order.customerId);
      }
      
      if (customer) {
        // 构建客户更新数据
        const customerUpdateDto: any = {};
        
        // 从updateOrderDto直接获取客户信息
        if (updateOrderDto.name) customerUpdateDto.name = updateOrderDto.name;
        if (updateOrderDto.passportNo) customerUpdateDto.passportNo = updateOrderDto.passportNo;
        if (updateOrderDto.gender) customerUpdateDto.gender = updateOrderDto.gender;
        if (updateOrderDto.country) customerUpdateDto.country = updateOrderDto.country;
        if (updateOrderDto.birthDate) customerUpdateDto.birthDate = updateOrderDto.birthDate;
        if (updateOrderDto.passportIssueDate) customerUpdateDto.issueDate = updateOrderDto.passportIssueDate;
        if (updateOrderDto.passportExpiryDate) customerUpdateDto.expiryDate = updateOrderDto.passportExpiryDate;
        
        // 或者从嵌套的customer对象获取客户信息
        if (updateOrderDto.customer) {
          if (updateOrderDto.customer.name) customerUpdateDto.name = updateOrderDto.customer.name;
          if (updateOrderDto.customer.passportNo) customerUpdateDto.passportNo = updateOrderDto.customer.passportNo;
          if (updateOrderDto.customer.gender) customerUpdateDto.gender = updateOrderDto.customer.gender;
          if (updateOrderDto.customer.country) customerUpdateDto.country = updateOrderDto.customer.country;
          if (updateOrderDto.customer.birthDate) customerUpdateDto.birthDate = updateOrderDto.customer.birthDate;
          if (updateOrderDto.customer.issueDate) customerUpdateDto.issueDate = updateOrderDto.customer.issueDate;
          if (updateOrderDto.customer.expiryDate) customerUpdateDto.expiryDate = updateOrderDto.customer.expiryDate;
        }
        
        // 更新客户信息
        if (Object.keys(customerUpdateDto).length > 0) {
          await this.customersService.update(order.customerId, customerUpdateDto);
        }
      }
    }

    // 如果包含业务信息，也更新业务信息
    if (updateOrderDto.business && updateOrderDto.businessId) {
      const business = await this.orderBusinessRepository.findOne({ 
        where: { id: updateOrderDto.businessId, orderId: id } 
      });

      if (business) {
        if (updateOrderDto.business.status) business.status = updateOrderDto.business.status;
        if (updateOrderDto.business.remark !== undefined) business.remark = updateOrderDto.business.remark;
        
        await this.orderBusinessRepository.save(business);
      }
    }
    
    // 如果包含业务数组，更新所有业务
    if (updateOrderDto.businesses && Array.isArray(updateOrderDto.businesses)) {
      // 获取当前订单的所有业务
      const existingBusinesses = await this.orderBusinessRepository.find({
        where: { orderId: id }
      });
      
      // 创建业务ID映射，用于快速查找
      const businessMap = new Map();
      existingBusinesses.forEach(business => {
        businessMap.set(business.id, business);
      });
      
      // 处理每个业务数据
      for (const businessDto of updateOrderDto.businesses) {
        if (businessDto.id && businessMap.has(businessDto.id)) {
          // 更新现有业务
          const business = businessMap.get(businessDto.id);
          if (businessDto.productId) business.productId = businessDto.productId;
          if (businessDto.supplierId) business.supplierId = businessDto.supplierId;
          if (businessDto.costPrice) business.costPrice = businessDto.costPrice;
          if (businessDto.agentPrice !== undefined) business.agentPrice = businessDto.agentPrice;
          if (businessDto.salePrice) business.salePrice = businessDto.salePrice;
          if (businessDto.status) business.status = businessDto.status;
          if (businessDto.remark !== undefined) business.remark = businessDto.remark;
          
          await this.orderBusinessRepository.save(business);
          
          // 从映射中移除已处理的业务
          businessMap.delete(business.id);
        } else {
          // 创建新业务
          const newBusiness = this.orderBusinessRepository.create({
            orderId: id,
            productId: businessDto.productId,
            supplierId: businessDto.supplierId,
            costPrice: businessDto.costPrice,
            agentPrice: businessDto.agentPrice,
            salePrice: businessDto.salePrice,
            status: businessDto.status || 'pending',
            remark: businessDto.remark,
          });
          
          await this.orderBusinessRepository.save(newBusiness);
        }
      }
      
      // 删除未在更新数据中出现的业务
      if (updateOrderDto.deleteRemovedBusinesses !== false) {
        for (const [id, business] of businessMap.entries()) {
          await this.orderBusinessRepository.remove(business);
        }
      }
    }

    return {
      success: true,
      data: await this.findOne(id).then(res => res.data),
    };
  }

  async remove(id: number) {
    const order = await this.orderRepository.findOne({ 
      where: { id },
      relations: ['bill']
    });
    
    if (!order) {
      throw new NotFoundException(`订单ID ${id} 不存在`);
    }
    
    // 检查订单是否关联了账单
    if (order.bill || order.billId) {
      throw new BadRequestException(`订单ID ${id} 已关联账单，无法删除。请先从账单中移除该订单。`);
    }

    // 查询并删除相关的利润记录
    try {
      // 1. 删除相关的供应商利润记录
      await this.dataSource.createQueryBuilder()
        .delete()
        .from('supplier_profits')
        .where('order_id = :orderId', { orderId: id })
        .execute();
        
      // 2. 删除相关的代理商利润记录
      await this.dataSource.createQueryBuilder()
        .delete()
        .from('agent_profits')
        .where('order_id = :orderId', { orderId: id })
        .execute();

      // 3. 删除订单
      await this.orderRepository.remove(order);
      
      return {
        success: true,
        message: `订单ID ${id} 已成功删除`,
      };
    } catch (error) {
      console.error('删除订单失败:', error);
      throw new BadRequestException(`删除订单失败: ${error.message}`);
    }
  }

  /**
   * 更新业务状态
   * @param orderId 订单ID
   * @param businessId 业务ID
   * @param status 新状态
   */
  async updateOrderBusinessStatus(orderId: number, businessId: number, status: string): Promise<any> {
    // 获取订单业务
    const business = await this.orderBusinessRepository.findOne({
      where: { id: businessId, orderId },
      relations: ['order', 'product', 'supplier']
    });

    if (!business) {
      throw new NotFoundException(`Order business with ID ${businessId} not found`);
    }
    
    // 如果状态没有变化，直接返回，避免重复处理
    if (business.status === status) {
      return {
        success: true,
        message: '业务状态未变更',
        data: business,
      };
    }

    // 更新状态
    business.status = status;
    const updatedBusiness = await this.orderBusinessRepository.save(business);
    
    // 如果状态为已完成，则生成利润数据
    if (status === 'completed') {
      try {
        // 获取完整订单信息，确保关系正确
        const order = await this.orderRepository.findOne({
          where: { id: orderId },
          relations: ['agent']
        });
        
        // 重新加载业务对象，确保包含所有需要的关系和字段
        const fullBusiness = await this.orderBusinessRepository
          .createQueryBuilder('business')
          .leftJoinAndSelect('business.supplier', 'supplier')
          .leftJoinAndSelect('business.product', 'product')
          .where('business.id = :id', { id: businessId })
          .getOne();
        
        if (!fullBusiness) {
          throw new NotFoundException(`无法加载完整业务信息，ID: ${businessId}`);
        }
        
        // 补充检查供应商信息
        if (!fullBusiness.supplier) {
          console.error('警告: 业务记录缺少供应商信息', businessId);
          // 尝试手动加载供应商
          const supplier = await this.dataSource
            .getRepository(Organization)
            .findOne({ where: { id: fullBusiness.supplierId } });
          
          if (supplier) {
            fullBusiness.supplier = supplier;
          }
        }
        
        console.log('订单业务完整信息:', {
          id: fullBusiness.id,
          supplierId: fullBusiness.supplierId,
          supplierName: fullBusiness.supplier?.name,
          supplierType: fullBusiness.supplier?.type,
          cooperationType: fullBusiness.supplier?.cooperation_type,
          commissionRate: fullBusiness.supplier?.commission_rate,
          costPrice: fullBusiness.costPrice,
          agentPrice: fullBusiness.agentPrice,
          salePrice: fullBusiness.salePrice
        });
        
        // 生成代理商利润（先检查是否已存在）
        if (order && order.agentId) {
          // 检查是否已存在该订单业务的代理商利润记录
          const existingAgentProfit = await this.dataSource
            .getRepository(AgentProfit)
            .findOne({
              where: { 
                orderId: order.id,
                orderBusinessId: fullBusiness.id,
                agentId: order.agentId
              }
            });
            
          if (existingAgentProfit) {
            console.log(`跳过代理商利润生成: 订单ID=${order.id}, 业务ID=${fullBusiness.id}, 代理商ID=${order.agentId} 的记录已存在`);
          } else {
            await this.generateAgentProfit(order, fullBusiness);
          }
        }
        
        // 生成供应商利润（先检查是否已存在）
        // 检查是否已存在该订单业务的供应商利润记录
        const existingSupplierProfit = await this.dataSource
          .getRepository(SupplierProfit)
          .findOne({
            where: { 
              orderId: order?.id,
              orderBusinessId: fullBusiness.id,
              supplierId: fullBusiness.supplierId
            }
          });
          
        if (existingSupplierProfit) {
          console.log(`跳过供应商利润生成: 订单ID=${order?.id}, 业务ID=${fullBusiness.id}, 供应商ID=${fullBusiness.supplierId} 的记录已存在`);
        } else {
          await this.generateSupplierProfit(order, fullBusiness);
        }
      } catch (error) {
        console.error('生成利润数据失败:', error);
        // 不影响主流程，继续返回更新后的业务
      }
    }
    
    // 返回标准格式的响应
    return {
      success: true,
      message: '业务状态更新成功',
      data: updatedBusiness,
    };
  }
  
  // 修改生成代理商利润的方法
  private async generateAgentProfit(order: Order, business: OrderBusiness): Promise<void> {
    if (!order || !order.agentId) return;
    
    // 查询代理商信息
    const agent = await this.agentsRepository.findOne({ where: { id: order.agentId } });
    if (!agent) return;
    
    console.log(`处理代理商[${agent.name}]利润，合作方式: ${agent.cooperationType}`);
    
    // 不同的合作方式有不同的计算方法
    // 只对不分佣类型不生成记录
    if (agent.cooperationType === 'none' || agent.cooperationType === 'no_commission') {
      // 不分佣的代理商，不生成利润记录
      console.log(`代理商[${agent.name}]为不分佣模式，不生成利润记录`);
      return;
    }
    
    let profit: number = 0;
    let profitRate: number = 0;
    let commissionRate: number = 0; 
    let commission: number = 0;
    
    if (agent.cooperationType === 'commission' || agent.cooperationType === 'normal_trade') {
      // 普通贸易/佣金模式：利润 = 销售价格 - 代理价格
      profit = business.salePrice - business.agentPrice;
      profitRate = business.salePrice > 0 ? (profit / business.salePrice) * 100 : 0;
      
      // 普通贸易/佣金模式下，佣金就是利润
      commissionRate = 100; // 100%
      commission = profit;
      
      console.log(`代理商[${agent.name}]${agent.cooperationType === 'normal_trade' ? '普通贸易' : '佣金模式'}：利润=${profit}，佣金=${commission}`);
    } else if (agent.cooperationType === 'profit_commission') {
      // 利润分佣模式：利润 = 销售价格 - 成本价格，然后乘以分佣比例
      profit = business.salePrice - business.costPrice;
      profitRate = business.salePrice > 0 ? (profit / business.salePrice) * 100 : 0;
      
      // 利润分佣，按比例计算佣金
      commissionRate = agent.commissionRate || 0;
      commission = (commissionRate / 100) * profit;
      
      console.log(`代理商[${agent.name}]利润分佣：利润=${profit}，佣金率=${commissionRate}%，佣金=${commission}`);
    } else {
      // 未知合作方式，使用默认计算方法
      profit = business.salePrice - business.agentPrice;
      profitRate = business.salePrice > 0 ? (profit / business.salePrice) * 100 : 0;
      commissionRate = 0;
      commission = 0;
      
      console.log(`代理商[${agent.name}]未知合作方式(${agent.cooperationType})，使用默认计算`);
    }
    
    // 创建代理商利润记录
    await this.agentProfitService.createAgentProfit({
      agentId: order.agentId,
      productId: business.productId,
      orderId: order.id,              // 保存订单ID
      orderBusinessId: business.id,   // 保存订单业务ID
      agentPrice: business.agentPrice,
      salePrice: business.salePrice,
      profit,
      profitRate,
      commissionRate,
      commission,
      orderCount: 1,
      startDate: new Date(),
      endDate: new Date(),
      settlementStatus: 'unsettled'
    });
  }
  
  // 修改生成供应商利润的方法
  private async generateSupplierProfit(order: Order | null, business: OrderBusiness): Promise<void> {
    if (!business || !business.supplier) {
      console.error('无法生成供应商利润：缺少业务信息或供应商信息');
      return;
    }
    
    // 只针对利润分佣类型的供应商生成利润数据
    if (business.supplier.cooperation_type !== 'profit_commission') {
      console.log(`供应商[${business.supplier.name}]非利润分佣类型(${business.supplier.cooperation_type})，不生成利润记录`);
      return;
    }
    
    // 检查必要字段
    if (business.costPrice === undefined || business.costPrice === null) {
      console.error('无法生成供应商利润：缺少成本价格');
      return;
    }
    
    if (business.salePrice === undefined || business.salePrice === null) {
      console.error('无法生成供应商利润：缺少销售价格');
      return;
    }
    
    if (order && order.agentId && (business.agentPrice === undefined || business.agentPrice === null)) {
      console.error('无法生成供应商利润：有代理商但缺少代理价格');
      return;
    }
    
    // 检查供应商合作方式
    const supplier = business.supplier;
    
    // 根据是否有代理商，确定供应商的销售价格
    const supplierSalePrice = order && order.agentId && business.agentPrice !== null
      ? business.agentPrice  // 有代理商，使用代理价格作为供应商的销售价格
      : business.salePrice;  // 没有代理商，使用最终销售价格
    
    // 计算利润
    const profit = supplierSalePrice - business.costPrice;
    
    // 计算利润率
    const profitRate = supplierSalePrice > 0 ? (profit / supplierSalePrice) * 100 : 0;
    
    // 计算佣金 - 利润分佣方式的供应商才计算佣金
    let commissionAmount = 0;
    let commissionRate = 0;
    
    // 设置佣金率和计算佣金金额
    commissionRate = supplier.commission_rate || 0;
    commissionAmount = (commissionRate / 100) * profit;
    
    console.log(`供应商[${supplier.name}]利润分佣：利润=${profit}，佣金率=${commissionRate}%，佣金=${commissionAmount}`);
    
    // 创建供应商利润记录
    await this.supplierProfitService.createSupplierProfit({
      supplierId: business.supplierId,
      productId: business.productId,
      orderId: order ? order.id : undefined,  // 保存订单ID
      orderBusinessId: business.id,      // 保存订单业务ID
      purchasePrice: business.costPrice,
      salePrice: supplierSalePrice,      // 使用根据代理情况确定的销售价格
      profit: profit,
      profitRate: profitRate,
      commissionRate: commissionRate,
      commission: commissionAmount,
      isAgentOrder: order && order.agentId ? true : false,
      orderCount: 1,
      startDate: new Date(),
      endDate: new Date(),
      settlementStatus: 'unsettled'
    });
  }

  async createComment(orderId: number, createCommentDto: CreateOrderCommentDto, user: any) {
    // 检查订单是否存在
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`订单ID ${orderId} 不存在`);
    }

    // 创建新评论
    const comment = this.orderCommentRepository.create({
      orderId,
      content: createCommentDto.content,
      createdBy: user.id,
    });

    const savedComment = await this.orderCommentRepository.save(comment);

    // 加载用户信息
    const commentWithUser = await this.orderCommentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['createdByUser'],
    });

    return {
      success: true,
      data: commentWithUser,
    };
  }

  async getComments(orderId: number) {
    // 检查订单是否存在
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`订单ID ${orderId} 不存在`);
    }

    // 获取评论列表，按创建时间升序排列（旧消息在上，新消息在下）
    const comments = await this.orderCommentRepository.find({
      where: { orderId },
      relations: ['createdByUser'],
      order: { createdAt: 'ASC' },
    });

    return {
      success: true,
      data: comments,
    };
  }

  /**
   * 获取订单统计数据
   * @param user 用户对象
   * @returns 订单统计数据，包括待处理、处理中、已完成订单的数量
   */
  async getStatistics(user: User): Promise<any> {
    // 初始化默认统计数据，确保即使查询失败也能返回有效数据
    const result = { 
      success: true,
      pending: 0, 
      processing: 0, 
      completed: 0,
      total: 0,
      cachedAt: new Date().toISOString(),  // 添加缓存时间戳
    };

    try {
      console.log('开始获取订单统计数据');
      
      // 查询订单总数，使用简单计数查询减轻负担
      const totalOrders = await this.orderRepository.count();
      
      result.total = totalOrders;
      console.log(`总订单数: ${totalOrders}`);
      
      // 使用单个高效查询获取状态统计
      const statusCounts = await this.orderBusinessRepository
        .createQueryBuilder('business')
        .select('business.status', 'status')
        .addSelect('COUNT(business.id)', 'count')
        .groupBy('business.status')
        .cache(60000) // 添加60秒缓存
        .getRawMany();
      
      // 解析结果
      for (const item of statusCounts) {
        if (item.status === 'pending') {
          result.pending = parseInt(item.count, 10);
        } else if (item.status === 'processing') {
          result.processing = parseInt(item.count, 10);
        } else if (item.status === 'completed') {
          result.completed = parseInt(item.count, 10);
        }
      }
      
      console.log('业务状态统计完成');
      
      return result;
    } catch (error) {
      console.error('获取订单统计失败:', error);
      return result; // 即使出错也返回默认结果，避免前端崩溃
    }
  }
} 