import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Job } from '../../jobs/entities/job.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { Quotation } from '../../quotations/entities/quotation.entity';
import { Product } from '../../products/entities/product.entity';

export enum InvoiceStatus {
  DRAFT = 'draft', SENT = 'sent', PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid', OVERDUE = 'overdue', CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer', CASH = 'cash', CARD = 'card', CHEQUE = 'cheque', OTHER = 'other',
}

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ name: 'invoice_number', unique: true, length: 50 })
  @Index()
  invoiceNumber: string;

  @Column({ name: 'job_id', nullable: true })
  jobId: string;

  @ManyToOne(() => Job, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ name: 'quotation_id', nullable: true })
  quotationId: string;

  @ManyToOne(() => Quotation, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'quotation_id' })
  quotation: Quotation;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'created_by_id', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @Column({ name: 'invoice_date', type: 'date' })
  invoiceDate: string;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: string;

  @Column({ name: 'subtotal', type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ name: 'discount_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'vat_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ name: 'grand_total', type: 'numeric', precision: 12, scale: 2, default: 0 })
  grandTotal: number;

  @Column({ name: 'amount_paid', type: 'numeric', precision: 12, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ name: 'amount_outstanding', type: 'numeric', precision: 12, scale: 2, default: 0 })
  amountOutstanding: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'terms_and_conditions', type: 'text', nullable: true })
  termsAndConditions: string;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date;

  @OneToMany(() => InvoiceLine, (line) => line.invoice, { cascade: true })
  lines: InvoiceLine[];

  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments: Payment[];
}

@Entity('invoice_lines')
export class InvoiceLine extends BaseEntity {
  @Column({ name: 'invoice_id' })
  invoiceId: string;

  @ManyToOne(() => Invoice, (inv) => inv.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ name: 'product_id', nullable: true })
  productId: string;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ length: 255 })
  description: string;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'numeric', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ name: 'line_total', type: 'numeric', precision: 12, scale: 2 })
  lineTotal: number;

  @Column({ name: 'vat_rate', type: 'numeric', precision: 5, scale: 2, default: 20 })
  vatRate: number;

  @Column({ name: 'vat_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}

@Entity('payments')
export class Payment extends BaseEntity {
  @Column({ name: 'invoice_id' })
  invoiceId: string;

  @ManyToOne(() => Invoice, (inv) => inv.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ name: 'recorded_by_id', nullable: true })
  recordedById: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recorded_by_id' })
  recordedBy: User;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: string;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.BANK_TRANSFER })
  method: PaymentMethod;

  @Column({ name: 'reference_number', nullable: true, length: 100 })
  referenceNumber: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ name: 'attachment_key', nullable: true, type: 'text' })
  attachmentKey: string;
}
