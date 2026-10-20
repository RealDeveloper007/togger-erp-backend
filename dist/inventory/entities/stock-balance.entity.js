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
exports.StockBalance = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const stock_location_entity_1 = require("./stock-location.entity");
let StockBalance = class StockBalance extends base_entity_1.BaseEntity {
};
exports.StockBalance = StockBalance;
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id' }),
    __metadata("design:type", String)
], StockBalance.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_id' }),
    __metadata("design:type", String)
], StockBalance.prototype, "locationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity_on_hand', type: 'numeric', precision: 12, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], StockBalance.prototype, "quantityOnHand", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity_reserved', type: 'numeric', precision: 12, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], StockBalance.prototype, "quantityReserved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity_available', type: 'numeric', precision: 12, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], StockBalance.prototype, "quantityAvailable", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", product_entity_1.Product)
], StockBalance.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => stock_location_entity_1.StockLocation, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'location_id' }),
    __metadata("design:type", stock_location_entity_1.StockLocation)
], StockBalance.prototype, "location", void 0);
exports.StockBalance = StockBalance = __decorate([
    (0, typeorm_1.Entity)('stock_balances'),
    (0, typeorm_1.Unique)(['productId', 'locationId'])
], StockBalance);
//# sourceMappingURL=stock-balance.entity.js.map