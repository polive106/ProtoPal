import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'path';

const E2E_DATABASE_PATH = resolve(__dirname, './data/e2e-test.db');

// Cross-browser coverage is opt-in. By default — locally and in CI — the suite
// runs `api` + `chromium` only. Firefox/WebKit triple the @ui runtime and are
// chained serially (they share one seeded database), so they are reserved for
// explicit cross-browser checks: E2E_BROWSERS=all pnpm test:e2e
const crossBrowser = process.env.E2E_BROWSERS === 'all';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // NEVER use the bare 'html' reporter: it defaults to open: 'on-failure', which
  // serves the report on :9323 and blocks until Ctrl+C. Under an agent or any
  // other non-interactive runner that is an unrecoverable hang, so the report is
  // always written to disk and never served (view it with `pnpm test:e2e:report`).
  reporter: process.env.CI ? 'github' : [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,

  use: {
    baseURL: 'http://localhost:5173',
    locale: 'en-US',
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
    ...(crossBrowser
      ? [
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
        ]
      : []),
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
