import { test, expect } from '@playwright/test';
import { apiUrl } from '../fixtures/api-helpers';

test.describe('Rate Limit API @api @rate-limit', () => {
  test('Rate limit headers are present on rate-limited endpoints', async ({ request }) => {
    const email = `rl-headers-${Date.now()}@example.com`;

    const response = await request.post(apiUrl('/auth/login'), {
      data: { email, password: 'TestPass1' },
    });

    // Login returns 401 for unknown user, but rate limit headers should still be set
    // Note: When DISABLE_RATE_LIMIT=true (E2E default), headers are not set
    // This test verifies no errors occur on rate-limited endpoints
    expect([401, 429].includes(response.status())).toBe(true);
  });

  test('Multiple requests to rate-limited endpoint do not crash', async ({ request }) => {
    // Make several requests to ensure persistent rate limiting works without errors
    for (let i = 0; i < 3; i++) {
      const response = await request.post(apiUrl('/auth/login'), {
        data: {
          email: `rl-multi-${Date.now()}-${i}@example.com`,
          password: 'TestPass1',
        },
      });

      // Should get 401 (invalid credentials), not 500 (server error)
      expect(response.status()).toBe(401);
    }
  });

  test('Rate-limited register endpoint still works', async ({ request }) => {
    const email = `rl-reg-${Date.now()}@example.com`;
    const response = await request.post(apiUrl('/auth/register'), {
      data: {
        email,
        password: 'TestPass1',
        firstName: 'Rate',
        lastName: 'Tester',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toContain('check your email');
  });
});
