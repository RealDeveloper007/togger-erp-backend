import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuotationReferenceNumber1792700000000 implements MigrationInterface {
  name = 'AddQuotationReferenceNumber1792700000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "reference_number" varchar(100)');
    await queryRunner.query('UPDATE "quotations" SET "reference_number" = "quotation_number" WHERE "reference_number" IS NULL OR btrim("reference_number") = \'\'');
    await queryRunner.query('ALTER TABLE "quotations" ALTER COLUMN "reference_number" SET NOT NULL');
    await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS "UQ_quotations_reference_number_normalized" ON "quotations" (lower(btrim("reference_number"))) WHERE "reference_number" IS NOT NULL');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "UQ_quotations_reference_number_normalized"');
    await queryRunner.query('ALTER TABLE "quotations" ALTER COLUMN "reference_number" DROP NOT NULL');
    await queryRunner.query('ALTER TABLE "quotations" DROP COLUMN IF EXISTS "reference_number"');
  }
}
