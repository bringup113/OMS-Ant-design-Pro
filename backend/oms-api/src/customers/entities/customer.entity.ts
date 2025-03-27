import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Visa } from './visa.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, unique: true })
  passportNo: string;

  @Column({ length: 10 })
  gender: string;

  @Column({ length: 50 })
  country: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  birthDate: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  issueDate: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  expiryDate: string | null;

  @OneToMany(() => Visa, visa => visa.customer)
  visas: Visa[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
} 