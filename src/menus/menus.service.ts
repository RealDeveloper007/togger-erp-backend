import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { User } from '../users/entities/user.entity';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
import { UserMenuPreference } from '../users/entities/user-menu-preference.entity';
import { Role } from '../roles/entities/role.entity';

export interface SidebarMenuItem {
  id: string;
  menuKey: string;
  title: string;
  icon: string | null;
  route: string | null;
  sortOrder: number;
  isCollapsible: boolean;
  badgeText: string | null;
  badgeColor: string | null;
  children: SidebarMenuItem[];
}

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(UserMenuPreference)
    private prefRepository: Repository<UserMenuPreference>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async getMySidebar(user: User): Promise<SidebarMenuItem[]> {
    const isSuperAdmin = user.roles?.some((r) => r.name === 'Super Admin');
    const userPermissionKeys = new Set<string>();
    user.roles?.forEach((role) => {
      role.permissions?.forEach((p) => userPermissionKeys.add(p.permissionKey));
    });

    const roleIds = (user.roles || []).map((r) => r.id);
    const rolesWithMenus = roleIds.length
      ? await this.roleRepository.find({ where: { id: In(roleIds) }, relations: ['menus'] })
      : [];
    const roleMenuIds = new Set<string>();
    let anyRoleHasExplicitMenus = false;
    rolesWithMenus.forEach((role) => {
      if (role.menus?.length) {
        anyRoleHasExplicitMenus = true;
        role.menus.forEach((m) => roleMenuIds.add(m.id));
      }
    });

    const pref = await this.prefRepository.findOne({ where: { userId: user.id } });
    const hidden = new Set(pref?.hiddenMenuIds || []);

    const allMenus = await this.menuRepository.find({
      where: { isActive: true, isVisible: true },
      order: { sortOrder: 'ASC' },
    });

    const accessible = allMenus.filter((menu) => {
      if (hidden.has(menu.id)) return false;
      if (!isSuperAdmin && anyRoleHasExplicitMenus && !roleMenuIds.has(menu.id)) return false;
      if (!menu.requiredPermission) return true;
      if (isSuperAdmin) return true;
      return userPermissionKeys.has(menu.requiredPermission);
    });

    return this.buildTree(accessible, null);
  }

  private buildTree(menus: Menu[], parentId: string | null): SidebarMenuItem[] {
    return menus
      .filter((m) => m.parentId === parentId)
      .map((m) => {
        const children = this.buildTree(menus, m.id);
        return {
          id: m.id,
          menuKey: m.menuKey,
          title: m.title,
          icon: m.icon,
          route: m.route,
          sortOrder: m.sortOrder,
          isCollapsible: m.isCollapsible,
          badgeText: m.badgeText,
          badgeColor: m.badgeColor,
          children,
        };
      })
      .filter((m) => m.route || m.children.length > 0); // Hide empty parent groups
  }

  async findAll(): Promise<Menu[]> {
    return this.menuRepository.find({ order: { sortOrder: 'ASC' } });
  }

  async create(dto: CreateMenuDto): Promise<Menu> {
    const menu = this.menuRepository.create(dto);
    return this.menuRepository.save(menu);
  }

  async update(id: string, dto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) throw new NotFoundException('Menu not found');
    Object.assign(menu, dto);
    return this.menuRepository.save(menu);
  }

  async remove(id: string): Promise<void> {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) throw new NotFoundException('Menu not found');
    await this.menuRepository.softDelete(id);
  }

  async reorder(menuId: string, sortOrder: number): Promise<Menu> {
    await this.menuRepository.update(menuId, { sortOrder });
    const menu = await this.menuRepository.findOne({ where: { id: menuId } });
    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }
}
