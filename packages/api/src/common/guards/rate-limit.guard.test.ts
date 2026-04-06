import { ExecutionContext, HttpException } from '@nestjs/common';
import { RateLimitGuard } from './rate-limit.guard';
import type { RateLimitRepository, RateLimitEntry } from '@acme/domain';

function createMockRepo(): RateLimitRepository & {
  _store: Map<string, RateLimitEntry>;
} {
  const store = new Map<string, RateLimitEntry>();
  return {
    _store: store,
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    upsert: vi.fn(async (entry: RateLimitEntry) => {
      store.set(entry.key, entry);
    }),
    deleteExpired: vi.fn(async () => 0),
    deleteAll: vi.fn(async () => {
      store.clear();
    }),
  };
}

function createContext(ip = '127.0.0.1', body: Record<string, unknown> = {}) {
  const mockResponse = {
    setHeader: vi.fn(),
  };
  const request: any = { ip, body, cookies: {} };
  return {
    context: {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => mockResponse,
      }),
      getHandler: () => () => {},
      getClass: () => class {},
    } as unknown as ExecutionContext,
    response: mockResponse,
  };
}

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard;
  let mockReflector: { get: ReturnType<typeof vi.fn> };
  let mockRepo: ReturnType<typeof createMockRepo>;
  const originalDisableRateLimit = process.env.DISABLE_RATE_LIMIT;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(async () => {
    mockRepo = createMockRepo();
    mockReflector = { get: vi.fn() };
    guard = new RateLimitGuard(mockReflector as any, mockRepo);
    process.env.DISABLE_RATE_LIMIT = undefined as any;
  });

  afterEach(() => {
    process.env.DISABLE_RATE_LIMIT = originalDisableRateLimit;
    process.env.NODE_ENV = originalNodeEnv;
    vi.useRealTimers();
  });

  it('bypassed when DISABLE_RATE_LIMIT=true', async () => {
    process.env.DISABLE_RATE_LIMIT = 'true';
    mockReflector.get.mockReturnValue({ windowMs: 1000, max: 1, keyPrefix: 'test' });
    const { context } = createContext();

    expect(await guard.canActivate(context)).toBe(true);
  });

  it('passes when no rate limit metadata', async () => {
    mockReflector.get.mockReturnValue(undefined);
    const { context } = createContext();

    expect(await guard.canActivate(context)).toBe(true);
  });

  it('passes when no repository is injected', async () => {
    const guardWithoutRepo = new RateLimitGuard(mockReflector as any);
    mockReflector.get.mockReturnValue({ windowMs: 60000, max: 1, keyPrefix: 'test' });
    const { context } = createContext();

    expect(await guardWithoutRepo.canActivate(context)).toBe(true);
  });

  it('allows up to max requests within window', async () => {
    mockReflector.get.mockReturnValue({ windowMs: 60000, max: 3, keyPrefix: 'test' });

    for (let i = 0; i < 3; i++) {
      const { context } = createContext();
      expect(await guard.canActivate(context)).toBe(true);
    }
  });

  it('throws 429 HttpException when exceeded', async () => {
    mockReflector.get.mockReturnValue({ windowMs: 60000, max: 2, keyPrefix: 'test' });

    await guard.canActivate(createContext().context);
    await guard.canActivate(createContext().context);

    await expect(guard.canActivate(createContext().context)).rejects.toThrow(HttpException);
    try {
      await guard.canActivate(createContext().context);
    } catch (e) {
      expect((e as HttpException).getStatus()).toBe(429);
    }
  });

  it('resets after sliding window fully expires', async () => {
    vi.useFakeTimers();
    mockReflector.get.mockReturnValue({ windowMs: 5000, max: 1, keyPrefix: 'test' });

    expect(await guard.canActivate(createContext().context)).toBe(true);
    await expect(guard.canActivate(createContext().context)).rejects.toThrow(HttpException);

    // Sliding window needs 2x windowMs to fully clear previous window's influence
    vi.advanceTimersByTime(10001);

    expect(await guard.canActivate(createContext().context)).toBe(true);
  });

  it('DISABLE_RATE_LIMIT is ignored when NODE_ENV=production', async () => {
    process.env.DISABLE_RATE_LIMIT = 'true';
    process.env.NODE_ENV = 'production';
    mockReflector.get.mockReturnValue({ windowMs: 60000, max: 1, keyPrefix: 'test' });

    expect(await guard.canActivate(createContext().context)).toBe(true);
    await expect(guard.canActivate(createContext().context)).rejects.toThrow(HttpException);
  });

  it('keyFromBody key extraction gives separate limits per value', async () => {
    mockReflector.get.mockReturnValue({
      windowMs: 60000,
      max: 2,
      keyPrefix: 'login',
      keyFromBody: 'email',
    });

    expect(await guard.canActivate(createContext('127.0.0.1', { email: 'a@test.com' }).context)).toBe(true);
    expect(await guard.canActivate(createContext('127.0.0.1', { email: 'b@test.com' }).context)).toBe(true);

    expect(await guard.canActivate(createContext('127.0.0.1', { email: 'a@test.com' }).context)).toBe(true);
    expect(await guard.canActivate(createContext('127.0.0.1', { email: 'b@test.com' }).context)).toBe(true);

    await expect(guard.canActivate(createContext('127.0.0.1', { email: 'a@test.com' }).context)).rejects.toThrow(HttpException);
  });

  it('sets rate limit response headers', async () => {
    mockReflector.get.mockReturnValue({ windowMs: 60000, max: 5, keyPrefix: 'test' });
    const { context, response } = createContext();

    await guard.canActivate(context);

    expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '5');
    expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '4');
    expect(response.setHeader).toHaveBeenCalledWith(
      'X-RateLimit-Reset',
      expect.stringMatching(/^\d+$/),
    );
  });

  it('decrements remaining count in headers with each request', async () => {
    mockReflector.get.mockReturnValue({ windowMs: 60000, max: 3, keyPrefix: 'test' });

    const { context: ctx1, response: res1 } = createContext();
    await guard.canActivate(ctx1);
    expect(res1.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '2');

    const { context: ctx2, response: res2 } = createContext();
    await guard.canActivate(ctx2);
    expect(res2.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '1');

    const { context: ctx3, response: res3 } = createContext();
    await guard.canActivate(ctx3);
    expect(res3.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '0');
  });

  it('sliding window weights previous window requests', async () => {
    vi.useFakeTimers();
    const windowMs = 10000;
    mockReflector.get.mockReturnValue({ windowMs, max: 5, keyPrefix: 'test' });

    // Make 4 requests in window 1
    for (let i = 0; i < 4; i++) {
      await guard.canActivate(createContext().context);
    }

    // Advance to start of window 2
    vi.advanceTimersByTime(windowMs);

    // First request in new window — previous 4 still partially count
    const { context, response } = createContext();
    await guard.canActivate(context);

    expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '5');
  });

  it('persists rate limit state via repository', async () => {
    mockReflector.get.mockReturnValue({ windowMs: 60000, max: 5, keyPrefix: 'test' });

    await guard.canActivate(createContext().context);

    expect(mockRepo.get).toHaveBeenCalledWith('test:127.0.0.1');
    expect(mockRepo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'test:127.0.0.1',
        count: 1,
      }),
    );
  });
});
