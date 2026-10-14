import { describe, it, expect, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { createConnection, closeConnection } from './connections/sql';
import { users, roles, userRoles, notes } from './schema';

const SEED_SCRIPT = resolve(__dirname, 'seed.ts');
const TSX = resolve(__dirname, '../../../node_modules/.bin/tsx');

function runSeed(env: Record<string, string> = {}, args = '') {
  return execSync(`${TSX} ${SEED_SCRIPT} ${args}`, {
    env: { ...process.env, ...env },
    encoding: 'utf-8',
    timeout: 30_000,
    cwd: resolve(__dirname, '../../..'),
  });
}

describe('seed script', { timeout: 60_000 }, () => {
  let dataDir: string | undefined;

  function tmpDataDir(): string {
    dataDir = join(mkdtempSync(join(tmpdir(), 'seed-test-')), 'pglite');
    return dataDir;
  }

  afterEach(() => {
    if (dataDir) rmSync(dirname(dataDir), { recursive: true, force: true });
    dataDir = undefined;
  });

  describe('production safety guard', () => {
    it('exits with code 1 when NODE_ENV is production', () => {
      expect(() =>
        runSeed({ NODE_ENV: 'production' }),
      ).toThrow();

      try {
        runSeed({ NODE_ENV: 'production' });
      } catch (err: any) {
        expect(err.status).toBe(1);
        expect(err.stderr.toString()).toContain(
          'Seed script cannot run in production',
        );
      }
    });
  });

  describe('credential exposure', () => {
    it('does not export TEST_CREDENTIALS from the package', async () => {
      const indexExports = await import('./index');
      expect(indexExports).not.toHaveProperty('TEST_CREDENTIALS');
    });

    it('does not print plaintext passwords to stdout', () => {
      const stdout = runSeed({
        NODE_ENV: 'development',
        DATABASE_PATH: tmpDataDir(),
      });

      // Known seed passwords should NOT appear in output
      expect(stdout).not.toContain('Admin123!');
      expect(stdout).not.toContain('User1234!');

      // But emails should still be shown (for convenience)
      expect(stdout).toContain('admin@example.com');
      expect(stdout).toContain('user@example.com');
    });
  });

  describe('seeded data', () => {
    it('creates the schema and inserts roles, users, assignments and notes', async () => {
      const dir = tmpDataDir();
      runSeed({ NODE_ENV: 'development', DATABASE_PATH: dir });

      const db = await createConnection(dir);
      try {
        expect(await db.select().from(roles)).toHaveLength(2);
        expect(await db.select().from(users)).toHaveLength(2);
        expect(await db.select().from(userRoles)).toHaveLength(2);
        expect(await db.select().from(notes)).toHaveLength(3);
      } finally {
        await closeConnection(db);
      }
    });

    it('is idempotent when re-run with --no-reset', async () => {
      const dir = tmpDataDir();
      runSeed({ NODE_ENV: 'development', DATABASE_PATH: dir });
      runSeed({ NODE_ENV: 'development', DATABASE_PATH: dir }, '--no-reset');

      const db = await createConnection(dir);
      try {
        expect(await db.select().from(users)).toHaveLength(2);
        expect(await db.select().from(notes)).toHaveLength(3);
      } finally {
        await closeConnection(db);
      }
    });
  });
});
