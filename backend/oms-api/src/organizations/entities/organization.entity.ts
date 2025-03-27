import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column()
  name: string;

  @ManyToOne(() => Organization, organization => organization.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: Organization | null;

  @OneToMany(() => Organization, organization => organization.parent)
  children: Organization[];

  @Column({ default: 100 })
  sort: number;

  @Column({ default: 'customer' })
  type: 'supplier' | 'customer';

  @Column({ default: '1' })
  status: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: number;

  @Column({ default: 'no_commission' })
  cooperation_type: 'no_commission' | 'normal_trade' | 'profit_commission';

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
  commission_rate: number;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'role_organizations',
    joinColumn: { name: 'organization_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 