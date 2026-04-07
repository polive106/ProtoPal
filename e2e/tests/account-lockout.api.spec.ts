import { test, expect } from '@playwright/test';
import { apiUrl, registerAndVerify, loginAs } from '../fixtures/api-helpers';
import { testCredentials } from '../fixtures';

test.describe('Account Lockout @api', () => {
  test('Account locks after 5 failed login attempts and returns 429 with Retry-After', async ({ request }) => {
    // Register and verify a fresh user to avoid interfering with seeded users
    const email = `lockout-${Date.now()}@example.com`;
    const password = 'TestPass1';
    await registerAndVerify(request, {
      email,
      password,
      firstName: 'Lockout',
      lastName: 'Tester',
    });

    // Submit 5 incorrect passwords
    for (let i = 0; i < 5; i++) {
      const res = await request.post(apiUrl('/auth/login'), {
        data: { email, password: 'WrongPassword99' },
      });
      expect(res.status()).toBe(401);
    }

    // 6th attempt should return 429
    const lockedRes = await request.post(apiUrl('/auth/login'), {
      data: { email, password: 'WrongPassword99' },
    });
    expect(lockedRes.status()).toBe(429);
    const headers = lockedRes.headers();
    expect(headers['retry-after']).toBeTruthy();
    const body = await lockedRes.json();
    expect(body.message).toContain('locked');
    expect(body.retryAfter).toBeGreaterThan(0);
  });

  test('Even correct password is rejected when account is locked', async ({ request }) => {
    const email = `lockout-correct-${Date.now()}@example.com`;
    const password = 'TestPass1';
    await registerAndVerify(request, {
      email,
      password,
      firstName: 'Lockout',
      lastName: 'Correct',
    });

    // Lock the account
    for (let i = 0; i < 5; i++) {
      await request.post(apiUrl('/auth/login'), {
        data: { email, password: 'WrongPassword99' },
      });
    }

    // Even correct password should be rejected
    const res = await request.post(apiUrl('/auth/login'), {
      data: { email, password },
    });
    expect(res.status()).toBe(429);
  });

  test('Successful login resets failure counter', async ({ request }) => {
    const email = `lockout-reset-${Date.now()}@example.com`;
    const password = 'TestPass1';
    await registerAndVerify(request, {
      email,
      password,
      firstName: 'Reset',
      lastName: 'Tester',
    });

    // 4 failed attempts (not enough to lock)
    for (let i = 0; i < 4; i++) {
      await request.post(apiUrl('/auth/login'), {
        data: { email, password: 'WrongPassword99' },
      });
    }

    // Successful login resets counter
    const successRes = await request.post(apiUrl('/auth/login'), {
      data: { email, password },
    });
    expect(successRes.status()).toBe(200);

    // Now 5 more failed attempts should be needed to lock
    for (let i = 0; i < 4; i++) {
      const res = await request.post(apiUrl('/auth/login'), {
        data: { email, password: 'WrongPassword99' },
      });
      expect(res.status()).toBe(401);
    }

    // Still not locked after 4 more
    const res = await request.post(apiUrl('/auth/login'), {
      data: { email, password },
    });
    expect(res.status()).toBe(200);
  });

  test('Admin can unlock a locked account', async ({ request }) => {
    const email = `lockout-admin-${Date.now()}@example.com`;
    const password = 'TestPass1';
    await registerAndVerify(request, {
      email,
      password,
      firstName: 'Admin',
      lastName: 'Unlock',
    });

    // Lock the account
    for (let i = 0; i < 5; i++) {
      await request.post(apiUrl('/auth/login'), {
        data: { email, password: 'WrongPassword99' },
      });
    }

    // Verify it's locked
    const lockedRes = await request.post(apiUrl('/auth/login'), {
      data: { email, password },
    });
    expect(lockedRes.status()).toBe(429);

    // Login as admin
    const adminCookie = await loginAs(request, testCredentials.admin);
    expect(adminCookie).toContain('auth_token');

    // Admin unlocks the account
    const unlockRes = await request.post(apiUrl(`/admin/unlock-account/${email}`), {
      headers: { Cookie: adminCookie },
    });
    expect(unlockRes.status()).toBe(200);
    const unlockBody = await unlockRes.json();
    expect(unlockBody.message).toContain('unlocked');

    // User can now log in again
    const loginRes = await request.post(apiUrl('/auth/login'), {
      data: { email, password },
    });
    expect(loginRes.status()).toBe(200);
  });
});
