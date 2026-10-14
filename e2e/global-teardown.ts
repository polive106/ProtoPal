import { rmSync, existsSync } from 'fs';
import { resolve } from 'path';

const E2E_DATABASE_PATH = resolve(__dirname, '../data/pglite-e2e');

export default function globalTeardown() {
  if (existsSync(E2E_DATABASE_PATH)) {
    rmSync(E2E_DATABASE_PATH, { recursive: true, force: true });
    console.log('Cleaned up E2E test database.');
  }
}
