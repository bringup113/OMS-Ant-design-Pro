import { IsNotEmpty, IsNumber, IsString, IsOptional, IsObject, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCustomerDto } from '../../customers/dto/create-customer.dto';

export class CreateOrderBusinessDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  supplierId: number;

  @IsNotEmpty()
  @IsNumber()
  costPrice: number;

  @IsOptional()
  @IsNumber()
  agentPrice?: number;

  @IsNotEmpty()
  @IsNumber()
  salePrice: number;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreateOrderDto {
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @IsNotEmpty()
  @IsString()
  paymentStatus: string;

  @IsNotEmpty()
  @IsString()
  accountStatus: string;

  @IsOptional()
  @IsNumber()
  agentId?: number;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateCustomerDto)
  customer?: CreateCustomerDto;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderBusinessDto)
  businesses: CreateOrderBusinessDto[];
} 