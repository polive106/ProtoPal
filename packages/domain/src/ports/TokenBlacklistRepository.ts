export interface TokenBlacklistRepository {
  add(tokenHash: string, expiresAt: Date): Promise<void>;
  exists(tokenHash: string): Promise<boolean>;
  deleteExpired(): Promise<number>;
}
