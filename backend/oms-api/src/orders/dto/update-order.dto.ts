import { IsOptional, IsNumber, IsString, IsObject, ValidateNested, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCustomerDto } from '../../customers/dto/create-customer.dto';

export class UpdateOrderBusinessDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsNumber()
  productId?: number;

  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  agentPrice?: number;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @IsOptional()
  @IsNumber()
  supplierId?: number;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsOptional()
  @IsString()
  accountStatus?: string;

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderBusinessDto)
  businesses?: UpdateOrderBusinessDto[];

  @IsOptional()
  @IsNumber()
  businessId?: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateOrderBusinessDto)
  business?: UpdateOrderBusinessDto;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  passportNo?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  passportIssueDate?: string;

  @IsOptional()
  @IsString()
  passportExpiryDate?: string;

  @IsOptional()
  deleteRemovedBusinesses?: boolean;
} 