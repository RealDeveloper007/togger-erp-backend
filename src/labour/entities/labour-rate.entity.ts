import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum LabourChargeType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  DAILY = 'daily',
  PER_UNIT = 'per_unit',
  CUSTOM = 'custom',
}

@Entity('labour_rates')
export class LabourRate extends BaseEntity {
  @Column({ length: 150, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'charge_type', length: 30, default: LabourChargeType.FIXED })
  chargeType: LabourChargeType;

  @Column({ name: 'default_rate', type: 'numeric', precision: 12, scale: 2, default: 0 })
  defaultRate: number;

  @Column({ name: 'vat_rate', type: 'numeric', precision: 5, scale: 2, default: 20 })
  vatRate: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
