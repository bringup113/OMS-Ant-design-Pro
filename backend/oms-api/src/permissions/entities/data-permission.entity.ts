import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('data_permissions')
export class DataPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  type: string;  // 数据类型，如：order, customer, product 等

  @Column({ type: 'text' })
  filter: string;  // 过滤条件

  @Column({ type: 'jsonb', nullable: true })
  params: Record<string, any>;  // 过滤参数

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'created_by' })
  createdBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
} 