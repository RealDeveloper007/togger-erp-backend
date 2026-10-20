import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOpenQuotationStatus1792500000000 implements MigrationInterface {
  name = 'AddOpenQuotationStatus1792500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE quotation_status_type text;
      BEGIN
        SELECT t.typname INTO quotation_status_type
        FROM pg_type t
        JOIN pg_enum e ON e.enumtypid = t.oid
        GROUP BY t.typname
        HAVING BOOL_OR(e.enumlabel = 'converted_to_job')
          AND BOOL_OR(e.enumlabel = 'draft')
          AND BOOL_OR(e.enumlabel = 'sent')
        LIMIT 1;

        IF quotation_status_type IS NULL THEN
          RAISE EXCEPTION 'Could not find the quotation status enum';
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_enum e
          JOIN pg_type t ON t.oid = e.enumtypid
          WHERE t.typname = quotation_status_type AND e.enumlabel = 'open'
        ) THEN
          EXECUTE format('ALTER TYPE %I ADD VALUE %L', quotation_status_type, 'open');
        END IF;
      END $$;
    `);
  }

  async down(): Promise<void> {
    // PostgreSQL does not support removing enum labels safely.
  }
}
