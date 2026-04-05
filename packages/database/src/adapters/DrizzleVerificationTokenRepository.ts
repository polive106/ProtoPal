import { eq, and, isNull, gt } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type {
  VerificationTokenRepository,
  CreateVerificationTokenDTO,
  VerificationToken,
} from '@acme/domain';
import type { DatabaseConnection } from '../connection';
import { verificationTokens } from '../schema';

export class DrizzleVerificationTokenRepository implements VerificationTokenRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async create(dto: CreateVerificationTokenDTO): Promise<VerificationToken> {
    const now = new Date();
    const id = randomUUID();
    const row = {
      id,
      userId: dto.userId,
      tokenHash: dto.tokenHash,
      expiresAt: dto.expiresAt,
      verifiedAt: null,
      createdAt: now,
    };
    this.db.insert(verificationTokens).values(row).run();
    return row;
  }

  async findByTokenHash(tokenHash: string): Promise<VerificationToken | null> {
    const row = this.db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.tokenHash, tokenHash))
      .get();
    return row ? this.mapRow(row) : null;
  }

  async findActiveByUserId(userId: string): Promise<VerificationToken | null> {
    const now = new Date();
    const row = this.db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.userId, userId),
          isNull(verificationTokens.verifiedAt),
          gt(verificationTokens.expiresAt, now),
        ),
      )
      .get();
    return row ? this.mapRow(row) : null;
  }

  async markVerified(id: string): Promise<VerificationToken> {
    const now = new Date();
    this.db
      .update(verificationTokens)
      .set({ verifiedAt: now })
      .where(eq(verificationTokens.id, id))
      .run();
    const row = this.db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.id, id))
      .get();
    if (!row) {
      throw new Error('Verification token not found after update');
    }
    return this.mapRow(row);
  }

  async invalidateByUserId(userId: string): Promise<void> {
    this.db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.userId, userId),
          isNull(verificationTokens.verifiedAt),
        ),
      )
      .run();
  }

  private mapRow(row: typeof verificationTokens.$inferSelect): VerificationToken {
    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      verifiedAt: row.verifiedAt ?? null,
      createdAt: row.createdAt,
    };
  }
}
