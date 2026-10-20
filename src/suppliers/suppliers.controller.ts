import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { Supplier } from './entities/supplier.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('suppliers')
@ApiBearerAuth('access-token')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @RequirePermissions('suppliers.create')
  create(@Body() dto: Partial<Supplier>) { return this.suppliersService.create(dto); }

  @Get()
  @RequirePermissions('suppliers.view')
  findAll(@Query() query: PaginationDto) { return this.suppliersService.findAll(query); }

  @Get(':id')
  @RequirePermissions('suppliers.view')
  findOne(@Param('id') id: string) { return this.suppliersService.findOne(id); }

  @Patch(':id')
  @RequirePermissions('suppliers.update')
  update(@Param('id') id: string, @Body() dto: Partial<Supplier>) { return this.suppliersService.update(id, dto); }

  @Delete(':id')
  @RequirePermissions('suppliers.delete')
  remove(@Param('id') id: string) { return this.suppliersService.remove(id); }
}
