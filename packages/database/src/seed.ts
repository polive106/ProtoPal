import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import { mkdirSync, existsSync, unlinkSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import * as schema from './schema';
import { getDatabase, isPostgresUrl, execSQL, type DatabaseConnection } from './connection';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || resolve(__dirname, '../../../data/app.db');
const BCRYPT_ROUNDS = 12;
const NO_RESET = process.argv.includes('--no-reset');
const IS_POSTGRES = isPostgresUrl(process.env.DATABASE_URL);

export const TEST_CREDENTIALS = {
  admin: { email: 'admin@example.com', password: 'Admin123!' },
  user: { email: 'user@example.com', password: 'User1234!' },
};

// Fixed IDs for test data
const IDS = {
  roles: { admin: 'role-admin', user: 'role-user' },
  users: { admin: 'user-admin-1', user: 'user-regular-1' },
  notes: { note1: 'note-1', note2: 'note-2', note3: 'note-3' },
};

async function seed() {
  console.log('Seeding database...');

  let db: DatabaseConnection;

  if (IS_POSTGRES) {
    db = await getDatabase();
  } else {
    if (!NO_RESET && existsSync(DB_PATH)) {
      unlinkSync(DB_PATH);
      console.log('  Removed existing database');
    }
    const dir = dirname(DB_PATH);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const sqlite = new Database(DB_PATH);
    sqlite.pragma('foreign_keys = ON');
    db = drizzle(sqlite, { schema });

    // Create tables
    db.run(sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'pending',
        last_login_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    db.run(sql`
      CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        description TEXT,
        is_system INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    db.run(sql`
      CREATE TABLE IF NOT EXISTS user_roles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        assigned_at INTEGER NOT NULL,
        assigned_by TEXT REFERENCES users(id)
      )
    `);
    db.run(sql`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    db.run(sql`
      CREATE TABLE IF NOT EXISTS token_blacklist (
        id TEXT PRIMARY KEY,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
    db.run(sql`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at INTEGER NOT NULL,
        verified_at INTEGER,
        created_at INTEGER NOT NULL
      )
    `);
  }

  const now = Date.now();
  const adminHash = await bcrypt.hash(TEST_CREDENTIALS.admin.password, BCRYPT_ROUNDS);
  const userHash = await bcrypt.hash(TEST_CREDENTIALS.user.password, BCRYPT_ROUNDS);

  // Seed roles
  await execSQL(db, sql`INSERT OR REPLACE INTO roles (id, name, display_name, description, is_system, created_at, updated_at) VALUES (${IDS.roles.admin}, 'admin', 'Administrator', 'Full system access', 1, ${now}, ${now})`);
  await execSQL(db, sql`INSERT OR REPLACE INTO roles (id, name, display_name, description, is_system, created_at, updated_at) VALUES (${IDS.roles.user}, 'user', 'User', 'Regular user', 1, ${now}, ${now})`);

  // Seed users
  await execSQL(db, sql`INSERT OR REPLACE INTO users (id, email, password_hash, first_name, last_name, is_active, status, created_at, updated_at) VALUES (${IDS.users.admin}, ${TEST_CREDENTIALS.admin.email}, ${adminHash}, 'Admin', 'User', 1, 'approved', ${now}, ${now})`);
  await execSQL(db, sql`INSERT OR REPLACE INTO users (id, email, password_hash, first_name, last_name, is_active, status, created_at, updated_at) VALUES (${IDS.users.user}, ${TEST_CREDENTIALS.user.email}, ${userHash}, 'Regular', 'User', 1, 'approved', ${now}, ${now})`);

  // Seed user roles
  await execSQL(db, sql`INSERT OR REPLACE INTO user_roles (id, user_id, role_id, assigned_at) VALUES ('ur-1', ${IDS.users.admin}, ${IDS.roles.admin}, ${now})`);
  await execSQL(db, sql`INSERT OR REPLACE INTO user_roles (id, user_id, role_id, assigned_at) VALUES ('ur-2', ${IDS.users.user}, ${IDS.roles.user}, ${now})`);

  // Seed notes
  await execSQL(db, sql`INSERT OR REPLACE INTO notes (id, title, content, user_id, created_at, updated_at) VALUES (${IDS.notes.note1}, 'Getting Started', 'Welcome to the app! This is your first note.', ${IDS.users.user}, ${now}, ${now})`);
  await execSQL(db, sql`INSERT OR REPLACE INTO notes (id, title, content, user_id, created_at, updated_at) VALUES (${IDS.notes.note2}, 'Meeting Notes', 'Discussed project roadmap and next milestones.', ${IDS.users.user}, ${now}, ${now})`);
  await execSQL(db, sql`INSERT OR REPLACE INTO notes (id, title, content, user_id, created_at, updated_at) VALUES (${IDS.notes.note3}, 'Admin Notes', 'System configuration and maintenance schedule.', ${IDS.users.admin}, ${now}, ${now})`);

  console.log('Database seeded successfully!');
  console.log(`  Admin: ${TEST_CREDENTIALS.admin.email} / ${TEST_CREDENTIALS.admin.password}`);
  console.log(`  User: ${TEST_CREDENTIALS.user.email} / ${TEST_CREDENTIALS.user.password}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
