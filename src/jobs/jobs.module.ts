import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Job, JobMaterialUsage, JobLabourRecord } from './entities/job.entity';
import { Quotation } from '../quotations/entities/quotation.entity';
import { CompanySettings } from '../settings/entities/company-settings.entity';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, JobMaterialUsage, JobLabourRecord, Quotation, CompanySettings]),
    InventoryModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
