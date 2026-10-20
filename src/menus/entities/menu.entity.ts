import { Entity, Column, ManyToOne, OneToMany, ManyToMany, JoinColumn, Index, Tree, TreeParent, TreeChildren } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('menus')
export class Menu extends BaseEntity {
  @Column({ name: 'menu_key', unique: true, length: 100 })
  @Index()
  menuKey: string;

  @Column({ length: 150 })
  title: string;

  @Column({ nullable: true, length: 100 })
  icon: string;

  @Column({ nullable: true, length: 255 })
  route: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  @Column({ name: 'is_collapsible', default: false })
  isCollapsible: boolean;

  @Column({ name: 'badge_text', nullable: true, length: 50 })
  badgeText: string;

  @Column({ name: 'badge_color', nullable: true, length: 50 })
  badgeColor: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @ManyToOne(() => Menu, (menu) => menu.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: Menu;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children: Menu[];

  @ManyToMany(() => Role, (role) => role.menus)
  roles: Role[];

  // Required permission key to see this menu item (optional)
  @Column({ name: 'required_permission', nullable: true, length: 100 })
  requiredPermission: string;
}
