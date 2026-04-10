import { randomUUID } from 'crypto';
import type { Db, Collection } from 'mongodb';
import type { LoginAttemptRepository, LoginAttempt } from '@acme/domain';
import { ensureDate } from './utils';

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
    const doc = await this.collection.findOneAndUpdate(
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
      { upsert: true, returnDocument: 'after' },
    );
    if (!doc) throw new Error('Failed to upsert login attempt');
    return this.mapDoc(doc);
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

  private mapDoc(doc: LoginAttemptDoc): LoginAttempt {
    return {
      id: doc._id,
      email: doc.email,
      attempts: doc.attempts,
      lockoutCount: doc.lockoutCount,
      lockedUntil: doc.lockedUntil ?? null,
      lastAttemptAt: ensureDate(doc.lastAttemptAt),
      createdAt: ensureDate(doc.createdAt),
    };
  }
}
