import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateVisaDto } from './create-visa.dto';

export class UpdateVisaDto extends PartialType(
  OmitType(CreateVisaDto, ['customerId'] as const),
) {} 