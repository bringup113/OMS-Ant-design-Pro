import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateBillDto } from './create-bill.dto';

export class UpdateBillDto extends PartialType(CreateBillDto) {
  @ApiProperty({ description: '账单状态', enum: ['paid', 'partially_paid', 'unpaid'], required: false })
  @IsOptional()
  @IsEnum(['paid', 'partially_paid', 'unpaid'], {
    message: '账单状态必须是 paid、partially_paid 或 unpaid 之一'
  })
  status?: 'paid' | 'partially_paid' | 'unpaid';

  @ApiProperty({ description: '账单备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
} 