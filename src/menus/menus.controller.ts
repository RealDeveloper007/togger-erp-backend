import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('menus')
@ApiBearerAuth('access-token')
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get('my-sidebar')
  @ApiOperation({ summary: 'Get current user dynamic sidebar menu' })
  getMySidebar(@CurrentUser() user: User) {
    return this.menusService.getMySidebar(user);
  }

  @Get()
  @RequirePermissions('menus.view')
  @ApiOperation({ summary: 'Get all menus (admin)' })
  findAll() { return this.menusService.findAll(); }

  @Post()
  @RequirePermissions('menus.manage')
  @ApiOperation({ summary: 'Create menu item' })
  create(@Body() dto: CreateMenuDto) { return this.menusService.create(dto); }

  @Patch(':id')
  @RequirePermissions('menus.manage')
  @ApiOperation({ summary: 'Update menu item' })
  update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menusService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('menus.manage')
  @ApiOperation({ summary: 'Delete menu item' })
  remove(@Param('id') id: string) { return this.menusService.remove(id); }
}
