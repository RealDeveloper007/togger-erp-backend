import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Product } from '../../products/entities/product.entity';
import { StockLocation } from './stock-location.entity';

@Entity('stock_balances')
@Unique(['productId', 'locationId'])
export class StockBalance extends BaseEntity {
  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'location_id' })
  locationId: string;

  @Column({ name: 'quantity_on_hand', type: 'numeric', precision: 12, scale: 3, default: 0 })
  quantityOnHand: number;

  @Column({ name: 'quantity_reserved', type: 'numeric', precision: 12, scale: 3, default: 0 })
  quantityReserved: number;

  @Column({ name: 'quantity_available', type: 'numeric', precision: 12, scale: 3, default: 0 })
  quantityAvailable: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => StockLocation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location: StockLocation;
}
