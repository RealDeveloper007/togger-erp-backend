import { readFileSync } from 'fs';
import { resolve } from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

/** Creates the initial application schema from the checked-in SQL source. */
export class InitialSchema1770000000000 implements MigrationInterface {
  name = 'InitialSchema1770000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const sqlPath = resolve(__dirname, '../../../../database/schema.sql');
    const source = readFileSync(sqlPath, 'utf8').trim();
    const statements = source
      .split(/;\s*(?:\r?\n\s*\r?\n|$)/)
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await queryRunner.query(statement);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const sqlPath = resolve(__dirname, '../../../../database/schema.sql');
    const source = readFileSync(sqlPath, 'utf8');
    const tables = [...source.matchAll(/CREATE TABLE "([^"]+)"/g)].map((match) => match[1]);
    const enumTypes = [...source.matchAll(/CREATE TYPE "([^"]+)" AS ENUM/g)].map((match) => match[1]);

    for (const table of tables.reverse()) {
      await queryRunner.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    }
    for (const type of enumTypes.reverse()) {
      await queryRunner.query(`DROP TYPE IF EXISTS "${type}" CASCADE`);
    }
  }
}
