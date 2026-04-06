export interface RateLimitEntry {
  key: string;
  count: number;
  windowStart: number;
  prevCount: number;
  prevWindowStart: number | null;
  expiresAt: number;
}

export interface RateLimitRepository {
  get(key: string): Promise<RateLimitEntry | null>;
  upsert(entry: RateLimitEntry): Promise<void>;
  deleteExpired(): Promise<number>;
  deleteAll(): Promise<void>;
}
