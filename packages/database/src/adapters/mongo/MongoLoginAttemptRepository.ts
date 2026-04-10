import { randomUUID } from 'crypto';
import type { Db, Collection } from 'mongodb';
import type { LoginAttemptRepository, LoginAttempt } from '@acme/domain';

interface LoginAttemptDoc {
  _id: string;
  email: string;
  attempts: number;
  lockoutCount: number;
  lockedUntil: Date | null;
  lastAttemptAt: Date;
  createdAt: Date;
}

export class MongoLoginAttemptRepository implements LoginAttemptRepository {
  private readonly collection: Collection<LoginAttemptDoc>;

  constructor(db: Db) {
    this.collection = db.collection<LoginAttemptDoc>('login_attempts');
  }

  async findByEmail(email: string): Promise<LoginAttempt | null> {
    const doc = await this.collection.findOne({ email });
    return doc ? this.mapDoc(doc) : null;
  }

  async upsertFailedAttempt(
    email: string,
    attempts: number,
    lockoutCount: number,
    lockedUntil: Date | null,
  ): Promise<LoginAttempt> {
    const now = new Date();
    await this.collection.updateOne(
      { email },
      {
        $set: {
          attempts,
          lockoutCount,
          lockedUntil,
          lastAttemptAt: now,
        },
        $setOnInsert: {
          _id: randomUUID(),
          email,
          createdAt: now,
        },
      },
      { upsert: true },
    );
    const doc = await this.findByEmail(email);
    if (!doc) throw new Error('Failed to upsert login attempt');
    return doc;
  }

  async resetAttempts(email: string): Promise<void> {
    await this.collection.updateOne(
      { email },
      { $set: { attempts: 0, lockedUntil: null } },
    );
  }

  async unlockAccount(email: string): Promise<void> {
    await this.collection.updateOne(
      { email },
      { $set: { attempts: 0, lockoutCount: 0, lockedUntil: null } },
    );
  }

  private mapDoc(doc: any): LoginAttempt {
    return {
      id: doc._id,
      email: doc.email,
      attempts: doc.attempts,
      lockoutCount: doc.lockoutCount,
      lockedUntil: doc.lockedUntil ?? null,
      lastAttemptAt: doc.lastAttemptAt instanceof Date ? doc.lastAttemptAt : new Date(doc.lastAttemptAt),
      createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt),
    };
  }
}
