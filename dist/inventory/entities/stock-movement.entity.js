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
exports.StockMovement = exports.MovementType = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const stock_location_entity_1 = require("./stock-location.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var MovementType;
(function (MovementType) {
    MovementType["RECEIVED"] = "received";
    MovementType["ISSUED"] = "issued";
    MovementType["RESERVED"] = "reserved";
    MovementType["RESERVATION_RELEASED"] = "reservation_released";
    MovementType["RETURNED"] = "returned";
    MovementType["DAMAGED"] = "damaged";
    MovementType["ADJUSTMENT_IN"] = "adjustment_in";
    MovementType["ADJUSTMENT_OUT"] = "adjustment_out";
    MovementType["TRANSFER_IN"] = "transfer_in";
    MovementType["TRANSFER_OUT"] = "transfer_out";
})(MovementType || (exports.MovementType = MovementType = {}));
let StockMovement = class StockMovement extends base_entity_1.BaseEntity {
};
exports.StockMovement = StockMovement;
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], StockMovement.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], StockMovement.prototype, "locationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MovementType }),
    __metadata("design:type", String)
], StockMovement.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 3 }),
    __metadata("design:type", Number)
], StockMovement.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_cost', type: 'numeric', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], StockMovement.prototype, "unitCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_type', nullable: true, length: 50 }),
    __metadata("design:type", String)
], StockMovement.prototype, "referenceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_id', nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "referenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_number', nullable: true, length: 100 }),
    __metadata("design:type", String)
], StockMovement.prototype, "referenceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], StockMovement.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by_id', nullable: true }),
    __metadata("design:type", String)
], StockMovement.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", product_entity_1.Product)
], StockMovement.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => stock_location_entity_1.StockLocation, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'location_id' }),
    __metadata("design:type", stock_location_entity_1.StockLocation)
], StockMovement.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_id' }),
    __metadata("design:type", user_entity_1.User)
], StockMovement.prototype, "createdBy", void 0);
exports.StockMovement = StockMovement = __decorate([
    (0, typeorm_1.Entity)('stock_movements')
], StockMovement);
//# sourceMappingURL=stock-movement.entity.js.map