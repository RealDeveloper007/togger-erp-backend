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
exports.CustomerAddress = exports.AddressType = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
const customer_entity_1 = require("./customer.entity");
var AddressType;
(function (AddressType) {
    AddressType["INSTALLATION"] = "installation";
    AddressType["SERVICE"] = "service";
    AddressType["BILLING"] = "billing";
    AddressType["OTHER"] = "other";
})(AddressType || (exports.AddressType = AddressType = {}));
let CustomerAddress = class CustomerAddress extends base_entity_1.BaseEntity {
};
exports.CustomerAddress = CustomerAddress;
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", String)
], CustomerAddress.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, (c) => c.addresses, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], CustomerAddress.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], CustomerAddress.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AddressType, default: AddressType.INSTALLATION }),
    __metadata("design:type", String)
], CustomerAddress.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_line1' }),
    __metadata("design:type", String)
], CustomerAddress.prototype, "addressLine1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_line2', nullable: true }),
    __metadata("design:type", String)
], CustomerAddress.prototype, "addressLine2", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], CustomerAddress.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], CustomerAddress.prototype, "county", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], CustomerAddress.prototype, "postcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'United Kingdom', length: 100 }),
    __metadata("design:type", String)
], CustomerAddress.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_primary', default: false }),
    __metadata("design:type", Boolean)
], CustomerAddress.prototype, "isPrimary", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], CustomerAddress.prototype, "notes", void 0);
exports.CustomerAddress = CustomerAddress = __decorate([
    (0, typeorm_1.Entity)('customer_addresses')
], CustomerAddress);
//# sourceMappingURL=customer-address.entity.js.map