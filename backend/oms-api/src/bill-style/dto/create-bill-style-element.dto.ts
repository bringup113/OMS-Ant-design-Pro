import { IsString, IsBoolean, IsOptional, IsNumber, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ElementType {
  TEXT = 'text',
  LINE = 'line',
  ORDER_ITEM = 'order-item',
  TOTAL = 'total',
  REMARK = 'remark',
  CUSTOM_FIELD = 'custom-field',
}

export enum SectionType {
  HEADER = 'header',
  BODY = 'body',
  FOOTER = 'footer',
}

export enum AlignType {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

export class CreateBillStyleElementDto {
  @ApiProperty({ description: '元素ID' })
  @IsString()
  elementId: string;

  @ApiProperty({ description: '元素类型', enum: ElementType })
  @IsString()
  @IsIn(Object.values(ElementType))
  type: ElementType;

  @ApiProperty({ description: '元素内容', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '对齐方式', enum: AlignType, default: AlignType.LEFT })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(AlignType))
  align?: AlignType = AlignType.LEFT;

  @ApiProperty({ description: '所属区域', enum: SectionType })
  @IsString()
  @IsIn(Object.values(SectionType))
  section: SectionType;

  @ApiProperty({ description: '是否加粗', default: false })
  @IsOptional()
  @IsBoolean()
  isBold?: boolean;

  @ApiProperty({ description: '是否为标题', default: false })
  @IsOptional()
  @IsBoolean()
  isTitle?: boolean;

  @ApiProperty({ description: '字体大小', default: 12 })
  @IsOptional()
  @IsNumber()
  fontSize?: number;

  @ApiProperty({ description: '排序', default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
} 