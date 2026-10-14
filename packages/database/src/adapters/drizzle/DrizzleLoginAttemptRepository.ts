import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { LoginAttemptRepository, LoginAttempt } from '@acme/domain';
import type { DatabaseConnection } from '../../connections/sql';
import { loginAttempts } from '../../schema';

export class DrizzleLoginAttemptRepository implements LoginAttemptRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async findByEmail(email: string): Promise<LoginAttempt | null> {
    const [row] = await this.db
      .select()
      .from(loginAttempts)
      .where(eq(loginAttempts.email, email))
      .limit(1);
    return row ? this.mapRow(row) : null;
  }

  async upsertFailedAttempt(
    email: string,
    attempts: number,
    lockoutCount: number,
    lockedUntil: Date | null,
  ): Promise<LoginAttempt> {
    const now = new Date();
    const id = randomUUID();
    await this.db
      .insert(loginAttempts)
      .values({
        id,
        email,
        attempts,
        lockoutCount,
        lockedUntil,
        lastAttemptAt: now,
        createdAt: now,
      })
      .onConflictDoUpdate({
        target: loginAttempts.email,
        set: {
          attempts,
          lockoutCount,
          lockedUntil,
          lastAttemptAt: now,
        },
      });
    const row = await this.findByEmail(email);
    if (!row) throw new Error('Failed to upsert login attempt');
    return row;
  }

  async resetAttempts(email: string): Promise<void> {
    await this.db
      .update(loginAttempts)
      .set({ attempts: 0, lockedUntil: null })
      .where(eq(loginAttempts.email, email));
  }

  async unlockAccount(email: string): Promise<void> {
    await this.db
      .update(loginAttempts)
      .set({ attempts: 0, lockoutCount: 0, lockedUntil: null })
      .where(eq(loginAttempts.email, email));
  }

  private mapRow(row: any): LoginAttempt {
    return {
      id: row.id,
      email: row.email,
      attempts: row.attempts,
      lockoutCount: row.lockoutCount,
      lockedUntil: row.lockedUntil ?? null,
      lastAttemptAt: row.lastAttemptAt instanceof Date ? row.lastAttemptAt : new Date(row.lastAttemptAt),
      createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
    };
  }
}
