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
exports.ProductPriceHistory = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
const product_entity_1 = require("./product.entity");
let ProductPriceHistory = class ProductPriceHistory extends base_entity_1.BaseEntity {
};
exports.ProductPriceHistory = ProductPriceHistory;
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id', type: 'uuid' }),
    __metadata("design:type", String)
], ProductPriceHistory.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", product_entity_1.Product)
], ProductPriceHistory.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'previous_price', type: 'numeric', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], ProductPriceHistory.prototype, "previousPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'new_price', type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], ProductPriceHistory.prototype, "newPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity_on_hand', type: 'numeric', precision: 12, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], ProductPriceHistory.prototype, "quantityOnHand", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], ProductPriceHistory.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'changed_by_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ProductPriceHistory.prototype, "changedById", void 0);
exports.ProductPriceHistory = ProductPriceHistory = __decorate([
    (0, typeorm_1.Entity)('product_price_history')
], ProductPriceHistory);
//# sourceMappingURL=product-price-history.entity.js.map