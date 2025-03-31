import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class GetOrdersDto {
  @ApiProperty({ description: '当前页码', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  current?: number;

  @ApiProperty({ description: '每页条数', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;

  @ApiProperty({ description: '关键字搜索', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: '订单状态', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: '支付状态', required: false })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiProperty({ description: '账户状态', required: false })
  @IsOptional()
  @IsString()
  accountStatus?: string;

  @ApiProperty({ description: '开始日期', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: '结束日期', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: '客户ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  customerId?: number;

  @ApiProperty({ description: '代理ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  agentId?: number;

  @ApiProperty({ description: '供应商ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  supplierId?: number;

  @ApiProperty({ description: '账单ID', required: false })
  @IsOptional()
  @IsString()
  billId?: string;
} 