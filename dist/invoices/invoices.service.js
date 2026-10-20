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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const decimal_js_1 = require("decimal.js");
const invoice_entity_1 = require("./entities/invoice.entity");
const job_entity_1 = require("../jobs/entities/job.entity");
const company_settings_entity_1 = require("../settings/entities/company-settings.entity");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const quotation_entity_1 = require("../quotations/entities/quotation.entity");
const pdf_service_1 = require("../pdf/pdf.service");
const inventory_service_1 = require("../inventory/inventory.service");
const storage_service_1 = require("../storage/storage.service");
let InvoicesService = class InvoicesService {
    constructor(invoiceRepo, lineRepo, paymentRepo, jobRepo, settingsRepo, quotationRepo, dataSource, pdfService, inventoryService, storageService) {
        this.invoiceRepo = invoiceRepo;
        this.lineRepo = lineRepo;
        this.paymentRepo = paymentRepo;
        this.jobRepo = jobRepo;
        this.settingsRepo = settingsRepo;
        this.quotationRepo = quotationRepo;
        this.dataSource = dataSource;
        this.pdfService = pdfService;
        this.inventoryService = inventoryService;
        this.storageService = storageService;
    }
    async getNextNumber() {
        return this.dataSource.transaction(async (manager) => {
            const settings = await manager.findOne(company_settings_entity_1.CompanySettings, { where: {} });
            const num = settings?.invoiceNextNumber || 1001;
            const prefix = settings?.invoicePrefix || 'INV-';
            if (settings)
                await manager.update(company_settings_entity_1.CompanySettings, settings.id, { invoiceNextNumber: num + 1 });
            return `${prefix}${num}`;
        });
    }
    async getNextInvoiceNumber() {
        const settings = await this.settingsRepo.findOne({ where: {} });
        return `${settings?.invoicePrefix || 'INV-'}${settings?.invoiceNextNumber || 1001}`;
    }
    async checkQuotationStock(quotationId) {
        const quotation = await this.quotationRepo.findOne({ where: { id: quotationId }, relations: ['lines'] });
        if (!quotation)
            throw new common_1.NotFoundException('Quotation not found');
        return this.inventoryService.checkInvoiceStock((quotation.lines || []).filter((line) => !!line.productId).map((line) => ({ productId: line.productId, quantity: Number(line.quantity) })));
    }
    async createFromJob(jobId, userId) {
        const job = await this.jobRepo.findOne({
            where: { id: jobId },
            relations: ['quotation', 'quotation.lines', 'quotation.labourCharges', 'quotation.additionalCharges', 'customer'],
        });
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        if (job.isInvoiced)
            throw new common_1.BadRequestException('Job already invoiced');
        const quotation = job.quotation;
        const lines = [];
        (quotation?.lines || []).forEach((l) => lines.push({
            description: `${l.productName}${l.modelNumber ? ` (${l.modelNumber})` : ''}`,
            quantity: Number(l.quantity),
            unitPrice: Number(l.unitPrice),
            vatRate: Number(l.vatRate),
        }));
        (quotation?.labourCharges || []).forEach((l) => lines.push({
            description: `Labour — ${l.description}`,
            quantity: Number(l.quantity),
            unitPrice: Number(l.unitRate),
            vatRate: Number(l.vatRate),
        }));
        (quotation?.additionalCharges || []).forEach((l) => lines.push({
            description: l.description,
            quantity: Number(l.quantity),
            unitPrice: Number(l.unitPrice),
            vatRate: Number(l.vatRate),
        }));
        if (!lines.length) {
            lines.push({
                description: job.title,
                quantity: 1,
                unitPrice: Number(job.estimatedTotal || job.actualTotal || 0),
                vatRate: 20,
            });
        }
        const today = new Date().toISOString().slice(0, 10);
        const settings = await this.settingsRepo.findOne({ where: {} });
        const due = new Date();
        due.setDate(due.getDate() + (settings?.defaultPaymentTermsDays || 30));
        return this.create({
            jobId,
            customerId: job.customerId,
            invoiceDate: today,
            dueDate: due.toISOString().slice(0, 10),
            notes: `Invoice for job ${job.jobNumber}`,
            lines,
        }, userId);
    }
    async createFromQuotation(quotationId, userId, options = {}) {
        const quotation = await this.quotationRepo.findOne({
            where: { id: quotationId },
            relations: ['customer', 'lines', 'labourCharges', 'additionalCharges'],
        });
        if (!quotation)
            throw new common_1.NotFoundException('Quotation not found');
        const invoiceDate = new Date().toISOString().slice(0, 10);
        const quotationDate = String(quotation.quotationDate || '').slice(0, 10);
        const minimumDueDate = quotationDate > invoiceDate ? quotationDate : invoiceDate;
        const requestedDueDate = options.dueDate?.trim();
        const parsedDueDate = requestedDueDate ? new Date(`${requestedDueDate}T00:00:00.000Z`) : null;
        const validDueDate = !!requestedDueDate
            && /^\d{4}-\d{2}-\d{2}$/.test(requestedDueDate)
            && !!parsedDueDate
            && !Number.isNaN(parsedDueDate.getTime())
            && parsedDueDate.toISOString().slice(0, 10) === requestedDueDate
            && requestedDueDate >= minimumDueDate;
        if (requestedDueDate && !validDueDate) {
            throw new common_1.BadRequestException(`Invoice due date must be on or after ${minimumDueDate}`);
        }
        const receivedPayment = Number(options.receivedPayment ?? 0);
        const quotationTotal = Number(quotation.grandTotal || 0);
        if (!Number.isFinite(receivedPayment) || receivedPayment < 0 || receivedPayment > quotationTotal) {
            throw new common_1.BadRequestException(`Payment received must be between £0.00 and the invoice total of £${quotationTotal.toFixed(2)}`);
        }
        if (![quotation_entity_1.QuotationStatus.OPEN, quotation_entity_1.QuotationStatus.SENT, quotation_entity_1.QuotationStatus.ACCEPTED].includes(quotation.status)) {
            throw new common_1.BadRequestException('Only a quotation given to the client can be confirmed');
        }
        const existingInvoice = await this.invoiceRepo.findOne({ where: { quotationId } });
        if (existingInvoice) {
            await this.quotationRepo.update(quotationId, { status: quotation_entity_1.QuotationStatus.ACCEPTED, acceptedAt: quotation.acceptedAt || new Date() });
            return this.findOne(existingInvoice.id);
        }
        const stockCheck = await this.inventoryService.checkInvoiceStock((quotation.lines || []).filter((line) => !!line.productId).map((line) => ({ productId: line.productId, quantity: Number(line.quantity) })));
        if (!stockCheck.canProceed) {
            const shortageList = stockCheck.items.filter((item) => item.shortage > 0).map((item) => `${item.name}: requested ${item.quantity}, available ${item.available}`).join('; ');
            throw new common_1.BadRequestException(`Insufficient stock to create this invoice. ${shortageList}`);
        }
        const lines = [];
        (quotation.lines || []).forEach((line) => lines.push({
            productId: line.productId || undefined,
            description: [line.productName, line.productSku ? `Code: ${line.productSku}` : '', line.modelNumber ? `Model: ${line.modelNumber}` : '', line.description].filter(Boolean).join(' · '),
            quantity: Number(line.quantity),
            unitPrice: Number(line.unitPrice),
            discountPercent: Number(line.discountPercent || 0),
            vatRate: Number(line.vatRate),
        }));
        (quotation.labourCharges || []).forEach((charge) => lines.push({
            description: `Labour — ${charge.description}`,
            quantity: Number(charge.quantity),
            unitPrice: Number(charge.unitRate),
            vatRate: Number(charge.vatRate),
        }));
        (quotation.additionalCharges || []).forEach((charge) => lines.push({
            description: charge.description,
            quantity: Number(charge.quantity),
            unitPrice: Number(charge.unitPrice),
            vatRate: Number(charge.vatRate),
        }));
        if (!lines.length)
            throw new common_1.BadRequestException('This quotation has no billable lines');
        const settings = await this.settingsRepo.findOne({ where: {} });
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (settings?.defaultPaymentTermsDays || 30));
        let invoice;
        let createdInvoice = false;
        try {
            invoice = await this.create({
                invoiceNumber: options.invoiceNumber?.trim(),
                customerId: quotation.customerId,
                invoiceDate,
                dueDate: options.dueDate || dueDate.toISOString().slice(0, 10),
                notes: quotation.notes,
                termsAndConditions: quotation.termsAndConditions,
                discountAmount: Number(quotation.discountAmount || 0),
                lines,
            }, userId, quotationId);
            createdInvoice = true;
        }
        catch (error) {
            if (error?.code !== '23505' && error?.driverError?.code !== '23505')
                throw error;
            const duplicate = await this.invoiceRepo.findOne({ where: { quotationId } });
            if (!duplicate)
                throw error;
            invoice = duplicate;
        }
        if (createdInvoice) {
            try {
                await this.inventoryService.issueInvoiceStock((quotation.lines || []).filter((line) => !!line.productId).map((line) => ({ productId: line.productId, quantity: Number(line.quantity) })), invoice.id, quotation.quotationNumber, userId);
            }
            catch (error) {
                await this.invoiceRepo.delete(invoice.id);
                throw error;
            }
        }
        await this.quotationRepo.update(quotationId, { status: quotation_entity_1.QuotationStatus.ACCEPTED, acceptedAt: quotation.acceptedAt || new Date() });
        if (receivedPayment > 0 && Number(invoice.amountPaid || 0) === 0) {
            invoice = await this.recordPayment(invoice.id, {
                amount: receivedPayment,
                paymentDate: invoiceDate,
                method: options.paymentMethod || invoice_entity_1.PaymentMethod.OTHER,
                notes: `Initial payment received when confirming quotation ${quotation.quotationNumber}`,
            }, userId, options.paymentReceipt);
        }
        return this.findOne(invoice.id);
    }
    async create(dto, userId, quotationId) {
        const invoiceNumber = dto.invoiceNumber?.trim() || await this.getNextNumber();
        if (dto.invoiceNumber?.trim()) {
            const existing = await this.invoiceRepo.findOne({ where: { invoiceNumber } });
            if (existing)
                throw new common_1.BadRequestException('This invoice number is already in use');
            await this.getNextNumber();
        }
        let subtotal = new decimal_js_1.default(0);
        let vatAmount = new decimal_js_1.default(0);
        const lines = dto.lines.map((l, idx) => {
            const qty = new decimal_js_1.default(l.quantity);
            const price = new decimal_js_1.default(l.unitPrice);
            const lineTotal = qty.times(price).times(new decimal_js_1.default(1).minus(new decimal_js_1.default(l.discountPercent ?? 0).dividedBy(100))).toDecimalPlaces(2);
            const vatRate = new decimal_js_1.default(l.vatRate ?? 20);
            const lineVat = lineTotal.times(vatRate).dividedBy(100).toDecimalPlaces(2);
            subtotal = subtotal.plus(lineTotal);
            vatAmount = vatAmount.plus(lineVat);
            return {
                productId: l.productId,
                description: l.description,
                quantity: qty.toNumber(),
                unitPrice: price.toDecimalPlaces(2).toNumber(),
                lineTotal: lineTotal.toNumber(),
                vatRate: vatRate.toNumber(),
                vatAmount: lineVat.toNumber(),
                sortOrder: l.sortOrder ?? idx,
            };
        });
        const discountAmount = new decimal_js_1.default(dto.discountAmount ?? 0);
        const grandTotal = subtotal.minus(discountAmount).plus(vatAmount).toDecimalPlaces(2);
        const amountOutstanding = grandTotal;
        const invoice = this.invoiceRepo.create({
            invoiceNumber,
            jobId: dto.jobId,
            quotationId,
            customerId: dto.customerId,
            createdById: userId,
            invoiceDate: dto.invoiceDate,
            dueDate: dto.dueDate,
            notes: dto.notes,
            termsAndConditions: dto.termsAndConditions,
            subtotal: subtotal.toDecimalPlaces(2).toNumber(),
            discountAmount: discountAmount.toDecimalPlaces(2).toNumber(),
            vatAmount: vatAmount.toDecimalPlaces(2).toNumber(),
            grandTotal: grandTotal.toNumber(),
            amountOutstanding: amountOutstanding.toNumber(),
            status: quotationId ? invoice_entity_1.InvoiceStatus.SENT : undefined,
            lines: lines,
        });
        const saved = await this.invoiceRepo.save(invoice);
        if (dto.jobId)
            await this.jobRepo.update(dto.jobId, { isInvoiced: true });
        return saved;
    }
    async findAll(query) {
        const { page = 1, limit = 20, search, status, customerId } = query;
        const qb = this.invoiceRepo.createQueryBuilder('inv')
            .leftJoinAndSelect('inv.customer', 'c')
            .leftJoinAndSelect('inv.job', 'j')
            .leftJoinAndSelect('inv.quotation', 'q')
            .orderBy('inv.createdAt', 'DESC');
        if (search)
            qb.where('c.firstName ILIKE :s OR c.lastName ILIKE :s OR c.companyName ILIKE :s OR q.quotationNumber ILIKE :s OR q.referenceNumber ILIKE :s', { s: `%${search}%` });
        if (status)
            qb.andWhere('inv.status = :status', { status });
        if (customerId)
            qb.andWhere('inv.customerId = :customerId', { customerId });
        const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
        return (0, pagination_dto_1.paginate)(data, total, page, limit);
    }
    async findOne(id) {
        const inv = await this.invoiceRepo.findOne({
            where: { id },
            relations: ['customer', 'customer.addresses', 'job', 'quotation', 'createdBy', 'lines', 'payments', 'payments.recordedBy'],
        });
        if (!inv)
            throw new common_1.NotFoundException('Invoice not found');
        return inv;
    }
    async getPaymentAttachment(paymentId) {
        const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
        if (!payment?.attachmentKey)
            throw new common_1.NotFoundException('Payment receipt not found');
        const file = this.storageService.readPrivatePaymentFile(payment.attachmentKey);
        if (!file)
            throw new common_1.NotFoundException('Payment receipt file not found');
        return file;
    }
    async recordPayment(invoiceId, dto, userId, paymentReceipt) {
        const invoice = await this.findOne(invoiceId);
        if (invoice.status === invoice_entity_1.InvoiceStatus.PAID || invoice.status === invoice_entity_1.InvoiceStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot record payment on this invoice');
        }
        const paymentAmount = new decimal_js_1.default(dto.amount);
        const outstanding = new decimal_js_1.default(invoice.amountOutstanding);
        if (!paymentAmount.isFinite() || !paymentAmount.gt(0)) {
            throw new common_1.BadRequestException('Payment amount must be greater than zero');
        }
        if (paymentAmount.gt(outstanding)) {
            throw new common_1.BadRequestException(`Payment amount (£${dto.amount}) exceeds outstanding balance (£${outstanding})`);
        }
        if (paymentReceipt && !paymentAmount.gt(0)) {
            throw new common_1.BadRequestException('Enter a payment amount before attaching a receipt');
        }
        const attachmentKey = paymentReceipt
            ? await this.storageService.savePrivatePaymentFile(paymentReceipt.buffer, paymentReceipt.originalname)
            : undefined;
        await this.paymentRepo.save(this.paymentRepo.create({
            invoiceId,
            amount: paymentAmount.toDecimalPlaces(2).toNumber(),
            paymentDate: dto.paymentDate,
            method: dto.method,
            referenceNumber: dto.referenceNumber,
            notes: dto.notes,
            attachmentKey,
            recordedById: userId,
        }));
        const newOutstanding = outstanding.minus(paymentAmount).toDecimalPlaces(2).toNumber();
        const newAmountPaid = new decimal_js_1.default(invoice.amountPaid).plus(paymentAmount).toDecimalPlaces(2).toNumber();
        const newStatus = newOutstanding <= 0 ? invoice_entity_1.InvoiceStatus.PAID : invoice_entity_1.InvoiceStatus.PARTIALLY_PAID;
        await this.invoiceRepo.update(invoiceId, {
            amountPaid: newAmountPaid,
            amountOutstanding: newOutstanding,
            status: newStatus,
        });
        return this.findOne(invoiceId);
    }
    async updateStatus(id, status) {
        await this.findOne(id);
        const update = { status };
        if (status === invoice_entity_1.InvoiceStatus.SENT)
            update.sentAt = new Date();
        await this.invoiceRepo.update(id, update);
        return this.findOne(id);
    }
    async generatePdf(id) {
        const invoice = await this.findOne(id);
        const settings = await this.settingsRepo.findOne({ where: {} });
        const client = invoice.customer;
        const clientName = client?.companyName || [client?.firstName, client?.lastName].filter(Boolean).join(' ') || 'Customer';
        const billingAddressFields = [client?.billingAddressLine1, client?.billingAddressLine2, client?.billingCity, client?.billingPostcode].filter(Boolean);
        const selectedAddress = client?.addresses?.find((item) => item.type === 'billing' || item.isPrimary) || client?.addresses?.[0];
        const billingAddress = (billingAddressFields.length
            ? [...billingAddressFields, client?.billingCountry].filter(Boolean)
            : [selectedAddress?.addressLine1, selectedAddress?.addressLine2, selectedAddress?.city, selectedAddress?.county, selectedAddress?.postcode, selectedAddress?.country].filter(Boolean))
            .map((part) => this.pdfService.esc(part)).join('<br/>');
        const customerPhones = [...new Set([client?.phone, client?.mobile].filter(Boolean))];
        const invoiceStatus = invoice.status === 'sent' ? 'unpaid' : String(invoice.status || 'unpaid').replace(/_/g, ' ');
        const statusClass = invoice.status === 'paid' ? 'paid' : invoice.status === 'partially_paid' ? 'partially-paid' : invoice.status === 'overdue' ? 'overdue' : invoice.status === 'cancelled' ? 'cancelled' : 'unpaid';
        const rows = (invoice.lines || []).map((line) => `<tr><td>${this.pdfService.esc(line.description)}</td><td>${Number(line.quantity).toLocaleString('en-GB')}</td><td>£${Number(line.lineTotal).toFixed(2)}</td></tr>`).join('');
        const payments = (invoice.payments || []).map((payment) => `<tr><td>${this.pdfService.esc(payment.paymentDate)}</td><td>${this.pdfService.esc(String(payment.method).replace(/_/g, ' '))}</td><td>£${Number(payment.amount).toFixed(2)}</td></tr>`).join('');
        const quotationReference = invoice.quotation?.referenceNumber || invoice.job?.jobNumber || '—';
        const additionalDetails = String(invoice.notes || '').replace(/^Invoice from quotation[^\n]*(?:\r?\n\r?\n)?/i, '').trim();
        const html = this.pdfService.wrapDocument(`Invoice ${invoice.invoiceNumber}`, `
      ${this.pdfService.companyHeader(settings)}
      <div class="quote-title"><div><h2>Invoice</h2><strong class="quote-number">${this.pdfService.esc(invoice.invoiceNumber)}</strong><div class="muted">Reference: ${this.pdfService.esc(quotationReference)}</div><span class="invoice-status ${statusClass}">${this.pdfService.esc(invoiceStatus)}</span></div><div class="quote-meta"><strong>Invoice date</strong><br/>${this.pdfService.esc(invoice.invoiceDate)}<br/><br/><strong>Due date</strong><br/>${this.pdfService.esc(invoice.dueDate || '—')}</div></div>
      <div class="client"><div class="client-left"><h3>Customer details</h3><strong>${this.pdfService.esc(clientName)}</strong><div><strong>Email:</strong> ${this.pdfService.esc(client?.email || 'Not provided')}</div>${customerPhones.length ? customerPhones.map((phone, index) => `<div><strong>${index === 0 ? 'Phone' : 'Mobile'}:</strong> ${this.pdfService.esc(phone)}</div>`).join('') : '<div><strong>Phone:</strong> Not provided</div>'}${client?.customerCode ? `<div><strong>Customer ID:</strong> ${this.pdfService.esc(client.customerCode)}</div>` : ''}</div><div class="client-right"><h3>Billing address</h3><p>${billingAddress || 'Not provided'}</p></div></div>
      <table><thead><tr><th>Description</th><th>Qty</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
      <table class="totals"><tr><td>Subtotal</td><td>£${Number(invoice.subtotal).toFixed(2)}</td></tr>${Number(invoice.discountAmount) > 0 ? `<tr><td>Discount</td><td>£${Number(invoice.discountAmount).toFixed(2)}</td></tr>` : ''}${Number(invoice.vatAmount) > 0 ? `<tr><td>VAT</td><td>£${Number(invoice.vatAmount).toFixed(2)}</td></tr>` : ''}<tr class="grand"><td>Total</td><td>£${Number(invoice.grandTotal).toFixed(2)}</td></tr></table>
      <div class="payment-summary"><div class="payment-summary-row"><span>Received</span><strong class="received">£${Number(invoice.amountPaid).toFixed(2)}</strong></div><div class="payment-summary-row"><span>Due payment</span><strong class="due">£${Number(invoice.amountOutstanding).toFixed(2)}</strong></div></div>
      ${payments ? `<h3>Payment history</h3><table><thead><tr><th>Date</th><th>Method</th><th>Amount</th></tr></thead><tbody>${payments}</tbody></table>` : ''}
      ${additionalDetails ? `<section class="note"><h3>Additional details</h3><div>${this.pdfService.htmlText(additionalDetails)}</div></section>` : ''}
    `);
        return this.pdfService.renderPdf(html);
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_entity_1.InvoiceLine)),
    __param(2, (0, typeorm_1.InjectRepository)(invoice_entity_1.Payment)),
    __param(3, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(4, (0, typeorm_1.InjectRepository)(company_settings_entity_1.CompanySettings)),
    __param(5, (0, typeorm_1.InjectRepository)(quotation_entity_1.Quotation)),
    __param(6, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        pdf_service_1.PdfService,
        inventory_service_1.InventoryService,
        storage_service_1.StorageService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map