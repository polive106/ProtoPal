import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'path';

const E2E_DATABASE_PATH = resolve(__dirname, './data/e2e-test.db');

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  timeout: 30_000,

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  globalTeardown: './e2e/global-teardown.ts',

  projects: [
    {
      name: 'api',
      testMatch: /.*\.spec\.ts$/,
      grep: /@api/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      grep: /@ui/,
      dependencies: ['api'],
    },
    ...(process.env.CI
      ? []
      : [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            grep: /@ui/,
            dependencies: ['chromium'],
          },
          {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
            grep: /@ui/,
            dependencies: ['firefox'],
          },
        ]),
  ],

  webServer: [
    {
      command: 'pnpm --filter @acme/api dev',
      url: 'http://localhost:3000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'ignore',
      stderr: 'pipe',
      env: {
        DATABASE_PATH: E2E_DATABASE_PATH,
        DISABLE_RATE_LIMIT: 'true',
        NODE_ENV: 'test',
        JWT_SECRET: 'e2e-test-jwt-secret-at-least-32-characters-long',
      },
    },
    {
      command: 'pnpm --filter @acme/frontend dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});
