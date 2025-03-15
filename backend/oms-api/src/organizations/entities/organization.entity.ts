import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

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
  parent: Organization;

  @OneToMany(() => Organization, organization => organization.parent)
  children: Organization[];

  @Column({ default: 0 })
  sort: number;

  @Column({ default: '1' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 