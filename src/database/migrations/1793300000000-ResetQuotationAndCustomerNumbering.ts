import { MigrationInterface, QueryRunner } from 'typeorm';

/** Ensure numbering starts at the requested values after the data reset. */
export class ResetQuotationAndCustomerNumbering1793300000000 implements MigrationInterface {
  name = 'ResetQuotationAndCustomerNumbering1793300000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE SEQUENCE IF NOT EXISTS "customers_customer_code_seq"');
    await queryRunner.query(`
      UPDATE "customers"
      SET "customer_code" = UPPER("customer_code")
      WHERE "customer_code" ~* '^cus-[0-9]+$'
    `);
    await queryRunner.query(`
      ALTER TABLE "customers"
      ALTER COLUMN "customer_code"
      SET DEFAULT ('CUS-' || LPAD(nextval('customers_customer_code_seq')::text, 4, '0'))
    `);
    await queryRunner.query(`
      SELECT setval(
        'customers_customer_code_seq',
        COALESCE(MAX(SUBSTRING("customer_code" FROM 5)::bigint), 0) + 1,
        false
      )
      FROM "customers"
      WHERE "customer_code" ~ '^CUS-[0-9]+$'
    `);
    await queryRunner.query(`
      UPDATE "company_settings"
      SET "quotation_prefix" = 'TOG-',
          "quotation_next_number" = GREATEST(
            1001,
            COALESCE((
              SELECT MAX(SUBSTRING("quotation_number" FROM '^TOG-([0-9]+)$')::integer)
              FROM "quotations"
            ), 0) + 1
          )
    `);
  }

  async down(): Promise<void> {
    throw new Error('This numbering migration cannot be reverted safely.');
  }
}
