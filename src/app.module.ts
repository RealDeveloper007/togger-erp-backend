import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { MenusModule } from './menus/menus.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { CustomersModule } from './customers/customers.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { QuotationsModule } from './quotations/quotations.module';
import { JobsModule } from './jobs/jobs.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PricingModule } from './pricing/pricing.module';
import { StorageModule } from './storage/storage.module';
import { EmailModule } from './email/email.module';
import { LabourModule } from './labour/labour.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { PdfModule } from './pdf/pdf.module';
import { typeOrmConfig } from './database/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../.env'] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD') || undefined,
        },
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    MenusModule,
    ProductsModule,
    InventoryModule,
    CustomersModule,
    SuppliersModule,
    QuotationsModule,
    JobsModule,
    InvoicesModule,
    ReportsModule,
    SettingsModule,
    AuditLogsModule,
    NotificationsModule,
    PricingModule,
    StorageModule,
    EmailModule,
    LabourModule,
    PurchaseOrdersModule,
    PdfModule,
  ],
})
export class AppModule {}
