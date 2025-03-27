import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCountryController } from './product-country.controller';
import { ProductCountryService } from './product-country.service';
import { ProductCountry } from './entities/product-country.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductCountry])],
  controllers: [ProductCountryController],
  providers: [ProductCountryService],
  exports: [ProductCountryService],
})
export class ProductCountryModule {} 