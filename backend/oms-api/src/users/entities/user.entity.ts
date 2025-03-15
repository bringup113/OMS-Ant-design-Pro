import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true, type: 'text' })
  profile: string;

  @Column({ default: '1' })
  status: string;

  @Column({ default: 'self' })
  data_scope: string;

  @ManyToOne(() => Organization, { eager: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToMany(() => Role, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 