import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';
import { Quotation, QuotationLine, QuotationLabourCharge, QuotationAdditionalCharge } from './entities/quotation.entity';
import { Product } from '../products/entities/product.entity';
import { CompanySettings } from '../settings/entities/company-settings.entity';
import { PricingModule } from '../pricing/pricing.module';
import { PdfModule } from '../pdf/pdf.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quotation, QuotationLine, QuotationLabourCharge, QuotationAdditionalCharge,
      Product, CompanySettings,
    ]),
    PricingModule,
    PdfModule,
    EmailModule,
  ],
  controllers: [QuotationsController],
  providers: [QuotationsService],
  exports: [QuotationsService],
})
export class QuotationsModule {}
