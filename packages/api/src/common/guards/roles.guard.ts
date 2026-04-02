import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException('Access denied');

    const userRoles = user.roles?.map((r: any) => r.roleName) || [];
    if (userRoles.includes('admin')) return true;

    const hasRole = requiredRoles.some((role) => userRoles.includes(role));
    if (!hasRole) throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}
