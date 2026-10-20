import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetQuotationPrefixToTog1793000000000 implements MigrationInterface {
  name = 'SetQuotationPrefixToTog1793000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "company_settings" ALTER COLUMN "quotation_prefix" SET DEFAULT 'TOG-'`);
    await queryRunner.query(`UPDATE "company_settings" SET "quotation_prefix" = 'TOG-' WHERE "quotation_prefix" = 'QT-'`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "company_settings" SET "quotation_prefix" = 'QT-' WHERE "quotation_prefix" = 'TOG-'`);
    await queryRunner.query(`ALTER TABLE "company_settings" ALTER COLUMN "quotation_prefix" SET DEFAULT 'QT-'`);
  }
}
