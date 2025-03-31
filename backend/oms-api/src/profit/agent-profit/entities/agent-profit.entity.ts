import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Agent } from '../../../agents/entities/agent.entity';
import { Order } from '../../../orders/entities/order.entity';

@Entity('agent_profits')
export class AgentProfit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'agent_id' })
  agentId: number;

  @ManyToOne(() => Agent)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'agent_price' })
  agentPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'sale_price' })
  salePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  profit: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'profit_rate' })
  profitRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'commission_rate' })
  commissionRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commission: number;

  @Column({ name: 'settlement_status', default: 'unsettled' })
  settlementStatus: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 