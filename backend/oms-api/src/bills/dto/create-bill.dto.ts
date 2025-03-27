import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBillDto {
  @ApiProperty({ description: '账单样式模板ID' })
  @IsNumber()
  templateId: number;

  @ApiProperty({ description: '订单ID数组', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  orderIds: number[];

  @ApiProperty({ description: '账单备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
} 