import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({ default: 0 })
  permission_value: number;

  @ManyToOne(() => Permission, permission => permission.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Permission;

  @OneToMany(() => Permission, permission => permission.parent)
  children: Permission[];

  @Column({ nullable: true })
  path: string;

  @Column({ nullable: true })
  component: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: 0 })
  sort: number;

  @Column({ default: '1' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 