import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import Decimal from 'decimal.js';
import {
  Quotation, QuotationLine, QuotationLabourCharge,
  QuotationAdditionalCharge, QuotationStatus,
} from './entities/quotation.entity';
import { PricingService } from '../pricing/pricing.service';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { Product } from '../products/entities/product.entity';
import { CompanySettings } from '../settings/entities/company-settings.entity';
import { PdfService } from '../pdf/pdf.service';
import { EmailService } from '../email/email.service';

export interface CreateQuotationDto {
  customerId: string;
  referenceNumber?: string;
  submit?: boolean;
  applyVat?: boolean;
  addressId?: string;
  quotationDate: string;
  validUntilDate?: string;
  notes?: string;
  termsAndConditions?: string;
  internalNotes?: string;
  discountAmount?: number;
  lines?: {
    productId?: string;
    productName: string;
    productSku?: string;
    modelNumber?: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    vatRate?: number;
    sortOrder?: number;
  }[];
  labourCharges?: {
    description: string;
    chargeType?: string;
    quantity?: number;
    unitRate: number;
    vatRate?: number;
    sortOrder?: number;
  }[];
  additionalCharges?: {
    description: string;
    chargeType?: string;
    productId?: string;
    quantity?: number;
    unitPrice: number;
    vatRate?: number;
    sortOrder?: number;
  }[];
}

@Injectable()
export class QuotationsService {
  constructor(
    @InjectRepository(Quotation)
    private quotationRepo: Repository<Quotation>,
    @InjectRepository(QuotationLine)
    private lineRepo: Repository<QuotationLine>,
    @InjectRepository(QuotationLabourCharge)
    private labourRepo: Repository<QuotationLabourCharge>,
    @InjectRepository(QuotationAdditionalCharge)
    private additionalRepo: Repository<QuotationAdditionalCharge>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(CompanySettings)
    private settingsRepo: Repository<CompanySettings>,
    @InjectDataSource()
    private dataSource: DataSource,
    private pricingService: PricingService,
    private pdfService: PdfService,
    private emailService: EmailService,
  ) {}

