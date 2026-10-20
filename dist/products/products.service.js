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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const brand_entity_1 = require("./entities/brand.entity");
const category_entity_1 = require("./entities/category.entity");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const product_price_history_entity_1 = require("./entities/product-price-history.entity");
const stock_balance_entity_1 = require("../inventory/entities/stock-balance.entity");
let ProductsService = class ProductsService {
    constructor(productRepo, brandRepo, categoryRepo, priceHistoryRepo, stockBalanceRepo, dataSource) {
        this.productRepo = productRepo;
        this.brandRepo = brandRepo;
        this.categoryRepo = categoryRepo;
        this.priceHistoryRepo = priceHistoryRepo;
        this.stockBalanceRepo = stockBalanceRepo;
        this.dataSource = dataSource;
    }
    async create(dto, changedById) {
        const productData = { ...dto, sku: dto.sku?.trim() || null, modelNumber: dto.modelNumber?.trim() };
        await this.assertMaterialCombinationAvailable(productData);
        return this.dataSource.transaction(async (manager) => {
            const product = await manager.save(product_entity_1.Product, manager.create(product_entity_1.Product, productData));
            await manager.save(product_price_history_entity_1.ProductPriceHistory, manager.create(product_price_history_entity_1.ProductPriceHistory, {
                productId: product.id,
                previousPrice: null,
                newPrice: Number(product.purchasePrice ?? 0),
                quantityOnHand: 0,
                source: 'product_created',
                changedById: changedById ?? null,
            }));
            return product;
        });
    }
    async findAll(query) {
        const { page = 1, limit = 20, search, categoryId, brandId, isActive, sortBy, sortOrder } = query;
        const qb = this.productRepo.createQueryBuilder('p')
            .leftJoinAndSelect('p.brand', 'brand')
            .leftJoinAndSelect('p.category', 'category')
            .leftJoinAndSelect('p.supplier', 'supplier')
            .leftJoinAndSelect('p.vatRate', 'vatRate');
        if (search) {
            qb.where('p.name ILIKE :s OR p.sku ILIKE :s OR p.modelNumber ILIKE :s OR p.manufacturer ILIKE :s', { s: `%${search}%` });
        }
        if (categoryId)
            qb.andWhere('p.categoryId = :categoryId', { categoryId });
        if (brandId)
            qb.andWhere('p.brandId = :brandId', { brandId });
        if (isActive !== undefined)
            qb.andWhere('p.isActive = :isActive', { isActive });
        const orderField = sortBy ? `p.${sortBy}` : 'p.name';
        qb.orderBy(orderField, sortOrder || 'ASC');
        const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
        return (0, pagination_dto_1.paginate)(data, total, page, limit);
    }
    async findOne(id) {
        const p = await this.productRepo.findOne({
            where: { id },
            relations: ['brand', 'category', 'supplier', 'vatRate'],
        });
        if (!p)
            throw new common_1.NotFoundException('Product not found');
        return p;
    }
    async findBySku(sku) {
        return this.productRepo.findOne({ where: { sku }, relations: ['brand', 'category', 'vatRate'] });
    }
    async update(id, dto, changedById) {
        const current = await this.findOne(id);
        const productData = {
            ...dto,
            sku: dto.sku === undefined ? current.sku : dto.sku?.trim() || null,
            modelNumber: dto.modelNumber === undefined ? current.modelNumber : dto.modelNumber?.trim(),
            manufacturer: dto.manufacturer === undefined ? current.manufacturer : dto.manufacturer,
            brandId: dto.brandId === undefined ? current.brandId : dto.brandId,
        };
        await this.assertMaterialCombinationAvailable(productData, id);
        await this.dataSource.transaction(async (manager) => {
            const previousPrice = Number(current.purchasePrice ?? 0);
            const updatedProduct = manager.merge(product_entity_1.Product, current, productData);
            const saved = await manager.save(product_entity_1.Product, updatedProduct);
            const newPrice = Number(saved.purchasePrice ?? 0);
            if (newPrice !== previousPrice) {
                const balance = await manager.getRepository(stock_balance_entity_1.StockBalance)
                    .createQueryBuilder('balance')
                    .select('COALESCE(SUM(balance.quantityOnHand), 0)', 'quantity')
                    .where('balance.productId = :productId', { productId: id })
                    .getRawOne();
                await manager.save(product_price_history_entity_1.ProductPriceHistory, manager.create(product_price_history_entity_1.ProductPriceHistory, {
                    productId: id,
                    previousPrice,
                    newPrice,
                    quantityOnHand: Number(balance?.quantity ?? 0),
                    source: 'product_edit',
                    changedById: changedById ?? null,
                }));
            }
        });
        return this.findOne(id);
    }
    async getPriceHistory(id) {
        await this.findOne(id);
        return this.priceHistoryRepo.find({ where: { productId: id }, order: { createdAt: 'DESC' } });
    }
    async assertMaterialCombinationAvailable(material, excludeId) {
        const selectedBrand = material.brandId
            ? await this.brandRepo.findOne({ where: { id: material.brandId } })
            : null;
        const manufacturer = (material.manufacturer?.trim() || selectedBrand?.name || '').toLocaleLowerCase();
        const modelNumber = (material.modelNumber ?? '').trim().toLocaleLowerCase();
        const sku = material.sku?.trim().toLocaleLowerCase() || null;
        const query = this.productRepo.createQueryBuilder('product')
            .leftJoin('product.brand', 'brand')
            .where(`LOWER(BTRIM(COALESCE(NULLIF(BTRIM(product.manufacturer), ''), brand.name, ''))) = :manufacturer`, { manufacturer })
            .andWhere(`LOWER(BTRIM(COALESCE(product.modelNumber, ''))) = :modelNumber`, { modelNumber });
        if (sku) {
            query.andWhere('LOWER(BTRIM(product.sku)) = :sku', { sku });
        }
        else {
            query.andWhere(`(product.sku IS NULL OR BTRIM(product.sku) = '')`);
        }
        if (excludeId)
            query.andWhere('product.id <> :excludeId', { excludeId });
        if (await query.getExists()) {
            throw new common_1.ConflictException('A material with this manufacturer, model, and product code already exists.');
        }
    }
    async remove(id) {
        await this.findOne(id);
        await this.productRepo.softDelete(id);
    }
    async findAllBrands() {
        return this.brandRepo.find({ order: { name: 'ASC' } });
    }
    async createBrand(dto) {
        return this.brandRepo.save(this.brandRepo.create(dto));
    }
    async updateBrand(id, dto) {
        await this.brandRepo.update(id, dto);
        const brand = await this.brandRepo.findOne({ where: { id } });
        if (!brand)
            throw new common_1.NotFoundException('Brand not found');
        return brand;
    }
    async removeBrand(id) {
        const brand = await this.brandRepo.findOne({ where: { id } });
        if (!brand)
            throw new common_1.NotFoundException('Manufacturer not found');
        const materialCount = await this.productRepo.count({ where: { brandId: id } });
        if (materialCount > 0) {
            throw new common_1.ConflictException(`Cannot delete manufacturer “${brand.name}”: it is used by ${materialCount} material${materialCount === 1 ? '' : 's'}. Deactivate it instead, or change the manufacturer on those materials first.`);
        }
        await this.brandRepo.softDelete(id);
    }
    async findAllCategories() {
        return this.categoryRepo.find({
            relations: ['parent', 'children'],
            order: { sortOrder: 'ASC', name: 'ASC' },
        });
    }
    async createCategory(dto) {
        return this.categoryRepo.save(this.categoryRepo.create(dto));
    }
    async updateCategory(id, dto) {
        await this.categoryRepo.update(id, dto);
        const category = await this.categoryRepo.findOne({ where: { id }, relations: ['parent'] });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        return category;
    }
    async removeCategory(id) {
        const category = await this.categoryRepo.findOne({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException('Product type not found');
        const [materialCount, childCount] = await Promise.all([
            this.productRepo.count({ where: { categoryId: id } }),
            this.categoryRepo.count({ where: { parentId: id } }),
        ]);
        if (materialCount > 0 || childCount > 0) {
            const usage = [
                materialCount > 0 ? `${materialCount} material${materialCount === 1 ? '' : 's'}` : '',
                childCount > 0 ? `${childCount} nested product type${childCount === 1 ? '' : 's'}` : '',
            ].filter(Boolean).join(' and ');
            throw new common_1.ConflictException(`Cannot delete product type “${category.name}”: it is used by ${usage}. Deactivate it instead, or reassign the linked records first.`);
        }
        await this.categoryRepo.softDelete(id);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(brand_entity_1.Brand)),
    __param(2, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(3, (0, typeorm_1.InjectRepository)(product_price_history_entity_1.ProductPriceHistory)),
    __param(4, (0, typeorm_1.InjectRepository)(stock_balance_entity_1.StockBalance)),
    __param(5, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ProductsService);
//# sourceMappingURL=products.service.js.map