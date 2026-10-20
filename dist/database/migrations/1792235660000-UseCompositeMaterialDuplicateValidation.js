"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UseCompositeMaterialDuplicateValidation1792235660000 = void 0;
class UseCompositeMaterialDuplicateValidation1792235660000 {
    constructor() {
        this.name = 'UseCompositeMaterialDuplicateValidation1792235660000';
    }
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "UQ_c44ac33a05b144dd0d9ddcf9327"');
    }
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE "products" ADD CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku")');
    }
}
exports.UseCompositeMaterialDuplicateValidation1792235660000 = UseCompositeMaterialDuplicateValidation1792235660000;
//# sourceMappingURL=1792235660000-UseCompositeMaterialDuplicateValidation.js.map