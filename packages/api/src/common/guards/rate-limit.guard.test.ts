import { ExecutionContext, HttpException } from '@nestjs/common';
import { clearRateLimitStore, RateLimitGuard } from './rate-limit.guard';

function createContext(ip = '127.0.0.1', body: Record<string, unknown> = {}) {
  const request: any = { ip, body, cookies: {} };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => () => {},
    getClass: () => class {},
  } as unknown as ExecutionContext;
}

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard;
  let mockReflector: { get: ReturnType<typeof vi.fn> };
  const originalDisableRateLimit = process.env.DISABLE_RATE_LIMIT;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    clearRateLimitStore();
    mockReflector = { get: vi.fn() };
    guard = new RateLimitGuard(mockReflector as any);
    process.env.DISABLE_RATE_LIMIT = undefined as any;
  });

  afterEach(() => {
    process.env.DISABLE_RATE_LIMIT = originalDisableRateLimit;
    process.env.NODE_ENV = originalNodeEnv;
    vi.useRealTimers();
  });

  it('bypassed when DISABLE_RATE_LIMIT=true', () => {
    process.env.DISABLE_RATE_LIMIT = 'true';
    mockReflector.get.mockReturnValue({ windowMs: 1000, max: 1, keyPrefix: 'test' });
    const context = createContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('passes when no rate limit metadata', () => {
    mockReflector.get.mockReturnValue(undefined);
    const context = createContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows up to max requests within window', () => {
    mockReflector.get.mockReturnValue({ windowMs: 60000, max: 3, keyPrefix: 'test' });

    for (let i = 0; i < 3; i++) {
      const context = createContext();
      expect(guard.canActivate(context)).toBe(true);
    }
  });

  it('throws 429 HttpException when exceeded', () => {
    mockReflector.get.mockReturnValue({ windowMs: 60000, max: 2, keyPrefix: 'test' });

    guard.canActivate(createContext());
    guard.canActivate(createContext());

    expect(() => guard.canActivate(createContext())).toThrow(HttpException);
    try {
      guard.canActivate(createContext());
    } catch (e) {
      expect((e as HttpException).getStatus()).toBe(429);
    }
  });

  it('resets after window expires', () => {
    vi.useFakeTimers();
    mockReflector.get.mockReturnValue({ windowMs: 5000, max: 1, keyPrefix: 'test' });

    expect(guard.canActivate(createContext())).toBe(true);
    expect(() => guard.canActivate(createContext())).toThrow(HttpException);

    vi.advanceTimersByTime(5001);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('DISABLE_RATE_LIMIT is ignored when NODE_ENV=production', () => {
    process.env.DISABLE_RATE_LIMIT = 'true';
    process.env.NODE_ENV = 'production';
    mockReflector.get.mockReturnValue({ windowMs: 60000, max: 1, keyPrefix: 'test' });

    expect(guard.canActivate(createContext())).toBe(true);
    expect(() => guard.canActivate(createContext())).toThrow(HttpException);
  });

  it('keyFromBody key extraction gives separate limits per value', () => {
    mockReflector.get.mockReturnValue({
      windowMs: 60000,
      max: 2,
      keyPrefix: 'login',
      keyFromBody: 'email',
    });

    // First request for each email
    expect(guard.canActivate(createContext('127.0.0.1', { email: 'a@test.com' }))).toBe(true);
    expect(guard.canActivate(createContext('127.0.0.1', { email: 'b@test.com' }))).toBe(true);

    // Second request for each email (still within limit)
    expect(guard.canActivate(createContext('127.0.0.1', { email: 'a@test.com' }))).toBe(true);
    expect(guard.canActivate(createContext('127.0.0.1', { email: 'b@test.com' }))).toBe(true);

    // Third request for a@test.com exceeds limit
    expect(() => guard.canActivate(createContext('127.0.0.1', { email: 'a@test.com' }))).toThrow(HttpException);
    // b@test.com still has one more allowed
  });
});
