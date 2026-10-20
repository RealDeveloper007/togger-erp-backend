import { MigrationInterface, QueryRunner } from 'typeorm';

/** Product codes are optional and only need to be unique as part of the material identity. */
export class UseCompositeMaterialDuplicateValidation1792235660000 implements MigrationInterface {
  name = 'UseCompositeMaterialDuplicateValidation1792235660000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "UQ_c44ac33a05b144dd0d9ddcf9327"');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "products" ADD CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku")');
  }
}
