"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddQuotationReferenceNumber1792700000000 = void 0;
class AddQuotationReferenceNumber1792700000000 {
    constructor() {
        this.name = 'AddQuotationReferenceNumber1792700000000';
    }
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "reference_number" varchar(100)');
        await queryRunner.query('UPDATE "quotations" SET "reference_number" = "quotation_number" WHERE "reference_number" IS NULL OR btrim("reference_number") = \'\'');
        await queryRunner.query('ALTER TABLE "quotations" ALTER COLUMN "reference_number" SET NOT NULL');
        await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS "UQ_quotations_reference_number_normalized" ON "quotations" (lower(btrim("reference_number"))) WHERE "reference_number" IS NOT NULL');
    }
    async down(queryRunner) {
        await queryRunner.query('DROP INDEX IF EXISTS "UQ_quotations_reference_number_normalized"');
        await queryRunner.query('ALTER TABLE "quotations" ALTER COLUMN "reference_number" DROP NOT NULL');
        await queryRunner.query('ALTER TABLE "quotations" DROP COLUMN IF EXISTS "reference_number"');
    }
}
exports.AddQuotationReferenceNumber1792700000000 = AddQuotationReferenceNumber1792700000000;
//# sourceMappingURL=1792700000000-AddQuotationReferenceNumber.js.map