"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetQuotationPrefixToTog1793000000000 = void 0;
class SetQuotationPrefixToTog1793000000000 {
    constructor() {
        this.name = 'SetQuotationPrefixToTog1793000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "company_settings" ALTER COLUMN "quotation_prefix" SET DEFAULT 'TOG-'`);
        await queryRunner.query(`UPDATE "company_settings" SET "quotation_prefix" = 'TOG-' WHERE "quotation_prefix" = 'QT-'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`UPDATE "company_settings" SET "quotation_prefix" = 'QT-' WHERE "quotation_prefix" = 'TOG-'`);
        await queryRunner.query(`ALTER TABLE "company_settings" ALTER COLUMN "quotation_prefix" SET DEFAULT 'QT-'`);
    }
}
exports.SetQuotationPrefixToTog1793000000000 = SetQuotationPrefixToTog1793000000000;
//# sourceMappingURL=1793000000000-SetQuotationPrefixToTog.js.map