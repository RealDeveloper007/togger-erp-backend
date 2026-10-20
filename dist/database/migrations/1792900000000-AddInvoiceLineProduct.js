"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddInvoiceLineProduct1792900000000 = void 0;
class AddInvoiceLineProduct1792900000000 {
    constructor() {
        this.name = 'AddInvoiceLineProduct1792900000000';
    }
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE "invoice_lines" ADD COLUMN IF NOT EXISTS "product_id" uuid');
        await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_invoice_lines_product') THEN
        ALTER TABLE "invoice_lines" ADD CONSTRAINT "FK_invoice_lines_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$`);
    }
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE "invoice_lines" DROP CONSTRAINT IF EXISTS "FK_invoice_lines_product"');
        await queryRunner.query('ALTER TABLE "invoice_lines" DROP COLUMN IF EXISTS "product_id"');
    }
}
exports.AddInvoiceLineProduct1792900000000 = AddInvoiceLineProduct1792900000000;
//# sourceMappingURL=1792900000000-AddInvoiceLineProduct.js.map