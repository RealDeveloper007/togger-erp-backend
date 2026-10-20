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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("../permissions/entities/permission.entity");
const menu_entity_1 = require("../menus/entities/menu.entity");
let RolesService = class RolesService {
    constructor(roleRepository, permissionRepository, menuRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.menuRepository = menuRepository;
    }
    async create(dto) {
        const exists = await this.roleRepository.findOne({ where: { name: dto.name } });
        if (exists)
            throw new common_1.ConflictException('Role name already exists');
        const role = this.roleRepository.create(dto);
        if (dto.permissionIds?.length) {
            role.permissions = await this.permissionRepository.findByIds(dto.permissionIds);
        }
        if (dto.menuIds?.length) {
            role.menus = await this.menuRepository.findByIds(dto.menuIds);
        }
        return this.roleRepository.save(role);
    }
    async findAll() {
        return this.roleRepository.find({
            relations: ['permissions'],
            order: { name: 'ASC' },
        });
    }
    async findOne(id) {
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: ['permissions', 'menus'],
        });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        return role;
    }
    async update(id, dto) {
        const role = await this.findOne(id);
        if (role.isSystem)
            throw new common_1.BadRequestException('System roles cannot be modified');
        Object.assign(role, dto);
        if (dto.permissionIds !== undefined) {
            role.permissions = dto.permissionIds.length ? await this.permissionRepository.findByIds(dto.permissionIds) : [];
        }
        if (dto.menuIds !== undefined) {
            role.menus = dto.menuIds.length ? await this.menuRepository.findByIds(dto.menuIds) : [];
        }
        return this.roleRepository.save(role);
    }
    async remove(id) {
        const role = await this.findOne(id);
        if (role.isSystem)
            throw new common_1.BadRequestException('System roles cannot be deleted');
        await this.roleRepository.softDelete(id);
    }
    async assignPermissions(id, dto) {
        const role = await this.findOne(id);
        role.permissions = dto.permissionIds.length ? await this.permissionRepository.findByIds(dto.permissionIds) : [];
        return this.roleRepository.save(role);
    }
    async assignMenus(id, dto) {
        const role = await this.findOne(id);
        role.menus = dto.menuIds.length ? await this.menuRepository.findByIds(dto.menuIds) : [];
        return this.roleRepository.save(role);
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(2, (0, typeorm_1.InjectRepository)(menu_entity_1.Menu)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RolesService);
//# sourceMappingURL=roles.service.js.map