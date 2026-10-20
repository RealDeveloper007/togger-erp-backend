import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { Brand } from './entities/brand.entity';
import { Category } from './entities/category.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('products')
@ApiBearerAuth('access-token')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ─── Products ─────────────────────────────────────────────────────────────
  @Post()
  @RequirePermissions('products.create')
  @ApiOperation({ summary: 'Create product' })
  create(@Body() dto: Partial<Product>, @CurrentUser() user: User) { return this.productsService.create(dto, user.id); }

  @Get()
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'List products with search and filters' })
  findAll(@Query() query: PaginationDto & { categoryId?: string; brandId?: string; isActive?: boolean }) {
    return this.productsService.findAll(query);
  }

  @Get(':id/price-history')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Get product price history and stock levels at each change' })
  getPriceHistory(@Param('id') id: string) { return this.productsService.getPriceHistory(id); }

  @Get(':id')
  @RequirePermissions('products.view')
  findOne(@Param('id') id: string) { return this.productsService.findOne(id); }

  @Patch(':id')
  @RequirePermissions('products.update')
  update(@Param('id') id: string, @Body() dto: Partial<Product>, @CurrentUser() user: User) {
    return this.productsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermissions('products.delete')
  remove(@Param('id') id: string) { return this.productsService.remove(id); }

  // ─── Brands ───────────────────────────────────────────────────────────────
  @Get('brands/all')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'List all brands' })
  getBrands() { return this.productsService.findAllBrands(); }

  @Post('brands')
  @RequirePermissions('products.create')
  createBrand(@Body() dto: Partial<Brand>) { return this.productsService.createBrand(dto); }

  @Patch('brands/:id')
  @RequirePermissions('products.update')
  updateBrand(@Param('id') id: string, @Body() dto: Partial<Brand>) {
    return this.productsService.updateBrand(id, dto);
  }

  @Delete('brands/:id')
  @RequirePermissions('products.delete')
  removeBrand(@Param('id') id: string) { return this.productsService.removeBrand(id); }

  // ─── Categories ───────────────────────────────────────────────────────────
  @Get('categories/all')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'List all categories' })
  getCategories() { return this.productsService.findAllCategories(); }

  @Post('categories')
  @RequirePermissions('products.create')
  createCategory(@Body() dto: Partial<Category>) { return this.productsService.createCategory(dto); }

  @Patch('categories/:id')
  @RequirePermissions('products.update')
  updateCategory(@Param('id') id: string, @Body() dto: Partial<Category>) {
    return this.productsService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @RequirePermissions('products.delete')
  removeCategory(@Param('id') id: string) { return this.productsService.removeCategory(id); }
}
