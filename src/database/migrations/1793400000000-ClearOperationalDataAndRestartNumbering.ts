import { MigrationInterface, QueryRunner } from 'typeorm';

/** One-time cleanup for operational records and their dependent data. */
export class ClearOperationalDataAndRestartNumbering1793400000000 implements MigrationInterface {
  name = 'ClearOperationalDataAndRestartNumbering1793400000000';

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

    await queryRunner.query(`
      ALTER TABLE "customers"
      ALTER COLUMN "customer_code"
      SET DEFAULT ('CUS-' || LPAD(nextval('customers_customer_code_seq')::text, 4, '0'))
    `);
    await queryRunner.query(`SELECT setval('customers_customer_code_seq', 1, false)`);
    await queryRunner.query(`
      UPDATE "company_settings"
      SET "quotation_prefix" = 'TOG-', "quotation_next_number" = 1001
    `);
  }

  async down(): Promise<void> {
    throw new Error('This data-clearing migration cannot be reverted; restore a database backup to recover deleted records.');
  }
}
