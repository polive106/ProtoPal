import { pgTable, text, boolean, timestamp, integer, bigint } from 'drizzle-orm/pg-core';

// Timestamps are stored as timestamptz and surfaced as JS Dates.
const ts = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' });

// === USERS ===
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  status: text('status', {
    enum: ['pending', 'verified', 'approved', 'rejected'],
  })
    .notNull()
    .default('pending'),
  tokenVersion: integer('token_version').notNull().default(0),
  lastLoginAt: ts('last_login_at'),
  createdAt: ts('created_at').notNull(),
  updatedAt: ts('updated_at').notNull(),
});

// === ROLES ===
export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  isSystem: boolean('is_system').notNull().default(false),
  createdAt: ts('created_at').notNull(),
  updatedAt: ts('updated_at').notNull(),
});

// === USER ROLES ===
export const userRoles = pgTable('user_roles', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  roleId: text('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  assignedAt: ts('assigned_at').notNull(),
  assignedBy: text('assigned_by').references(() => users.id),
});

// === TOKEN BLACKLIST ===
export const tokenBlacklist = pgTable('token_blacklist', {
  id: text('id').primaryKey(),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: ts('expires_at').notNull(),
  createdAt: ts('created_at').notNull(),
});

// === VERIFICATION TOKENS ===
export const verificationTokens = pgTable('verification_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: ts('expires_at').notNull(),
  verifiedAt: ts('verified_at'),
  createdAt: ts('created_at').notNull(),
});

// === PASSWORD RESET TOKENS ===
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: ts('expires_at').notNull(),
  usedAt: ts('used_at'),
  createdAt: ts('created_at').notNull(),
});

// === RATE LIMIT ENTRIES ===
// Window timestamps are epoch milliseconds, which overflow a 32-bit integer.
export const rateLimitEntries = pgTable('rate_limit_entries', {
  key: text('key').primaryKey(),
  count: integer('count').notNull().default(0),
  windowStart: bigint('window_start', { mode: 'number' }).notNull(),
  prevCount: integer('prev_count').notNull().default(0),
  prevWindowStart: bigint('prev_window_start', { mode: 'number' }),
  expiresAt: bigint('expires_at', { mode: 'number' }).notNull(),
});

// === LOGIN ATTEMPTS ===
export const loginAttempts = pgTable('login_attempts', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  attempts: integer('attempts').notNull().default(0),
  lockoutCount: integer('lockout_count').notNull().default(0),
  lockedUntil: ts('locked_until'),
  lastAttemptAt: ts('last_attempt_at').notNull(),
  createdAt: ts('created_at').notNull(),
});

// === NOTES ===
export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: ts('created_at').notNull(),
  updatedAt: ts('updated_at').notNull(),
});
