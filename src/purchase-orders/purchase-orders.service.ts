import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import Decimal from 'decimal.js';
import { PurchaseOrder, PurchaseOrderLine, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { CompanySettings } from '../settings/entities/company-settings.entity';
import { InventoryService } from '../inventory/inventory.service';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';

export interface CreatePurchaseOrderDto {
  supplierId: string;
  orderDate: string;
  expectedDate?: string;
  notes?: string;
  lines: { productId: string; quantity: number; unitCost: number; vatRate?: number }[];
}

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private poRepo: Repository<PurchaseOrder>,
    @InjectRepository(CompanySettings)
    private settingsRepo: Repository<CompanySettings>,
    @InjectDataSource()
    private dataSource: DataSource,
    private inventoryService: InventoryService,
  ) {}

  private async getNextNumber(): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      const settings = await manager.findOne(CompanySettings, { where: {} });
      const num = settings?.poNextNumber || 1001;
      const prefix = settings?.poPrefix || 'PO-';
      if (settings) await manager.update(CompanySettings, settings.id, { poNextNumber: num + 1 });
      return `${prefix}${num}`;
    });
  }

  async create(dto: CreatePurchaseOrderDto, userId: string) {
    const poNumber = await this.getNextNumber();
    let subtotal = new Decimal(0);
    let vatAmount = new Decimal(0);
    const lines = dto.lines.map((l) => {
      const qty = new Decimal(l.quantity);
      const cost = new Decimal(l.unitCost);
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
      lines: lines as any,
    });
    return this.poRepo.save(po);
  }

  async findAll(query: PaginationDto & { status?: PurchaseOrderStatus }) {
    const { page = 1, limit = 20, search, status } = query;
    const qb = this.poRepo.createQueryBuilder('po')
      .leftJoinAndSelect('po.supplier', 's')
      .orderBy('po.createdAt', 'DESC');
    if (search) qb.where('po.poNumber ILIKE :s OR s.name ILIKE :s', { s: `%${search}%` });
    if (status) qb.andWhere('po.status = :status', { status });
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return paginate(data, total, page, limit);
  }

  async findOne(id: string) {
    const po = await this.poRepo.findOne({
      where: { id },
      relations: ['supplier', 'lines', 'lines.product', 'createdBy'],
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }

  async receive(id: string, receipts: { lineId: string; quantity: number }[], locationId: string, userId: string) {
    const po = await this.findOne(id);
    if (po.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot receive a cancelled purchase order');
    }
    for (const receipt of receipts) {
      const line = po.lines.find((l) => l.id === receipt.lineId);
      if (!line) throw new NotFoundException('PO line not found');
      const remaining = new Decimal(line.quantity).minus(line.receivedQuantity || 0);
      if (new Decimal(receipt.quantity).gt(remaining)) {
        throw new BadRequestException('Received quantity exceeds ordered quantity');
      }
      await this.inventoryService.receiveStock({
        productId: line.productId,
        locationId,
        quantity: receipt.quantity,
        unitCost: Number(line.unitCost),
        referenceNumber: po.poNumber,
        notes: `PO receipt ${po.poNumber}`,
      }, userId);
      line.receivedQuantity = new Decimal(line.receivedQuantity || 0).plus(receipt.quantity).toNumber();
      await this.dataSource.getRepository(PurchaseOrderLine).save(line);
    }
    const refreshed = await this.findOne(id);
    const fullyReceived = refreshed.lines.every((l) => new Decimal(l.receivedQuantity).gte(l.quantity));
    const anyReceived = refreshed.lines.some((l) => new Decimal(l.receivedQuantity).gt(0));
    refreshed.status = fullyReceived
      ? PurchaseOrderStatus.RECEIVED
      : anyReceived
        ? PurchaseOrderStatus.PARTIALLY_RECEIVED
        : refreshed.status;
    return this.poRepo.save(refreshed);
  }
}
