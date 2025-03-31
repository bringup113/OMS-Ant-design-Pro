import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { OrderBusiness } from './order-business.entity';
import { OrderComment } from './order-comment.entity';
import { Bill } from '../../bills/entities/bill.entity';
import { Agent } from '../../agents/entities/agent.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'customer_id' })
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'supplier_id' })
  supplierId: number;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Organization;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({ length: 20, default: 'unpaid', name: 'payment_status' })
  paymentStatus: string;

  @Column({ name: 'account_status', type: 'enum', enum: ['unbilled', 'billed'], default: 'unbilled' })
  accountStatus: string;

  @Column({ length: 20, default: 'pending' })
  status: string;

  @Column({ nullable: true, name: 'agent_id' })
  agentId: number;

  @ManyToOne(() => Agent)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ nullable: true, name: 'created_by' })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;

  @OneToMany(() => OrderBusiness, business => business.order)
  businesses: OrderBusiness[];

  @OneToMany(() => OrderComment, comment => comment.order)
  comments: OrderComment[];

  @Column({ name: 'bill_id', type: 'int', nullable: true })
  billId: number | null;

  @ManyToOne(() => Bill, bill => bill.orders)
  @JoinColumn({ name: 'bill_id' })
  bill: Bill;
} 