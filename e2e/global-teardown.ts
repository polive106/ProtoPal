import { unlinkSync, existsSync } from 'fs';
import { resolve } from 'path';

const E2E_DATABASE_PATH = resolve(__dirname, '../data/e2e-test.db');

export default function globalTeardown() {
  if (existsSync(E2E_DATABASE_PATH)) {
    unlinkSync(E2E_DATABASE_PATH);
    console.log('Cleaned up E2E test database.');
  }
}
