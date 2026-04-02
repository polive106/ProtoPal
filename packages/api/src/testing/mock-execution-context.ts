import { ExecutionContext } from '@nestjs/common';

interface MockContextOptions {
  cookies?: Record<string, string>;
  user?: any;
  ip?: string;
  body?: any;
}

export function createMockExecutionContext(
  options: MockContextOptions = {},
): ExecutionContext {
  const request = {
    cookies: options.cookies || {},
    user: options.user,
    ip: options.ip || '127.0.0.1',
    body: options.body || {},
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
    }),
    getHandler: () => () => {},
    getClass: () => class {},
  } as unknown as ExecutionContext;
}
