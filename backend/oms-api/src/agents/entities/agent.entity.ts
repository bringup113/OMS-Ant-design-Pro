import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  contact: string;

  @Column({ type: 'varchar', length: 10, default: 'active' })
  status: string;

  @Column({ type: 'varchar', length: 20, default: 'none' })
  cooperationType: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  commissionRate: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 