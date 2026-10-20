import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({ order: { moduleName: 'ASC', permissionKey: 'ASC' } });
  }

  findByModule(moduleName: string): Promise<Permission[]> {
    return this.permissionRepository.find({ where: { moduleName }, order: { permissionKey: 'ASC' } });
  }
}
