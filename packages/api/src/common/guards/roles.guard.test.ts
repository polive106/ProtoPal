import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

function createContext(user?: any) {
  const request: any = { user };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => () => {},
    getClass: () => class {},
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let mockReflector: { getAllAndOverride: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockReflector = { getAllAndOverride: vi.fn() };
    guard = new RolesGuard(mockReflector as any);
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
});
