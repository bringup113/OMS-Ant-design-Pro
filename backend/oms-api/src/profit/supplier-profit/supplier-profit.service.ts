import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { SupplierProfit } from './entities/supplier-profit.entity';
import { GetSupplierProfitDto, SupplierProfitResponseDto, UpdateSettlementStatusDto } from './dto/supplier-profit.dto';
import { formatDate } from '../../utils/date.utils';
import { OrdersService } from '../../orders/orders.service';

@Injectable()
export class SupplierProfitService {
  constructor(
    @InjectRepository(SupplierProfit)
    private readonly supplierProfitRepository: Repository<SupplierProfit>,
    
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  async findAll(query: GetSupplierProfitDto) {
    const { keyword, startDate, endDate, settlementStatus } = query;
    const take = query.pageSize ? +query.pageSize : 10;
    const skip = query.current && query.pageSize ? (+query.current - 1) * +query.pageSize : 0;

    const whereConditions: any = {};

    if (keyword) {
      whereConditions.supplier = { name: Like(`%${keyword}%`) };
    }

    if (startDate) {
      whereConditions.startDate = startDate;
    }

    if (endDate) {
      whereConditions.endDate = endDate;
    }

    if (settlementStatus) {
      whereConditions.settlementStatus = settlementStatus;
    }

    const [profits, total] = await this.supplierProfitRepository.findAndCount({
      where: whereConditions,
      relations: ['supplier', 'product'],
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

    const result = await this.supplierProfitRepository.update(
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
  
  // 新增创建供应商利润记录的方法
  async createSupplierProfit(data: {
    supplierId: number;
    productId: number;
    orderId?: number;
    orderBusinessId?: number;
    purchasePrice: number;
    salePrice: number;
    profit: number;
    profitRate: number;
    commissionRate: number;
    commission: number;
    isAgentOrder: boolean;
    orderCount: number;
    startDate: Date;
    endDate: Date;
    settlementStatus: string;
  }) {
    const supplierProfit = this.supplierProfitRepository.create(data);
    return this.supplierProfitRepository.save(supplierProfit);
  }

  private mapToResponseDto(profit: SupplierProfit): SupplierProfitResponseDto {
    return {
      id: profit.id,
      supplierName: profit.supplier?.name || '',
      productName: profit.product?.name || '',
      orderId: profit.orderId,
      orderBusinessId: profit.orderBusinessId,
      purchasePrice: Number(profit.purchasePrice),
      salePrice: Number(profit.salePrice),
      profit: Number(profit.profit),
      profitRate: Number(profit.profitRate),
      commissionRate: Number(profit.commissionRate || 0),
      commission: Number(profit.commission || 0),
      isAgentOrder: profit.isAgentOrder || false,
      orderCount: profit.orderCount,
      startDate: formatDate(profit.startDate),
      endDate: formatDate(profit.endDate),
      createdAt: formatDate(profit.createdAt),
      settlementStatus: profit.settlementStatus,
    };
  }
} 