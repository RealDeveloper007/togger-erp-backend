import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<{ user: User }>();
    if (!user) throw new ForbiddenException('Access denied');

    // Super Admin bypasses all permission checks
    const isSuperAdmin = user.roles?.some((r) => r.name === 'Super Admin');
    if (isSuperAdmin) return true;

    const userPermissions = new Set<string>();
    user.roles?.forEach((role) => {
      role.permissions?.forEach((p) => userPermissions.add(p.permissionKey));
    });

    const hasAll = requiredPermissions.every((p) => userPermissions.has(p));
    if (!hasAll) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
