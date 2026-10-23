import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * One-time data reset for customers, the material catalog, quotations, inventory, and invoices.
 * Dependent purchase order lines and job material usage are cleared so products
 * can be removed without violating foreign keys. Jobs are cleared because they
 * require a customer; purchase order headers remain.
 * This migration is intentionally irreversible because it deletes application data.
 */
export class ClearMaterialsQuotationsStockAndInvoices1793200000000 implements MigrationInterface {
  name = 'ClearMaterialsQuotationsStockAndInvoices1793200000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "payments"');
    await queryRunner.query('DELETE FROM "invoice_lines"');
    await queryRunner.query('DELETE FROM "invoices"');

    await queryRunner.query('DELETE FROM "quotation_lines"');
    await queryRunner.query('DELETE FROM "quotation_labour_charges"');
    await queryRunner.query('DELETE FROM "quotation_additional_charges"');
    await queryRunner.query('DELETE FROM "quotations"');

    await queryRunner.query('DELETE FROM "jobs"');

    await queryRunner.query('DELETE FROM "stock_movements"');
    await queryRunner.query('DELETE FROM "stock_balances"');
    await queryRunner.query('DELETE FROM "purchase_order_lines"');
    await queryRunner.query('DELETE FROM "job_material_usages"');
    await queryRunner.query('DELETE FROM "products"');

    await queryRunner.query('DELETE FROM "customers"');
  }

  async down(): Promise<void> {
    throw new Error('This data-clearing migration cannot be reverted; restore a database backup to recover deleted records.');
  }
}
