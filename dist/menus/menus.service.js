"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenusService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const menu_entity_1 = require("./entities/menu.entity");
const user_menu_preference_entity_1 = require("../users/entities/user-menu-preference.entity");
const role_entity_1 = require("../roles/entities/role.entity");
let MenusService = class MenusService {
    constructor(menuRepository, prefRepository, roleRepository) {
        this.menuRepository = menuRepository;
        this.prefRepository = prefRepository;
        this.roleRepository = roleRepository;
    }
    async getMySidebar(user) {
        const isSuperAdmin = user.roles?.some((r) => r.name === 'Super Admin');
        const userPermissionKeys = new Set();
        user.roles?.forEach((role) => {
            role.permissions?.forEach((p) => userPermissionKeys.add(p.permissionKey));
        });
        const roleIds = (user.roles || []).map((r) => r.id);
        const rolesWithMenus = roleIds.length
            ? await this.roleRepository.find({ where: { id: (0, typeorm_2.In)(roleIds) }, relations: ['menus'] })
            : [];
        const roleMenuIds = new Set();
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
            if (hidden.has(menu.id))
                return false;
            if (!isSuperAdmin && anyRoleHasExplicitMenus && !roleMenuIds.has(menu.id))
                return false;
            if (!menu.requiredPermission)
                return true;
            if (isSuperAdmin)
                return true;
            return userPermissionKeys.has(menu.requiredPermission);
        });
        return this.buildTree(accessible, null);
    }
    buildTree(menus, parentId) {
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
            .filter((m) => m.route || m.children.length > 0);
    }
    async findAll() {
        return this.menuRepository.find({ order: { sortOrder: 'ASC' } });
    }
    async create(dto) {
        const menu = this.menuRepository.create(dto);
        return this.menuRepository.save(menu);
    }
    async update(id, dto) {
        const menu = await this.menuRepository.findOne({ where: { id } });
        if (!menu)
            throw new common_1.NotFoundException('Menu not found');
        Object.assign(menu, dto);
        return this.menuRepository.save(menu);
    }
    async remove(id) {
        const menu = await this.menuRepository.findOne({ where: { id } });
        if (!menu)
            throw new common_1.NotFoundException('Menu not found');
        await this.menuRepository.softDelete(id);
    }
    async reorder(menuId, sortOrder) {
        await this.menuRepository.update(menuId, { sortOrder });
        const menu = await this.menuRepository.findOne({ where: { id: menuId } });
        if (!menu)
            throw new common_1.NotFoundException('Menu not found');
        return menu;
    }
};
exports.MenusService = MenusService;
exports.MenusService = MenusService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(menu_entity_1.Menu)),
    __param(1, (0, typeorm_1.InjectRepository)(user_menu_preference_entity_1.UserMenuPreference)),
    __param(2, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MenusService);
//# sourceMappingURL=menus.service.js.map