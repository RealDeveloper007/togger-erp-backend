import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Brand } from './entities/brand.entity';
import { Category } from './entities/category.entity';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { ProductPriceHistory } from './entities/product-price-history.entity';
import { StockBalance } from '../inventory/entities/stock-balance.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Brand)
    private brandRepo: Repository<Brand>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(ProductPriceHistory)
    private priceHistoryRepo: Repository<ProductPriceHistory>,
    @InjectRepository(StockBalance)
    private stockBalanceRepo: Repository<StockBalance>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(dto: Partial<Product>, changedById?: string): Promise<Product> {
    const productData = { ...dto, sku: dto.sku?.trim() || null, modelNumber: dto.modelNumber?.trim() };
    await this.assertMaterialCombinationAvailable(productData);
    return this.dataSource.transaction(async (manager) => {
      const product = await manager.save(Product, manager.create(Product, productData));
      await manager.save(ProductPriceHistory, manager.create(ProductPriceHistory, {
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

  async findAll(query: PaginationDto & { categoryId?: string; brandId?: string; isActive?: boolean }) {
    const { page = 1, limit = 20, search, categoryId, brandId, isActive, sortBy, sortOrder } = query;
    const qb = this.productRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.brand', 'brand')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.supplier', 'supplier')
      .leftJoinAndSelect('p.vatRate', 'vatRate');

    if (search) {
      qb.where(
        'p.name ILIKE :s OR p.sku ILIKE :s OR p.modelNumber ILIKE :s OR p.manufacturer ILIKE :s',
        { s: `%${search}%` },
      );
    }
    if (categoryId) qb.andWhere('p.categoryId = :categoryId', { categoryId });
    if (brandId) qb.andWhere('p.brandId = :brandId', { brandId });
    if (isActive !== undefined) qb.andWhere('p.isActive = :isActive', { isActive });

    const orderField = sortBy ? `p.${sortBy}` : 'p.name';
    qb.orderBy(orderField, sortOrder || 'ASC');

    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return paginate(data, total, page, limit);
  }

  async findOne(id: string): Promise<Product> {
    const p = await this.productRepo.findOne({
      where: { id },
      relations: ['brand', 'category', 'supplier', 'vatRate'],
    });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.productRepo.findOne({ where: { sku }, relations: ['brand', 'category', 'vatRate'] });
  }

  async update(id: string, dto: Partial<Product>, changedById?: string): Promise<Product> {
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
      const updatedProduct = manager.merge(Product, current, productData);
      const saved = await manager.save(Product, updatedProduct);
      const newPrice = Number(saved.purchasePrice ?? 0);

      if (newPrice !== previousPrice) {
        const balance = await manager.getRepository(StockBalance)
          .createQueryBuilder('balance')
          .select('COALESCE(SUM(balance.quantityOnHand), 0)', 'quantity')
          .where('balance.productId = :productId', { productId: id })
          .getRawOne();
        await manager.save(ProductPriceHistory, manager.create(ProductPriceHistory, {
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

  async getPriceHistory(id: string): Promise<ProductPriceHistory[]> {
    await this.findOne(id);
    return this.priceHistoryRepo.find({ where: { productId: id }, order: { createdAt: 'DESC' } });
  }

  private async assertMaterialCombinationAvailable(
    material: Partial<Product>,
    excludeId?: string,
  ): Promise<void> {
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
    } else {
      query.andWhere(`(product.sku IS NULL OR BTRIM(product.sku) = '')`);
    }
    if (excludeId) query.andWhere('product.id <> :excludeId', { excludeId });

    if (await query.getExists()) {
      throw new ConflictException('A material with this manufacturer, model, and product code already exists.');
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.productRepo.softDelete(id);
  }

  async findAllBrands() {
    return this.brandRepo.find({ order: { name: 'ASC' } });
  }

  async createBrand(dto: Partial<Brand>): Promise<Brand> {
    return this.brandRepo.save(this.brandRepo.create(dto));
  }

  async updateBrand(id: string, dto: Partial<Brand>): Promise<Brand> {
    await this.brandRepo.update(id, dto);
    const brand = await this.brandRepo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async removeBrand(id: string): Promise<void> {
    const brand = await this.brandRepo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('Manufacturer not found');
    const materialCount = await this.productRepo.count({ where: { brandId: id } });
    if (materialCount > 0) {
      throw new ConflictException(`Cannot delete manufacturer “${brand.name}”: it is used by ${materialCount} material${materialCount === 1 ? '' : 's'}. Deactivate it instead, or change the manufacturer on those materials first.`);
    }
    await this.brandRepo.softDelete(id);
  }

  async findAllCategories() {
    return this.categoryRepo.find({
      relations: ['parent', 'children'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async createCategory(dto: Partial<Category>): Promise<Category> {
    return this.categoryRepo.save(this.categoryRepo.create(dto));
  }

  async updateCategory(id: string, dto: Partial<Category>): Promise<Category> {
    await this.categoryRepo.update(id, dto);
    const category = await this.categoryRepo.findOne({ where: { id }, relations: ['parent'] });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Product type not found');
    const [materialCount, childCount] = await Promise.all([
      this.productRepo.count({ where: { categoryId: id } }),
      this.categoryRepo.count({ where: { parentId: id } }),
    ]);
    if (materialCount > 0 || childCount > 0) {
      const usage = [
        materialCount > 0 ? `${materialCount} material${materialCount === 1 ? '' : 's'}` : '',
        childCount > 0 ? `${childCount} nested product type${childCount === 1 ? '' : 's'}` : '',
      ].filter(Boolean).join(' and ');
      throw new ConflictException(`Cannot delete product type “${category.name}”: it is used by ${usage}. Deactivate it instead, or reassign the linked records first.`);
    }
    await this.categoryRepo.softDelete(id);
  }
}
