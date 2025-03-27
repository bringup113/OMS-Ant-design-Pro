import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { CustomersController, VisasController } from './customers.controller';
import { Customer } from './entities/customer.entity';
import { Visa } from './entities/visa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Visa])],
  controllers: [CustomersController, VisasController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {} 