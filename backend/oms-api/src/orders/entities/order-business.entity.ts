import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('order_businesses')
export class OrderBusiness {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => Order, order => order.businesses)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'product_id' })
  productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'supplier_id' })
  supplierId: number;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Organization;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'cost_price' })
  costPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'agent_price' })
  agentPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'sale_price' })
  salePrice: number;

  @Column({ length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 