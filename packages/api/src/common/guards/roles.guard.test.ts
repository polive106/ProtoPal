import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard, ADMIN_ROLE } from './roles.guard';

function createContext(user?: any) {
  const request: any = { user, ip: '10.0.0.1' };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => () => {},
    getClass: () => class {},
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let mockReflector: { getAllAndOverride: ReturnType<typeof vi.fn> };
  let mockAuditLogService: { log: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockReflector = { getAllAndOverride: vi.fn() };
    mockAuditLogService = { log: vi.fn() };
    guard = new RolesGuard(mockReflector as any, mockAuditLogService as any);
  });

  it('passes when no @Roles() metadata', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('passes when @Roles() has empty array', () => {
    mockReflector.getAllAndOverride.mockReturnValue([]);
    const context = createContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws ForbiddenException when no user on request', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['editor']);
    const context = createContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('admin role bypasses all checks', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['editor', 'manager']);
    const context = createContext({ roles: [{ roleName: 'admin' }] });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('passes when user has one of the required roles', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['editor', 'manager']);
    const context = createContext({ roles: [{ roleName: 'editor' }] });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws ForbiddenException when user lacks required roles', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['editor', 'manager']);
    const context = createContext({ roles: [{ roleName: 'viewer' }] });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('logs audit event when admin bypasses role check', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['editor', 'manager']);
    const context = createContext({ sub: 'u1', roles: [{ roleName: 'admin' }] });

    guard.canActivate(context);

    expect(mockAuditLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'ROLE_BYPASS_ADMIN',
        userId: 'u1',
        ip: '10.0.0.1',
        outcome: 'success',
        metadata: { requiredRoles: ['editor', 'manager'] },
      }),
    );
  });

  it('does not log audit event for normal role match', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['editor']);
    const context = createContext({ sub: 'u2', roles: [{ roleName: 'editor' }] });

    guard.canActivate(context);

    expect(mockAuditLogService.log).not.toHaveBeenCalled();
  });

  it('does not log audit event when no roles required', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createContext({ sub: 'u1', roles: [{ roleName: 'admin' }] });

    guard.canActivate(context);

    expect(mockAuditLogService.log).not.toHaveBeenCalled();
  });

  it('exports ADMIN_ROLE constant as "admin"', () => {
    expect(ADMIN_ROLE).toBe('admin');
  });

  it('works without audit log service (optional dependency)', () => {
    const guardWithoutAudit = new RolesGuard(mockReflector as any);
    mockReflector.getAllAndOverride.mockReturnValue(['editor']);
    const context = createContext({ roles: [{ roleName: 'admin' }] });

    expect(guardWithoutAudit.canActivate(context)).toBe(true);
  });
});
