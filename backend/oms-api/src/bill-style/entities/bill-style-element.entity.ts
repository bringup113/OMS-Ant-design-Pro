import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IBillStyleTemplate } from './models';

@Entity('bill_style_elements')
export class BillStyleElement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'element_id', length: 100 })
  elementId: string;

  @Column({ length: 50 })
  type: string;

  @Column({ nullable: true, type: 'text' })
  content: string;

  @Column({ default: 'left', length: 20 })
  align: string;

  @Column({ length: 20 })
  section: string;

  @Column({ name: 'is_bold', default: false })
  isBold: boolean;

  @Column({ name: 'is_title', default: false })
  isTitle: boolean;

  @Column({ name: 'font_size', default: 12 })
  fontSize: number;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @ManyToOne('BillStyleTemplate', 'elements', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template: IBillStyleTemplate;

  @Column({ name: 'template_id' })
  templateId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 