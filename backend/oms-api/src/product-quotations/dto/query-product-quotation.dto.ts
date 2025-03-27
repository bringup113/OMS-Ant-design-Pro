import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QueryProductQuotationDto {
  @ApiPropertyOptional({ description: '产品ID' })
  @IsOptional()
  @IsNumber({}, { message: '产品ID必须是数字' })
  @Transform(({ value }) => (value ? Number(value) : undefined))
  productId?: number;

  @ApiPropertyOptional({ description: '供应商ID' })
  @IsOptional()
  @IsNumber({}, { message: '供应商ID必须是数字' })
  @Transform(({ value }) => (value ? Number(value) : undefined))
  supplierId?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString({ message: '状态必须是字符串' })
  status?: string;

  @ApiPropertyOptional({ description: '是否最新', default: true })
  @IsOptional()
  @IsBoolean({ message: '是否最新必须是布尔值' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  is_latest?: boolean;

  @ApiPropertyOptional({ description: '当前页', default: 1 })
  @IsOptional()
  @IsNumber({}, { message: '当前页必须是数字' })
  @Transform(({ value }) => (value ? Number(value) : 1))
  current?: number;

  @ApiPropertyOptional({ description: '每页条数', default: 10 })
  @IsOptional()
  @IsNumber({}, { message: '每页条数必须是数字' })
  @Transform(({ value }) => (value ? Number(value) : 10))
  pageSize?: number;
} 