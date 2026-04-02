import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema.sqlite.ts',
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_PATH || '../../data/app.db',
  },
});
