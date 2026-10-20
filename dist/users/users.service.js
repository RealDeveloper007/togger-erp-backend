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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("./entities/user.entity");
const role_entity_1 = require("../roles/entities/role.entity");
const user_menu_preference_entity_1 = require("./entities/user-menu-preference.entity");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const storage_service_1 = require("../storage/storage.service");
let UsersService = class UsersService {
    constructor(userRepository, roleRepository, prefRepository, storageService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.prefRepository = prefRepository;
        this.storageService = storageService;
    }
    async create(dto) {
        const exists = await this.userRepository.findOne({ where: { email: dto.email.toLowerCase() } });
        if (exists)
            throw new common_1.ConflictException('Email already registered');
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = this.userRepository.create({ ...dto, email: dto.email.toLowerCase(), passwordHash });
        if (dto.roleIds?.length) {
            user.roles = await this.roleRepository.findByIds(dto.roleIds);
        }
        return this.userRepository.save(user);
    }
    async findAll(query) {
        const { page = 1, limit = 20, search } = query;
        const qb = this.userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'role')
            .orderBy('user.createdAt', 'DESC');
        if (search) {
            qb.where('user.firstName ILIKE :s OR user.lastName ILIKE :s OR user.email ILIKE :s', { s: `%${search}%` });
        }
        const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
        return (0, pagination_dto_1.paginate)(data.map(this.sanitize), total, page, limit);
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['roles', 'roles.permissions'],
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async update(id, dto) {
        const user = await this.findOne(id);
        Object.assign(user, dto);
        if (dto.roleIds !== undefined) {
            user.roles = dto.roleIds.length ? await this.roleRepository.findByIds(dto.roleIds) : [];
        }
        return this.userRepository.save(user);
    }
    async updateOwnProfile(id, dto) {
        const user = await this.findOne(id);
        user.firstName = dto.firstName ?? user.firstName;
        user.lastName = dto.lastName ?? user.lastName;
        user.phone = dto.phone ?? user.phone;
        const saved = await this.userRepository.save(user);
        return this.sanitize(saved);
    }
    async updateAvatar(id, file) {
        const user = await this.findOne(id);
        const extension = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
        const avatarUrl = await this.storageService.saveFile(file.buffer, `profile.${extension}`, 'avatars');
        const previousAvatar = user.avatarUrl;
        user.avatarUrl = avatarUrl;
        const saved = await this.userRepository.save(user);
        if (previousAvatar)
            await this.storageService.deleteFile(previousAvatar);
        return this.sanitize(saved);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.userRepository.softDelete(id);
    }
    async getSidebarPreferences(userId) {
        let pref = await this.prefRepository.findOne({ where: { userId } });
        if (!pref) {
            pref = await this.prefRepository.save(this.prefRepository.create({ userId, sidebarCollapsed: false, hiddenMenuIds: [] }));
        }
        return pref;
    }
    async updateSidebarPreferences(userId, dto) {
        const pref = await this.getSidebarPreferences(userId);
        if (dto.sidebarCollapsed !== undefined)
            pref.sidebarCollapsed = dto.sidebarCollapsed;
        if (dto.hiddenMenuIds !== undefined)
            pref.hiddenMenuIds = dto.hiddenMenuIds;
        return this.prefRepository.save(pref);
    }
    sanitize(user) {
        const { passwordHash, passwordResetToken, passwordResetExpires, ...safe } = user;
        return safe;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(2, (0, typeorm_1.InjectRepository)(user_menu_preference_entity_1.UserMenuPreference)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        storage_service_1.StorageService])
], UsersService);
//# sourceMappingURL=users.service.js.map