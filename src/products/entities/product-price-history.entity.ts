import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Product } from './product.entity';

@Entity('product_price_history')
export class ProductPriceHistory extends BaseEntity {
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'previous_price', type: 'numeric', precision: 12, scale: 2, nullable: true })
  previousPrice: number | null;

  @Column({ name: 'new_price', type: 'numeric', precision: 12, scale: 2 })
  newPrice: number;

  @Column({ name: 'quantity_on_hand', type: 'numeric', precision: 12, scale: 3, default: 0 })
  quantityOnHand: number;

  @Column({ type: 'varchar', length: 32 })
  source: 'migration_snapshot' | 'product_created' | 'product_edit' | 'stock_receipt';

  @Column({ name: 'changed_by_id', type: 'uuid', nullable: true })
  changedById: string | null;
}
