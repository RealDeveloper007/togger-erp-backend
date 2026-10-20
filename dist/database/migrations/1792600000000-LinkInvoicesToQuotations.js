"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkInvoicesToQuotations1792600000000 = void 0;
class LinkInvoicesToQuotations1792600000000 {
    constructor() {
        this.name = 'LinkInvoicesToQuotations1792600000000';
    }
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "quotation_id" uuid');
        await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS "UQ_invoices_quotation_id" ON "invoices" ("quotation_id") WHERE "quotation_id" IS NOT NULL');
        await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_invoices_quotation_id') THEN
          ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_quotation_id"
          FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "FK_invoices_quotation_id"');
        await queryRunner.query('DROP INDEX IF EXISTS "UQ_invoices_quotation_id"');
        await queryRunner.query('ALTER TABLE "invoices" DROP COLUMN IF EXISTS "quotation_id"');
    }
}
exports.LinkInvoicesToQuotations1792600000000 = LinkInvoicesToQuotations1792600000000;
//# sourceMappingURL=1792600000000-LinkInvoicesToQuotations.js.map