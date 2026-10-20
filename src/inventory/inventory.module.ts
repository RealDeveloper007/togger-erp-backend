import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { StockMovement } from './entities/stock-movement.entity';
import { StockBalance } from './entities/stock-balance.entity';
import { StockLocation } from './entities/stock-location.entity';
import { Product } from '../products/entities/product.entity';
import { ProductPriceHistory } from '../products/entities/product-price-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockMovement, StockBalance, StockLocation, Product, ProductPriceHistory])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
