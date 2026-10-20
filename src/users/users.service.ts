import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserMenuPreference } from './entities/user-menu-preference.entity';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserMenuPreference)
    private prefRepository: Repository<UserMenuPreference>,
    private storageService: StorageService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.userRepository.findOne({ where: { email: dto.email.toLowerCase() } });
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepository.create({ ...dto, email: dto.email.toLowerCase(), passwordHash });

    if (dto.roleIds?.length) {
      user.roles = await this.roleRepository.findByIds(dto.roleIds);
    }

    return this.userRepository.save(user);
  }

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 20, search } = query;
    const qb = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .orderBy('user.createdAt', 'DESC');

    if (search) {
      qb.where(
        'user.firstName ILIKE :s OR user.lastName ILIKE :s OR user.email ILIKE :s',
        { s: `%${search}%` },
      );
    }

    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return paginate(data.map(this.sanitize), total, page, limit);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    if (dto.roleIds !== undefined) {
      user.roles = dto.roleIds.length ? await this.roleRepository.findByIds(dto.roleIds) : [];
    }
    return this.userRepository.save(user);
  }

  async updateOwnProfile(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    user.firstName = dto.firstName ?? user.firstName;
    user.lastName = dto.lastName ?? user.lastName;
    user.phone = dto.phone ?? user.phone;
    const saved = await this.userRepository.save(user);
    return this.sanitize(saved);
  }

  async updateAvatar(id: string, file: Express.Multer.File) {
    const user = await this.findOne(id);
    const extension = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const avatarUrl = await this.storageService.saveFile(file.buffer, `profile.${extension}`, 'avatars');
    const previousAvatar = user.avatarUrl;
    user.avatarUrl = avatarUrl;
    const saved = await this.userRepository.save(user);
    if (previousAvatar) await this.storageService.deleteFile(previousAvatar);
    return this.sanitize(saved);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.softDelete(id);
  }

  async getSidebarPreferences(userId: string) {
    let pref = await this.prefRepository.findOne({ where: { userId } });
    if (!pref) {
      pref = await this.prefRepository.save(
        this.prefRepository.create({ userId, sidebarCollapsed: false, hiddenMenuIds: [] }),
      );
    }
    return pref;
  }

  async updateSidebarPreferences(
    userId: string,
    dto: { sidebarCollapsed?: boolean; hiddenMenuIds?: string[] },
  ) {
    const pref = await this.getSidebarPreferences(userId);
    if (dto.sidebarCollapsed !== undefined) pref.sidebarCollapsed = dto.sidebarCollapsed;
    if (dto.hiddenMenuIds !== undefined) pref.hiddenMenuIds = dto.hiddenMenuIds;
    return this.prefRepository.save(pref);
  }

  private sanitize(user: User) {
    const { passwordHash, passwordResetToken, passwordResetExpires, ...safe } = user as any;
    return safe;
  }
}
