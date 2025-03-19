import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './customer.entity';

@Entity('visas')
export class Visa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerId: number;

  @Column({ length: 50 })
  country: string;

  @Column({ length: 100 })
  visaName: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  issueDate: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  expiryDate: string | null;

  @ManyToOne(() => Customer, customer => customer.visas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
} 