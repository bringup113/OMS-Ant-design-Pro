import { IsString, IsOptional, IsNumber, Length, Min, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductCategoryDto {
  @ApiProperty({ description: '类别名称' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: '类别编码' })
  @IsString()
  @Length(1, 50)
  code: string;

  @ApiProperty({ description: '父类别ID', required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ description: '排序', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort?: number;

  @ApiProperty({ description: '状态', enum: ['enabled', 'disabled'], default: 'enabled' })
  @IsOptional()
  @IsString()
  @IsIn(['enabled', 'disabled'])
  status?: string = 'enabled';

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
} 