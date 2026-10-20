import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('reports')
@ApiBearerAuth('access-token')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard metrics' })
  getDashboard() { return this.reportsService.getDashboardMetrics(); }

  @Get('job-profitability')
  @RequirePermissions('reports.view')
  @ApiOperation({ summary: 'Job profitability report' })
  getJobProfitability(@Query('startDate') s?: string, @Query('endDate') e?: string) {
    return this.reportsService.getJobProfitabilityReport(s, e);
  }

  @Get('stock-valuation')
  @RequirePermissions('reports.view')
  @ApiOperation({ summary: 'Stock valuation report' })
  getStockValuation() { return this.reportsService.getStockValuationReport(); }

  @Get('revenue')
  @RequirePermissions('reports.view')
  @ApiOperation({ summary: 'Revenue report' })
  getRevenue(@Query('startDate') s?: string, @Query('endDate') e?: string) {
    return this.reportsService.getRevenueReport(s, e);
  }
}
