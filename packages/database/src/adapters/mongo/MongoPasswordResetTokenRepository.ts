import { randomUUID } from 'crypto';
import type { Db, Collection } from 'mongodb';
import type {
  PasswordResetTokenRepository,
  CreatePasswordResetTokenDTO,
  PasswordResetToken,
} from '@acme/domain';
import { ensureDate } from './utils';

interface PasswordResetTokenDoc {
  _id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export class MongoPasswordResetTokenRepository implements PasswordResetTokenRepository {
  private readonly collection: Collection<PasswordResetTokenDoc>;

  constructor(db: Db) {
    this.collection = db.collection<PasswordResetTokenDoc>('password_reset_tokens');
  }

  async create(dto: CreatePasswordResetTokenDTO): Promise<PasswordResetToken> {
    const now = new Date();
    const doc: PasswordResetTokenDoc = {
      _id: randomUUID(),
      userId: dto.userId,
      tokenHash: dto.tokenHash,
      expiresAt: dto.expiresAt,
      usedAt: null,
      createdAt: now,
    };
    await this.collection.insertOne(doc);
    return this.mapDoc(doc);
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const doc = await this.collection.findOne({ tokenHash });
    return doc ? this.mapDoc(doc) : null;
  }

  async markUsed(id: string): Promise<PasswordResetToken> {
    const now = new Date();
    const doc = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: { usedAt: now } },
      { returnDocument: 'after' },
    );
    if (!doc) throw new Error('Password reset token not found');
    return this.mapDoc(doc);
  }

  async invalidateByUserId(userId: string): Promise<void> {
    await this.collection.deleteMany({ userId, usedAt: null });
  }

  private mapDoc(doc: PasswordResetTokenDoc): PasswordResetToken {
    return {
      id: doc._id,
      userId: doc.userId,
      tokenHash: doc.tokenHash,
      expiresAt: ensureDate(doc.expiresAt),
      usedAt: doc.usedAt ?? null,
      createdAt: ensureDate(doc.createdAt),
    };
  }
}
