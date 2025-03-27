import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IBillStyleElement } from './models';
import { BillStyleElement } from './bill-style-element.entity';

@Entity('bill_style_templates')
export class BillStyleTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'paper_type', default: 'a4' })
  paperType: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  @OneToMany('BillStyleElement', 'template')
  elements: BillStyleElement[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 