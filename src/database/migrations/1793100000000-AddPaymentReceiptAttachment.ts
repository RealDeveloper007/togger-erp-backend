import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentReceiptAttachment1793100000000 implements MigrationInterface {
  name = 'AddPaymentReceiptAttachment1793100000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "attachment_key" text');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "payments" DROP COLUMN IF EXISTS "attachment_key"');
  }
}
