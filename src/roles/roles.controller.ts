import { Controller, Get, Post, Patch, Delete, Body, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto, AssignMenusDto } from './dto/role.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('roles')
@ApiBearerAuth('access-token')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermissions('roles.create')
  create(@Body() dto: CreateRoleDto) { return this.rolesService.create(dto); }

  @Get()
  @RequirePermissions('roles.view')
  findAll() { return this.rolesService.findAll(); }

  @Get(':id')
  @RequirePermissions('roles.view')
  findOne(@Param('id') id: string) { return this.rolesService.findOne(id); }

  @Patch(':id')
  @RequirePermissions('roles.update')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) { return this.rolesService.update(id, dto); }

  @Delete(':id')
  @RequirePermissions('roles.delete')
  remove(@Param('id') id: string) { return this.rolesService.remove(id); }

  @Put(':id/permissions')
  @RequirePermissions('roles.update')
  @ApiOperation({ summary: 'Assign permissions to role' })
  assignPermissions(@Param('id') id: string, @Body() dto: AssignPermissionsDto) {
    return this.rolesService.assignPermissions(id, dto);
  }

  @Put(':id/menus')
  @RequirePermissions('roles.update')
  @ApiOperation({ summary: 'Assign menus to role' })
  assignMenus(@Param('id') id: string, @Body() dto: AssignMenusDto) {
    return this.rolesService.assignMenus(id, dto);
  }
}
