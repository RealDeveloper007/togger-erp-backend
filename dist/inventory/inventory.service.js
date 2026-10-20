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
exports.InventoryService = exports.ReserveStockDto = exports.AdjustStockDto = exports.ReceiveStockDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const decimal_js_1 = require("decimal.js");
const stock_movement_entity_1 = require("./entities/stock-movement.entity");
const stock_balance_entity_1 = require("./entities/stock-balance.entity");
const stock_location_entity_1 = require("./entities/stock-location.entity");
const product_entity_1 = require("../products/entities/product.entity");
const product_price_history_entity_1 = require("../products/entities/product-price-history.entity");
const pagination_dto_1 = require("../common/dto/pagination.dto");
class ReceiveStockDto {
}
exports.ReceiveStockDto = ReceiveStockDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReceiveStockDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReceiveStockDto.prototype, "locationId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], ReceiveStockDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ReceiveStockDto.prototype, "unitCost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveStockDto.prototype, "referenceNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveStockDto.prototype, "notes", void 0);
class AdjustStockDto {
}
exports.AdjustStockDto = AdjustStockDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AdjustStockDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AdjustStockDto.prototype, "locationId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.NotEquals)(0),
    __metadata("design:type", Number)
], AdjustStockDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdjustStockDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdjustStockDto.prototype, "notes", void 0);
class ReserveStockDto {
}
exports.ReserveStockDto = ReserveStockDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReserveStockDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReserveStockDto.prototype, "locationId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], ReserveStockDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReserveStockDto.prototype, "referenceType", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReserveStockDto.prototype, "referenceId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReserveStockDto.prototype, "referenceNumber", void 0);
let InventoryService = class InventoryService {
    constructor(movementRepo, balanceRepo, locationRepo, productRepo, dataSource) {
        this.movementRepo = movementRepo;
        this.balanceRepo = balanceRepo;
        this.locationRepo = locationRepo;
        this.productRepo = productRepo;
        this.dataSource = dataSource;
    }
    async getDefaultLocation() {
        let loc = await this.locationRepo.findOne({ where: { isDefault: true } });
        if (!loc)
            loc = await this.locationRepo.findOne({ where: {} });
        if (!loc)
            throw new common_1.BadRequestException('No stock location configured');
        return loc;
    }
    async getStockBalance(productId, locationId) {
        return this.balanceRepo.findOne({ where: { productId, locationId }, relations: ['product', 'location'] });
    }
    async getAllBalances(query) {
        const { page = 1, limit = 50, search } = query;
        const qb = this.balanceRepo.createQueryBuilder('b')
            .leftJoinAndSelect('b.product', 'p')
            .leftJoinAndSelect('b.location', 'l')
            .leftJoinAndSelect('p.brand', 'brand')
            .orderBy('p.name', 'ASC');
        if (search) {
            qb.where('p.name ILIKE :s OR p.sku ILIKE :s OR p.modelNumber ILIKE :s', { s: `%${search}%` });
        }
        const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
        return (0, pagination_dto_1.paginate)(data, total, page, limit);
    }
    async receiveStock(dto, userId) {
        return this.dataSource.transaction(async (manager) => {
            if (dto.quantity <= 0)
                throw new common_1.BadRequestException('Quantity must be positive');
            const product = await manager.findOne(product_entity_1.Product, {
                where: { id: dto.productId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!product)
                throw new common_1.NotFoundException('Product not found');
            const location = await manager.findOne(stock_location_entity_1.StockLocation, { where: { id: dto.locationId } });
            if (!location)
                throw new common_1.NotFoundException('Location not found');
            const movement = manager.create(stock_movement_entity_1.StockMovement, {
                productId: dto.productId,
                locationId: dto.locationId,
                type: stock_movement_entity_1.MovementType.RECEIVED,
                quantity: dto.quantity,
                unitCost: dto.unitCost,
                referenceNumber: dto.referenceNumber,
                notes: dto.notes,
                createdById: userId,
            });
            await manager.save(stock_movement_entity_1.StockMovement, movement);
            if (dto.unitCost !== undefined) {
                const currentStock = await manager
                    .createQueryBuilder(stock_balance_entity_1.StockBalance, 'balance')
                    .select('COALESCE(SUM(balance.quantityOnHand), 0)', 'quantity')
                    .where('balance.productId = :productId', { productId: dto.productId })
                    .getRawOne();
                const previousQuantity = new decimal_js_1.default(currentStock?.quantity ?? 0);
                const receivedQuantity = new decimal_js_1.default(dto.quantity);
                const previousCost = new decimal_js_1.default(product.purchasePrice ?? 0);
                const weightedAverage = previousQuantity.plus(receivedQuantity).isZero()
                    ? new decimal_js_1.default(dto.unitCost)
                    : previousQuantity.times(previousCost)
                        .plus(receivedQuantity.times(dto.unitCost))
                        .dividedBy(previousQuantity.plus(receivedQuantity));
                product.purchasePrice = weightedAverage.toDecimalPlaces(2).toNumber();
                if (product.purchasePrice !== previousCost.toNumber()) {
                    await manager.save(product_price_history_entity_1.ProductPriceHistory, manager.create(product_price_history_entity_1.ProductPriceHistory, {
                        productId: product.id,
                        previousPrice: previousCost.toNumber(),
                        newPrice: product.purchasePrice,
                        quantityOnHand: previousQuantity.plus(receivedQuantity).toDecimalPlaces(3).toNumber(),
                        source: 'stock_receipt',
                        changedById: userId,
                    }));
                }
                await manager.save(product_entity_1.Product, product);
            }
            await this.updateBalance(manager, dto.productId, dto.locationId, dto.quantity, 0);
            return movement;
        });
    }
    async adjustStock(dto, userId) {
        return this.dataSource.transaction(async (manager) => {
            const type = dto.quantity > 0 ? stock_movement_entity_1.MovementType.ADJUSTMENT_IN : stock_movement_entity_1.MovementType.ADJUSTMENT_OUT;
            const absQty = Math.abs(dto.quantity);
            if (dto.quantity < 0) {
                const balance = await manager.findOne(stock_balance_entity_1.StockBalance, {
                    where: { productId: dto.productId, locationId: dto.locationId }
                });
                const available = balance ? new decimal_js_1.default(balance.quantityAvailable).toNumber() : 0;
                if (absQty > available)
                    throw new common_1.BadRequestException('Insufficient available stock for adjustment');
            }
            const movement = manager.create(stock_movement_entity_1.StockMovement, {
                productId: dto.productId,
                locationId: dto.locationId,
                type,
                quantity: absQty,
                notes: `${dto.reason}: ${dto.notes || ''}`.trim(),
                createdById: userId,
            });
            await manager.save(stock_movement_entity_1.StockMovement, movement);
            await this.updateBalance(manager, dto.productId, dto.locationId, dto.quantity, 0);
            return movement;
        });
    }
    async reserveStock(dto, userId) {
        return this.dataSource.transaction(async (manager) => {
            const balance = await manager.findOne(stock_balance_entity_1.StockBalance, {
                where: { productId: dto.productId, locationId: dto.locationId },
                lock: { mode: 'pessimistic_write' },
            });
            const available = balance ? new decimal_js_1.default(balance.quantityAvailable).toNumber() : 0;
            if (dto.quantity > available) {
                throw new common_1.BadRequestException(`Insufficient stock. Available: ${available}, Requested: ${dto.quantity}`);
            }
            const movement = manager.create(stock_movement_entity_1.StockMovement, {
                productId: dto.productId,
                locationId: dto.locationId,
                type: stock_movement_entity_1.MovementType.RESERVED,
                quantity: dto.quantity,
                referenceType: dto.referenceType,
                referenceId: dto.referenceId,
                referenceNumber: dto.referenceNumber,
                createdById: userId,
            });
            await manager.save(stock_movement_entity_1.StockMovement, movement);
            await this.updateBalance(manager, dto.productId, dto.locationId, 0, dto.quantity);
            return movement;
        });
    }
    async releaseReservation(dto, userId) {
        return this.dataSource.transaction(async (manager) => {
            const balance = await manager.findOne(stock_balance_entity_1.StockBalance, {
                where: { productId: dto.productId, locationId: dto.locationId },
                lock: { mode: 'pessimistic_write' },
            });
            const reserved = balance ? new decimal_js_1.default(balance.quantityReserved).toNumber() : 0;
            if (dto.quantity > reserved) {
                throw new common_1.BadRequestException(`Cannot release more than reserved (${reserved})`);
            }
            const movement = manager.create(stock_movement_entity_1.StockMovement, {
                productId: dto.productId,
                locationId: dto.locationId,
                type: stock_movement_entity_1.MovementType.RESERVATION_RELEASED,
                quantity: dto.quantity,
                referenceType: dto.referenceType,
                referenceId: dto.referenceId,
                referenceNumber: dto.referenceNumber,
                createdById: userId,
            });
            await manager.save(stock_movement_entity_1.StockMovement, movement);
            await this.updateBalance(manager, dto.productId, dto.locationId, 0, -dto.quantity);
            return movement;
        });
    }
    async consumeStock(dto, userId) {
        return this.dataSource.transaction(async (manager) => {
            const balance = await manager.findOne(stock_balance_entity_1.StockBalance, {
                where: { productId: dto.productId, locationId: dto.locationId },
                lock: { mode: 'pessimistic_write' },
            });
            const onHand = balance ? new decimal_js_1.default(balance.quantityOnHand).toNumber() : 0;
            if (dto.quantity > onHand) {
                throw new common_1.BadRequestException(`Insufficient physical stock. On hand: ${onHand}`);
            }
            const reserved = balance ? new decimal_js_1.default(balance.quantityReserved).toNumber() : 0;
            const reservedDelta = Math.min(dto.quantity, reserved) * -1;
            const movement = manager.create(stock_movement_entity_1.StockMovement, {
                productId: dto.productId,
                locationId: dto.locationId,
                type: stock_movement_entity_1.MovementType.ISSUED,
                quantity: dto.quantity,
                unitCost: dto.unitCost,
                referenceType: dto.referenceType,
                referenceId: dto.referenceId,
                referenceNumber: dto.referenceNumber,
                createdById: userId,
            });
            await manager.save(stock_movement_entity_1.StockMovement, movement);
            await this.updateBalance(manager, dto.productId, dto.locationId, -dto.quantity, reservedDelta);
            return movement;
        });
    }
    async checkInvoiceStock(items) {
        const requested = new Map();
        for (const item of items)
            requested.set(item.productId, (requested.get(item.productId) || 0) + Number(item.quantity));
        if (requested.size === 0)
            return { location: null, items: [], canProceed: true };
        const products = await Promise.all([...requested.keys()].map((productId) => this.productRepo.findOne({ where: { id: productId } })));
        const needsStockLocation = products.some((product) => product?.isStockable);
        const location = needsStockLocation ? await this.getDefaultLocation() : null;
        const results = await Promise.all([...requested.entries()].map(async ([productId, quantity], index) => {
            const product = products[index];
            if (!product || !product.isStockable)
                return { productId, name: product?.name || 'Product', sku: product?.sku || '', quantity, stockable: false, onHand: null, willRemain: null, shortage: 0 };
            const balance = await this.balanceRepo.findOne({ where: { productId, locationId: location.id } });
            const onHand = Number(balance?.quantityOnHand || 0);
            const available = Number(balance?.quantityAvailable ?? onHand);
            return { productId, name: product.name, sku: product.sku || '', quantity, stockable: true, onHand, available, willRemain: onHand - quantity, availableAfter: available - quantity, shortage: Math.max(0, quantity - available) };
        }));
        return { location: location?.name || null, items: results, canProceed: results.every((item) => item.shortage === 0) };
    }
    async issueInvoiceStock(items, invoiceId, referenceNumber, userId) {
        return this.dataSource.transaction(async (manager) => {
            let location = await manager.findOne(stock_location_entity_1.StockLocation, { where: { isDefault: true } });
            if (!location)
                location = await manager.findOne(stock_location_entity_1.StockLocation, { where: {} });
            if (!location)
                throw new common_1.BadRequestException('No stock location configured');
            const requested = new Map();
            for (const item of items)
                requested.set(item.productId, (requested.get(item.productId) || 0) + Number(item.quantity));
            const movements = [];
            for (const [productId, quantity] of requested.entries()) {
                const product = await manager.findOne(product_entity_1.Product, { where: { id: productId }, lock: { mode: 'pessimistic_write' } });
                if (!product || !product.isStockable)
                    continue;
                const balance = await manager.findOne(stock_balance_entity_1.StockBalance, { where: { productId, locationId: location.id }, lock: { mode: 'pessimistic_write' } });
                const onHand = Number(balance?.quantityOnHand || 0);
                const available = Number(balance?.quantityAvailable ?? onHand);
                if (quantity > available)
                    throw new common_1.BadRequestException(`Insufficient stock for ${product.name}. Available: ${available}, requested: ${quantity}`);
                const movement = manager.create(stock_movement_entity_1.StockMovement, {
                    productId,
                    locationId: location.id,
                    type: stock_movement_entity_1.MovementType.ISSUED,
                    quantity,
                    referenceType: 'invoice',
                    referenceId: invoiceId,
                    referenceNumber,
                    notes: `Issued for invoice from quotation ${referenceNumber}`,
                    createdById: userId,
                });
                movements.push(await manager.save(stock_movement_entity_1.StockMovement, movement));
                await this.updateBalance(manager, productId, location.id, -quantity, 0);
            }
            return movements;
        });
    }
    async getMovements(query) {
        const { page = 1, limit = 50, productId, locationId } = query;
        const qb = this.movementRepo.createQueryBuilder('m')
            .leftJoinAndSelect('m.product', 'p')
            .leftJoinAndSelect('m.location', 'l')
            .leftJoinAndSelect('m.createdBy', 'u')
            .orderBy('m.createdAt', 'DESC');
        if (productId)
            qb.andWhere('m.productId = :productId', { productId });
        if (locationId)
            qb.andWhere('m.locationId = :locationId', { locationId });
        const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
        return (0, pagination_dto_1.paginate)(data, total, page, limit);
    }
    async getLowStockProducts() {
        return this.dataSource.query(`
      SELECT p.id, p.name, p.sku, p.model_number, p.reorder_level,
             COALESCE(SUM(sb.quantity_available), 0) as total_available
      FROM products p
      LEFT JOIN stock_balances sb ON sb.product_id = p.id
      WHERE p.is_active = true AND p.is_stockable = true AND p.deleted_at IS NULL
      GROUP BY p.id, p.name, p.sku, p.model_number, p.reorder_level
      HAVING COALESCE(SUM(sb.quantity_available), 0) <= p.reorder_level
      ORDER BY total_available ASC
    `);
    }
    async getLocations() {
        return this.locationRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
    }
    async updateBalance(manager, productId, locationId, quantityOnHandDelta, quantityReservedDelta) {
        let balance = await manager.findOne(stock_balance_entity_1.StockBalance, { where: { productId, locationId } });
        if (!balance) {
            balance = manager.create(stock_balance_entity_1.StockBalance, { productId, locationId, quantityOnHand: 0, quantityReserved: 0, quantityAvailable: 0 });
        }
        const onHand = new decimal_js_1.default(balance.quantityOnHand).plus(quantityOnHandDelta);
        const reserved = new decimal_js_1.default(balance.quantityReserved).plus(quantityReservedDelta);
        const available = onHand.minus(reserved);
        balance.quantityOnHand = onHand.toDecimalPlaces(3).toNumber();
        balance.quantityReserved = reserved.toDecimalPlaces(3).toNumber();
        balance.quantityAvailable = available.toDecimalPlaces(3).toNumber();
        await manager.save(stock_balance_entity_1.StockBalance, balance);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(stock_movement_entity_1.StockMovement)),
    __param(1, (0, typeorm_1.InjectRepository)(stock_balance_entity_1.StockBalance)),
    __param(2, (0, typeorm_1.InjectRepository)(stock_location_entity_1.StockLocation)),
    __param(3, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(4, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map