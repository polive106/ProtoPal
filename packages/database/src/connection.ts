import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { SQL } from 'drizzle-orm';
import * as sqliteSchema from './schema.sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type DatabaseConnection = ReturnType<typeof createSqliteConnection>;

export function isPostgresUrl(url?: string): boolean {
  return url != null && (url.startsWith('postgres://') || url.startsWith('postgresql://'));
}

function getDatabasePath(): string {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }
  return resolve(__dirname, '../../../data/app.db');
}

function createSqliteConnection(dbPath?: string) {
  const resolvedPath = dbPath ?? getDatabasePath();
  const dir = dirname(resolvedPath);
  mkdirSync(dir, { recursive: true });
  const sqlite = new Database(resolvedPath);
  sqlite.pragma('foreign_keys = ON');
  return drizzleSqlite(sqlite, { schema: sqliteSchema });
}

async function createPostgresConnection(url: string): Promise<DatabaseConnection> {
  const pgModule = await import('postgres');
  const postgres = pgModule.default;
  const { drizzle: drizzlePg } = await import('drizzle-orm/postgres-js');
  const pgSchema = await import('./schema.postgres');
  const client = postgres(url);
  return drizzlePg(client, { schema: pgSchema }) as unknown as DatabaseConnection;
}

export function createConnection(dbPath?: string): DatabaseConnection | Promise<DatabaseConnection> {
  const dbUrl = process.env.DATABASE_URL;
  if (isPostgresUrl(dbUrl)) {
    return createPostgresConnection(dbUrl!);
  }
  return createSqliteConnection(dbPath);
}

let db: DatabaseConnection | null = null;

export async function getDatabase(): Promise<DatabaseConnection> {
  if (!db) {
    db = await createConnection();
  }
  return db;
}

export function createTestConnection(): DatabaseConnection {
  const sqlite = new Database(':memory:');
  sqlite.pragma('foreign_keys = ON');
  return drizzleSqlite(sqlite, { schema: sqliteSchema });
}

export async function execSQL(db: DatabaseConnection, query: SQL): Promise<void> {
  if (isPostgresUrl(process.env.DATABASE_URL)) {
    await (db as any).execute(query);
  } else {
    db.run(query);
  }
}

export async function querySQL<T = Record<string, unknown>>(
  db: DatabaseConnection,
  query: SQL
): Promise<T[]> {
  if (isPostgresUrl(process.env.DATABASE_URL)) {
    return (await (db as any).execute(query)) as T[];
  }
  return db.all(query) as T[];
}

export function closeDatabase(): void {
  db = null;
}
