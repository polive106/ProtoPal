import { randomUUID } from 'crypto';
import type { Db, Collection } from 'mongodb';
import type {
  PasswordResetTokenRepository,
  CreatePasswordResetTokenDTO,
  PasswordResetToken,
} from '@acme/domain';

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
    const doc = {
      _id: randomUUID(),
      userId: dto.userId,
      tokenHash: dto.tokenHash,
      expiresAt: dto.expiresAt,
      usedAt: null as Date | null,
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
    await this.collection.updateOne(
      { _id: id },
      { $set: { usedAt: now } },
    );
    const doc = await this.collection.findOne({ _id: id });
    if (!doc) throw new Error('Password reset token not found');
    return this.mapDoc(doc);
  }

  async invalidateByUserId(userId: string): Promise<void> {
    await this.collection.deleteMany({ userId, usedAt: null });
  }

  private mapDoc(doc: any): PasswordResetToken {
    return {
      id: doc._id,
      userId: doc.userId,
      tokenHash: doc.tokenHash,
      expiresAt: doc.expiresAt instanceof Date ? doc.expiresAt : new Date(doc.expiresAt),
      usedAt: doc.usedAt ?? null,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt),
    };
  }
}
