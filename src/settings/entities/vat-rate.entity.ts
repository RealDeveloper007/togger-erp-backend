import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum VatCategory {
  STANDARD = 'standard',
  REDUCED = 'reduced',
  ZERO = 'zero',
  EXEMPT = 'exempt',
}

@Entity('vat_rates')
export class VatRate extends BaseEntity {
  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'enum', enum: VatCategory })
  category: VatCategory;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  rate: number;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;
}
