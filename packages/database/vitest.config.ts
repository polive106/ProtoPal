import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    hookTimeout: 30_000,
    // Each PGlite boot compiles Postgres to WASM; it can take several seconds under load
    testTimeout: 30_000,
  },
});
