import { PartialType } from '@nestjs/mapped-types';
import { CreateProductCountryDto } from './create-product-country.dto';

export class UpdateProductCountryDto extends PartialType(CreateProductCountryDto) {} 