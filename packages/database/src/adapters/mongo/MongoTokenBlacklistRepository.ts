import { randomUUID } from 'crypto';
import type { Db, Collection } from 'mongodb';
import type { TokenBlacklistRepository } from '@acme/domain';

interface TokenBlacklistDoc {
  _id: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export class MongoTokenBlacklistRepository implements TokenBlacklistRepository {
  private readonly collection: Collection<TokenBlacklistDoc>;

  constructor(db: Db) {
    this.collection = db.collection<TokenBlacklistDoc>('token_blacklist');
  }

  async add(tokenHash: string, expiresAt: Date): Promise<void> {
    await this.collection.insertOne({
      _id: randomUUID(),
      tokenHash,
      expiresAt,
      createdAt: new Date(),
    });
  }

  async exists(tokenHash: string): Promise<boolean> {
    const doc = await this.collection.findOne({ tokenHash });
    return doc != null;
  }

  async deleteExpired(): Promise<number> {
    const now = new Date();
    const result = await this.collection.deleteMany({ expiresAt: { $lt: now } });
    return result.deletedCount;
  }
}
