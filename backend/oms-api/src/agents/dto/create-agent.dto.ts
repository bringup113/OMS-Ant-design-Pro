import { IsNotEmpty, IsString, MaxLength, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateAgentDto {
  @IsNotEmpty({ message: '代理名称不能为空' })
  @IsString({ message: '代理名称必须是字符串' })
  @MaxLength(100, { message: '代理名称长度不能超过100个字符' })
  name: string;

  @IsNotEmpty({ message: '联系方式不能为空' })
  @IsString({ message: '联系方式必须是字符串' })
  @MaxLength(20, { message: '联系方式长度不能超过20个字符' })
  contact: string;

  @IsString({ message: '代理状态必须是字符串' })
  @MaxLength(10, { message: '代理状态长度不能超过10个字符' })
  status: string = 'active';

  @IsNotEmpty({ message: '合作方式不能为空' })
  @IsEnum(['none', 'regular', 'commission'], { message: '合作方式必须是 none、regular 或 commission' })
  cooperationType: string = 'none';

  @IsOptional()
  @IsNumber({}, { message: '分佣比例必须是数字' })
  @Min(0, { message: '分佣比例不能小于0' })
  @Max(100, { message: '分佣比例不能大于100' })
  commissionRate?: number | null;
} 