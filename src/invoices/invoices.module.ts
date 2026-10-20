import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { Invoice, InvoiceLine, Payment } from './entities/invoice.entity';
import { Job } from '../jobs/entities/job.entity';
import { CompanySettings } from '../settings/entities/company-settings.entity';
import { Quotation } from '../quotations/entities/quotation.entity';
import { PdfModule } from '../pdf/pdf.module';
import { InventoryModule } from '../inventory/inventory.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceLine, Payment, Job, CompanySettings, Quotation]), PdfModule, InventoryModule, StorageModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
