import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

function createContext(
  cookies: Record<string, string> = {},
  headers: Record<string, string> = {},
) {
  const request: any = {
    cookies,
    headers,
  };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => () => {},
    getClass: () => class {},
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockJwtService: { verifyToken: ReturnType<typeof vi.fn> };
  let mockReflector: { getAllAndOverride: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockJwtService = { verifyToken: vi.fn() };
    mockReflector = { getAllAndOverride: vi.fn() };
    guard = new AuthGuard(mockJwtService as any, mockReflector as any);
  });

  it('skips auth when @Public() metadata is present', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    const context = createContext();

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockJwtService.verifyToken).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when no cookie', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const context = createContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when token is invalid or expired', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockJwtService.verifyToken.mockRejectedValue(new Error('invalid'));
    const context = createContext({ auth_token: 'bad-token' });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('sets request.user and returns true on valid token', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const payload = { sub: 1, email: 'test@test.com' };
    mockJwtService.verifyToken.mockResolvedValue(payload);
    const context = createContext({ auth_token: 'valid-token' });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    const request = context.switchToHttp().getRequest() as any;
    expect(request.user).toEqual(payload);
  });

  it('falls back to Bearer token when no cookie is present', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const payload = { sub: 1, email: 'test@test.com' };
    mockJwtService.verifyToken.mockResolvedValue(payload);
    const context = createContext({}, { authorization: 'Bearer valid-bearer-token' });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockJwtService.verifyToken).toHaveBeenCalledWith('valid-bearer-token');
    const request = context.switchToHttp().getRequest() as any;
    expect(request.user).toEqual(payload);
  });

  it('prefers cookie over Bearer token when both are present', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const payload = { sub: 1, email: 'test@test.com' };
    mockJwtService.verifyToken.mockResolvedValue(payload);
    const context = createContext(
      { auth_token: 'cookie-token' },
      { authorization: 'Bearer bearer-token' },
    );

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockJwtService.verifyToken).toHaveBeenCalledWith('cookie-token');
  });

  it('throws UnauthorizedException when Bearer token is invalid', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockJwtService.verifyToken.mockRejectedValue(new Error('invalid'));
    const context = createContext({}, { authorization: 'Bearer bad-token' });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when no cookie and no Bearer token', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const context = createContext({}, {});

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
