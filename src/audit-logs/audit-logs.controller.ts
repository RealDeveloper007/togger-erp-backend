import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('settings')
@ApiBearerAuth('access-token')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @RequirePermissions('settings.manage')
  findAll(@Query() query: any) { return this.auditLogsService.findAll(query); }
}
