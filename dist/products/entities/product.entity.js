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
exports.Product = exports.UnitOfMeasurement = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
const brand_entity_1 = require("./brand.entity");
const category_entity_1 = require("./category.entity");
const supplier_entity_1 = require("../../suppliers/entities/supplier.entity");
const vat_rate_entity_1 = require("../../settings/entities/vat-rate.entity");
var UnitOfMeasurement;
(function (UnitOfMeasurement) {
    UnitOfMeasurement["EACH"] = "each";
    UnitOfMeasurement["METER"] = "meter";
    UnitOfMeasurement["KG"] = "kg";
    UnitOfMeasurement["LITRE"] = "litre";
    UnitOfMeasurement["BOX"] = "box";
    UnitOfMeasurement["PACK"] = "pack";
    UnitOfMeasurement["ROLL"] = "roll";
    UnitOfMeasurement["SET"] = "set";
})(UnitOfMeasurement || (exports.UnitOfMeasurement = UnitOfMeasurement = {}));
let Product = class Product extends base_entity_1.BaseEntity {
};
exports.Product = Product;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Object)
], Product.prototype, "sku", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'model_number', nullable: true, length: 150 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Product.prototype, "modelNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 150 }),
    __metadata("design:type", String)
], Product.prototype, "manufacturer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'purchase_price', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "purchasePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'selling_price', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "sellingPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: UnitOfMeasurement, default: UnitOfMeasurement.EACH }),
    __metadata("design:type", String)
], Product.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reorder_level', type: 'int', default: 5 }),
    __metadata("design:type", Number)
], Product.prototype, "reorderLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'image_url', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'warranty_months', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Product.prototype, "warrantyMonths", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'warranty_notes', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Product.prototype, "warrantyNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Product.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_stockable', default: true }),
    __metadata("design:type", Boolean)
], Product.prototype, "isStockable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'brand_id', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "brandId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_id', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_rate_id', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "vatRateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => brand_entity_1.Brand, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'brand_id' }),
    __metadata("design:type", brand_entity_1.Brand)
], Product.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", category_entity_1.Category)
], Product.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => supplier_entity_1.Supplier, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'supplier_id' }),
    __metadata("design:type", supplier_entity_1.Supplier)
], Product.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vat_rate_entity_1.VatRate, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'vat_rate_id' }),
    __metadata("design:type", vat_rate_entity_1.VatRate)
], Product.prototype, "vatRate", void 0);
exports.Product = Product = __decorate([
    (0, typeorm_1.Entity)('products')
], Product);
//# sourceMappingURL=product.entity.js.map