import { IsString, IsOptional, IsNotEmpty, Matches, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: '机构编码只能包含英文字母和数字，或者为空'
  })
  code?: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? parseInt(value) : value)
  parentId?: number;

  @IsString()
  @IsOptional()
  status?: string;

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