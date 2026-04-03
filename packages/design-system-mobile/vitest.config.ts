import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    exclude: ['dist/**', 'node_modules/**'],
    passWithNoTests: true,
  },
});
