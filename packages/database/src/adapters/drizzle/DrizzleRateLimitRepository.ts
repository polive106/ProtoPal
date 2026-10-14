import { eq, lt } from 'drizzle-orm';
import type { RateLimitRepository, RateLimitEntry } from '@acme/domain';
import type { DatabaseConnection } from '../../connections/sql';
import { rateLimitEntries } from '../../schema';

export class DrizzleRateLimitRepository implements RateLimitRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async get(key: string): Promise<RateLimitEntry | null> {
    const [row] = await this.db
      .select()
      .from(rateLimitEntries)
      .where(eq(rateLimitEntries.key, key))
      .limit(1);
    return row ?? null;
  }

  async upsert(entry: RateLimitEntry): Promise<void> {
    await this.db
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
      });
  }

  async deleteExpired(): Promise<number> {
    const now = Date.now();
    const deleted = await this.db
      .delete(rateLimitEntries)
      .where(lt(rateLimitEntries.expiresAt, now))
      .returning({ key: rateLimitEntries.key });
    return deleted.length;
  }

  async deleteAll(): Promise<void> {
    await this.db.delete(rateLimitEntries);
  }
}
