"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddOpenQuotationStatus1792500000000 = void 0;
class AddOpenQuotationStatus1792500000000 {
    constructor() {
        this.name = 'AddOpenQuotationStatus1792500000000';
    }
    async up(queryRunner) {
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
    async down() {
    }
}
exports.AddOpenQuotationStatus1792500000000 = AddOpenQuotationStatus1792500000000;
//# sourceMappingURL=1792500000000-AddOpenQuotationStatus.js.map