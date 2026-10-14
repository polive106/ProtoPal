import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;
const isPostgres =
  databaseUrl?.startsWith('postgres://') || databaseUrl?.startsWith('postgresql://');

// With DATABASE_URL pointing at Postgres, drizzle-kit targets that server.
// Otherwise it targets the local PGlite data directory.
export default defineConfig({
  schema: './src/schema/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  ...(isPostgres
    ? { dbCredentials: { url: databaseUrl! } }
    : {
        driver: 'pglite' as const,
        dbCredentials: { url: process.env.DATABASE_PATH || '../../data/pglite' },
      }),
});