  private async getNextNumber(): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      const settings = await manager.findOne(CompanySettings, { where: {} });
      const num = settings?.quotationNextNumber || 1001;
      const prefix = 'TOG-';
      if (settings) {
        await manager.update(CompanySettings, settings.id, { quotationNextNumber: num + 1, quotationPrefix: prefix });
      }
      return `${prefix}${num}`;
    });
  }

  async create(dto: CreateQuotationDto, userId: string, options: { quotationNumber?: string; persist?: boolean; excludeReferenceForId?: string } = {}): Promise<Quotation> {
    const referenceNumber = String(dto.referenceNumber || '').trim();
    if (!referenceNumber) throw new BadRequestException('A reference number is required');
    const duplicateReference = await this.quotationRepo.createQueryBuilder('quotation')
      .where('LOWER(BTRIM(quotation.referenceNumber)) = LOWER(BTRIM(:referenceNumber))', { referenceNumber })
      .andWhere(options.excludeReferenceForId ? 'quotation.id != :excludeId' : '1 = 1', options.excludeReferenceForId ? { excludeId: options.excludeReferenceForId } : {})
      .getOne();
    if (duplicateReference) throw new ConflictException('This reference number is already used by another quotation');
    const quotationNumber = options.quotationNumber || await this.getNextNumber();

    // Auto-populate product details from DB if productId given
    const processedLines = await Promise.all((dto.lines || []).map(async (l, idx) => {
      let productName = l.productName;
      let productSku = l.productSku;
      let modelNumber = l.modelNumber;
      let description = l.description;
      let vatRate = l.vatRate ?? 20;

      if (l.productId) {
        const product = await this.productRepo.findOne({
          where: { id: l.productId },
          relations: ['vatRate'],
        });
        if (product) {
          productName = product.name;
          productSku = product.sku ?? undefined;
          modelNumber = product.modelNumber;
          description = description || product.description;
          vatRate = dto.applyVat === false ? 0 : (product.vatRate?.rate ?? vatRate);
        }
      }

      const calc = this.pricingService.calculateLine({
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        discountPercent: l.discountPercent,
        vatRate,
      });

      return {
        productId: l.productId,
        productName,
        productSku,
        modelNumber,
        description,
        quantity: calc.quantity,
        unitPrice: calc.unitPrice,
        discountPercent: l.discountPercent ?? 0,
        lineTotal: calc.lineTotal,
        vatRate,
        vatAmount: calc.vatAmount,
        sortOrder: l.sortOrder ?? idx,
      };
    }));

    const processedLabour = (dto.labourCharges || []).map((lc, idx) => {
      const qty = new Decimal(lc.quantity ?? 1);
      const rate = new Decimal(lc.unitRate);
      const lineTotal = qty.times(rate).toDecimalPlaces(2).toNumber();
      return {
        description: lc.description,
        chargeType: lc.chargeType || 'fixed',
        quantity: qty.toNumber(),
        unitRate: rate.toNumber(),
        lineTotal,
        vatRate: dto.applyVat === false ? 0 : (lc.vatRate ?? 20),
        sortOrder: lc.sortOrder ?? idx,
      };
    });

    const processedAdditional = (dto.additionalCharges || []).map((ac, idx) => {
      const qty = new Decimal(ac.quantity ?? 1);
      const price = new Decimal(ac.unitPrice);
      const lineTotal = qty.times(price).toDecimalPlaces(2).toNumber();
      return {
        description: ac.description,
        chargeType: ac.chargeType || 'service',
        productId: ac.productId,
        quantity: qty.toNumber(),
        unitPrice: price.toNumber(),
        lineTotal,
        vatRate: dto.applyVat === false ? 0 : (ac.vatRate ?? 20),
        sortOrder: ac.sortOrder ?? idx,
      };
    });

    const totals = this.pricingService.calculateQuotationTotals({
      productLines: processedLines,
      labourLines: processedLabour,
      additionalLines: processedAdditional,
      globalDiscountAmount: dto.discountAmount,
    });

    const quotation = this.quotationRepo.create({
      quotationNumber,
      referenceNumber,
      applyVat: dto.applyVat !== false,
      customerId: dto.customerId,
      status: dto.submit ? QuotationStatus.OPEN : QuotationStatus.DRAFT,
      addressId: dto.addressId,
      createdById: userId,
      quotationDate: dto.quotationDate,
      validUntilDate: dto.validUntilDate,
      notes: dto.notes,
      termsAndConditions: dto.termsAndConditions,
      internalNotes: dto.internalNotes,
      discountAmount: totals.discountAmount,
      subtotalProducts: totals.subtotalProducts,
      subtotalLabour: totals.subtotalLabour,
      subtotalAdditional: totals.subtotalAdditional,
      taxableAmount: totals.taxableAmount,
      vatAmount: totals.vatAmount,
      grandTotal: totals.grandTotal,
      lines: processedLines as any,
      labourCharges: processedLabour as any,
      additionalCharges: processedAdditional as any,
    });

    if (options.persist === false) return quotation;
    try {
      return await this.quotationRepo.save(quotation);
    } catch (error: any) {
      if (error?.code === '23505' && String(error?.constraint || '').includes('reference_number')) {
        throw new ConflictException('This reference number is already used by another quotation');
      }
      throw error;
    }
  }

  async findAll(query: PaginationDto & { status?: QuotationStatus; customerId?: string }) {
    const { page = 1, limit = 20, search, status, customerId } = query;
    const qb = this.quotationRepo.createQueryBuilder('q')
      .leftJoinAndSelect('q.customer', 'c')
      .leftJoinAndSelect('q.createdBy', 'u')
      .orderBy('q.createdAt', 'DESC');

    if (search) {
      qb.where('q.quotationNumber ILIKE :s OR q.referenceNumber ILIKE :s OR c.firstName ILIKE :s OR c.lastName ILIKE :s OR c.companyName ILIKE :s', { s: `%${search}%` });
    }
    if (status) qb.andWhere('q.status = :status', { status });
    if (customerId) qb.andWhere('q.customerId = :customerId', { customerId });

    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return paginate(data, total, page, limit);
  }

  async findOne(id: string): Promise<Quotation> {
    const q = await this.quotationRepo.findOne({
      where: { id },
      relations: ['customer', 'installationAddress', 'createdBy', 'lines', 'labourCharges', 'additionalCharges'],
    });
    if (!q) throw new NotFoundException('Quotation not found');
    return q;
  }

  async updateStatus(id: string, status: QuotationStatus): Promise<Quotation> {
    const q = await this.quotationRepo.findOne({
      where: { id },
      relations: ['customer', 'installationAddress', 'createdBy', 'lines', 'labourCharges', 'additionalCharges'],
    });
    if (!q) throw new NotFoundException('Quotation not found');
    const allowedTransitions: Partial<Record<QuotationStatus, QuotationStatus[]>> = {
      [QuotationStatus.DRAFT]: [QuotationStatus.OPEN, QuotationStatus.SENT],
      [QuotationStatus.OPEN]: [QuotationStatus.REJECTED],
      [QuotationStatus.SENT]: [QuotationStatus.REJECTED],
    };
    if (status === QuotationStatus.ACCEPTED) {
      throw new BadRequestException('Confirm this quotation using the create invoice action');
    }
    if (!(allowedTransitions[q.status] || []).includes(status)) {
      throw new BadRequestException(`Cannot change quotation status from ${q.status} to ${status}`);
    }
    const now = new Date();
    const update: Partial<Quotation> = { status };
    if (status === QuotationStatus.SENT) update.sentAt = now;
    if (status === QuotationStatus.VIEWED) update.viewedAt = now;
    if (status === QuotationStatus.REJECTED) update.rejectedAt = now;
    if (status === QuotationStatus.CONVERTED) update.convertedAt = now;
    await this.quotationRepo.update(id, update);
    return this.findOne(id);
  }

  async duplicate(id: string, userId: string): Promise<Quotation> {
    const original = await this.findOne(id);
    const { id: _id, quotationNumber, createdAt, updatedAt, revision, ...rest } = original as any;
    const newNumber = await this.getNextNumber();
    const newQ = this.quotationRepo.create({
      ...rest,
      quotationNumber: newNumber,
      referenceNumber: newNumber,
      createdById: userId,
      status: QuotationStatus.DRAFT,
      revision: (revision || 1) + 1,
      sentAt: null, viewedAt: null, acceptedAt: null, rejectedAt: null, convertedAt: null,
    });
    return this.quotationRepo.save(newQ as unknown as Quotation);
  }

  async remove(id: string): Promise<void> {
    const q = await this.findOne(id);
    if (q.status !== QuotationStatus.DRAFT) {
      throw new BadRequestException('Only draft quotations can be deleted');
    }
    await this.quotationRepo.softDelete(id);
  }

  async updateDraft(id: string, dto: CreateQuotationDto): Promise<Quotation> {
    const existing = await this.findOne(id);
    if (existing.status !== QuotationStatus.DRAFT) {
      throw new BadRequestException('Only draft quotations can be edited');
    }
    // Recalculate in memory using the existing quote number so editing a draft
    // does not create a hidden quotation or consume a new number.
    const rebuilt = await this.create(
      { ...dto, customerId: dto.customerId || existing.customerId },
      existing.createdById,
      { quotationNumber: existing.quotationNumber, persist: false, excludeReferenceForId: existing.id },
    );
    await this.quotationRepo.update(id, {
      status: rebuilt.status,
      referenceNumber: rebuilt.referenceNumber,
      applyVat: rebuilt.applyVat,
      sentAt: rebuilt.sentAt,
      customerId: rebuilt.customerId,
      addressId: rebuilt.addressId,
      quotationDate: rebuilt.quotationDate,
      validUntilDate: rebuilt.validUntilDate,
      notes: rebuilt.notes,
      termsAndConditions: rebuilt.termsAndConditions,
      internalNotes: rebuilt.internalNotes,
      discountAmount: rebuilt.discountAmount,
      subtotalProducts: rebuilt.subtotalProducts,
      subtotalLabour: rebuilt.subtotalLabour,
      subtotalAdditional: rebuilt.subtotalAdditional,
      taxableAmount: rebuilt.taxableAmount,
      vatAmount: rebuilt.vatAmount,
      grandTotal: rebuilt.grandTotal,
    });
    await this.lineRepo.delete({ quotationId: id });
    await this.labourRepo.delete({ quotationId: id });
    await this.additionalRepo.delete({ quotationId: id });
    for (const line of rebuilt.lines || []) {
      await this.lineRepo.save(this.lineRepo.create({ ...line, id: undefined, quotationId: id }));
    }
    for (const line of rebuilt.labourCharges || []) {
      await this.labourRepo.save(this.labourRepo.create({ ...line, id: undefined, quotationId: id }));
    }
    for (const line of rebuilt.additionalCharges || []) {
      await this.additionalRepo.save(this.additionalRepo.create({ ...line, id: undefined, quotationId: id }));
    }
    return this.findOne(id);
  }

  async generatePdf(id: string): Promise<Buffer> {
    const q = await this.quotationRepo.findOne({
      where: { id },
      relations: ['customer', 'customer.addresses', 'installationAddress', 'createdBy', 'lines', 'labourCharges', 'additionalCharges'],
    });
    if (!q) throw new NotFoundException('Quotation not found');
    const settings = await this.settingsRepo.findOne({ where: {} });
    const customerName = q.customer?.companyName
      || [q.customer?.firstName, q.customer?.lastName].filter(Boolean).join(' ');
    const rows = (q.lines || []).map((l) => `
      <tr>
        <td><strong>${this.pdfService.esc(l.productName)}</strong><div class="muted">${this.pdfService.esc(l.modelNumber || l.productSku)}</div>${l.description ? `<div class="muted">${this.pdfService.htmlText(l.description)}</div>` : ''}</td>
        <td>${Number(l.quantity).toLocaleString('en-GB')}</td>
        <td>£${Number(l.lineTotal).toFixed(2)}</td>
      </tr>`).join('');
    const additionalRows = [
      ...(q.labourCharges || []).map((charge) => ({ description: charge.description, lineTotal: charge.lineTotal })),
      ...(q.additionalCharges || []).map((charge) => ({ description: charge.description, lineTotal: charge.lineTotal })),
    ].map((charge) => `
      <tr><td colspan="2">${this.pdfService.htmlText(charge.description)}</td><td>£${Number(charge.lineTotal).toFixed(2)}</td></tr>`).join('');
    const vatBreakdown = this.pricingService.calculateQuotationTotals({
      productLines: (q.lines || []).map((line) => ({ lineTotal: Number(line.lineTotal), vatRate: Number(line.vatRate ?? 20), vatAmount: Number(line.vatAmount ?? 0) })),
      labourLines: (q.labourCharges || []).map((charge) => ({ lineTotal: Number(charge.lineTotal), vatRate: Number(charge.vatRate ?? 20) })),
      additionalLines: (q.additionalCharges || []).map((charge) => ({ lineTotal: Number(charge.lineTotal), vatRate: Number(charge.vatRate ?? 20) })),
      globalDiscountAmount: q.discountAmount,
    }).vatBreakdown;
    const billingAddressFields = [q.customer?.billingAddressLine1, q.customer?.billingAddressLine2, q.customer?.billingCity, q.customer?.billingPostcode].filter(Boolean);
    const customerAddress = billingAddressFields.length
      ? [...billingAddressFields, q.customer?.billingCountry].filter(Boolean)
      : (() => {
        const address = q.customer?.addresses?.find((item) => item.type === 'billing' || item.isPrimary) || q.customer?.addresses?.[0];
        return [address?.addressLine1, address?.addressLine2, address?.city, address?.county, address?.postcode, address?.country].filter(Boolean);
      })();
    const billingAddress = customerAddress.map((part) => this.pdfService.esc(part)).join('<br/>') || 'Not provided';
    const customerPhones = [...new Set([q.customer?.phone, q.customer?.mobile].filter(Boolean))];
    const installationAddress = q.installationAddress
      ? [q.installationAddress.addressLine1, q.installationAddress.addressLine2, q.installationAddress.city, q.installationAddress.county, q.installationAddress.postcode, q.installationAddress.country].filter(Boolean).map((part) => this.pdfService.esc(part)).join('<br/>')
      : '';
    const html = this.pdfService.wrapDocument(`Quotation ${q.quotationNumber}`, `
      ${this.pdfService.companyHeader(settings)}
      <div class="quote-title"><div><h2>Quotation</h2><strong class="quote-number">${this.pdfService.esc(q.quotationNumber)}</strong><div class="muted">Reference: ${this.pdfService.esc(q.referenceNumber || '—')}</div></div><div class="quote-meta"><strong>Quotation date</strong><br/>${this.pdfService.esc(q.quotationDate)}<br/><br/><strong>Valid until</strong><br/>${this.pdfService.esc(q.validUntilDate || '—')}</div></div>
      <div class="client"><div class="client-left"><h3>Customer details</h3><strong>${this.pdfService.esc(customerName || 'Customer')}</strong><div><strong>Email:</strong> ${this.pdfService.esc(q.customer?.email || 'Not provided')}</div>${customerPhones.length ? customerPhones.map((phone, index) => `<div><strong>${index === 0 ? 'Phone' : 'Mobile'}:</strong> ${this.pdfService.esc(phone)}</div>`).join('') : '<div><strong>Phone:</strong> Not provided</div>'}${q.customer?.customerCode ? `<div><strong>Customer ID:</strong> ${this.pdfService.esc(q.customer.customerCode)}</div>` : ''}${q.customer?.vatNumber ? `<div><strong>VAT:</strong> ${this.pdfService.esc(q.customer.vatNumber)}</div>` : ''}</div><div class="client-right"><h3>Billing address</h3><p>${billingAddress}</p></div></div>
      ${installationAddress ? `<div class="installation"><h3>Installation address</h3>${installationAddress}</div>` : ''}
      <table>
        <thead><tr><th>Description</th><th>Qty</th><th>Total</th></tr></thead>
        <tbody>${rows}${additionalRows ? `<tr><td colspan="3" style="font-weight:700;background:#f1f5f9">Additional charges</td></tr>${additionalRows}` : ''}</tbody>
      </table>
      <table class="totals">
        <tr><td>Subtotal</td><td>£${Number(q.subtotalProducts).toFixed(2)}</td></tr>
        ${Number(q.subtotalLabour) + Number(q.subtotalAdditional) > 0 ? `<tr><td>Additional charges total</td><td>£${(Number(q.subtotalLabour) + Number(q.subtotalAdditional)).toFixed(2)}</td></tr>` : ''}
        ${Number(q.discountAmount) > 0 ? `<tr><td>Discount</td><td>£${Number(q.discountAmount).toFixed(2)}</td></tr>` : ''}
        ${Number(q.vatAmount) > 0 ? `${vatBreakdown.filter((vat) => Number(vat.vatAmount) > 0).map((vat) => `<tr><td>VAT at ${Number(vat.rate)}% on £${Number(vat.taxableAmount).toFixed(2)}</td><td>£${Number(vat.vatAmount).toFixed(2)}</td></tr>`).join('')}<tr><td>Total VAT</td><td>£${Number(q.vatAmount).toFixed(2)}</td></tr>` : ''}
        <tr class="grand"><td>Total</td><td>£${Number(q.grandTotal).toFixed(2)}</td></tr>
      </table>
      ${q.notes ? `<div class="note"><strong>Notes</strong><br/>${this.pdfService.htmlText(q.notes)}</div>` : ''}
    `);
    return this.pdfService.renderPdf(html);
  }

  async emailPdf(id: string, to?: string) {
    const q = await this.findOne(id);
    const pdf = await this.generatePdf(id);
    const recipient = to || q.customer?.email;
    if (!recipient) throw new BadRequestException('No email address available');
    await this.emailService.sendEmail({
      to: recipient,
      subject: `Quotation ${q.quotationNumber} — Toggar Heat & Aircon`,
      html: `<p>Please find attached quotation ${q.quotationNumber}.</p>`,
      attachments: [{ filename: `${q.quotationNumber}.pdf`, content: pdf, contentType: 'application/pdf' }],
    });
    if (q.status === QuotationStatus.DRAFT) {
      await this.updateStatus(id, QuotationStatus.SENT);
    }
    return { sent: true, to: recipient };
  }
}
