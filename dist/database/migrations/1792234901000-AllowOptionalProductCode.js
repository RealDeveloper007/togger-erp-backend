"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllowOptionalProductCode1792234901000 = void 0;
class AllowOptionalProductCode1792234901000 {
    constructor() {
        this.name = 'AllowOptionalProductCode1792234901000';
    }
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE "products" ALTER COLUMN "sku" DROP NOT NULL');
    }
    async down(queryRunner) {
        await queryRunner.query(`UPDATE "products" SET "sku" = 'LEGACY-' || "id"::text WHERE "sku" IS NULL`);
        await queryRunner.query('ALTER TABLE "products" ALTER COLUMN "sku" SET NOT NULL');
    }
}
exports.AllowOptionalProductCode1792234901000 = AllowOptionalProductCode1792234901000;
//# sourceMappingURL=1792234901000-AllowOptionalProductCode.js.map