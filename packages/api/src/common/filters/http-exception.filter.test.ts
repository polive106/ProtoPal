import { HttpException, BadRequestException, NotFoundException, type ArgumentsHost } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

function createMockHost() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const response = { status };
  return {
    host: {
      switchToHttp: () => ({ getResponse: () => response }),
    } as unknown as ArgumentsHost,
    json,
    status,
  };
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('formats HttpException with string body', () => {
    const { host, status, json } = createMockHost();
    const exception = new HttpException('msg', 400);

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'msg', statusCode: 400 });
  });

  it('formats HttpException with object body (BadRequestException)', () => {
    const { host, status, json } = createMockHost();
    const exception = new BadRequestException('validation failed');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Bad Request',
        statusCode: 400,
      }),
    );
  });

  it('returns 500 for non-HttpException (plain Error)', () => {
    const { host, status, json } = createMockHost();
    const exception = new Error('something broke');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      error: 'Internal server error',
      statusCode: 500,
    });
  });

  it('returns 500 for unknown exception types', () => {
    const { host, status, json } = createMockHost();

    filter.catch('unexpected string error', host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      error: 'Internal server error',
      statusCode: 500,
    });
  });
});
