import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService, CreateCustomerDto } from './customers.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CustomerAddress } from './entities/customer-address.entity';

@ApiTags('customers')
@ApiBearerAuth('access-token')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @RequirePermissions('customers.create')
  @ApiOperation({ summary: 'Create customer' })
  create(@Body() dto: CreateCustomerDto) { return this.customersService.create(dto); }

  @Get()
  @RequirePermissions('customers.view')
  @ApiOperation({ summary: 'List customers' })
  findAll(@Query() query: PaginationDto) { return this.customersService.findAll(query); }

  @Get(':id')
  @RequirePermissions('customers.view')
  findOne(@Param('id') id: string) { return this.customersService.findOne(id); }

  @Patch(':id')
  @RequirePermissions('customers.update')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCustomerDto>) {
    return this.customersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('customers.delete')
  remove(@Param('id') id: string) { return this.customersService.remove(id); }

  @Post(':id/addresses')
  @RequirePermissions('customers.update')
  @ApiOperation({ summary: 'Add address to customer' })
  addAddress(@Param('id') id: string, @Body() dto: Partial<CustomerAddress>) {
    return this.customersService.addAddress(id, dto);
  }

  @Patch('addresses/:addressId')
  @RequirePermissions('customers.update')
  updateAddress(@Param('addressId') addressId: string, @Body() dto: Partial<CustomerAddress>) {
    return this.customersService.updateAddress(addressId, dto);
  }

  @Delete('addresses/:addressId')
  @RequirePermissions('customers.update')
  removeAddress(@Param('addressId') addressId: string) {
    return this.customersService.removeAddress(addressId);
  }
}
