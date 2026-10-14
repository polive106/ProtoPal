import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite, type PgliteDatabase } from 'drizzle-orm/pglite';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import * as schema from '../schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_FOLDER = resolve(__dirname, '../../migrations');

/**
 * A Drizzle Postgres database. Locally and in tests it is backed by PGlite
 * (embedded Postgres); with a postgres:// DATABASE_URL it uses postgres-js.
 */
export type DatabaseConnection = PgDatabase<PgQueryResultHKT, typeof schema>;

export function isPostgresUrl(url?: string): boolean {
  return url != null && (url.startsWith('postgres://') || url.startsWith('postgresql://'));
}

function getDatabasePath(): string {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }
  return resolve(__dirname, '../../../../data/pglite');
}

function getClient(db: DatabaseConnection): unknown {
  return (db as unknown as { $client: unknown }).$client;
}

/** Applies pending migrations from packages/database/migrations. */
export async function migrateDatabase(db: DatabaseConnection): Promise<void> {
  if (getClient(db) instanceof PGlite) {
    const { migrate } = await import('drizzle-orm/pglite/migrator');
    await migrate(db as PgliteDatabase<typeof schema>, { migrationsFolder: MIGRATIONS_FOLDER });
  } else {
    const { migrate } = await import('drizzle-orm/postgres-js/migrator');
    await migrate(db as PostgresJsDatabase<typeof schema>, { migrationsFolder: MIGRATIONS_FOLDER });
  }
}

async function createPgliteConnection(dataDir?: string): Promise<DatabaseConnection> {
  if (dataDir) {
    mkdirSync(dirname(dataDir), { recursive: true });
  }
  const client = new PGlite(dataDir);
  const db = drizzlePglite(client, { schema }) as unknown as DatabaseConnection;
  await migrateDatabase(db);
  return db;
}

async function createPostgresConnection(url: string): Promise<DatabaseConnection> {
  const { default: postgres } = await import('postgres');
  const { drizzle: drizzlePg } = await import('drizzle-orm/postgres-js');
  const client = postgres(url);
  return drizzlePg(client, { schema }) as unknown as DatabaseConnection;
}

/**
 * Opens the application database. Uses Postgres when DATABASE_URL is a
 * postgres:// URL (migrations are applied separately via `db:migrate`);
 * otherwise opens a file-backed PGlite database at DATABASE_PATH and
 * migrates it automatically.
 */
export async function createConnection(dataDir?: string): Promise<DatabaseConnection> {
  const dbUrl = process.env.DATABASE_URL;
  if (isPostgresUrl(dbUrl)) {
    return createPostgresConnection(dbUrl!);
  }
  return createPgliteConnection(dataDir ?? getDatabasePath());
}

/** Fresh in-memory PGlite database with all migrations applied. */
export function createTestConnection(): Promise<DatabaseConnection> {
  return createPgliteConnection();
}

export async function closeConnection(db: DatabaseConnection): Promise<void> {
  const client = getClient(db);
  if (client instanceof PGlite) {
    await client.close();
  } else {
    await (client as { end(): Promise<void> }).end();
  }
}

let db: Promise<DatabaseConnection> | null = null;

export function getDatabase(): Promise<DatabaseConnection> {
  if (!db) {
    db = createConnection();
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (!db) return;
  const current = db;
  db = null;
  await closeConnection(await current);
}
