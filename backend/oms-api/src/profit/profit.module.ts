import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentProfitController } from './agent-profit/agent-profit.controller';
import { AgentProfitService } from './agent-profit/agent-profit.service';
import { AgentProfit } from './agent-profit/entities/agent-profit.entity';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentProfit]),
    forwardRef(() => OrdersModule),
    AuthModule,
  ],
  controllers: [AgentProfitController],
  providers: [AgentProfitService],
  exports: [AgentProfitService],
})
export class ProfitModule {} 