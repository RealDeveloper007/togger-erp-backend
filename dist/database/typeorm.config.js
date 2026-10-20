"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOrmConfig = void 0;
const path_1 = require("path");
const typeOrmConfig = (configService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'root'),
    password: configService.get('DB_PASSWORD', 'root_dev_password'),
    database: configService.get('DB_DATABASE', 'toggar_erp'),
    ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
    entities: [(0, path_1.join)(__dirname, '..', '**', '*.entity{.ts,.js}')],
    migrations: [(0, path_1.join)(__dirname, 'migrations', '*{.ts,.js}')],
    synchronize: false,
    logging: configService.get('NODE_ENV') === 'development' ? ['error', 'warn'] : ['error'],
    migrationsRun: false,
});
exports.typeOrmConfig = typeOrmConfig;
//# sourceMappingURL=typeorm.config.js.map