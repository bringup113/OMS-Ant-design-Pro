import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderBusiness } from './entities/order-business.entity';
import { OrderComment } from './entities/order-comment.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderCommentDto } from './dto/create-order-comment.dto';
import { GetOrdersDto } from './dto/get-orders.dto';
import { CustomersService } from '../customers/customers.service';
import { UsersService } from '../users/users.service';
import { Organization } from '../organizations/entities/organization.entity';
import { AgentProfit } from '../profit/agent-profit/entities/agent-profit.entity';
import { AgentProfitService } from '../profit/agent-profit/agent-profit.service';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Agent } from '../agents/entities/agent.entity';
import { DataPermissionsService } from '../permissions/data-permissions.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderBusiness)
    private readonly orderBusinessRepository: Repository<OrderBusiness>,
    @InjectRepository(OrderComment)
    private readonly orderCommentRepository: Repository<OrderComment>,
    private readonly customersService: CustomersService,
    private readonly usersService: UsersService,
    private dataSource: DataSource,
    @Inject(forwardRef(() => AgentProfitService))
    private readonly agentProfitService: AgentProfitService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataPermissionsService: DataPermissionsService,
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
        supplierId: createOrderDto.supplierId,
        totalAmount: createOrderDto.totalAmount,
        paymentStatus: createOrderDto.paymentStatus,
        accountStatus: createOrderDto.accountStatus,
        agentId: createOrderDto.agentId,
        remark: createOrderDto.remark,
        createdBy: user?.id,
      };

      const order = this.ordersRepository.create(orderData);
      const savedOrder = await this.ordersRepository.save(order);

      // 创建订单业务信息（多条）
      const orderBusinesses: OrderBusiness[] = [];
      for (const business of createOrderDto.businesses) {
        const businessData = {
          orderId: savedOrder.id,
          productId: business.productId,
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
      const { 
        current = 1, 
        pageSize = 10, 
        status, 
        paymentStatus,
        accountStatus,
        keyword,
        startDate,
        endDate,
        customerId,
        agentId,
        supplierId
      } = query;

      const skip = (current - 1) * pageSize;
      const take = pageSize;

      // 创建查询构建器
      const queryBuilder = this.ordersRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.agent', 'agent')
        .leftJoinAndSelect('order.supplier', 'supplier')
        .leftJoinAndSelect('order.businesses', 'businesses')
        .leftJoinAndSelect('businesses.product', 'product')
        .leftJoinAndSelect('order.bill', 'bill')
        .orderBy('order.createdAt', 'DESC');

      // 添加过滤条件
      if (status) {
        queryBuilder.andWhere('order.status = :status', { status });
      }

      if (paymentStatus) {
        queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus });
      }

      if (accountStatus) {
        queryBuilder.andWhere('order.accountStatus = :accountStatus', { accountStatus });
      }

      if (customerId) {
        queryBuilder.andWhere('order.customerId = :customerId', { customerId });
      }

      if (agentId) {
        queryBuilder.andWhere('order.agentId = :agentId', { agentId });
      }

      if (supplierId) {
        queryBuilder.andWhere('order.supplierId = :supplierId', { supplierId });
      }

      if (startDate) {
        queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('order.createdAt <= :endDate', { endDate });
      }

      // 添加数据权限过滤
      if (user) {
        // 获取数据权限过滤条件
        const dataPermission = await this.dataPermissionsService.getDataFilter(user, 'order');
        
        // 应用数据权限过滤
        if (dataPermission && dataPermission.filter) {
          queryBuilder.andWhere(dataPermission.filter, dataPermission.params);
        }
      }

      // 添加分页
      queryBuilder.skip(skip).take(take);
      
      // 执行查询
      const [orders, total] = await queryBuilder.getManyAndCount();
      
      // 更新订单的支付状态以匹配账单状态
      const updatedOrders = orders.map(order => {
        if (order.bill) {
          // 如果订单有关联的账单，根据账单状态设置支付状态
          switch (order.bill.status) {
            case 'paid':
              order.paymentStatus = 'paid';
              break;
            case 'partially_paid':
              order.paymentStatus = 'partially_paid';
              break;
            case 'unpaid':
              order.paymentStatus = 'unpaid';
              break;
          }
        }
        return order;
      });

      // 如果有关键字搜索，我们需要在内存中过滤结果
      let filteredOrders = updatedOrders;
      if (keyword) {
        const searchText = keyword.toLowerCase();
        filteredOrders = filteredOrders.filter(order => {
          const customerMatch = order.customer?.name?.toLowerCase().includes(searchText) ||
                              order.customer?.passportNo?.toLowerCase().includes(searchText);
          const agentMatch = order.agent?.name?.toLowerCase().includes(searchText);
          const supplierMatch = order.supplier?.name?.toLowerCase().includes(searchText);
          const productMatch = order.businesses?.some(business => 
            business.product?.name?.toLowerCase().includes(searchText)
          );
          
          return customerMatch || agentMatch || supplierMatch || productMatch;
        });
      }

      return {
        data: filteredOrders,
        total,
        current,
        pageSize,
      };
    } catch (error) {
      console.error('获取订单列表失败:', error);
      throw error;
    }
  }

  async findOne(id: number) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: [
        'customer',
        'businesses',
        'businesses.product',
        'agent',
        'supplier',
        'bill'  // 添加bill关联
      ],
    });

    if (!order) {
      throw new NotFoundException(`订单 #${id} 不存在`);
    }

    // 根据账单状态更新订单支付状态
    if (order.bill) {
      switch (order.bill.status) {
        case 'paid':
          order.paymentStatus = 'paid';
          break;
        case 'partially_paid':
          order.paymentStatus = 'partially_paid';
          break;
        case 'unpaid':
          order.paymentStatus = 'unpaid';
          break;
      }
    }

    // 根据业务状态计算订单状态
    const orderStatus = this.calculateOrderStatus(order.businesses);

    return {
      success: true,
      data: {
        ...order,
        status: orderStatus,
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

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.ordersRepository.findOne({ where: { id } });
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
    await this.ordersRepository.save(order);

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
    const order = await this.ordersRepository.findOne({ 
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
      // 删除相关的代理商利润记录
      await this.dataSource.createQueryBuilder()
        .delete()
        .from('agent_profits')
        .where('order_id = :orderId', { orderId: id })
        .execute();

      // 删除订单
      await this.ordersRepository.remove(order);
      
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
    try {
      // 获取订单业务
      const business = await this.orderBusinessRepository.findOne({
        where: { id: businessId, orderId },
        relations: ['order', 'product']
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
      
      // 获取完整订单信息，包括所有业务
      console.log('正在获取完整订单信息...');
      const order = await this.ordersRepository.findOne({
        where: { id: orderId },
        relations: ['businesses', 'agent', 'supplier', 'customer']
      });
      
      if (!order) {
        throw new NotFoundException(`无法加载完整订单信息，ID: ${orderId}`);
      }

      console.log('订单信息:', {
        orderId: order.id,
        agentId: order.agentId,
        businessCount: order.businesses?.length,
        hasAgent: !!order.agent,
        hasSupplier: !!order.supplier,
        hasCustomer: !!order.customer
      });

      // 计算新的订单状态
      const newOrderStatus = this.calculateOrderStatus(order.businesses);
      const oldOrderStatus = order.status;

      console.log('订单状态:', {
        oldStatus: oldOrderStatus,
        newStatus: newOrderStatus,
        businessStatuses: order.businesses.map(b => ({ id: b.id, status: b.status }))
      });

      // 如果订单状态发生变化，更新订单状态
      if (newOrderStatus !== oldOrderStatus) {
        order.status = newOrderStatus;
        await this.ordersRepository.save(order);

        // 如果新状态是已完成，检查是否已存在利润记录，如果不存在则生成
        if (newOrderStatus === 'completed') {
          console.log('订单状态变更为已完成，检查是否需要生成利润记录...');
          // 检查是否已经存在利润记录
          const existingProfits = await this.dataSource
            .getRepository(AgentProfit)
            .find({
              where: { orderId: order.id }
            });

          console.log('现有利润记录:', {
            count: existingProfits.length,
            records: existingProfits.map(p => ({ id: p.id, orderId: p.orderId }))
          });

          if (existingProfits.length === 0) {
            console.log('开始生成代理商利润记录...');
            try {
              await this.generateAgentProfit(order);
              console.log('代理商利润记录生成成功');
            } catch (error) {
              console.error('生成代理商利润记录时出错:', error);
              throw error;
            }
          }
        }
      }

      return {
        success: true,
        data: {
          business: updatedBusiness,
          orderStatus: newOrderStatus
        }
      };
    } catch (error) {
      console.error('更新订单状态时出错:', {
        error,
        orderId,
        businessId,
        status,
        errorMessage: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
  
  /**
   * 更新订单状态
   * @param id 订单ID
   * @param status 新状态
   */
  async updateOrderStatus(id: number, status: string): Promise<any> {
    try {
      // 获取订单及其关联数据
      const order = await this.ordersRepository.findOne({
        where: { id },
        relations: ['businesses', 'agent', 'supplier']
      });

      if (!order) {
        throw new NotFoundException(`订单 #${id} 不存在`);
      }

      // 如果状态没有变化，直接返回
      if (order.status === status) {
        return {
          success: true,
          message: '订单状态未变更',
          data: order
        };
      }

      // 不允许直接修改订单状态，订单状态应该由业务状态决定
      throw new BadRequestException('订单状态不能直接修改，它由业务状态自动计算决定');
    } catch (error) {
      console.error('更新订单状态时出错:', error);
      throw error;
    }
  }

  // 修改生成代理商利润的方法
  private async generateAgentProfit(order: Order): Promise<void> {
    try {
      console.log('开始生成代理商利润:', {
        orderId: order.id,
        agentId: order.agentId,
        status: order.status
      });

      // 如果没有代理，则不生成代理利润
      if (!order.agentId) {
        console.log('无需生成代理利润：没有代理', {
          agentId: order.agentId
        });
        return;
      }

      // 检查是否已经存在该订单的利润记录
      const existingProfit = await this.dataSource
        .getRepository(AgentProfit)
        .findOne({
          where: {
            orderId: order.id
          }
        });

      if (existingProfit) {
        console.log(`订单 #${order.id} 的利润记录已存在，跳过生成`, {
          existingProfitId: existingProfit.id,
          profit: existingProfit.profit,
          commission: existingProfit.commission
        });
        return;
      }

      // 获取代理信息
      const agent = await this.dataSource
        .getRepository(Agent)
        .findOne({ where: { id: order.agentId } });

      if (!agent) {
        console.error(`找不到代理 ID: ${order.agentId}`);
        return;
      }

      console.log('获取到代理商信息:', {
        agentId: agent.id,
        agentName: agent.name,
        cooperationType: agent.cooperationType,
        commissionRate: agent.commissionRate
      });

      // 计算订单总利润
      let totalProfit = 0;
      let totalProfitRate = 0;
      let commissionRate = 0;
      let commission = 0;

      // 检查代理商合作方式
      console.log('检查代理商合作方式:', {
        cooperationType: agent.cooperationType,
        isCommission: agent.cooperationType === 'commission',
        commissionRate: agent.commissionRate
      });

      // 计算订单总金额
      const totalAgentPrice = order.businesses.reduce((sum, business) => {
        const agentPrice = business.agentPrice ? Number(business.agentPrice) : 0;
        return sum + agentPrice;
      }, 0);
      
      const totalCostPrice = order.businesses.reduce((sum, business) => {
        const costPrice = business.costPrice ? Number(business.costPrice) : 0;
        return sum + costPrice;
      }, 0);
      
      const totalSalePrice = order.businesses.reduce((sum, business) => {
        const salePrice = business.salePrice ? Number(business.salePrice) : 0;
        return sum + salePrice;
      }, 0);

      console.log('订单金额计算:', {
        totalAgentPrice,
        totalCostPrice,
        totalSalePrice,
        businesses: order.businesses.map(b => ({
          id: b.id,
          agentPrice: b.agentPrice,
          costPrice: b.costPrice,
          salePrice: b.salePrice
        }))
      });

      if (agent.cooperationType === 'commission') {
        // 如果代理商是利润分佣模式
        totalProfit = totalAgentPrice - totalCostPrice;
        totalProfitRate = totalAgentPrice > 0 ? (totalProfit / totalAgentPrice) * 100 : 0;
        commissionRate = Number(agent.commissionRate) || 0;
        commission = totalProfit * (commissionRate / 100);
        
        console.log('利润分佣模式计算过程:', {
          totalCostPrice,
          totalAgentPrice,
          totalProfit,
          totalProfitRate,
          commissionRate,
          commission,
          cooperationType: agent.cooperationType
        });
      } else if (agent.cooperationType === 'regular') {
        // 如果是普通贸易模式
        totalProfit = totalSalePrice - totalAgentPrice;
        totalProfitRate = totalSalePrice > 0 ? (totalProfit / totalSalePrice) * 100 : 0;
        commissionRate = 100;
        commission = totalProfit;
        
        console.log('普通贸易模式计算结果:', {
          totalAgentPrice,
          totalSalePrice,
          totalProfit,
          totalProfitRate,
          commissionRate,
          commission,
          cooperationType: agent.cooperationType
        });
      } else {
        // 如果是其他模式（如：none），不生成利润
        console.log('不分佣模式，跳过生成利润:', {
          cooperationType: agent.cooperationType
        });
        return;
      }

      // 创建代理利润记录
      const agentProfit = await this.agentProfitService.createAgentProfit({
        agentId: order.agentId,
        orderId: order.id,
        agentPrice: totalAgentPrice,
        salePrice: totalSalePrice,
        profit: totalProfit,
        profitRate: totalProfitRate,
        commissionRate,
        commission,
        settlementStatus: 'unsettled'
      });

      console.log('成功生成代理利润记录:', {
        profitId: agentProfit.id,
        orderId: order.id,
        agentId: order.agentId,
        agentName: agent.name,
        totalProfit,
        totalProfitRate,
        commission,
        commissionRate
      });
    } catch (error) {
      console.error('生成代理利润时出错:', error);
      throw error;
    }
  }

  async createComment(orderId: number, createCommentDto: CreateOrderCommentDto, user: any) {
    // 检查订单是否存在
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
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
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
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
} 