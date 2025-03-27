import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAgentProfitDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  settlementStatus?: string;
  
  @IsOptional()
  @IsString()
  current?: string;
  
  @IsOptional()
  @IsString()
  pageSize?: string;
}

export class AgentProfitResponseDto {
  id: number;
  agentName: string;
  productName: string;
  orderId?: number;
  orderBusinessId?: number;
  agentPrice: number;
  salePrice: number;
  profit: number;
  profitRate: number;
  commissionRate: number;
  commission: number;
  orderCount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  settlementStatus: string;
}

export class UpdateSettlementStatusDto {
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  ids: number[];

  @IsEnum(['settled', 'unsettled'], { message: '结算状态必须是已结算或未结算' })
  settlementStatus: 'settled' | 'unsettled';
} 