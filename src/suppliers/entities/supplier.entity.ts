import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('suppliers')
export class Supplier extends BaseEntity {
  @Column({ length: 200 })
  name: string;

  @Column({ name: 'contact_name', nullable: true, length: 150 })
  contactName: string;

  @Column({ nullable: true, length: 255 })
  email: string;

  @Column({ nullable: true, length: 30 })
  phone: string;

  @Column({ name: 'address_line1', nullable: true })
  addressLine1: string;

  @Column({ name: 'address_line2', nullable: true })
  addressLine2: string;

  @Column({ nullable: true, length: 100 })
  city: string;

  @Column({ nullable: true, length: 20 })
  postcode: string;

  @Column({ nullable: true, length: 100 })
  country: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'account_number', nullable: true, length: 100 })
  accountNumber: string;

  @Column({ name: 'vat_number', nullable: true, length: 50 })
  vatNumber: string;

  @Column({ name: 'payment_terms_days', type: 'int', default: 30 })
  paymentTermsDays: number;
}
