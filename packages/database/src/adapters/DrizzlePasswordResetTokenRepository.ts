import { eq, and, isNull } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type {
  PasswordResetTokenRepository,
  CreatePasswordResetTokenDTO,
  PasswordResetToken,
} from '@acme/domain';
import type { DatabaseConnection } from '../connection';
import { passwordResetTokens } from '../schema';

export class DrizzlePasswordResetTokenRepository implements PasswordResetTokenRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async create(dto: CreatePasswordResetTokenDTO): Promise<PasswordResetToken> {
    const now = new Date();
    const id = randomUUID();
    const row = {
      id,
      userId: dto.userId,
      tokenHash: dto.tokenHash,
      expiresAt: dto.expiresAt,
      usedAt: null,
      createdAt: now,
    };
    this.db.insert(passwordResetTokens).values(row).run();
    return row;
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const row = this.db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
      .get();
    return row ? this.mapRow(row) : null;
  }

  async markUsed(id: string): Promise<PasswordResetToken> {
    const now = new Date();
    const rows = this.db
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(eq(passwordResetTokens.id, id))
      .returning();
    const row = rows.get();
    if (!row) {
      throw new Error('Password reset token not found');
    }
    return this.mapRow(row);
  }

  async invalidateByUserId(userId: string): Promise<void> {
    this.db
      .delete(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, userId),
          isNull(passwordResetTokens.usedAt),
        ),
      )
      .run();
  }

  private mapRow(row: typeof passwordResetTokens.$inferSelect): PasswordResetToken {
    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      usedAt: row.usedAt ?? null,
      createdAt: row.createdAt,
    };
  }
}
