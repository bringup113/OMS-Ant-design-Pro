import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentProfitController } from './agent-profit/agent-profit.controller';
import { AgentProfitService } from './agent-profit/agent-profit.service';
import { SupplierProfitController } from './supplier-profit/supplier-profit.controller';
import { SupplierProfitService } from './supplier-profit/supplier-profit.service';
import { AgentProfit } from './agent-profit/entities/agent-profit.entity';
import { SupplierProfit } from './supplier-profit/entities/supplier-profit.entity';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentProfit, SupplierProfit]),
    forwardRef(() => OrdersModule),
  ],
  controllers: [AgentProfitController, SupplierProfitController],
  providers: [AgentProfitService, SupplierProfitService],
  exports: [AgentProfitService, SupplierProfitService],
})
export class ProfitModule {} 