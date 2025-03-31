import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAgentProfitDto {
  @IsNotEmpty()
  @IsNumber()
  agentId: number;

  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @IsNotEmpty()
  @IsNumber()
  agentPrice: number;

  @IsNotEmpty()
  @IsNumber()
  salePrice: number;

  @IsNotEmpty()
  @IsNumber()
  profit: number;

  @IsNotEmpty()
  @IsNumber()
  profitRate: number;

  @IsNotEmpty()
  @IsNumber()
  commissionRate: number;

  @IsNotEmpty()
  @IsNumber()
  commission: number;

  @IsNotEmpty()
  @IsString()
  settlementStatus: string;
} 