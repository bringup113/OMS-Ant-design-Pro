import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsNumber, IsNotEmpty, IsEnum, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateOrganizationDto } from './create-organization.dto';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
  @IsOptional()
  id?: string | number;

  @IsOptional()
  key?: string;

  @IsOptional()
  parentName?: string;

  @IsOptional()
  createdAt?: string;

  @IsOptional()
  children?: any[];

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? parseInt(value) : value)
  parentId?: number;

  @IsString()
  @IsOptional()
  @IsEnum(['no_commission', 'normal_trade', 'profit_commission'], {
    message: '合作方式必须是：不分佣、普通贸易、利润分佣之一'
  })
  cooperation_type?: 'no_commission' | 'normal_trade' | 'profit_commission';

  @IsOptional()
  @IsNumber({}, { message: '佣金比例必须是数字' })
  @Min(0, { message: '佣金比例不能小于0' })
  @Max(100, { message: '佣金比例不能大于100' })
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  commission_rate?: number;
} 