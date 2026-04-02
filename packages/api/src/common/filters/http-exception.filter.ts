import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal server error';

    let body: string | Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      body = exception.getResponse() as string | Record<string, unknown>;
      if (typeof body === 'string') {
        error = body;
      } else if (typeof body === 'object' && body !== null) {
        error = (body.error as string) || (body.message as string) || exception.message;
      }
    }

    const message = typeof body === 'object' && body !== null ? body.message : undefined;

    response.status(status).json({
      error,
      statusCode: status,
      ...(message && error !== message ? { message } : {}),
    });
  }
}
