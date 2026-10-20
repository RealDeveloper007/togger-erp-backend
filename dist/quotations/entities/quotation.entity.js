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
exports.QuotationAdditionalCharge = exports.QuotationLabourCharge = exports.QuotationLine = exports.Quotation = exports.QuotationStatus = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const customer_address_entity_1 = require("../../customers/entities/customer-address.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var QuotationStatus;
(function (QuotationStatus) {
    QuotationStatus["DRAFT"] = "draft";
    QuotationStatus["OPEN"] = "open";
    QuotationStatus["SENT"] = "sent";
    QuotationStatus["VIEWED"] = "viewed";
    QuotationStatus["ACCEPTED"] = "accepted";
    QuotationStatus["REJECTED"] = "rejected";
    QuotationStatus["EXPIRED"] = "expired";
    QuotationStatus["CONVERTED"] = "converted_to_job";
})(QuotationStatus || (exports.QuotationStatus = QuotationStatus = {}));
let Quotation = class Quotation extends base_entity_1.BaseEntity {
};
exports.Quotation = Quotation;
__decorate([
    (0, typeorm_1.Column)({ name: 'quotation_number', unique: true, length: 50 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Quotation.prototype, "quotationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_number', length: 100 }),
    __metadata("design:type", String)
], Quotation.prototype, "referenceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'apply_vat', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Quotation.prototype, "applyVat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", String)
], Quotation.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], Quotation.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_id', nullable: true }),
    __metadata("design:type", String)
], Quotation.prototype, "addressId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_address_entity_1.CustomerAddress, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'address_id' }),
    __metadata("design:type", customer_address_entity_1.CustomerAddress)
], Quotation.prototype, "installationAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by_id', nullable: true }),
    __metadata("design:type", String)
], Quotation.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_id' }),
    __metadata("design:type", user_entity_1.User)
], Quotation.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: QuotationStatus, default: QuotationStatus.DRAFT }),
    __metadata("design:type", String)
], Quotation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quotation_date', type: 'date' }),
    __metadata("design:type", String)
], Quotation.prototype, "quotationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valid_until_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], Quotation.prototype, "validUntilDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Quotation.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'terms_and_conditions', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Quotation.prototype, "termsAndConditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'internal_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Quotation.prototype, "internalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subtotal_products', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Quotation.prototype, "subtotalProducts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subtotal_labour', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Quotation.prototype, "subtotalLabour", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subtotal_additional', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Quotation.prototype, "subtotalAdditional", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_amount', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Quotation.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taxable_amount', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Quotation.prototype, "taxableAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_amount', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Quotation.prototype, "vatAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'grand_total', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Quotation.prototype, "grandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revision', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Quotation.prototype, "revision", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sent_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Quotation.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'viewed_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Quotation.prototype, "viewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'accepted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Quotation.prototype, "acceptedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rejected_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Quotation.prototype, "rejectedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'converted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Quotation.prototype, "convertedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => QuotationLine, (line) => line.quotation, { cascade: true }),
    __metadata("design:type", Array)
], Quotation.prototype, "lines", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => QuotationLabourCharge, (lc) => lc.quotation, { cascade: true }),
    __metadata("design:type", Array)
], Quotation.prototype, "labourCharges", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => QuotationAdditionalCharge, (ac) => ac.quotation, { cascade: true }),
    __metadata("design:type", Array)
], Quotation.prototype, "additionalCharges", void 0);
exports.Quotation = Quotation = __decorate([
    (0, typeorm_1.Entity)('quotations')
], Quotation);
let QuotationLine = class QuotationLine extends base_entity_1.BaseEntity {
};
exports.QuotationLine = QuotationLine;
__decorate([
    (0, typeorm_1.Column)({ name: 'quotation_id' }),
    __metadata("design:type", String)
], QuotationLine.prototype, "quotationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Quotation, (q) => q.lines, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'quotation_id' }),
    __metadata("design:type", Quotation)
], QuotationLine.prototype, "quotation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id', nullable: true }),
    __metadata("design:type", String)
], QuotationLine.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_name', length: 255 }),
    __metadata("design:type", String)
], QuotationLine.prototype, "productName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_sku', nullable: true, length: 100 }),
    __metadata("design:type", String)
], QuotationLine.prototype, "productSku", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'model_number', nullable: true, length: 150 }),
    __metadata("design:type", String)
], QuotationLine.prototype, "modelNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], QuotationLine.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 3 }),
    __metadata("design:type", Number)
], QuotationLine.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], QuotationLine.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_percent', type: 'numeric', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], QuotationLine.prototype, "discountPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_total', type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], QuotationLine.prototype, "lineTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_rate', type: 'numeric', precision: 5, scale: 2, default: 20 }),
    __metadata("design:type", Number)
], QuotationLine.prototype, "vatRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_amount', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], QuotationLine.prototype, "vatAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], QuotationLine.prototype, "sortOrder", void 0);
exports.QuotationLine = QuotationLine = __decorate([
    (0, typeorm_1.Entity)('quotation_lines')
], QuotationLine);
let QuotationLabourCharge = class QuotationLabourCharge extends base_entity_1.BaseEntity {
};
exports.QuotationLabourCharge = QuotationLabourCharge;
__decorate([
    (0, typeorm_1.Column)({ name: 'quotation_id' }),
    __metadata("design:type", String)
], QuotationLabourCharge.prototype, "quotationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Quotation, (q) => q.labourCharges, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'quotation_id' }),
    __metadata("design:type", Quotation)
], QuotationLabourCharge.prototype, "quotation", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], QuotationLabourCharge.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'charge_type', length: 50, default: 'fixed' }),
    __metadata("design:type", String)
], QuotationLabourCharge.prototype, "chargeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 10, scale: 2, default: 1 }),
    __metadata("design:type", Number)
], QuotationLabourCharge.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_rate', type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], QuotationLabourCharge.prototype, "unitRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_total', type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], QuotationLabourCharge.prototype, "lineTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_rate', type: 'numeric', precision: 5, scale: 2, default: 20 }),
    __metadata("design:type", Number)
], QuotationLabourCharge.prototype, "vatRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], QuotationLabourCharge.prototype, "sortOrder", void 0);
exports.QuotationLabourCharge = QuotationLabourCharge = __decorate([
    (0, typeorm_1.Entity)('quotation_labour_charges')
], QuotationLabourCharge);
let QuotationAdditionalCharge = class QuotationAdditionalCharge extends base_entity_1.BaseEntity {
};
exports.QuotationAdditionalCharge = QuotationAdditionalCharge;
__decorate([
    (0, typeorm_1.Column)({ name: 'quotation_id' }),
    __metadata("design:type", String)
], QuotationAdditionalCharge.prototype, "quotationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Quotation, (q) => q.additionalCharges, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'quotation_id' }),
    __metadata("design:type", Quotation)
], QuotationAdditionalCharge.prototype, "quotation", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], QuotationAdditionalCharge.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'charge_type', length: 50, default: 'service' }),
    __metadata("design:type", String)
], QuotationAdditionalCharge.prototype, "chargeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id', nullable: true }),
    __metadata("design:type", String)
], QuotationAdditionalCharge.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 10, scale: 3, default: 1 }),
    __metadata("design:type", Number)
], QuotationAdditionalCharge.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], QuotationAdditionalCharge.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_total', type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], QuotationAdditionalCharge.prototype, "lineTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_rate', type: 'numeric', precision: 5, scale: 2, default: 20 }),
    __metadata("design:type", Number)
], QuotationAdditionalCharge.prototype, "vatRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], QuotationAdditionalCharge.prototype, "sortOrder", void 0);
exports.QuotationAdditionalCharge = QuotationAdditionalCharge = __decorate([
    (0, typeorm_1.Entity)('quotation_additional_charges')
], QuotationAdditionalCharge);
//# sourceMappingURL=quotation.entity.js.map