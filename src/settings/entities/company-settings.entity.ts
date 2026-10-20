import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('company_settings')
export class CompanySettings extends BaseEntity {
  @Column({ length: 200, unique: true })
  name: string;

  @Column({ nullable: true, length: 255 })
  email: string;

  @Column({ nullable: true, length: 30 })
  phone: string;

  @Column({ nullable: true, length: 255 })
  website: string;

  @Column({ name: 'address_line1', nullable: true })
  addressLine1: string;

  @Column({ name: 'address_line2', nullable: true })
  addressLine2: string;

  @Column({ nullable: true, length: 100 })
  city: string;

  @Column({ nullable: true, length: 20 })
  postcode: string;

  @Column({ default: 'United Kingdom', length: 100 })
  country: string;

  @Column({ name: 'vat_number', nullable: true, length: 50 })
  vatNumber: string;

  @Column({ name: 'company_registration_number', nullable: true, length: 50 })
  companyRegistrationNumber: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ name: 'quotation_prefix', default: 'TOG-', length: 20 })
  quotationPrefix: string;

  @Column({ name: 'invoice_prefix', default: 'INV-', length: 20 })
  invoicePrefix: string;

  @Column({ name: 'job_prefix', default: 'JOB-', length: 20 })
  jobPrefix: string;

  @Column({ name: 'po_prefix', default: 'PO-', length: 20 })
  poPrefix: string;

  @Column({ name: 'quotation_next_number', type: 'int', default: 1001 })
  quotationNextNumber: number;

  @Column({ name: 'invoice_next_number', type: 'int', default: 1001 })
  invoiceNextNumber: number;

  @Column({ name: 'job_next_number', type: 'int', default: 1001 })
  jobNextNumber: number;

  @Column({ name: 'po_next_number', type: 'int', default: 1001 })
  poNextNumber: number;

  @Column({ name: 'default_payment_terms_days', type: 'int', default: 30 })
  defaultPaymentTermsDays: number;

  @Column({ name: 'default_quotation_valid_days', type: 'int', default: 30 })
  defaultQuotationValidDays: number;

  @Column({ name: 'default_terms_and_conditions', type: 'text', nullable: true })
  defaultTermsAndConditions: string;

  @Column({ name: 'bank_name', nullable: true, length: 150 })
  bankName: string;

  @Column({ name: 'bank_account_name', nullable: true, length: 150 })
  bankAccountName: string;

  @Column({ name: 'bank_sort_code', nullable: true, length: 20 })
  bankSortCode: string;

  @Column({ name: 'bank_account_number', nullable: true, length: 30 })
  bankAccountNumber: string;

  @Column({ name: 'bank_iban', nullable: true, length: 50 })
  bankIban: string;
}
