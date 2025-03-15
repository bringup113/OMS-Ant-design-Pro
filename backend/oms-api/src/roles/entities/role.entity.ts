import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from '../../permissions/entities/permission.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ default: 0 })
  sort: number;

  @Column({ default: '1' })
  status: string;

  @Column({ default: 'self' })
  data_scope: string;

  @ManyToMany(() => Permission, { eager: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @ManyToMany(() => Organization, { eager: true })
  @JoinTable({
    name: 'role_organizations',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'organization_id', referencedColumnName: 'id' },
  })
  organizations: Organization[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 