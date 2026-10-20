import { Entity, Column, ManyToMany, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ name: 'permission_key', unique: true, length: 100 })
  @Index()
  permissionKey: string;

  @Column({ name: 'module_name', length: 100 })
  moduleName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
