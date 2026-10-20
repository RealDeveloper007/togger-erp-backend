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
exports.Customer = exports.CustomerType = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
const customer_address_entity_1 = require("./customer-address.entity");
var CustomerType;
(function (CustomerType) {
    CustomerType["INDIVIDUAL"] = "individual";
    CustomerType["COMPANY"] = "company";
})(CustomerType || (exports.CustomerType = CustomerType = {}));
let Customer = class Customer extends base_entity_1.BaseEntity {
    get displayName() {
        if (this.type === CustomerType.COMPANY)
            return this.companyName || 'Unknown';
        return [this.firstName, this.lastName].filter(Boolean).join(' ') || 'Unknown';
    }
};
exports.Customer = Customer;
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_code', unique: true, length: 20, default: () => "'cus-' || lpad(nextval('customers_customer_code_seq')::text, 4, '0')" }),
    __metadata("design:type", String)
], Customer.prototype, "customerCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CustomerType, default: CustomerType.INDIVIDUAL }),
    __metadata("design:type", String)
], Customer.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name', nullable: true, length: 100 }),
    __metadata("design:type", String)
], Customer.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name', nullable: true, length: 100 }),
    __metadata("design:type", String)
], Customer.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_name', nullable: true, length: 200 }),
    __metadata("design:type", String)
], Customer.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 255 }),
    __metadata("design:type", String)
], Customer.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 30 }),
    __metadata("design:type", String)
], Customer.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mobile', nullable: true, length: 30 }),
    __metadata("design:type", String)
], Customer.prototype, "mobile", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'billing_address_line1', nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "billingAddressLine1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'billing_address_line2', nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "billingAddressLine2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'billing_city', nullable: true, length: 100 }),
    __metadata("design:type", String)
], Customer.prototype, "billingCity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'billing_postcode', nullable: true, length: 20 }),
    __metadata("design:type", String)
], Customer.prototype, "billingPostcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'billing_country', default: 'United Kingdom', length: 100 }),
    __metadata("design:type", String)
], Customer.prototype, "billingCountry", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Customer.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Customer.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_exempt', default: false }),
    __metadata("design:type", Boolean)
], Customer.prototype, "vatExempt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_number', nullable: true, length: 50 }),
    __metadata("design:type", String)
], Customer.prototype, "vatNumber", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => customer_address_entity_1.CustomerAddress, (addr) => addr.customer, { cascade: true }),
    __metadata("design:type", Array)
], Customer.prototype, "addresses", void 0);
exports.Customer = Customer = __decorate([
    (0, typeorm_1.Entity)('customers')
], Customer);
//# sourceMappingURL=customer.entity.js.map