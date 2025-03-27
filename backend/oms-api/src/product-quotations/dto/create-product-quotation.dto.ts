import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDecimal, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductQuotationDto {
  @ApiProperty({ description: '产品ID' })
  @IsNotEmpty({ message: '产品ID不能为空' })
  @IsNumber({}, { message: '产品ID必须是数字' })
  productId: number;

  @ApiProperty({ description: '供应商ID' })
  @IsNotEmpty({ message: '供应商ID不能为空' })
  @IsNumber({}, { message: '供应商ID必须是数字' })
  supplierId: number;

  @ApiProperty({ description: '价格' })
  @IsNotEmpty({ message: '价格不能为空' })
  @IsNumber({}, { message: '价格必须是数字' })
  price: number;

  @ApiPropertyOptional({ description: '代理价格' })
  @IsOptional()
  @IsNumber({}, { message: '代理价格必须是数字' })
  agentPrice?: number;

  @ApiPropertyOptional({ description: '销售价格' })
  @IsOptional()
  @IsNumber({}, { message: '销售价格必须是数字' })
  salePrice?: number;

  @ApiProperty({ description: '状态', default: 'active' })
  @IsString({ message: '状态必须是字符串' })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString({ message: '备注必须是字符串' })
  @IsOptional()
  remark?: string;

  @ApiPropertyOptional({ description: '是否最新', default: true })
  @IsBoolean({ message: '是否最新必须是布尔值' })
  @IsOptional()
  isLatest?: boolean;

  @IsOptional()
  @IsNumber()
  createdBy?: number;
} 