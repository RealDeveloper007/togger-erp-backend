import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceLineProduct1792900000000 implements MigrationInterface {
  name = 'AddInvoiceLineProduct1792900000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "invoice_lines" ADD COLUMN IF NOT EXISTS "product_id" uuid');
    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_invoice_lines_product') THEN
        ALTER TABLE "invoice_lines" ADD CONSTRAINT "FK_invoice_lines_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "invoice_lines" DROP CONSTRAINT IF EXISTS "FK_invoice_lines_product"');
    await queryRunner.query('ALTER TABLE "invoice_lines" DROP COLUMN IF EXISTS "product_id"');
  }
}
