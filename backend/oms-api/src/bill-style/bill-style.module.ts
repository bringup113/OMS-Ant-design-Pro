import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillStyleController } from './bill-style.controller';
import { BillStyleService } from './bill-style.service';
import { BillStyleTemplate } from './entities/bill-style-template.entity';
import { BillStyleElement } from './entities/bill-style-element.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BillStyleTemplate, BillStyleElement])],
  controllers: [BillStyleController],
  providers: [BillStyleService],
  exports: [BillStyleService],
})
export class BillStyleModule {} 