import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductQuotationsService } from './product-quotations.service';
import { ProductQuotationsController } from './product-quotations.controller';
import { ProductQuotation } from './entities/product-quotation.entity';
import { Product } from '../products/entities/product.entity';
import { Organization } from '../organizations/entities/organization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductQuotation, Product, Organization]),
  ],
  controllers: [ProductQuotationsController],
  providers: [ProductQuotationsService],
  exports: [ProductQuotationsService],
})
export class ProductQuotationsModule {}
