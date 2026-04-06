import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request, Response } from 'express';

const SENSITIVE_PARAMS = ['token', 'password', 'secret', 'authorization', 'key'];

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        const duration = Date.now() - start;
        const url = this.sanitizeUrl(request.url);
        console.log(`${request.method} ${url} ${response.statusCode} ${duration}ms`);
      }),
    );
  }

  private sanitizeUrl(url: string): string {
    const questionIndex = url.indexOf('?');
    if (questionIndex === -1) return url;

    const path = url.substring(0, questionIndex);
    const queryString = url.substring(questionIndex + 1);

    const sanitized = queryString
      .split('&')
      .map((pair) => {
        const eqIndex = pair.indexOf('=');
        if (eqIndex === -1) return pair;
        const key = pair.substring(0, eqIndex);
        if (SENSITIVE_PARAMS.includes(key.toLowerCase())) {
          return `${key}=[REDACTED]`;
        }
        return pair;
      })
      .join('&');

    return `${path}?${sanitized}`;
  }
}
