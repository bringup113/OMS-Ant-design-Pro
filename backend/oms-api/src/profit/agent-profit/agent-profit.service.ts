import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { AgentProfit } from './entities/agent-profit.entity';
import { GetAgentProfitDto, AgentProfitResponseDto, UpdateSettlementStatusDto } from './dto/agent-profit.dto';
import { formatDate } from '../../utils/date.utils';
import { OrdersService } from '../../orders/orders.service';

@Injectable()
export class AgentProfitService {
  constructor(
    @InjectRepository(AgentProfit)
    private readonly agentProfitRepository: Repository<AgentProfit>,
    
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  async findAll(query: GetAgentProfitDto) {
    const { keyword, settlementStatus } = query;
    const take = query.pageSize ? +query.pageSize : 10;
    const skip = query.current && query.pageSize ? (+query.current - 1) * +query.pageSize : 0;

    const whereConditions: any = {};

    if (keyword) {
      whereConditions.agent = { name: Like(`%${keyword}%`) };
    }

    if (settlementStatus) {
      whereConditions.settlementStatus = settlementStatus;
    }

    const [profits, total] = await this.agentProfitRepository.findAndCount({
      where: whereConditions,
      relations: ['agent', 'order', 'order.customer'],
      take,
      skip,
      order: {
        createdAt: 'DESC',
      },
    });

    const data = profits.map((profit) => this.mapToResponseDto(profit));

    return {
      data,
      total,
      success: true,
    };
  }

  async updateSettlementStatus(updateDto: UpdateSettlementStatusDto) {
    const { ids, settlementStatus } = updateDto;

    if (ids.length === 0) {
      return { success: false, message: '请选择要更新的记录' };
    }

    const result = await this.agentProfitRepository.update(
      { id: In(ids) },
      { settlementStatus },
    );

    if (result.affected === 0) {
      throw new NotFoundException('未找到相关记录');
    }

    return {
      success: true,
      message: `成功将${result.affected}条记录的结算状态更新为${
        settlementStatus === 'settled' ? '已结算' : '未结算'
      }`,
    };
  }
  
  // 新增创建代理商利润记录的方法
  async createAgentProfit(data: {
    agentId: number;
    orderId: number;
    agentPrice: number;
    salePrice: number;
    profit: number;
    profitRate: number;
    commissionRate: number;
    commission: number;
    settlementStatus: string;
  }) {
    const agentProfit = this.agentProfitRepository.create(data);
    return this.agentProfitRepository.save(agentProfit);
  }

  private mapToResponseDto(profit: AgentProfit): AgentProfitResponseDto {
    return {
      id: profit.id,
      agentName: profit.agent?.name || '',
      orderId: profit.orderId,
      customerName: profit.order?.customer?.name || '',
      agentPrice: Number(profit.agentPrice),
      salePrice: Number(profit.salePrice),
      profit: Number(profit.profit),
      profitRate: Number(profit.profitRate),
      commissionRate: Number(profit.commissionRate),
      commission: Number(profit.commission),
      createdAt: formatDate(profit.createdAt),
      settlementStatus: profit.settlementStatus,
    };
  }
} 