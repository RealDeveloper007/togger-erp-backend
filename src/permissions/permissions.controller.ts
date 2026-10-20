import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('roles')
@ApiBearerAuth('access-token')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermissions('roles.view')
  @ApiOperation({ summary: 'List all permissions' })
  findAll(@Query('module') module?: string) {
    if (module) return this.permissionsService.findByModule(module);
    return this.permissionsService.findAll();
  }
}
