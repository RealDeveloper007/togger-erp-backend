"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const throttler_1 = require("@nestjs/throttler");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const roles_module_1 = require("./roles/roles.module");
const permissions_module_1 = require("./permissions/permissions.module");
const menus_module_1 = require("./menus/menus.module");
const products_module_1 = require("./products/products.module");
const inventory_module_1 = require("./inventory/inventory.module");
const customers_module_1 = require("./customers/customers.module");
const suppliers_module_1 = require("./suppliers/suppliers.module");
const quotations_module_1 = require("./quotations/quotations.module");
const jobs_module_1 = require("./jobs/jobs.module");
const invoices_module_1 = require("./invoices/invoices.module");
const reports_module_1 = require("./reports/reports.module");
const settings_module_1 = require("./settings/settings.module");
const audit_logs_module_1 = require("./audit-logs/audit-logs.module");
const notifications_module_1 = require("./notifications/notifications.module");
const pricing_module_1 = require("./pricing/pricing.module");
const storage_module_1 = require("./storage/storage.module");
const email_module_1 = require("./email/email.module");
const labour_module_1 = require("./labour/labour.module");
const purchase_orders_module_1 = require("./purchase-orders/purchase-orders.module");
const pdf_module_1 = require("./pdf/pdf.module");
const typeorm_config_1 = require("./database/typeorm.config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../.env'] }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: typeorm_config_1.typeOrmConfig,
            }),
            bull_1.BullModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    redis: {
                        host: config.get('REDIS_HOST', 'localhost'),
                        port: config.get('REDIS_PORT', 6379),
                        password: config.get('REDIS_PASSWORD') || undefined,
                    },
                }),
            }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            permissions_module_1.PermissionsModule,
            menus_module_1.MenusModule,
            products_module_1.ProductsModule,
            inventory_module_1.InventoryModule,
            customers_module_1.CustomersModule,
            suppliers_module_1.SuppliersModule,
            quotations_module_1.QuotationsModule,
            jobs_module_1.JobsModule,
            invoices_module_1.InvoicesModule,
            reports_module_1.ReportsModule,
            settings_module_1.SettingsModule,
            audit_logs_module_1.AuditLogsModule,
            notifications_module_1.NotificationsModule,
            pricing_module_1.PricingModule,
            storage_module_1.StorageModule,
            email_module_1.EmailModule,
            labour_module_1.LabourModule,
            purchase_orders_module_1.PurchaseOrdersModule,
            pdf_module_1.PdfModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map