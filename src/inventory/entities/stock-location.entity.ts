import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('stock_locations')
export class StockLocation extends BaseEntity {
  @Column({ length: 150, unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'address_line1', nullable: true })
  addressLine1: string;

  @Column({ nullable: true, length: 100 })
  city: string;

  @Column({ nullable: true, length: 20 })
  postcode: string;
}
