import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix: string;
  keyFromBody?: string;
}

export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL_MS = 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetTime) store.delete(key);
  }
}

export function clearRateLimitStore() {
  store.clear();
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (process.env.DISABLE_RATE_LIMIT === 'true' && process.env.NODE_ENV !== 'production') return true;

    const options = this.reflector.get<RateLimitOptions>(RATE_LIMIT_KEY, context.getHandler());
    if (!options) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip || 'unknown';
    let key = `${options.keyPrefix}:${ip}`;

    if (options.keyFromBody && request.body) {
      const bodyValue = (request.body as Record<string, unknown>)[options.keyFromBody];
      if (bodyValue) key = `${options.keyPrefix}:${String(bodyValue)}`;
    }

    cleanupExpired();

    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetTime) {
      store.set(key, { count: 1, resetTime: now + options.windowMs });
      return true;
    }

    entry.count++;
    if (entry.count > options.max) {
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}
