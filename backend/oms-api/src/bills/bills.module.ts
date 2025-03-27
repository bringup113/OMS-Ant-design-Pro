import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { Bill } from './entities/bill.entity';
import { Order } from '../orders/entities/order.entity';
import { BillStyleTemplate } from '../bill-style/entities/bill-style-template.entity';
import { PaymentRecord } from './entities/payment-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bill, Order, BillStyleTemplate, PaymentRecord]),
  ],
  controllers: [BillsController],
  providers: [BillsService],
  exports: [BillsService],
})
export class BillsModule {} 