import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Customer } from './customer.entity';

export enum AddressType {
  INSTALLATION = 'installation',
  SERVICE = 'service',
  BILLING = 'billing',
  OTHER = 'other',
}

@Entity('customer_addresses')
export class CustomerAddress extends BaseEntity {
  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Customer, (c) => c.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ nullable: true, length: 100 })
  label: string;

  @Column({ type: 'enum', enum: AddressType, default: AddressType.INSTALLATION })
  type: AddressType;

  @Column({ name: 'address_line1' })
  addressLine1: string;

  @Column({ name: 'address_line2', nullable: true })
  addressLine2: string;

  @Column({ nullable: true, length: 100 })
  city: string;

  @Column({ nullable: true, length: 100 })
  county: string;

  @Column({ length: 20 })
  postcode: string;

  @Column({ default: 'United Kingdom', length: 100 })
  country: string;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ nullable: true, type: 'text' })
  notes: string;
}
