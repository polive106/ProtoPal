import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuditLogService, AuditAction } from '../../services';

export const ADMIN_ROLE = 'admin';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService?: AuditLogService,
  ) {}

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
    if (userRoles.includes(ADMIN_ROLE)) {
      this.auditLogService?.log({
        action: AuditAction.ROLE_BYPASS_ADMIN,
        userId: user.sub,
        ip: request.ip,
        outcome: 'success',
        metadata: { requiredRoles },
      });
      return true;
    }

    const hasRole = requiredRoles.some((role) => userRoles.includes(role));
    if (!hasRole) throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}
