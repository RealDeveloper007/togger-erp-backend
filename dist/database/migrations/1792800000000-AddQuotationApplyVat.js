"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddQuotationApplyVat1792800000000 = void 0;
class AddQuotationApplyVat1792800000000 {
    constructor() {
        this.name = 'AddQuotationApplyVat1792800000000';
    }
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "apply_vat" boolean NOT NULL DEFAULT true');
        await queryRunner.query(`
      UPDATE "quotations" q
      SET "apply_vat" = (
        COALESCE(q."vat_amount", 0) > 0
        OR EXISTS (SELECT 1 FROM "quotation_lines" l WHERE l."quotation_id" = q."id" AND COALESCE(l."vat_rate", 0) > 0)
        OR EXISTS (SELECT 1 FROM "quotation_labour_charges" lc WHERE lc."quotation_id" = q."id" AND COALESCE(lc."vat_rate", 0) > 0)
        OR EXISTS (SELECT 1 FROM "quotation_additional_charges" ac WHERE ac."quotation_id" = q."id" AND COALESCE(ac."vat_rate", 0) > 0)
      )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE "quotations" DROP COLUMN IF EXISTS "apply_vat"');
    }
}
exports.AddQuotationApplyVat1792800000000 = AddQuotationApplyVat1792800000000;
//# sourceMappingURL=1792800000000-AddQuotationApplyVat.js.map