import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService, ReceiveStockDto, AdjustStockDto, ReserveStockDto } from './inventory.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('inventory')
@ApiBearerAuth('access-token')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('balances')
  @RequirePermissions('inventory.view')
  @ApiOperation({ summary: 'Get all stock balances' })
  getBalances(@Query() query: PaginationDto) {
    return this.inventoryService.getAllBalances(query);
  }

  @Get('movements')
  @RequirePermissions('inventory.view')
  @ApiOperation({ summary: 'Get stock movements log' })
  getMovements(@Query() query: PaginationDto & { productId?: string; locationId?: string }) {
    return this.inventoryService.getMovements(query);
  }

  @Get('low-stock')
  @RequirePermissions('inventory.view')
  @ApiOperation({ summary: 'Get low stock products' })
  getLowStock() {
    return this.inventoryService.getLowStockProducts();
  }

  @Get('locations')
  @RequirePermissions('inventory.view')
  @ApiOperation({ summary: 'Get stock locations' })
  getLocations() {
    return this.inventoryService.getLocations();
  }

  @Post('receive')
  @RequirePermissions('inventory.receive')
  @ApiOperation({ summary: 'Receive stock' })
  receiveStock(@Body() dto: ReceiveStockDto, @CurrentUser() user: User) {
    return this.inventoryService.receiveStock(dto, user.id);
  }

  @Post('adjust')
  @RequirePermissions('inventory.adjust')
  @ApiOperation({ summary: 'Adjust stock quantity' })
  adjustStock(@Body() dto: AdjustStockDto, @CurrentUser() user: User) {
    return this.inventoryService.adjustStock(dto, user.id);
  }

  @Post('reserve')
  @RequirePermissions('inventory.adjust')
  @ApiOperation({ summary: 'Reserve stock for a job/quotation' })
  reserveStock(@Body() dto: ReserveStockDto, @CurrentUser() user: User) {
    return this.inventoryService.reserveStock(dto, user.id);
  }

  @Post('release')
  @RequirePermissions('inventory.adjust')
  releaseReservation(@Body() dto: ReserveStockDto, @CurrentUser() user: User) {
    return this.inventoryService.releaseReservation(dto, user.id);
  }

  @Post('consume')
  @RequirePermissions('inventory.adjust')
  consumeStock(@Body() dto: ReserveStockDto, @CurrentUser() user: User) {
    return this.inventoryService.consumeStock(dto, user.id);
  }
}
