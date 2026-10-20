import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { CustomerAddress } from '../../customers/entities/customer-address.entity';
import { User } from '../../users/entities/user.entity';

export enum QuotationStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  SENT = 'sent',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CONVERTED = 'converted_to_job',
}

@Entity('quotations')
export class Quotation extends BaseEntity {
  @Column({ name: 'quotation_number', unique: true, length: 50 })
  @Index()
  quotationNumber: string;

  @Column({ name: 'reference_number', length: 100 })
  referenceNumber: string;

  @Column({ name: 'apply_vat', type: 'boolean', default: true })
  applyVat: boolean;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'address_id', nullable: true })
  addressId: string;

  @ManyToOne(() => CustomerAddress, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'address_id' })
  installationAddress: CustomerAddress;

  @Column({ name: 'created_by_id', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'enum', enum: QuotationStatus, default: QuotationStatus.DRAFT })
  status: QuotationStatus;

  @Column({ name: 'quotation_date', type: 'date' })
  quotationDate: string;

  @Column({ name: 'valid_until_date', type: 'date', nullable: true })
  validUntilDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'terms_and_conditions', type: 'text', nullable: true })
  termsAndConditions: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ name: 'subtotal_products', type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotalProducts: number;

  @Column({ name: 'subtotal_labour', type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotalLabour: number;

  @Column({ name: 'subtotal_additional', type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotalAdditional: number;

  @Column({ name: 'discount_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'taxable_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  taxableAmount: number;

  @Column({ name: 'vat_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ name: 'grand_total', type: 'numeric', precision: 12, scale: 2, default: 0 })
  grandTotal: number;

  @Column({ name: 'revision', type: 'int', default: 1 })
  revision: number;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date;

  @Column({ name: 'viewed_at', type: 'timestamptz', nullable: true })
  viewedAt: Date;

  @Column({ name: 'accepted_at', type: 'timestamptz', nullable: true })
  acceptedAt: Date;

  @Column({ name: 'rejected_at', type: 'timestamptz', nullable: true })
  rejectedAt: Date;

  @Column({ name: 'converted_at', type: 'timestamptz', nullable: true })
  convertedAt: Date;

  @OneToMany(() => QuotationLine, (line) => line.quotation, { cascade: true })
  lines: QuotationLine[];

  @OneToMany(() => QuotationLabourCharge, (lc) => lc.quotation, { cascade: true })
  labourCharges: QuotationLabourCharge[];

  @OneToMany(() => QuotationAdditionalCharge, (ac) => ac.quotation, { cascade: true })
  additionalCharges: QuotationAdditionalCharge[];
}

@Entity('quotation_lines')
export class QuotationLine extends BaseEntity {
  @Column({ name: 'quotation_id' })
  quotationId: string;

  @ManyToOne(() => Quotation, (q) => q.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotation_id' })
  quotation: Quotation;

  @Column({ name: 'product_id', nullable: true })
  productId: string;

  @Column({ name: 'product_name', length: 255 })
  productName: string;

  @Column({ name: 'product_sku', nullable: true, length: 100 })
  productSku: string;

  @Column({ name: 'model_number', nullable: true, length: 150 })
  modelNumber: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'numeric', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ name: 'discount_percent', type: 'numeric', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ name: 'line_total', type: 'numeric', precision: 12, scale: 2 })
  lineTotal: number;

  @Column({ name: 'vat_rate', type: 'numeric', precision: 5, scale: 2, default: 20 })
  vatRate: number;

  @Column({ name: 'vat_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}

@Entity('quotation_labour_charges')
export class QuotationLabourCharge extends BaseEntity {
  @Column({ name: 'quotation_id' })
  quotationId: string;

  @ManyToOne(() => Quotation, (q) => q.labourCharges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotation_id' })
  quotation: Quotation;

  @Column({ length: 200 })
  description: string;

  @Column({ name: 'charge_type', length: 50, default: 'fixed' })
  chargeType: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 1 })
  quantity: number;

  @Column({ name: 'unit_rate', type: 'numeric', precision: 12, scale: 2 })
  unitRate: number;

  @Column({ name: 'line_total', type: 'numeric', precision: 12, scale: 2 })
  lineTotal: number;

  @Column({ name: 'vat_rate', type: 'numeric', precision: 5, scale: 2, default: 20 })
  vatRate: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}

@Entity('quotation_additional_charges')
export class QuotationAdditionalCharge extends BaseEntity {
  @Column({ name: 'quotation_id' })
  quotationId: string;

  @ManyToOne(() => Quotation, (q) => q.additionalCharges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotation_id' })
  quotation: Quotation;

  @Column({ length: 200 })
  description: string;

  @Column({ name: 'charge_type', length: 50, default: 'service' })
  chargeType: string;

  @Column({ name: 'product_id', nullable: true })
  productId: string;

  @Column({ type: 'numeric', precision: 10, scale: 3, default: 1 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'numeric', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ name: 'line_total', type: 'numeric', precision: 12, scale: 2 })
  lineTotal: number;

  @Column({ name: 'vat_rate', type: 'numeric', precision: 5, scale: 2, default: 20 })
  vatRate: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}
