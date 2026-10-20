import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { Brand } from './entities/brand.entity';
import { Category } from './entities/category.entity';
import { ProductPriceHistory } from './entities/product-price-history.entity';
import { StockBalance } from '../inventory/entities/stock-balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Brand, Category, ProductPriceHistory, StockBalance])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}
