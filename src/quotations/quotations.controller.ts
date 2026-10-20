import { Controller, Get, Post, Patch, Delete, Body, Param, Query, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuotationsService, CreateQuotationDto } from './quotations.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { QuotationStatus } from './entities/quotation.entity';

@ApiTags('quotations')
@ApiBearerAuth('access-token')
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @RequirePermissions('quotations.create')
  @ApiOperation({ summary: 'Create quotation' })
  create(@Body() dto: CreateQuotationDto, @CurrentUser() user: User) {
    return this.quotationsService.create(dto, user.id);
  }

  @Get()
  @RequirePermissions('quotations.view')
  @ApiOperation({ summary: 'List quotations' })
  findAll(@Query() query: PaginationDto & { status?: QuotationStatus; customerId?: string }) {
    return this.quotationsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('quotations.view')
  @ApiOperation({ summary: 'Get quotation detail' })
  findOne(@Param('id') id: string) { return this.quotationsService.findOne(id); }

  @Patch(':id/status')
  @RequirePermissions('quotations.update')
  @ApiOperation({ summary: 'Update quotation status' })
  updateStatus(@Param('id') id: string, @Body('status') status: QuotationStatus) {
    return this.quotationsService.updateStatus(id, status);
  }

  @Post(':id/duplicate')
  @RequirePermissions('quotations.create')
  @ApiOperation({ summary: 'Duplicate a quotation as new revision' })
  duplicate(@Param('id') id: string, @CurrentUser() user: User) {
    return this.quotationsService.duplicate(id, user.id);
  }

  @Patch(':id')
  @RequirePermissions('quotations.update')
  update(@Param('id') id: string, @Body() dto: CreateQuotationDto) {
    return this.quotationsService.updateDraft(id, dto);
  }

  @Get(':id/pdf')
  @RequirePermissions('quotations.view')
  async pdf(@Param('id') id: string) {
    const buffer = await this.quotationsService.generatePdf(id);
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="quotation-${id}.pdf"`,
    });
  }

  @Post(':id/email')
  @RequirePermissions('quotations.update')
  email(@Param('id') id: string, @Body('to') to?: string) {
    return this.quotationsService.emailPdf(id, to);
  }

  @Delete(':id')
  @RequirePermissions('quotations.delete')
  @ApiOperation({ summary: 'Delete draft quotation' })
  remove(@Param('id') id: string) { return this.quotationsService.remove(id); }
}
