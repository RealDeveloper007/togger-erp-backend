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
exports.CompanySettings = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
let CompanySettings = class CompanySettings extends base_entity_1.BaseEntity {
};
exports.CompanySettings = CompanySettings;
__decorate([
    (0, typeorm_1.Column)({ length: 200, unique: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 255 }),
    __metadata("design:type", String)
], CompanySettings.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 30 }),
    __metadata("design:type", String)
], CompanySettings.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 255 }),
    __metadata("design:type", String)
], CompanySettings.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_line1', nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "addressLine1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_line2', nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "addressLine2", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], CompanySettings.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 20 }),
    __metadata("design:type", String)
], CompanySettings.prototype, "postcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'United Kingdom', length: 100 }),
    __metadata("design:type", String)
], CompanySettings.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_number', nullable: true, length: 50 }),
    __metadata("design:type", String)
], CompanySettings.prototype, "vatNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_registration_number', nullable: true, length: 50 }),
    __metadata("design:type", String)
], CompanySettings.prototype, "companyRegistrationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'logo_url', nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quotation_prefix', default: 'TOG-', length: 20 }),
    __metadata("design:type", String)
], CompanySettings.prototype, "quotationPrefix", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_prefix', default: 'INV-', length: 20 }),
    __metadata("design:type", String)
], CompanySettings.prototype, "invoicePrefix", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_prefix', default: 'JOB-', length: 20 }),
    __metadata("design:type", String)
], CompanySettings.prototype, "jobPrefix", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'po_prefix', default: 'PO-', length: 20 }),
    __metadata("design:type", String)
], CompanySettings.prototype, "poPrefix", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quotation_next_number', type: 'int', default: 1001 }),
    __metadata("design:type", Number)
], CompanySettings.prototype, "quotationNextNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_next_number', type: 'int', default: 1001 }),
    __metadata("design:type", Number)
], CompanySettings.prototype, "invoiceNextNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_next_number', type: 'int', default: 1001 }),
    __metadata("design:type", Number)
], CompanySettings.prototype, "jobNextNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'po_next_number', type: 'int', default: 1001 }),
    __metadata("design:type", Number)
], CompanySettings.prototype, "poNextNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_payment_terms_days', type: 'int', default: 30 }),
    __metadata("design:type", Number)
], CompanySettings.prototype, "defaultPaymentTermsDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_quotation_valid_days', type: 'int', default: 30 }),
    __metadata("design:type", Number)
], CompanySettings.prototype, "defaultQuotationValidDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_terms_and_conditions', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "defaultTermsAndConditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name', nullable: true, length: 150 }),
    __metadata("design:type", String)
], CompanySettings.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_account_name', nullable: true, length: 150 }),
    __metadata("design:type", String)
], CompanySettings.prototype, "bankAccountName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_sort_code', nullable: true, length: 20 }),
    __metadata("design:type", String)
], CompanySettings.prototype, "bankSortCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_account_number', nullable: true, length: 30 }),
    __metadata("design:type", String)
], CompanySettings.prototype, "bankAccountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_iban', nullable: true, length: 50 }),
    __metadata("design:type", String)
], CompanySettings.prototype, "bankIban", void 0);
exports.CompanySettings = CompanySettings = __decorate([
    (0, typeorm_1.Entity)('company_settings')
], CompanySettings);
//# sourceMappingURL=company-settings.entity.js.map