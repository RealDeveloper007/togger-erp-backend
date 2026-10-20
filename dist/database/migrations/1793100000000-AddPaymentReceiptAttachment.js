"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPaymentReceiptAttachment1793100000000 = void 0;
class AddPaymentReceiptAttachment1793100000000 {
    constructor() {
        this.name = 'AddPaymentReceiptAttachment1793100000000';
    }
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "attachment_key" text');
    }
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE "payments" DROP COLUMN IF EXISTS "attachment_key"');
    }
}
exports.AddPaymentReceiptAttachment1793100000000 = AddPaymentReceiptAttachment1793100000000;
//# sourceMappingURL=1793100000000-AddPaymentReceiptAttachment.js.map