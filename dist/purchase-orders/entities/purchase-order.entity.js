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
exports.PurchaseOrderLine = exports.PurchaseOrder = exports.PurchaseOrderStatus = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
const supplier_entity_1 = require("../../suppliers/entities/supplier.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var PurchaseOrderStatus;
(function (PurchaseOrderStatus) {
    PurchaseOrderStatus["DRAFT"] = "draft";
    PurchaseOrderStatus["SENT"] = "sent";
    PurchaseOrderStatus["PARTIALLY_RECEIVED"] = "partially_received";
    PurchaseOrderStatus["RECEIVED"] = "received";
    PurchaseOrderStatus["CANCELLED"] = "cancelled";
})(PurchaseOrderStatus || (exports.PurchaseOrderStatus = PurchaseOrderStatus = {}));
let PurchaseOrder = class PurchaseOrder extends base_entity_1.BaseEntity {
};
exports.PurchaseOrder = PurchaseOrder;
__decorate([
    (0, typeorm_1.Column)({ name: 'po_number', unique: true, length: 50 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "poNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_id' }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => supplier_entity_1.Supplier, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'supplier_id' }),
    __metadata("design:type", supplier_entity_1.Supplier)
], PurchaseOrder.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by_id', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_id' }),
    __metadata("design:type", user_entity_1.User)
], PurchaseOrder.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PurchaseOrderStatus, default: PurchaseOrderStatus.DRAFT }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_date', type: 'date' }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "orderDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "expectedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PurchaseOrder.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subtotal', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrder.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_amount', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrder.prototype, "vatAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'grand_total', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrder.prototype, "grandTotal", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PurchaseOrderLine, (line) => line.purchaseOrder, { cascade: true }),
    __metadata("design:type", Array)
], PurchaseOrder.prototype, "lines", void 0);
exports.PurchaseOrder = PurchaseOrder = __decorate([
    (0, typeorm_1.Entity)('purchase_orders')
], PurchaseOrder);
let PurchaseOrderLine = class PurchaseOrderLine extends base_entity_1.BaseEntity {
};
exports.PurchaseOrderLine = PurchaseOrderLine;
__decorate([
    (0, typeorm_1.Column)({ name: 'purchase_order_id' }),
    __metadata("design:type", String)
], PurchaseOrderLine.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PurchaseOrder, (po) => po.lines, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'purchase_order_id' }),
    __metadata("design:type", PurchaseOrder)
], PurchaseOrderLine.prototype, "purchaseOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id' }),
    __metadata("design:type", String)
], PurchaseOrderLine.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", product_entity_1.Product)
], PurchaseOrderLine.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 3 }),
    __metadata("design:type", Number)
], PurchaseOrderLine.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'received_quantity', type: 'numeric', precision: 12, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrderLine.prototype, "receivedQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_cost', type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], PurchaseOrderLine.prototype, "unitCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_total', type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], PurchaseOrderLine.prototype, "lineTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_rate', type: 'numeric', precision: 5, scale: 2, default: 20 }),
    __metadata("design:type", Number)
], PurchaseOrderLine.prototype, "vatRate", void 0);
exports.PurchaseOrderLine = PurchaseOrderLine = __decorate([
    (0, typeorm_1.Entity)('purchase_order_lines')
], PurchaseOrderLine);
//# sourceMappingURL=purchase-order.entity.js.map