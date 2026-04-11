import type { Db, Collection } from 'mongodb';
import type { RateLimitRepository, RateLimitEntry } from '@acme/domain';

interface RateLimitDoc {
  key: string;
  count: number;
  windowStart: number;
  prevCount: number;
  prevWindowStart: number | null;
  expiresAt: number;
}

export class MongoRateLimitRepository implements RateLimitRepository {
  private readonly collection: Collection<RateLimitDoc>;

  constructor(db: Db) {
    this.collection = db.collection<RateLimitDoc>('rate_limit_entries');
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    const doc = await this.collection.findOne({ key });
    if (!doc) return null;
    return {
      key: doc.key,
      count: doc.count,
      windowStart: doc.windowStart,
      prevCount: doc.prevCount,
      prevWindowStart: doc.prevWindowStart ?? null,
      expiresAt: doc.expiresAt,
    };
  }

  async upsert(entry: RateLimitEntry): Promise<void> {
    await this.collection.updateOne(
      { key: entry.key },
      {
        $set: {
          count: entry.count,
          windowStart: entry.windowStart,
          prevCount: entry.prevCount,
          prevWindowStart: entry.prevWindowStart,
          expiresAt: entry.expiresAt,
        },
        $setOnInsert: {
          key: entry.key,
        },
      },
      { upsert: true },
    );
  }

  async deleteExpired(): Promise<number> {
    const now = Date.now();
    const result = await this.collection.deleteMany({ expiresAt: { $lt: now } });
    return result.deletedCount;
  }

  async deleteAll(): Promise<void> {
    await this.collection.deleteMany({});
  }
}
