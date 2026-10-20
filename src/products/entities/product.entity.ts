import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Brand } from './brand.entity';
import { Category } from './category.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { VatRate } from '../../settings/entities/vat-rate.entity';

export enum UnitOfMeasurement {
  EACH = 'each',
  METER = 'meter',
  KG = 'kg',
  LITRE = 'litre',
  BOX = 'box',
  PACK = 'pack',
  ROLL = 'roll',
  SET = 'set',
}

@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  sku: string | null;

  @Column({ length: 255 })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'model_number', nullable: true, length: 150 })
  @Index()
  modelNumber: string;

  @Column({ nullable: true, length: 150 })
  manufacturer: string;

  @Column({ name: 'purchase_price', type: 'numeric', precision: 12, scale: 2, default: 0 })
  purchasePrice: number;

  @Column({ name: 'selling_price', type: 'numeric', precision: 12, scale: 2, default: 0 })
  sellingPrice: number;

  @Column({ type: 'enum', enum: UnitOfMeasurement, default: UnitOfMeasurement.EACH })
  unit: UnitOfMeasurement;

  @Column({ name: 'reorder_level', type: 'int', default: 5 })
  reorderLevel: number;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'warranty_months', type: 'int', nullable: true })
  warrantyMonths: number;

  @Column({ name: 'warranty_notes', nullable: true, type: 'text' })
  warrantyNotes: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_stockable', default: true })
  isStockable: boolean;

  @Column({ name: 'brand_id', nullable: true })
  brandId: string;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @Column({ name: 'supplier_id', nullable: true })
  supplierId: string;

  @Column({ name: 'vat_rate_id', nullable: true })
  vatRateId: string;

  @ManyToOne(() => Brand, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Supplier, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ManyToOne(() => VatRate, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'vat_rate_id' })
  vatRate: VatRate;
}
