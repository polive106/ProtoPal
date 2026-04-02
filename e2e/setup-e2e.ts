import { execSync } from 'child_process';
import { resolve } from 'path';

const E2E_DATABASE_PATH = resolve(__dirname, '../data/e2e-test.db');

// Kill any existing dev servers on ports 3000 and 5173
try {
  execSync('lsof -ti:3000 | xargs kill -9 2>/dev/null || true', { stdio: 'ignore' });
  execSync('lsof -ti:5173 | xargs kill -9 2>/dev/null || true', { stdio: 'ignore' });
} catch {
  // Ignore errors - ports may not be in use
}

// Seed the test database
console.log('Seeding E2E test database...');
execSync(`DATABASE_PATH=${E2E_DATABASE_PATH} tsx packages/database/src/seed.ts`, {
  stdio: 'inherit',
  cwd: resolve(__dirname, '..'),
});
console.log('E2E setup complete.');
