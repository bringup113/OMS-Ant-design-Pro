import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: '产品名称' })
  @IsNotEmpty({ message: '产品名称不能为空' })
  @IsString({ message: '产品名称必须是字符串' })
  @MaxLength(255, { message: '产品名称不能超过255个字符' })
  name: string;

  @ApiProperty({ description: '产品类别ID' })
  @IsNotEmpty({ message: '产品类别不能为空' })
  @IsNumber({}, { message: '产品类别ID必须是数字' })
  categoryId: number;

  @ApiProperty({ description: '产品描述', required: false })
  @IsOptional()
  @IsString({ message: '产品描述必须是字符串' })
  description?: string;

  @ApiProperty({ description: '国家', required: false })
  @IsOptional()
  @IsString({ message: '国家必须是字符串' })
  country?: string;

  @ApiProperty({ description: '产品状态', enum: ['online', 'offline'], default: 'offline' })
  @IsOptional()
  @IsEnum(['online', 'offline'], { message: '产品状态必须是 online 或 offline' })
  status?: 'online' | 'offline' = 'offline';
} 