import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService, CreateJobDto } from './jobs.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { JobStatus, JobMaterialUsage, JobLabourRecord } from './entities/job.entity';

@ApiTags('jobs')
@ApiBearerAuth('access-token')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @RequirePermissions('jobs.create')
  @ApiOperation({ summary: 'Create job manually' })
  create(@Body() dto: CreateJobDto, @CurrentUser() user: User) {
    return this.jobsService.create(dto, user.id);
  }

  @Post('from-quotation/:quotationId')
  @RequirePermissions('jobs.create')
  @ApiOperation({ summary: 'Convert accepted quotation to job' })
  createFromQuotation(
    @Param('quotationId') quotationId: string,
    @Body() dto: Partial<CreateJobDto>,
    @CurrentUser() user: User,
  ) {
    return this.jobsService.createFromQuotation(quotationId, dto, user.id);
  }

  @Get()
  @RequirePermissions('jobs.view')
  @ApiOperation({ summary: 'List jobs' })
  findAll(@Query() query: PaginationDto & { status?: JobStatus; engineerId?: string; customerId?: string }) {
    return this.jobsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('jobs.view')
  @ApiOperation({ summary: 'Get job detail' })
  findOne(@Param('id') id: string) { return this.jobsService.findOne(id); }

  @Patch(':id')
  @RequirePermissions('jobs.update')
  @ApiOperation({ summary: 'Update job' })
  update(@Param('id') id: string, @Body() dto: any) { return this.jobsService.update(id, dto); }

  @Post(':id/materials')
  @RequirePermissions('jobs.update')
  @ApiOperation({ summary: 'Record material usage for job' })
  addMaterial(@Param('id') id: string, @Body() dto: Partial<JobMaterialUsage>, @CurrentUser() user: User) {
    return this.jobsService.addMaterialUsage(id, dto, user.id);
  }

  @Post(':id/labour')
  @RequirePermissions('jobs.update')
  @ApiOperation({ summary: 'Record labour for job' })
  addLabour(@Param('id') id: string, @Body() dto: Partial<JobLabourRecord>) {
    return this.jobsService.addLabourRecord(id, dto);
  }
}
