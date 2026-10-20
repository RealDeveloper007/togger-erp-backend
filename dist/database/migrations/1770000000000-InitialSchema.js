"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialSchema1770000000000 = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
class InitialSchema1770000000000 {
    constructor() {
        this.name = 'InitialSchema1770000000000';
    }
    async up(queryRunner) {
        const sqlPath = (0, path_1.resolve)(__dirname, '../../../../database/schema.sql');
        const source = (0, fs_1.readFileSync)(sqlPath, 'utf8').trim();
        const statements = source
            .split(/;\s*(?:\r?\n\s*\r?\n|$)/)
            .map((statement) => statement.trim())
            .filter(Boolean);
        for (const statement of statements) {
            await queryRunner.query(statement);
        }
    }
    async down(queryRunner) {
        const sqlPath = (0, path_1.resolve)(__dirname, '../../../../database/schema.sql');
        const source = (0, fs_1.readFileSync)(sqlPath, 'utf8');
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
exports.InitialSchema1770000000000 = InitialSchema1770000000000;
//# sourceMappingURL=1770000000000-InitialSchema.js.map