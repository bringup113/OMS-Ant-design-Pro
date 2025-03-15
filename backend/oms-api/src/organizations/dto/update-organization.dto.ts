import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateOrganizationDto } from './create-organization.dto';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
  @IsOptional()
  id?: string | number;

  @IsOptional()
  key?: string;

  @IsOptional()
  parentName?: string;

  @IsOptional()
  createdAt?: string;

  @IsOptional()
  children?: any[];

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? parseInt(value) : value)
  parentId?: number;
} 