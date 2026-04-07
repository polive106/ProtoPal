import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { resolve } from 'path';
import { mkdirSync, existsSync, unlinkSync } from 'fs';
import { dirname } from 'path';

const DB_PATH = process.env.DATABASE_PATH || resolve(__dirname, '../data/e2e-test.db');
const BCRYPT_ROUNDS = 10;

export const TEST_CREDENTIALS = {
  admin: { email: 'admin@example.com', password: 'Admin123!' },
  user: { email: 'user@example.com', password: 'User1234!' },
};

export const TEST_IDS = {
  roles: { admin: 'role-admin', user: 'role-user' },
  users: { admin: 'user-admin-1', user: 'user-regular-1' },
  notes: { note1: 'note-1', note2: 'note-2', note3: 'note-3' },
};

export async function seedTestDatabase() {
  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  if (existsSync(DB_PATH)) {
    unlinkSync(DB_PATH);
  }

  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'pending',
      token_version INTEGER NOT NULL DEFAULT 0,
      last_login_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      description TEXT,
      is_system INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      assigned_at INTEGER NOT NULL,
      assigned_by TEXT REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS token_blacklist (
      id TEXT PRIMARY KEY,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verification_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      verified_at INTEGER,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      used_at INTEGER,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rate_limit_entries (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0,
      window_start INTEGER NOT NULL,
      prev_count INTEGER NOT NULL DEFAULT 0,
      prev_window_start INTEGER,
      expires_at INTEGER NOT NULL
    );
  `);

  const now = Date.now();
  const adminHash = await bcrypt.hash(TEST_CREDENTIALS.admin.password, BCRYPT_ROUNDS);
  const userHash = await bcrypt.hash(TEST_CREDENTIALS.user.password, BCRYPT_ROUNDS);

  // Seed roles
  db.prepare('INSERT INTO roles (id, name, display_name, description, is_system, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(TEST_IDS.roles.admin, 'admin', 'Administrator', 'Full system access', 1, now, now);
  db.prepare('INSERT INTO roles (id, name, display_name, description, is_system, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(TEST_IDS.roles.user, 'user', 'User', 'Regular user', 1, now, now);

  // Seed users
  db.prepare('INSERT INTO users (id, email, password_hash, first_name, last_name, is_active, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(TEST_IDS.users.admin, TEST_CREDENTIALS.admin.email, adminHash, 'Admin', 'User', 1, 'approved', now, now);
  db.prepare('INSERT INTO users (id, email, password_hash, first_name, last_name, is_active, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(TEST_IDS.users.user, TEST_CREDENTIALS.user.email, userHash, 'Regular', 'User', 1, 'approved', now, now);

  // Seed user roles
  db.prepare('INSERT INTO user_roles (id, user_id, role_id, assigned_at) VALUES (?, ?, ?, ?)').run('ur-1', TEST_IDS.users.admin, TEST_IDS.roles.admin, now);
  db.prepare('INSERT INTO user_roles (id, user_id, role_id, assigned_at) VALUES (?, ?, ?, ?)').run('ur-2', TEST_IDS.users.user, TEST_IDS.roles.user, now);

  // Seed notes
  db.prepare('INSERT INTO notes (id, title, content, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(TEST_IDS.notes.note1, 'Getting Started', 'Welcome to the app! This is your first note.', TEST_IDS.users.user, now, now);
  db.prepare('INSERT INTO notes (id, title, content, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(TEST_IDS.notes.note2, 'Meeting Notes', 'Discussed project roadmap and next milestones.', TEST_IDS.users.user, now, now);
  db.prepare('INSERT INTO notes (id, title, content, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(TEST_IDS.notes.note3, 'Admin Notes', 'System configuration and maintenance schedule.', TEST_IDS.users.admin, now, now);

  db.close();
  console.log('E2E test database seeded successfully.');
}

// Run if called directly
seedTestDatabase().catch(console.error);
