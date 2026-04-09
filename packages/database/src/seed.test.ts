import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { resolve } from 'path';

const SEED_SCRIPT = resolve(__dirname, 'seed.ts');
const TSX = resolve(__dirname, '../../../node_modules/.bin/tsx');

function runSeed(env: Record<string, string> = {}) {
  return execSync(`${TSX} ${SEED_SCRIPT}`, {
    env: { ...process.env, ...env },
    encoding: 'utf-8',
    timeout: 30_000,
    cwd: resolve(__dirname, '../../..'),
  });
}

describe('seed script', () => {
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
      // Run seed in development mode with an in-memory db path
      const tmpDbPath = resolve(__dirname, '../../../data/seed-test-tmp.db');
      const stdout = runSeed({
        NODE_ENV: 'development',
        DATABASE_PATH: tmpDbPath,
      });

      // Known seed passwords should NOT appear in output
      expect(stdout).not.toContain('Admin123!');
      expect(stdout).not.toContain('User1234!');

      // But emails should still be shown (for convenience)
      expect(stdout).toContain('admin@example.com');
      expect(stdout).toContain('user@example.com');

      // Clean up
      try {
        const { unlinkSync } = require('fs');
        unlinkSync(tmpDbPath);
      } catch {
        // ignore if doesn't exist
      }
    });
  });
});
