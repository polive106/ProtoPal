import { eq, lt } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { TokenBlacklistRepository } from '@acme/domain';
import type { DatabaseConnection } from '../../connections/sql';
import { tokenBlacklist } from '../../schema';

export class DrizzleTokenBlacklistRepository implements TokenBlacklistRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async add(tokenHash: string, expiresAt: Date): Promise<void> {
    this.db
      .insert(tokenBlacklist)
      .values({
        id: randomUUID(),
        tokenHash,
        expiresAt,
        createdAt: new Date(),
      })
      .run();
  }

  async exists(tokenHash: string): Promise<boolean> {
    const row = this.db
      .select({ id: tokenBlacklist.id })
      .from(tokenBlacklist)
      .where(eq(tokenBlacklist.tokenHash, tokenHash))
      .get();
    return row != null;
  }

  async deleteExpired(): Promise<number> {
    const now = new Date();
    const result = this.db
      .delete(tokenBlacklist)
      .where(lt(tokenBlacklist.expiresAt, now))
      .run();
    return result.changes;
  }
}
