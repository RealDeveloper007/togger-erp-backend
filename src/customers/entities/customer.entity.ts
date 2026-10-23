import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { CustomerAddress } from './customer-address.entity';

export enum CustomerType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
}

@Entity('customers')
export class Customer extends BaseEntity {
  @Column({ name: 'customer_code', unique: true, length: 20, default: () => "'CUS-' || lpad(nextval('customers_customer_code_seq')::text, 4, '0')" })
  customerCode: string;

  @Column({ type: 'enum', enum: CustomerType, default: CustomerType.INDIVIDUAL })
  type: CustomerType;

  @Column({ name: 'first_name', nullable: true, length: 100 })
  firstName: string;

  @Column({ name: 'last_name', nullable: true, length: 100 })
  lastName: string;

  @Column({ name: 'company_name', nullable: true, length: 200 })
  companyName: string;

  @Column({ nullable: true, length: 255 })
  email: string;

  @Column({ nullable: true, length: 30 })
  phone: string;

  @Column({ name: 'mobile', nullable: true, length: 30 })
  mobile: string;

  @Column({ name: 'billing_address_line1', nullable: true })
  billingAddressLine1: string;

  @Column({ name: 'billing_address_line2', nullable: true })
  billingAddressLine2: string;

  @Column({ name: 'billing_city', nullable: true, length: 100 })
  billingCity: string;

  @Column({ name: 'billing_postcode', nullable: true, length: 20 })
  billingPostcode: string;

  @Column({ name: 'billing_country', default: 'United Kingdom', length: 100 })
  billingCountry: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'vat_exempt', default: false })
  vatExempt: boolean;

  @Column({ name: 'vat_number', nullable: true, length: 50 })
  vatNumber: string;

  @OneToMany(() => CustomerAddress, (addr) => addr.customer, { cascade: true })
  addresses: CustomerAddress[];

  get displayName(): string {
    if (this.type === CustomerType.COMPANY) return this.companyName || 'Unknown';
    return [this.firstName, this.lastName].filter(Boolean).join(' ') || 'Unknown';
  }
}
