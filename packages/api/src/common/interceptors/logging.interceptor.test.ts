import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  it('calls next.handle() and logs request info', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/test' }),
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const mockNext: CallHandler = {
      handle: () => of('result'),
    };

    const result = await new Promise((resolve) => {
      interceptor.intercept(mockContext, mockNext).subscribe((val) => resolve(val));
    });

    expect(result).toBe('result');
    expect(logSpy).toHaveBeenCalledTimes(1);

    const logMessage = logSpy.mock.calls[0]![0] as string;
    expect(logMessage).toMatch(/^GET \/test 200 \d+ms$/);

    logSpy.mockRestore();
  });

  it('log format is ${method} ${url} ${statusCode} ${duration}ms', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'POST', url: '/api/users' }),
        getResponse: () => ({ statusCode: 201 }),
      }),
    } as unknown as ExecutionContext;

    const mockNext: CallHandler = {
      handle: () => of('data'),
    };

    await new Promise((resolve) => {
      interceptor.intercept(mockContext, mockNext).subscribe((val) => resolve(val));
    });

    const logMessage = logSpy.mock.calls[0]![0] as string;
    expect(logMessage).toMatch(/^POST \/api\/users 201 \d+ms$/);

    logSpy.mockRestore();
  });
});
