import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { Menu } from '../menus/entities/menu.entity';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto, AssignMenusDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const exists = await this.roleRepository.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException('Role name already exists');
    const role = this.roleRepository.create(dto);
    if (dto.permissionIds?.length) {
      role.permissions = await this.permissionRepository.findByIds(dto.permissionIds);
    }
    if (dto.menuIds?.length) {
      role.menus = await this.menuRepository.findByIds(dto.menuIds);
    }
    return this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'menus'],
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    if (role.isSystem) throw new BadRequestException('System roles cannot be modified');
    Object.assign(role, dto);
    if (dto.permissionIds !== undefined) {
      role.permissions = dto.permissionIds.length ? await this.permissionRepository.findByIds(dto.permissionIds) : [];
    }
    if (dto.menuIds !== undefined) {
      role.menus = dto.menuIds.length ? await this.menuRepository.findByIds(dto.menuIds) : [];
    }
    return this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    if (role.isSystem) throw new BadRequestException('System roles cannot be deleted');
    await this.roleRepository.softDelete(id);
  }

  async assignPermissions(id: string, dto: AssignPermissionsDto): Promise<Role> {
    const role = await this.findOne(id);
    role.permissions = dto.permissionIds.length ? await this.permissionRepository.findByIds(dto.permissionIds) : [];
    return this.roleRepository.save(role);
  }

  async assignMenus(id: string, dto: AssignMenusDto): Promise<Role> {
    const role = await this.findOne(id);
    role.menus = dto.menuIds.length ? await this.menuRepository.findByIds(dto.menuIds) : [];
    return this.roleRepository.save(role);
  }
}
