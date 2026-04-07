export interface LoginAttempt {
  id: string;
  email: string;
  attempts: number;
  lockoutCount: number;
  lockedUntil: Date | null;
  lastAttemptAt: Date;
  createdAt: Date;
}
