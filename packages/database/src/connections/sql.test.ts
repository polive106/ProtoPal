import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { sql } from 'drizzle-orm';
import {
  createConnection,
  createTestConnection,
  closeConnection,
  isPostgresUrl,
  type DatabaseConnection,
} from './sql';
import { users } from '../schema';

const EXPECTED_TABLES = [
  'login_attempts',
  'notes',
  'password_reset_tokens',
  'rate_limit_entries',
  'roles',
  'token_blacklist',
  'user_roles',
  'users',
  'verification_tokens',
];

async function listTables(db: DatabaseConnection): Promise<string[]> {
  const rows = await db
    .select({ name: sql<string>`table_name` })
    .from(sql`information_schema.tables`)
    .where(sql`table_schema = 'public'`);
  return rows.map((r) => r.name).sort();
}

describe('isPostgresUrl', () => {
  it('accepts postgres:// and postgresql:// URLs', () => {
    expect(isPostgresUrl('postgres://u:p@localhost/db')).toBe(true);
    expect(isPostgresUrl('postgresql://u:p@localhost/db')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isPostgresUrl(undefined)).toBe(false);
    expect(isPostgresUrl('./data/pglite')).toBe(false);
    expect(isPostgresUrl('mongodb://localhost')).toBe(false);
  });
});

describe('createTestConnection', () => {
  let db: DatabaseConnection | undefined;

  afterEach(async () => {
    if (db) await closeConnection(db);
    db = undefined;
  });

  it('returns an in-memory database with all migrations applied', async () => {
    db = await createTestConnection();
    expect(await listTables(db)).toEqual(EXPECTED_TABLES);
  });

  it('round-trips booleans and timestamps as native types', async () => {
    db = await createTestConnection();
    const createdAt = new Date('2026-01-02T03:04:05.678Z');
    await db.insert(users).values({
      id: 'u1',
      email: 'a@example.com',
      firstName: 'A',
      lastName: 'B',
      createdAt,
      updatedAt: createdAt,
    });
    const [row] = await db.select().from(users);
    expect(row!.isActive).toBe(true);
    expect(row!.createdAt).toBeInstanceOf(Date);
    expect(row!.createdAt.getTime()).toBe(createdAt.getTime());
  });
});

describe('createConnection (PGlite)', () => {
  let dataDir: string;
  let db: DatabaseConnection | undefined;
  const originalPath = process.env.DATABASE_PATH;
  const originalUrl = process.env.DATABASE_URL;

  afterEach(async () => {
    if (db) await closeConnection(db);
    db = undefined;
    rmSync(dataDir, { recursive: true, force: true });
    process.env.DATABASE_PATH = originalPath;
    process.env.DATABASE_URL = originalUrl;
  });

  it('creates a file-backed PGlite database at DATABASE_PATH and migrates it', async () => {
    dataDir = join(mkdtempSync(join(tmpdir(), 'pglite-')), 'db');
    process.env.DATABASE_PATH = dataDir;
    delete process.env.DATABASE_URL;

    db = await createConnection();
    expect(await listTables(db)).toEqual(EXPECTED_TABLES);
  });

  it('persists data across connections to the same directory', async () => {
    dataDir = join(mkdtempSync(join(tmpdir(), 'pglite-')), 'db');
    process.env.DATABASE_PATH = dataDir;
    delete process.env.DATABASE_URL;

    const now = new Date();
    const first = await createConnection();
    await first.insert(users).values({
      id: 'u1',
      email: 'a@example.com',
      firstName: 'A',
      lastName: 'B',
      createdAt: now,
      updatedAt: now,
    });
    await closeConnection(first);

    db = await createConnection();
    const rows = await db.select().from(users);
    expect(rows).toHaveLength(1);
  });
});
