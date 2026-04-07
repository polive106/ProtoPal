import type { LoginAttempt } from '../entities/LoginAttempt';

export interface LoginAttemptRepository {
  findByEmail(email: string): Promise<LoginAttempt | null>;
  upsertFailedAttempt(email: string, attempts: number, lockoutCount: number, lockedUntil: Date | null): Promise<LoginAttempt>;
  resetAttempts(email: string): Promise<void>;
  unlockAccount(email: string): Promise<void>;
}
