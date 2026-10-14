import { eq, lt } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { TokenBlacklistRepository } from '@acme/domain';
import type { DatabaseConnection } from '../../connections/sql';
import { tokenBlacklist } from '../../schema';

export class DrizzleTokenBlacklistRepository implements TokenBlacklistRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async add(tokenHash: string, expiresAt: Date): Promise<void> {
    await this.db
      .insert(tokenBlacklist)
      .values({
        id: randomUUID(),
        tokenHash,
        expiresAt,
        createdAt: new Date(),
      });
  }

  async exists(tokenHash: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: tokenBlacklist.id })
      .from(tokenBlacklist)
      .where(eq(tokenBlacklist.tokenHash, tokenHash))
      .limit(1);
    return row != null;
  }

  async deleteExpired(): Promise<number> {
    const now = new Date();
    const deleted = await this.db
      .delete(tokenBlacklist)
      .where(lt(tokenBlacklist.expiresAt, now))
      .returning({ id: tokenBlacklist.id });
    return deleted.length;
  }
}
