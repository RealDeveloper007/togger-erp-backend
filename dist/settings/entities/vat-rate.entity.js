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
exports.VatRate = exports.VatCategory = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
var VatCategory;
(function (VatCategory) {
    VatCategory["STANDARD"] = "standard";
    VatCategory["REDUCED"] = "reduced";
    VatCategory["ZERO"] = "zero";
    VatCategory["EXEMPT"] = "exempt";
})(VatCategory || (exports.VatCategory = VatCategory = {}));
let VatRate = class VatRate extends base_entity_1.BaseEntity {
};
exports.VatRate = VatRate;
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true }),
    __metadata("design:type", String)
], VatRate.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: VatCategory }),
    __metadata("design:type", String)
], VatRate.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], VatRate.prototype, "rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], VatRate.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], VatRate.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_default', default: false }),
    __metadata("design:type", Boolean)
], VatRate.prototype, "isDefault", void 0);
exports.VatRate = VatRate = __decorate([
    (0, typeorm_1.Entity)('vat_rates')
], VatRate);
//# sourceMappingURL=vat-rate.entity.js.map