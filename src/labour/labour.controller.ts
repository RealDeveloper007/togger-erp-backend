import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LabourService } from './labour.service';
import { LabourRate } from './entities/labour-rate.entity';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('quotations')
@ApiBearerAuth('access-token')
@Controller('labour-rates')
export class LabourController {
  constructor(private readonly labourService: LabourService) {}

  @Get()
  @RequirePermissions('quotations.view')
  findAll(@Query('activeOnly') activeOnly?: string) {
    return this.labourService.findAll(activeOnly === 'true');
  }

  @Post()
  @RequirePermissions('settings.manage')
  create(@Body() dto: Partial<LabourRate>) {
    return this.labourService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('settings.manage')
  update(@Param('id') id: string, @Body() dto: Partial<LabourRate>) {
    return this.labourService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('settings.manage')
  remove(@Param('id') id: string) {
    return this.labourService.remove(id);
  }
}
