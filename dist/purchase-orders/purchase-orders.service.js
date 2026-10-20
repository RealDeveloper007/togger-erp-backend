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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const decimal_js_1 = require("decimal.js");
const purchase_order_entity_1 = require("./entities/purchase-order.entity");
const company_settings_entity_1 = require("../settings/entities/company-settings.entity");
const inventory_service_1 = require("../inventory/inventory.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let PurchaseOrdersService = class PurchaseOrdersService {
    constructor(poRepo, settingsRepo, dataSource, inventoryService) {
        this.poRepo = poRepo;
        this.settingsRepo = settingsRepo;
        this.dataSource = dataSource;
        this.inventoryService = inventoryService;
    }
    async getNextNumber() {
        return this.dataSource.transaction(async (manager) => {
            const settings = await manager.findOne(company_settings_entity_1.CompanySettings, { where: {} });
            const num = settings?.poNextNumber || 1001;
            const prefix = settings?.poPrefix || 'PO-';
            if (settings)
                await manager.update(company_settings_entity_1.CompanySettings, settings.id, { poNextNumber: num + 1 });
            return `${prefix}${num}`;
        });
    }
    async create(dto, userId) {
        const poNumber = await this.getNextNumber();
        let subtotal = new decimal_js_1.default(0);
        let vatAmount = new decimal_js_1.default(0);
        const lines = dto.lines.map((l) => {
            const qty = new decimal_js_1.default(l.quantity);
            const cost = new decimal_js_1.default(l.unitCost);
            const lineTotal = qty.times(cost).toDecimalPlaces(2);
            const vat = lineTotal.times(l.vatRate ?? 20).dividedBy(100).toDecimalPlaces(2);
            subtotal = subtotal.plus(lineTotal);
            vatAmount = vatAmount.plus(vat);
            return {
                productId: l.productId,
                quantity: qty.toNumber(),
                unitCost: cost.toDecimalPlaces(2).toNumber(),
                lineTotal: lineTotal.toNumber(),
                vatRate: l.vatRate ?? 20,
                receivedQuantity: 0,
            };
        });
        const po = this.poRepo.create({
            poNumber,
            supplierId: dto.supplierId,
            createdById: userId,
            orderDate: dto.orderDate,
            expectedDate: dto.expectedDate,
            notes: dto.notes,
            subtotal: subtotal.toNumber(),
            vatAmount: vatAmount.toNumber(),
            grandTotal: subtotal.plus(vatAmount).toDecimalPlaces(2).toNumber(),
            lines: lines,
        });
        return this.poRepo.save(po);
    }
    async findAll(query) {
        const { page = 1, limit = 20, search, status } = query;
        const qb = this.poRepo.createQueryBuilder('po')
            .leftJoinAndSelect('po.supplier', 's')
            .orderBy('po.createdAt', 'DESC');
        if (search)
            qb.where('po.poNumber ILIKE :s OR s.name ILIKE :s', { s: `%${search}%` });
        if (status)
            qb.andWhere('po.status = :status', { status });
        const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
        return (0, pagination_dto_1.paginate)(data, total, page, limit);
    }
    async findOne(id) {
        const po = await this.poRepo.findOne({
            where: { id },
            relations: ['supplier', 'lines', 'lines.product', 'createdBy'],
        });
        if (!po)
            throw new common_1.NotFoundException('Purchase order not found');
        return po;
    }
    async receive(id, receipts, locationId, userId) {
        const po = await this.findOne(id);
        if (po.status === purchase_order_entity_1.PurchaseOrderStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot receive a cancelled purchase order');
        }
        for (const receipt of receipts) {
            const line = po.lines.find((l) => l.id === receipt.lineId);
            if (!line)
                throw new common_1.NotFoundException('PO line not found');
            const remaining = new decimal_js_1.default(line.quantity).minus(line.receivedQuantity || 0);
            if (new decimal_js_1.default(receipt.quantity).gt(remaining)) {
                throw new common_1.BadRequestException('Received quantity exceeds ordered quantity');
            }
            await this.inventoryService.receiveStock({
                productId: line.productId,
                locationId,
                quantity: receipt.quantity,
                unitCost: Number(line.unitCost),
                referenceNumber: po.poNumber,
                notes: `PO receipt ${po.poNumber}`,
            }, userId);
            line.receivedQuantity = new decimal_js_1.default(line.receivedQuantity || 0).plus(receipt.quantity).toNumber();
            await this.dataSource.getRepository(purchase_order_entity_1.PurchaseOrderLine).save(line);
        }
        const refreshed = await this.findOne(id);
        const fullyReceived = refreshed.lines.every((l) => new decimal_js_1.default(l.receivedQuantity).gte(l.quantity));
        const anyReceived = refreshed.lines.some((l) => new decimal_js_1.default(l.receivedQuantity).gt(0));
        refreshed.status = fullyReceived
            ? purchase_order_entity_1.PurchaseOrderStatus.RECEIVED
            : anyReceived
                ? purchase_order_entity_1.PurchaseOrderStatus.PARTIALLY_RECEIVED
                : refreshed.status;
        return this.poRepo.save(refreshed);
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(purchase_order_entity_1.PurchaseOrder)),
    __param(1, (0, typeorm_1.InjectRepository)(company_settings_entity_1.CompanySettings)),
    __param(2, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        inventory_service_1.InventoryService])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map