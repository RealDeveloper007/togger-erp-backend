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
exports.LabourRate = exports.LabourChargeType = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
var LabourChargeType;
(function (LabourChargeType) {
    LabourChargeType["FIXED"] = "fixed";
    LabourChargeType["HOURLY"] = "hourly";
    LabourChargeType["DAILY"] = "daily";
    LabourChargeType["PER_UNIT"] = "per_unit";
    LabourChargeType["CUSTOM"] = "custom";
})(LabourChargeType || (exports.LabourChargeType = LabourChargeType = {}));
let LabourRate = class LabourRate extends base_entity_1.BaseEntity {
};
exports.LabourRate = LabourRate;
__decorate([
    (0, typeorm_1.Column)({ length: 150, unique: true }),
    __metadata("design:type", String)
], LabourRate.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LabourRate.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'charge_type', length: 30, default: LabourChargeType.FIXED }),
    __metadata("design:type", String)
], LabourRate.prototype, "chargeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_rate', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], LabourRate.prototype, "defaultRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_rate', type: 'numeric', precision: 5, scale: 2, default: 20 }),
    __metadata("design:type", Number)
], LabourRate.prototype, "vatRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], LabourRate.prototype, "isActive", void 0);
exports.LabourRate = LabourRate = __decorate([
    (0, typeorm_1.Entity)('labour_rates')
], LabourRate);
//# sourceMappingURL=labour-rate.entity.js.map