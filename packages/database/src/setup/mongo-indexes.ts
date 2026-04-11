import type { IndexDescription } from 'mongodb';

export const MONGO_INDEXES: Record<string, IndexDescription[]> = {
  users: [{ key: { email: 1 }, unique: true }],
  roles: [{ key: { name: 1 }, unique: true }],
  user_roles: [{ key: { userId: 1, roleId: 1 }, unique: true }],
  notes: [{ key: { userId: 1 } }],
  token_blacklist: [
    { key: { tokenHash: 1 }, unique: true },
    { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
  ],
  verification_tokens: [{ key: { expiresAt: 1 }, expireAfterSeconds: 0 }],
  password_reset_tokens: [{ key: { expiresAt: 1 }, expireAfterSeconds: 0 }],
  login_attempts: [{ key: { email: 1 }, unique: true }],
  // rate_limit_entries uses numeric timestamps (Date.now()), not Date objects.
  // MongoDB TTL indexes require Date fields, so expiry is handled by
  // MongoRateLimitRepository.deleteExpired() instead.
  rate_limit_entries: [],
};

export const COLLECTION_NAMES = Object.keys(MONGO_INDEXES);
