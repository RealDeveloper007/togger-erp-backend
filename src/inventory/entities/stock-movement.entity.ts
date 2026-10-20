import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Product } from '../../products/entities/product.entity';
import { StockLocation } from './stock-location.entity';
import { User } from '../../users/entities/user.entity';

export enum MovementType {
  RECEIVED = 'received',
  ISSUED = 'issued',
  RESERVED = 'reserved',
  RESERVATION_RELEASED = 'reservation_released',
  RETURNED = 'returned',
  DAMAGED = 'damaged',
  ADJUSTMENT_IN = 'adjustment_in',
  ADJUSTMENT_OUT = 'adjustment_out',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
}

@Entity('stock_movements')
export class StockMovement extends BaseEntity {
  @Column({ name: 'product_id' })
  @Index()
  productId: string;

  @Column({ name: 'location_id' })
  @Index()
  locationId: string;

  @Column({ type: 'enum', enum: MovementType })
  type: MovementType;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  quantity: number;

  @Column({ name: 'unit_cost', type: 'numeric', precision: 12, scale: 2, nullable: true })
  unitCost: number;

  @Column({ name: 'reference_type', nullable: true, length: 50 })
  referenceType: string;

  @Column({ name: 'reference_id', nullable: true })
  referenceId: string;

  @Column({ name: 'reference_number', nullable: true, length: 100 })
  referenceNumber: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ name: 'created_by_id', nullable: true })
  createdById: string;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => StockLocation, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'location_id' })
  location: StockLocation;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;
}
