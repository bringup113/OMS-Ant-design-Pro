import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('product_categories')
export class ProductCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  code: string;

  @Column({ nullable: true })
  parentId: number;

  @ManyToOne(() => ProductCategory, category => category.children, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentId' })
  parent: ProductCategory;

  @OneToMany(() => ProductCategory, category => category.parent)
  children: ProductCategory[];

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ type: 'varchar', length: 20, default: 'enabled' })
  status: string;

  @Column({ nullable: true, length: 500 })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 