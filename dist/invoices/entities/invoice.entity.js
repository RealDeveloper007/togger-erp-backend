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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = exports.InvoiceLine = exports.Invoice = exports.PaymentMethod = exports.InvoiceStatus = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
const job_entity_1 = require("../../jobs/entities/job.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const quotation_entity_1 = require("../../quotations/entities/quotation.entity");
const product_entity_1 = require("../../products/entities/product.entity");
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "draft";
    InvoiceStatus["SENT"] = "sent";
    InvoiceStatus["PARTIALLY_PAID"] = "partially_paid";
    InvoiceStatus["PAID"] = "paid";
    InvoiceStatus["OVERDUE"] = "overdue";
    InvoiceStatus["CANCELLED"] = "cancelled";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["CARD"] = "card";
    PaymentMethod["CHEQUE"] = "cheque";
    PaymentMethod["OTHER"] = "other";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
let Invoice = class Invoice extends base_entity_1.BaseEntity {
};
exports.Invoice = Invoice;
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_number', unique: true, length: 50 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_id', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "jobId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => job_entity_1.Job, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'job_id' }),
    __metadata("design:type", job_entity_1.Job)
], Invoice.prototype, "job", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quotation_id', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "quotationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => quotation_entity_1.Quotation, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'quotation_id' }),
    __metadata("design:type", quotation_entity_1.Quotation)
], Invoice.prototype, "quotation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", String)
], Invoice.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], Invoice.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by_id', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_id' }),
    __metadata("design:type", user_entity_1.User)
], Invoice.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT }),
    __metadata("design:type", String)
], Invoice.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_date', type: 'date' }),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subtotal', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_amount', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_amount', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "vatAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'grand_total', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "grandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'amount_paid', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "amountPaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'amount_outstanding', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "amountOutstanding", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'terms_and_conditions', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "termsAndConditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sent_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => InvoiceLine, (line) => line.invoice, { cascade: true }),
    __metadata("design:type", Array)
], Invoice.prototype, "lines", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Payment, (payment) => payment.invoice),
    __metadata("design:type", Array)
], Invoice.prototype, "payments", void 0);
exports.Invoice = Invoice = __decorate([
    (0, typeorm_1.Entity)('invoices')
], Invoice);
let InvoiceLine = class InvoiceLine extends base_entity_1.BaseEntity {
};
exports.InvoiceLine = InvoiceLine;
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_id' }),
    __metadata("design:type", String)
], InvoiceLine.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Invoice, (inv) => inv.lines, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'invoice_id' }),
    __metadata("design:type", Invoice)
], InvoiceLine.prototype, "invoice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id', nullable: true }),
    __metadata("design:type", String)
], InvoiceLine.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", product_entity_1.Product)
], InvoiceLine.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], InvoiceLine.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 3 }),
    __metadata("design:type", Number)
], InvoiceLine.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], InvoiceLine.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_total', type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], InvoiceLine.prototype, "lineTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_rate', type: 'numeric', precision: 5, scale: 2, default: 20 }),
    __metadata("design:type", Number)
], InvoiceLine.prototype, "vatRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_amount', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InvoiceLine.prototype, "vatAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InvoiceLine.prototype, "sortOrder", void 0);
exports.InvoiceLine = InvoiceLine = __decorate([
    (0, typeorm_1.Entity)('invoice_lines')
], InvoiceLine);
let Payment = class Payment extends base_entity_1.BaseEntity {
};
exports.Payment = Payment;
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_id' }),
    __metadata("design:type", String)
], Payment.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Invoice, (inv) => inv.payments, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'invoice_id' }),
    __metadata("design:type", Invoice)
], Payment.prototype, "invoice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recorded_by_id', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "recordedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'recorded_by_id' }),
    __metadata("design:type", user_entity_1.User)
], Payment.prototype, "recordedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_date', type: 'date' }),
    __metadata("design:type", String)
], Payment.prototype, "paymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.BANK_TRANSFER }),
    __metadata("design:type", String)
], Payment.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_number', nullable: true, length: 100 }),
    __metadata("design:type", String)
], Payment.prototype, "referenceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Payment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attachment_key', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Payment.prototype, "attachmentKey", void 0);
exports.Payment = Payment = __decorate([
    (0, typeorm_1.Entity)('payments')
], Payment);
//# sourceMappingURL=invoice.entity.js.map