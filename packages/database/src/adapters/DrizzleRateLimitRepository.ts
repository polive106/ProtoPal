import { eq, lt } from 'drizzle-orm';
import type { RateLimitRepository, RateLimitEntry } from '@acme/domain';
import type { DatabaseConnection } from '../connection';
import { rateLimitEntries } from '../schema';

export class DrizzleRateLimitRepository implements RateLimitRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async get(key: string): Promise<RateLimitEntry | null> {
    const row = this.db
      .select()
      .from(rateLimitEntries)
      .where(eq(rateLimitEntries.key, key))
      .get();
    return row ?? null;
  }

  async upsert(entry: RateLimitEntry): Promise<void> {
    this.db
      .insert(rateLimitEntries)
      .values(entry)
      .onConflictDoUpdate({
        target: rateLimitEntries.key,
        set: {
          count: entry.count,
          windowStart: entry.windowStart,
          prevCount: entry.prevCount,
          prevWindowStart: entry.prevWindowStart,
          expiresAt: entry.expiresAt,
        },
      })
      .run();
  }

  async deleteExpired(): Promise<number> {
    const now = Date.now();
    const result = this.db
      .delete(rateLimitEntries)
      .where(lt(rateLimitEntries.expiresAt, now))
      .run();
    return result.changes;
  }

  async deleteAll(): Promise<void> {
    this.db.delete(rateLimitEntries).run();
  }
}
