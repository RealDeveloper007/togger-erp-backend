"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCustomerCodesAndContactUniqueness1792238000000 = void 0;
class AddCustomerCodesAndContactUniqueness1792238000000 {
    constructor() {
        this.name = 'AddCustomerCodesAndContactUniqueness1792238000000';
    }
    async up(queryRunner) {
        const duplicateEmails = await queryRunner.query(`
      SELECT LOWER(BTRIM("email")) AS value, COUNT(*)::int AS count
      FROM "customers"
      WHERE "deleted_at" IS NULL AND NULLIF(BTRIM("email"), '') IS NOT NULL
      GROUP BY LOWER(BTRIM("email")) HAVING COUNT(*) > 1 LIMIT 5
    `);
        const duplicatePhones = await queryRunner.query(`
      SELECT regexp_replace("phone", '[^0-9]', '', 'g') AS value, COUNT(*)::int AS count
      FROM "customers"
      WHERE "deleted_at" IS NULL AND regexp_replace(COALESCE("phone", ''), '[^0-9]', '', 'g') <> ''
      GROUP BY regexp_replace("phone", '[^0-9]', '', 'g') HAVING COUNT(*) > 1 LIMIT 5
    `);
        if (duplicateEmails.length || duplicatePhones.length) {
            const details = [
                duplicateEmails.length ? `duplicate emails: ${duplicateEmails.map((row) => row.value).join(', ')}` : '',
                duplicatePhones.length ? `duplicate phone numbers: ${duplicatePhones.map((row) => row.value).join(', ')}` : '',
            ].filter(Boolean).join('; ');
            throw new Error(`Cannot enforce unique customer contact details until existing duplicates are resolved (${details}).`);
        }
        await queryRunner.query('CREATE SEQUENCE IF NOT EXISTS "customers_customer_code_seq"');
        await queryRunner.query('ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "customer_code" character varying(20)');
        await queryRunner.query(`
      WITH numbered AS (
        SELECT "id", ROW_NUMBER() OVER (ORDER BY "created_at", "id") AS number
        FROM "customers"
      )
      UPDATE "customers" AS customer
      SET "customer_code" = 'cus-' || LPAD(numbered.number::text, 4, '0')
      FROM numbered WHERE customer."id" = numbered."id" AND customer."customer_code" IS NULL
    `);
        await queryRunner.query(`
      SELECT setval('customers_customer_code_seq', COALESCE(MAX(NULLIF(SUBSTRING("customer_code" FROM 5), '')::bigint), 0) + 1, false)
      FROM "customers"
    `);
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "customer_code" SET DEFAULT ('cus-' || LPAD(nextval('customers_customer_code_seq')::text, 4, '0'))`);
        await queryRunner.query('ALTER TABLE "customers" ALTER COLUMN "customer_code" SET NOT NULL');
        await queryRunner.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UQ_customers_customer_code') THEN ALTER TABLE "customers" ADD CONSTRAINT "UQ_customers_customer_code" UNIQUE ("customer_code"); END IF; END $$`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_customers_email_active" ON "customers" (LOWER(BTRIM("email"))) WHERE "deleted_at" IS NULL AND NULLIF(BTRIM("email"), '') IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_customers_phone_active" ON "customers" (regexp_replace("phone", '[^0-9]', '', 'g')) WHERE "deleted_at" IS NULL AND regexp_replace(COALESCE("phone", ''), '[^0-9]', '', 'g') <> ''`);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP INDEX IF EXISTS "UQ_customers_phone_active"');
        await queryRunner.query('DROP INDEX IF EXISTS "UQ_customers_email_active"');
        await queryRunner.query('ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "UQ_customers_customer_code"');
        await queryRunner.query('ALTER TABLE "customers" DROP COLUMN IF EXISTS "customer_code"');
        await queryRunner.query('DROP SEQUENCE IF EXISTS "customers_customer_code_seq"');
    }
}
exports.AddCustomerCodesAndContactUniqueness1792238000000 = AddCustomerCodesAndContactUniqueness1792238000000;
//# sourceMappingURL=1792238000000-AddCustomerCodesAndContactUniqueness.js.map