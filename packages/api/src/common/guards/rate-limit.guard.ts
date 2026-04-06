import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import type { RateLimitRepository, RateLimitEntry } from '@acme/domain';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix: string;
  keyFromBody?: string;
}

export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);

const CLEANUP_INTERVAL_MS = 60 * 1000;
let lastCleanup = 0;

function slidingWindowCount(entry: RateLimitEntry, now: number, windowMs: number): number {
  if (entry.prevWindowStart == null) return entry.count;

  const prevWindowEnd = entry.prevWindowStart + windowMs;
  const slidingWindowStart = now - windowMs;
  const overlapStart = Math.max(entry.prevWindowStart, slidingWindowStart);
  const overlap = Math.max(0, prevWindowEnd - overlapStart) / windowMs;

  return Math.ceil(entry.prevCount * overlap + entry.count);
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitRepo?: RateLimitRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.DISABLE_RATE_LIMIT === 'true' && process.env.NODE_ENV !== 'production') return true;

    const options = this.reflector.get<RateLimitOptions>(RATE_LIMIT_KEY, context.getHandler());
    if (!options) return true;

    if (!this.rateLimitRepo) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const ip = request.ip || 'unknown';
    let key = `${options.keyPrefix}:${ip}`;

    if (options.keyFromBody && request.body) {
      const bodyValue = (request.body as Record<string, unknown>)[options.keyFromBody];
      if (bodyValue) key = `${options.keyPrefix}:${String(bodyValue)}`;
    }

    await this.cleanupExpired();

    const now = Date.now();
    const existing = await this.rateLimitRepo.get(key);

    let entry: RateLimitEntry;

    if (!existing || now >= existing.windowStart + options.windowMs) {
      // Start new window, carry over current as previous
      const prevCount = existing && now < existing.windowStart + 2 * options.windowMs
        ? existing.count : 0;
      const prevWindowStart = existing ? existing.windowStart : null;

      entry = {
        key,
        count: 1,
        windowStart: now,
        prevCount,
        prevWindowStart,
        expiresAt: now + 2 * options.windowMs,
      };
    } else {
      // Same window — increment
      entry = {
        ...existing,
        count: existing.count + 1,
      };
    }

    await this.rateLimitRepo.upsert(entry);

    const effectiveCount = slidingWindowCount(entry, now, options.windowMs);
    const remaining = Math.max(0, options.max - effectiveCount);
    const resetTimeSec = Math.ceil((entry.windowStart + options.windowMs) / 1000);

    response.setHeader('X-RateLimit-Limit', String(options.max));
    response.setHeader('X-RateLimit-Remaining', String(remaining));
    response.setHeader('X-RateLimit-Reset', String(resetTimeSec));

    if (effectiveCount > options.max) {
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }

  private async cleanupExpired(): Promise<void> {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
    lastCleanup = now;
    await this.rateLimitRepo!.deleteExpired();
  }
}
