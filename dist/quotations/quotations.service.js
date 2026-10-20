"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const decimal_js_1 = require("decimal.js");
const quotation_entity_1 = require("./entities/quotation.entity");
const pricing_service_1 = require("../pricing/pricing.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const product_entity_1 = require("../products/entities/product.entity");
const company_settings_entity_1 = require("../settings/entities/company-settings.entity");
const pdf_service_1 = require("../pdf/pdf.service");
const email_service_1 = require("../email/email.service");
let QuotationsService = class QuotationsService {
    constructor(quotationRepo, lineRepo, labourRepo, additionalRepo, productRepo, settingsRepo, dataSource, pricingService, pdfService, emailService) {
        this.quotationRepo = quotationRepo;
        this.lineRepo = lineRepo;
        this.labourRepo = labourRepo;
        this.additionalRepo = additionalRepo;
        this.productRepo = productRepo;
        this.settingsRepo = settingsRepo;
        this.dataSource = dataSource;
        this.pricingService = pricingService;
        this.pdfService = pdfService;
        this.emailService = emailService;
    }
    async getNextNumber() {
        return this.dataSource.transaction(async (manager) => {
            const settings = await manager.findOne(company_settings_entity_1.CompanySettings, { where: {} });
            const num = settings?.quotationNextNumber || 1001;
            const prefix = 'TOG-';
            if (settings) {
                await manager.update(company_settings_entity_1.CompanySettings, settings.id, { quotationNextNumber: num + 1, quotationPrefix: prefix });
            }
            return `${prefix}${num}`;
        });
    }
    async create(dto, userId, options = {}) {
        const referenceNumber = String(dto.referenceNumber || '').trim();
        if (!referenceNumber)
            throw new common_1.BadRequestException('A reference number is required');
        const duplicateReference = await this.quotationRepo.createQueryBuilder('quotation')
            .where('LOWER(BTRIM(quotation.referenceNumber)) = LOWER(BTRIM(:referenceNumber))', { referenceNumber })
            .andWhere(options.excludeReferenceForId ? 'quotation.id != :excludeId' : '1 = 1', options.excludeReferenceForId ? { excludeId: options.excludeReferenceForId } : {})
            .getOne();
        if (duplicateReference)
            throw new common_1.ConflictException('This reference number is already used by another quotation');
        const quotationNumber = options.quotationNumber || await this.getNextNumber();
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
            const qty = new decimal_js_1.default(lc.quantity ?? 1);
            const rate = new decimal_js_1.default(lc.unitRate);
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
            const qty = new decimal_js_1.default(ac.quantity ?? 1);
            const price = new decimal_js_1.default(ac.unitPrice);
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
            status: dto.submit ? quotation_entity_1.QuotationStatus.OPEN : quotation_entity_1.QuotationStatus.DRAFT,
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
            lines: processedLines,
            labourCharges: processedLabour,
            additionalCharges: processedAdditional,
        });
        if (options.persist === false)
            return quotation;
        try {
            return await this.quotationRepo.save(quotation);
        }
        catch (error) {
            if (error?.code === '23505' && String(error?.constraint || '').includes('reference_number')) {
                throw new common_1.ConflictException('This reference number is already used by another quotation');
            }
            throw error;
        }
    }
    async findAll(query) {
        const { page = 1, limit = 20, search, status, customerId } = query;
        const qb = this.quotationRepo.createQueryBuilder('q')
            .leftJoinAndSelect('q.customer', 'c')
            .leftJoinAndSelect('q.createdBy', 'u')
            .orderBy('q.createdAt', 'DESC');
        if (search) {
            qb.where('q.quotationNumber ILIKE :s OR q.referenceNumber ILIKE :s OR c.firstName ILIKE :s OR c.lastName ILIKE :s OR c.companyName ILIKE :s', { s: `%${search}%` });
        }
        if (status)
            qb.andWhere('q.status = :status', { status });
        if (customerId)
            qb.andWhere('q.customerId = :customerId', { customerId });
        const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
        return (0, pagination_dto_1.paginate)(data, total, page, limit);
    }
    async findOne(id) {
        const q = await this.quotationRepo.findOne({
            where: { id },
            relations: ['customer', 'installationAddress', 'createdBy', 'lines', 'labourCharges', 'additionalCharges'],
        });
        if (!q)
            throw new common_1.NotFoundException('Quotation not found');
        return q;
    }
    async updateStatus(id, status) {
        const q = await this.quotationRepo.findOne({
            where: { id },
            relations: ['customer', 'installationAddress', 'createdBy', 'lines', 'labourCharges', 'additionalCharges'],
        });
        if (!q)
            throw new common_1.NotFoundException('Quotation not found');
        const allowedTransitions = {
            [quotation_entity_1.QuotationStatus.DRAFT]: [quotation_entity_1.QuotationStatus.OPEN, quotation_entity_1.QuotationStatus.SENT],
            [quotation_entity_1.QuotationStatus.OPEN]: [quotation_entity_1.QuotationStatus.REJECTED],
            [quotation_entity_1.QuotationStatus.SENT]: [quotation_entity_1.QuotationStatus.REJECTED],
        };
        if (status === quotation_entity_1.QuotationStatus.ACCEPTED) {
            throw new common_1.BadRequestException('Confirm this quotation using the create invoice action');
        }
        if (!(allowedTransitions[q.status] || []).includes(status)) {
            throw new common_1.BadRequestException(`Cannot change quotation status from ${q.status} to ${status}`);
        }
        const now = new Date();
        const update = { status };
        if (status === quotation_entity_1.QuotationStatus.SENT)
            update.sentAt = now;
        if (status === quotation_entity_1.QuotationStatus.VIEWED)
            update.viewedAt = now;
        if (status === quotation_entity_1.QuotationStatus.REJECTED)
            update.rejectedAt = now;
        if (status === quotation_entity_1.QuotationStatus.CONVERTED)
            update.convertedAt = now;
        await this.quotationRepo.update(id, update);
        return this.findOne(id);
    }
    async duplicate(id, userId) {
        const original = await this.findOne(id);
        const { id: _id, quotationNumber, createdAt, updatedAt, revision, ...rest } = original;
        const newNumber = await this.getNextNumber();
        const newQ = this.quotationRepo.create({
            ...rest,
            quotationNumber: newNumber,
            referenceNumber: newNumber,
            createdById: userId,
            status: quotation_entity_1.QuotationStatus.DRAFT,
            revision: (revision || 1) + 1,
            sentAt: null, viewedAt: null, acceptedAt: null, rejectedAt: null, convertedAt: null,
        });
        return this.quotationRepo.save(newQ);
    }
    async remove(id) {
        const q = await this.findOne(id);
        if (q.status !== quotation_entity_1.QuotationStatus.DRAFT) {
            throw new common_1.BadRequestException('Only draft quotations can be deleted');
        }
        await this.quotationRepo.softDelete(id);
    }
    async updateDraft(id, dto) {
        const existing = await this.findOne(id);
        if (existing.status !== quotation_entity_1.QuotationStatus.DRAFT) {
            throw new common_1.BadRequestException('Only draft quotations can be edited');
        }
        const rebuilt = await this.create({ ...dto, customerId: dto.customerId || existing.customerId }, existing.createdById, { quotationNumber: existing.quotationNumber, persist: false, excludeReferenceForId: existing.id });
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
    async generatePdf(id) {
        const q = await this.quotationRepo.findOne({
            where: { id },
            relations: ['customer', 'customer.addresses', 'installationAddress', 'createdBy', 'lines', 'labourCharges', 'additionalCharges'],
        });
        if (!q)
            throw new common_1.NotFoundException('Quotation not found');
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
    async emailPdf(id, to) {
        const q = await this.findOne(id);
        const pdf = await this.generatePdf(id);
        const recipient = to || q.customer?.email;
        if (!recipient)
            throw new common_1.BadRequestException('No email address available');
        await this.emailService.sendEmail({
            to: recipient,
            subject: `Quotation ${q.quotationNumber} — Toggar Heat & Aircon`,
            html: `<p>Please find attached quotation ${q.quotationNumber}.</p>`,
            attachments: [{ filename: `${q.quotationNumber}.pdf`, content: pdf, contentType: 'application/pdf' }],
        });
        if (q.status === quotation_entity_1.QuotationStatus.DRAFT) {
            await this.updateStatus(id, quotation_entity_1.QuotationStatus.SENT);
        }
        return { sent: true, to: recipient };
    }
};
exports.QuotationsService = QuotationsService;
exports.QuotationsService = QuotationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(quotation_entity_1.Quotation)),
    __param(1, (0, typeorm_1.InjectRepository)(quotation_entity_1.QuotationLine)),
    __param(2, (0, typeorm_1.InjectRepository)(quotation_entity_1.QuotationLabourCharge)),
    __param(3, (0, typeorm_1.InjectRepository)(quotation_entity_1.QuotationAdditionalCharge)),
    __param(4, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(5, (0, typeorm_1.InjectRepository)(company_settings_entity_1.CompanySettings)),
    __param(6, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        pricing_service_1.PricingService,
        pdf_service_1.PdfService,
        email_service_1.EmailService])
], QuotationsService);
//# sourceMappingURL=quotations.service.js.map