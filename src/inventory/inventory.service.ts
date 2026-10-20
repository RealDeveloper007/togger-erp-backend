import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IsNumber, IsOptional, IsString, IsUUID, Min, NotEquals } from 'class-validator';
import Decimal from 'decimal.js';
import { StockMovement, MovementType } from './entities/stock-movement.entity';
import { StockBalance } from './entities/stock-balance.entity';
import { StockLocation } from './entities/stock-location.entity';
import { Product } from '../products/entities/product.entity';
import { ProductPriceHistory } from '../products/entities/product-price-history.entity';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';

export class ReceiveStockDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  locationId: string;

  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AdjustStockDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  locationId: string;

  @IsNumber()
  @NotEquals(0)
  quantity: number; // positive = adjustment_in, negative = adjustment_out

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReserveStockDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  locationId: string;

  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsString()
  referenceType: string;

  @IsUUID()
  referenceId: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(StockMovement)
    private movementRepo: Repository<StockMovement>,
    @InjectRepository(StockBalance)
    private balanceRepo: Repository<StockBalance>,
    @InjectRepository(StockLocation)
    private locationRepo: Repository<StockLocation>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async getDefaultLocation(): Promise<StockLocation> {
    let loc = await this.locationRepo.findOne({ where: { isDefault: true } });
    if (!loc) loc = await this.locationRepo.findOne({ where: {} });
    if (!loc) throw new BadRequestException('No stock location configured');
    return loc;
  }

  async getStockBalance(productId: string, locationId: string): Promise<StockBalance | null> {
    return this.balanceRepo.findOne({ where: { productId, locationId }, relations: ['product', 'location'] });
  }

  async getAllBalances(query: PaginationDto) {
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
    return paginate(data, total, page, limit);
  }

  async receiveStock(dto: ReceiveStockDto, userId: string): Promise<StockMovement> {
    return this.dataSource.transaction(async (manager) => {
      if (dto.quantity <= 0) throw new BadRequestException('Quantity must be positive');
      const product = await manager.findOne(Product, {
        where: { id: dto.productId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!product) throw new NotFoundException('Product not found');
      const location = await manager.findOne(StockLocation, { where: { id: dto.locationId } });
      if (!location) throw new NotFoundException('Location not found');

      const movement = manager.create(StockMovement, {
        productId: dto.productId,
        locationId: dto.locationId,
        type: MovementType.RECEIVED,
        quantity: dto.quantity,
        unitCost: dto.unitCost,
        referenceNumber: dto.referenceNumber,
        notes: dto.notes,
        createdById: userId,
      });
      await manager.save(StockMovement, movement);

      // Treat products.purchasePrice as the current weighted average unit cost.
      // Recalculate it from all locations when stock is received at a known cost.
      if (dto.unitCost !== undefined) {
        const currentStock = await manager
          .createQueryBuilder(StockBalance, 'balance')
          .select('COALESCE(SUM(balance.quantityOnHand), 0)', 'quantity')
          .where('balance.productId = :productId', { productId: dto.productId })
          .getRawOne();
        const previousQuantity = new Decimal(currentStock?.quantity ?? 0);
        const receivedQuantity = new Decimal(dto.quantity);
        const previousCost = new Decimal(product.purchasePrice ?? 0);
        const weightedAverage = previousQuantity.plus(receivedQuantity).isZero()
          ? new Decimal(dto.unitCost)
          : previousQuantity.times(previousCost)
              .plus(receivedQuantity.times(dto.unitCost))
              .dividedBy(previousQuantity.plus(receivedQuantity));
        product.purchasePrice = weightedAverage.toDecimalPlaces(2).toNumber();
        if (product.purchasePrice !== previousCost.toNumber()) {
          await manager.save(ProductPriceHistory, manager.create(ProductPriceHistory, {
            productId: product.id,
            previousPrice: previousCost.toNumber(),
            newPrice: product.purchasePrice,
            quantityOnHand: previousQuantity.plus(receivedQuantity).toDecimalPlaces(3).toNumber(),
            source: 'stock_receipt',
            changedById: userId,
          }));
        }
        await manager.save(Product, product);
      }

      await this.updateBalance(manager, dto.productId, dto.locationId, dto.quantity, 0);
      return movement;
    });
  }

  async adjustStock(dto: AdjustStockDto, userId: string): Promise<StockMovement> {
    return this.dataSource.transaction(async (manager) => {
      const type = dto.quantity > 0 ? MovementType.ADJUSTMENT_IN : MovementType.ADJUSTMENT_OUT;
      const absQty = Math.abs(dto.quantity);

      if (dto.quantity < 0) {
        const balance = await manager.findOne(StockBalance, {
          where: { productId: dto.productId, locationId: dto.locationId }
        });
        const available = balance ? new Decimal(balance.quantityAvailable).toNumber() : 0;
        if (absQty > available) throw new BadRequestException('Insufficient available stock for adjustment');
      }

      const movement = manager.create(StockMovement, {
        productId: dto.productId,
        locationId: dto.locationId,
        type,
        quantity: absQty,
        notes: `${dto.reason}: ${dto.notes || ''}`.trim(),
        createdById: userId,
      });
      await manager.save(StockMovement, movement);
      await this.updateBalance(manager, dto.productId, dto.locationId, dto.quantity, 0);
      return movement;
    });
  }

  async reserveStock(dto: ReserveStockDto, userId: string): Promise<StockMovement> {
    return this.dataSource.transaction(async (manager) => {
      // Lock the balance row to prevent race conditions
      const balance = await manager.findOne(StockBalance, {
        where: { productId: dto.productId, locationId: dto.locationId },
        lock: { mode: 'pessimistic_write' },
      });
      const available = balance ? new Decimal(balance.quantityAvailable).toNumber() : 0;
      if (dto.quantity > available) {
        throw new BadRequestException(`Insufficient stock. Available: ${available}, Requested: ${dto.quantity}`);
      }

      const movement = manager.create(StockMovement, {
        productId: dto.productId,
        locationId: dto.locationId,
        type: MovementType.RESERVED,
        quantity: dto.quantity,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
        referenceNumber: dto.referenceNumber,
        createdById: userId,
      });
      await manager.save(StockMovement, movement);
      // Reserve reduces available, increases reserved (on_hand unchanged)
      await this.updateBalance(manager, dto.productId, dto.locationId, 0, dto.quantity);
      return movement;
    });
  }

  async releaseReservation(dto: ReserveStockDto, userId: string): Promise<StockMovement> {
    return this.dataSource.transaction(async (manager) => {
      const balance = await manager.findOne(StockBalance, {
        where: { productId: dto.productId, locationId: dto.locationId },
        lock: { mode: 'pessimistic_write' },
      });
      const reserved = balance ? new Decimal(balance.quantityReserved).toNumber() : 0;
      if (dto.quantity > reserved) {
        throw new BadRequestException(`Cannot release more than reserved (${reserved})`);
      }
      const movement = manager.create(StockMovement, {
        productId: dto.productId,
        locationId: dto.locationId,
        type: MovementType.RESERVATION_RELEASED,
        quantity: dto.quantity,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
        referenceNumber: dto.referenceNumber,
        createdById: userId,
      });
      await manager.save(StockMovement, movement);
      await this.updateBalance(manager, dto.productId, dto.locationId, 0, -dto.quantity);
      return movement;
    });
  }

  async consumeStock(dto: ReserveStockDto & { unitCost?: number }, userId: string): Promise<StockMovement> {
    return this.dataSource.transaction(async (manager) => {
      const balance = await manager.findOne(StockBalance, {
        where: { productId: dto.productId, locationId: dto.locationId },
        lock: { mode: 'pessimistic_write' },
      });
      const onHand = balance ? new Decimal(balance.quantityOnHand).toNumber() : 0;
      if (dto.quantity > onHand) {
        throw new BadRequestException(`Insufficient physical stock. On hand: ${onHand}`);
      }
      const reserved = balance ? new Decimal(balance.quantityReserved).toNumber() : 0;
      const reservedDelta = Math.min(dto.quantity, reserved) * -1;
      const movement = manager.create(StockMovement, {
        productId: dto.productId,
        locationId: dto.locationId,
        type: MovementType.ISSUED,
        quantity: dto.quantity,
        unitCost: dto.unitCost,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
        referenceNumber: dto.referenceNumber,
        createdById: userId,
      });
      await manager.save(StockMovement, movement);
      await this.updateBalance(manager, dto.productId, dto.locationId, -dto.quantity, reservedDelta);
      return movement;
    });
  }

  async checkInvoiceStock(items: { productId: string; quantity: number }[]) {
    const requested = new Map<string, number>();
    for (const item of items) requested.set(item.productId, (requested.get(item.productId) || 0) + Number(item.quantity));
    if (requested.size === 0) return { location: null, items: [], canProceed: true };
    const products = await Promise.all([...requested.keys()].map((productId) => this.productRepo.findOne({ where: { id: productId } })));
    const needsStockLocation = products.some((product) => product?.isStockable);
    const location = needsStockLocation ? await this.getDefaultLocation() : null;
    const results = await Promise.all([...requested.entries()].map(async ([productId, quantity], index) => {
      const product = products[index];
      if (!product || !product.isStockable) return { productId, name: product?.name || 'Product', sku: product?.sku || '', quantity, stockable: false, onHand: null, willRemain: null, shortage: 0 };
      const balance = await this.balanceRepo.findOne({ where: { productId, locationId: location!.id } });
      const onHand = Number(balance?.quantityOnHand || 0);
      const available = Number(balance?.quantityAvailable ?? onHand);
      return { productId, name: product.name, sku: product.sku || '', quantity, stockable: true, onHand, available, willRemain: onHand - quantity, availableAfter: available - quantity, shortage: Math.max(0, quantity - available) };
    }));
    return { location: location?.name || null, items: results, canProceed: results.every((item) => item.shortage === 0) };
  }

  async issueInvoiceStock(items: { productId: string; quantity: number }[], invoiceId: string, referenceNumber: string, userId: string): Promise<StockMovement[]> {
    return this.dataSource.transaction(async (manager) => {
      let location = await manager.findOne(StockLocation, { where: { isDefault: true } });
      if (!location) location = await manager.findOne(StockLocation, { where: {} });
      if (!location) throw new BadRequestException('No stock location configured');
      const requested = new Map<string, number>();
      for (const item of items) requested.set(item.productId, (requested.get(item.productId) || 0) + Number(item.quantity));

      const movements: StockMovement[] = [];
      for (const [productId, quantity] of requested.entries()) {
        const product = await manager.findOne(Product, { where: { id: productId }, lock: { mode: 'pessimistic_write' } });
        if (!product || !product.isStockable) continue;
        const balance = await manager.findOne(StockBalance, { where: { productId, locationId: location.id }, lock: { mode: 'pessimistic_write' } });
        const onHand = Number(balance?.quantityOnHand || 0);
        const available = Number(balance?.quantityAvailable ?? onHand);
        if (quantity > available) throw new BadRequestException(`Insufficient stock for ${product.name}. Available: ${available}, requested: ${quantity}`);
        const movement = manager.create(StockMovement, {
          productId,
          locationId: location.id,
          type: MovementType.ISSUED,
          quantity,
          referenceType: 'invoice',
          referenceId: invoiceId,
          referenceNumber,
          notes: `Issued for invoice from quotation ${referenceNumber}`,
          createdById: userId,
        });
        movements.push(await manager.save(StockMovement, movement));
        await this.updateBalance(manager, productId, location.id, -quantity, 0);
      }
      return movements;
    });
  }

  async getMovements(query: PaginationDto & { productId?: string; locationId?: string }) {
    const { page = 1, limit = 50, productId, locationId } = query;
    const qb = this.movementRepo.createQueryBuilder('m')
      .leftJoinAndSelect('m.product', 'p')
      .leftJoinAndSelect('m.location', 'l')
      .leftJoinAndSelect('m.createdBy', 'u')
      .orderBy('m.createdAt', 'DESC');
    if (productId) qb.andWhere('m.productId = :productId', { productId });
    if (locationId) qb.andWhere('m.locationId = :locationId', { locationId });
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return paginate(data, total, page, limit);
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

  async getLocations(): Promise<StockLocation[]> {
    return this.locationRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  private async updateBalance(
    manager: any,
    productId: string,
    locationId: string,
    quantityOnHandDelta: number,
    quantityReservedDelta: number,
  ) {
    let balance = await manager.findOne(StockBalance, { where: { productId, locationId } });
    if (!balance) {
      balance = manager.create(StockBalance, { productId, locationId, quantityOnHand: 0, quantityReserved: 0, quantityAvailable: 0 });
    }
    const onHand = new Decimal(balance.quantityOnHand).plus(quantityOnHandDelta);
    const reserved = new Decimal(balance.quantityReserved).plus(quantityReservedDelta);
    const available = onHand.minus(reserved);
    balance.quantityOnHand = onHand.toDecimalPlaces(3).toNumber();
    balance.quantityReserved = reserved.toDecimalPlaces(3).toNumber();
    balance.quantityAvailable = available.toDecimalPlaces(3).toNumber();
    await manager.save(StockBalance, balance);
  }
}
