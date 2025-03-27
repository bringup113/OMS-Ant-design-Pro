import { IsNumber, IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentRecordDto {
  @ApiProperty({ description: '付款金额' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: '付款备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ description: '付款方式', enum: ['cash', 'transfer', 'check', 'other'] })
  @IsOptional()
  @IsString()
  @IsIn(['cash', 'transfer', 'check', 'other'])
  paymentMethod?: string = 'cash';
} 