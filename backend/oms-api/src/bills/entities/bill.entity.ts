import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { PaymentRecord } from './payment-record.entity';

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'template_id', type: 'int' })
  templateId: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: string;

  @Column({
    type: 'enum',
    enum: ['paid', 'partially_paid', 'unpaid'],
    default: 'unpaid'
  })
  status: 'paid' | 'partially_paid' | 'unpaid';

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ name: 'agent_id', type: 'int', nullable: true })
  agentId: number | null;

  @Column({ name: 'created_by', type: 'int' })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关联
  @OneToMany(() => Order, order => order.bill)
  orders: Order[];
  
  // 付款记录关联
  @OneToMany(() => PaymentRecord, paymentRecord => paymentRecord.bill, {
    cascade: true, // 级联所有操作
    eager: true,   // 自动加载关联数据
  })
  paymentRecords: PaymentRecord[];
  
  // 计算已付金额（非持久化字段）
  paidAmount?: string;
} 