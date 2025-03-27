import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateBillStyleElementDto } from './create-bill-style-element.dto';
import { PaperType } from './create-bill-style-template.dto';

export class UpdateBillStyleTemplateDto {
  @ApiProperty({ description: '模板名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '是否为默认模板', default: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ description: '纸张类型', enum: PaperType, default: PaperType.A4, required: false })
  @IsOptional()
  @IsEnum(PaperType)
  paperType?: PaperType;

  @ApiProperty({ description: '头部元素', type: [CreateBillStyleElementDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBillStyleElementDto)
  headerElements?: CreateBillStyleElementDto[];

  @ApiProperty({ description: '主体元素', type: [CreateBillStyleElementDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBillStyleElementDto)
  bodyElements?: CreateBillStyleElementDto[];

  @ApiProperty({ description: '底部元素', type: [CreateBillStyleElementDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBillStyleElementDto)
  footerElements?: CreateBillStyleElementDto[];
} 