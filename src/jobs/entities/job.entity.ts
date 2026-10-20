import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Quotation } from '../../quotations/entities/quotation.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { CustomerAddress } from '../../customers/entities/customer-address.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

export enum JobStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('jobs')
export class Job extends BaseEntity {
  @Column({ name: 'job_number', unique: true, length: 50 })
  @Index()
  jobNumber: string;

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

  @Column({ name: 'address_id', nullable: true })
  addressId: string;

  @ManyToOne(() => CustomerAddress, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'address_id' })
  installationAddress: CustomerAddress;

  @Column({ name: 'assigned_engineer_id', nullable: true })
  assignedEngineerId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_engineer_id' })
  assignedEngineer: User;

  @Column({ name: 'created_by_id', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.PENDING })
  status: JobStatus;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'scheduled_date', type: 'date', nullable: true })
  scheduledDate: string;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ name: 'completion_notes', type: 'text', nullable: true })
  completionNotes: string;

  @Column({ name: 'estimated_total', type: 'numeric', precision: 12, scale: 2, default: 0 })
  estimatedTotal: number;

  @Column({ name: 'actual_materials_cost', type: 'numeric', precision: 12, scale: 2, default: 0 })
  actualMaterialsCost: number;

  @Column({ name: 'actual_labour_cost', type: 'numeric', precision: 12, scale: 2, default: 0 })
  actualLabourCost: number;

  @Column({ name: 'actual_additional_cost', type: 'numeric', precision: 12, scale: 2, default: 0 })
  actualAdditionalCost: number;

  @Column({ name: 'actual_total', type: 'numeric', precision: 12, scale: 2, default: 0 })
  actualTotal: number;

  @Column({ name: 'is_invoiced', default: false })
  isInvoiced: boolean;

  @OneToMany(() => JobMaterialUsage, (m) => m.job, { cascade: true })
  materialUsages: JobMaterialUsage[];

  @OneToMany(() => JobLabourRecord, (l) => l.job, { cascade: true })
  labourRecords: JobLabourRecord[];
}

@Entity('job_material_usages')
export class JobMaterialUsage extends BaseEntity {
  @Column({ name: 'job_id' })
  jobId: string;

  @ManyToOne(() => Job, (j) => j.materialUsages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  quantity: number;

  @Column({ name: 'unit_cost', type: 'numeric', precision: 12, scale: 2, nullable: true })
  unitCost: number;

  @Column({ name: 'total_cost', type: 'numeric', precision: 12, scale: 2, nullable: true })
  totalCost: number;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ name: 'recorded_by_id', nullable: true })
  recordedById: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recorded_by_id' })
  recordedBy: User;
}

@Entity('job_labour_records')
export class JobLabourRecord extends BaseEntity {
  @Column({ name: 'job_id' })
  jobId: string;

  @ManyToOne(() => Job, (j) => j.labourRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ name: 'engineer_id', nullable: true })
  engineerId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'engineer_id' })
  engineer: User;

  @Column({ length: 200 })
  description: string;

  @Column({ name: 'hours_worked', type: 'numeric', precision: 8, scale: 2, default: 0 })
  hoursWorked: number;

  @Column({ name: 'hourly_rate', type: 'numeric', precision: 10, scale: 2, default: 0 })
  hourlyRate: number;

  @Column({ name: 'total_cost', type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalCost: number;

  @Column({ name: 'work_date', type: 'date', nullable: true })
  workDate: string;
}
