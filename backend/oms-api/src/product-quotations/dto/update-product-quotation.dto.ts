import { PartialType } from '@nestjs/swagger';
import { CreateProductQuotationDto } from './create-product-quotation.dto';

export class UpdateProductQuotationDto extends PartialType(CreateProductQuotationDto) {} 