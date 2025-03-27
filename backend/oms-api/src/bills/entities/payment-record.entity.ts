import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Bill } from './bill.entity';

@Entity('bill_payment_records')
export class PaymentRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'bill_id', type: 'int' })
  billId: number;

  @ManyToOne(() => Bill, bill => bill.paymentRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bill_id' })
  bill: Bill;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, default: 'cash' })
  paymentMethod: string;

  @Column({ name: 'payment_date', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;
  
  @Column({ name: 'created_by', type: 'int' })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 