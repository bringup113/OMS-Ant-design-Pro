import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import { Permission } from './permission.entity';

@Entity('permission_audit_logs')
export class PermissionAuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  role_id: number | null;

  @ManyToOne(() => Role, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ nullable: true })
  permission_id: number | null;

  @ManyToOne(() => Permission, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @Column({ length: 255 })
  action: string; // 'GRANT' | 'REVOKE' | 'MODIFY'

  @Column('text', { nullable: true })
  details: string | null;

  @Column('text', { nullable: true })
  old_value: string | null;

  @Column('text', { nullable: true })
  new_value: string | null;

  @Column({ length: 45 })
  ip_address: string;

  @CreateDateColumn()
  created_at: Date;
} 