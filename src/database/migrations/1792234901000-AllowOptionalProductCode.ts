import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowOptionalProductCode1792234901000 implements MigrationInterface {
  name = 'AllowOptionalProductCode1792234901000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "products" ALTER COLUMN "sku" DROP NOT NULL');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "products" SET "sku" = 'LEGACY-' || "id"::text WHERE "sku" IS NULL`);
    await queryRunner.query('ALTER TABLE "products" ALTER COLUMN "sku" SET NOT NULL');
  }
}
