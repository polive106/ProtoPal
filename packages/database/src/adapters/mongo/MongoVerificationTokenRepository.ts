import { randomUUID } from 'crypto';
import type { Db, Collection } from 'mongodb';
import type {
  VerificationTokenRepository,
  CreateVerificationTokenDTO,
  VerificationToken,
} from '@acme/domain';
import { ensureDate } from './utils';

interface VerificationTokenDoc {
  _id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  verifiedAt: Date | null;
  createdAt: Date;
}

export class MongoVerificationTokenRepository implements VerificationTokenRepository {
  private readonly collection: Collection<VerificationTokenDoc>;

  constructor(db: Db) {
    this.collection = db.collection<VerificationTokenDoc>('verification_tokens');
  }

  async create(dto: CreateVerificationTokenDTO): Promise<VerificationToken> {
    const now = new Date();
    const doc: VerificationTokenDoc = {
      _id: randomUUID(),
      userId: dto.userId,
      tokenHash: dto.tokenHash,
      expiresAt: dto.expiresAt,
      verifiedAt: null,
      createdAt: now,
    };
    await this.collection.insertOne(doc);
    return this.mapDoc(doc);
  }

  async findByTokenHash(tokenHash: string): Promise<VerificationToken | null> {
    const doc = await this.collection.findOne({ tokenHash });
    return doc ? this.mapDoc(doc) : null;
  }

  async findActiveByUserId(userId: string): Promise<VerificationToken | null> {
    const now = new Date();
    const doc = await this.collection.findOne({
      userId,
      verifiedAt: null,
      expiresAt: { $gt: now },
    });
    return doc ? this.mapDoc(doc) : null;
  }

  async markVerified(id: string): Promise<VerificationToken> {
    const now = new Date();
    const doc = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: { verifiedAt: now } },
      { returnDocument: 'after' },
    );
    if (!doc) throw new Error('Verification token not found');
    return this.mapDoc(doc);
  }

  async invalidateByUserId(userId: string): Promise<void> {
    await this.collection.deleteMany({ userId, verifiedAt: null });
  }

  private mapDoc(doc: VerificationTokenDoc): VerificationToken {
    return {
      id: doc._id,
      userId: doc.userId,
      tokenHash: doc.tokenHash,
      expiresAt: ensureDate(doc.expiresAt),
      verifiedAt: doc.verifiedAt ?? null,
      createdAt: ensureDate(doc.createdAt),
    };
  }
}
