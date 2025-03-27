import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductCategory } from '../../product-categories/entities/product-category.entity';
import { User } from '../../users/entities/user.entity';

@Entity('product_items')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 'offline' })
  status: 'online' | 'offline';

  @Column({ nullable: true })
  country: string;

  @Column({ default: 100 })
  sort: number;

  @Column({ name: 'created_by' })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ProductCategory)
  @JoinColumn({ name: 'category_id' })
  category: ProductCategory;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
} 