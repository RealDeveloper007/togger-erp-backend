import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreatePurchaseOrderDto, PurchaseOrdersService } from './purchase-orders.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PurchaseOrderStatus } from './entities/purchase-order.entity';

@ApiTags('inventory')
@ApiBearerAuth('access-token')
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly poService: PurchaseOrdersService) {}

  @Post()
  @RequirePermissions('inventory.receive')
  create(@Body() dto: CreatePurchaseOrderDto, @CurrentUser() user: User) {
    return this.poService.create(dto, user.id);
  }

  @Get()
  @RequirePermissions('inventory.view')
  findAll(@Query() query: PaginationDto & { status?: PurchaseOrderStatus }) {
    return this.poService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('inventory.view')
  findOne(@Param('id') id: string) {
    return this.poService.findOne(id);
  }

  @Post(':id/receive')
  @RequirePermissions('inventory.receive')
  receive(
    @Param('id') id: string,
    @Body() body: { locationId: string; receipts: { lineId: string; quantity: number }[] },
    @CurrentUser() user: User,
  ) {
    return this.poService.receive(id, body.receipts, body.locationId, user.id);
  }
}
