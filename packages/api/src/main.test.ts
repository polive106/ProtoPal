import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DEFAULT_ORIGINS,
  getAllowedOrigins,
  createCorsOriginHandler,
  validateStartupEnv,
} from './main';

describe('getAllowedOrigins', () => {
  const originalCorsOrigins = process.env.CORS_ORIGINS;

  afterEach(() => {
    if (originalCorsOrigins === undefined) {
      delete process.env.CORS_ORIGINS;
    } else {
      process.env.CORS_ORIGINS = originalCorsOrigins;
    }
  });

  it('returns DEFAULT_ORIGINS when CORS_ORIGINS is not set', () => {
    delete process.env.CORS_ORIGINS;
    expect(getAllowedOrigins()).toEqual(DEFAULT_ORIGINS);
  });

  it('parses comma-separated CORS_ORIGINS', () => {
    process.env.CORS_ORIGINS = 'https://app.example.com, https://admin.example.com';
    expect(getAllowedOrigins()).toEqual([
      'https://app.example.com',
      'https://admin.example.com',
    ]);
  });
});

describe('createCorsOriginHandler', () => {
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
  let handler: ReturnType<typeof createCorsOriginHandler>;

  beforeEach(() => {
    handler = createCorsOriginHandler(allowedOrigins);
  });

  it('allows requests with no origin', () => {
    const callback = vi.fn();
    handler(undefined, callback);
    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it('allows a whitelisted origin', () => {
    const callback = vi.fn();
    handler('http://localhost:5173', callback);
    expect(callback).toHaveBeenCalledWith(null, 'http://localhost:5173');
  });

  it('rejects an unknown origin', () => {
    const callback = vi.fn();
    handler('https://evil.example.com', callback);
    expect(callback).toHaveBeenCalledWith(null, false);
  });

  it('rejects an unknown origin even in non-production', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const callback = vi.fn();
    handler('https://evil.example.com', callback);
    expect(callback).toHaveBeenCalledWith(null, false);

    process.env.NODE_ENV = originalNodeEnv;
  });
});

describe('validateStartupEnv', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalJwtSecret = process.env.JWT_SECRET;

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
    vi.restoreAllMocks();
  });

  it('logs warning when NODE_ENV is not set', () => {
    delete process.env.NODE_ENV;
    process.env.JWT_SECRET = 'some-secret';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateStartupEnv();

    expect(warnSpy).toHaveBeenCalledWith(
      'WARNING: NODE_ENV is not explicitly set',
    );
  });

  it('exits in production when JWT_SECRET is not set', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);

    validateStartupEnv();

    expect(errorSpy).toHaveBeenCalledWith(
      'FATAL: JWT_SECRET is required in production',
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('does not exit when all critical env vars are present', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'a-valid-secret-for-production';
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);

    validateStartupEnv();

    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('does not warn when NODE_ENV is set', () => {
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = 'some-secret';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    validateStartupEnv();

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
