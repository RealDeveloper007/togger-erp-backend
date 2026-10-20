"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const path_1 = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: (0, path_1.join)(__dirname, '../../.env') });
dotenv.config({ path: (0, path_1.join)(__dirname, '../../../.env') });
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root_dev_password',
    database: process.env.DB_DATABASE || 'toggar_erp',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    entities: [(0, path_1.join)(__dirname, '..', '**', '*.entity{.ts,.js}')],
    migrations: [(0, path_1.join)(__dirname, 'migrations', '*{.ts,.js}')],
    synchronize: false,
    logging: false,
});
//# sourceMappingURL=data-source.js.map