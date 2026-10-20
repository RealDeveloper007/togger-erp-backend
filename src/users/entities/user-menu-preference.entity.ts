import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';

@Entity('user_menu_preferences')
@Unique(['userId'])
export class UserMenuPreference extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'sidebar_collapsed', default: false })
  sidebarCollapsed: boolean;

  @Column({ name: 'hidden_menu_ids', type: 'jsonb', default: [] })
  hiddenMenuIds: string[];
}
