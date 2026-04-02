import { test, expect } from '@playwright/test';
import { apiUrl, registerUser, loginAs } from '../fixtures/api-helpers';
import { testCredentials } from '../fixtures';

test.describe('Auth API @api', () => {
  test('Register new user → 201', async ({ request }) => {
    const email = `auth-test-${Date.now()}@example.com`;
    const response = await registerUser(request, {
      email,
      password: 'TestPass1',
      firstName: 'Auth',
      lastName: 'Tester',
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.user.email).toBe(email);
  });

  test('Register duplicate email → 400', async ({ request }) => {
    const email = `auth-dup-${Date.now()}@example.com`;
    const userData = {
      email,
      password: 'TestPass1',
      firstName: 'Dup',
      lastName: 'User',
    };

    await registerUser(request, userData);
    const response = await registerUser(request, userData);

    expect(response.status()).toBe(400);
  });

  test('Login with valid credentials → 200 + cookie', async ({ request }) => {
    const response = await request.post(apiUrl('/auth/login'), {
      data: testCredentials.user,
    });

    expect(response.status()).toBe(200);
    const cookies = response.headers()['set-cookie'] || '';
    expect(cookies).toContain('auth_token');
  });

  test('Login with wrong password → 401', async ({ request }) => {
    const response = await request.post(apiUrl('/auth/login'), {
      data: { email: testCredentials.user.email, password: 'WrongPassword99' },
    });

    expect(response.status()).toBe(401);
  });

  test('Get me with cookie → 200', async ({ request }) => {
    const cookie = await loginAs(request, testCredentials.user);
    const response = await request.get(apiUrl('/auth/me'), {
      headers: { Cookie: cookie },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.user.email).toBe(testCredentials.user.email);
  });

  test('Get me without cookie → 401', async ({ request }) => {
    const response = await request.get(apiUrl('/auth/me'));

    expect(response.status()).toBe(401);
  });

  test('Full flow: register → login → me → logout', async ({ request }) => {
    const email = `auth-flow-${Date.now()}@example.com`;
    const password = 'TestPass1';

    // Register
    const regResponse = await registerUser(request, {
      email,
      password,
      firstName: 'Flow',
      lastName: 'Tester',
    });
    expect(regResponse.status()).toBe(201);

    // Login
    const cookie = await loginAs(request, { email, password });
    expect(cookie).toContain('auth_token');

    // Me (authenticated)
    const meResponse = await request.get(apiUrl('/auth/me'), {
      headers: { Cookie: cookie },
    });
    expect(meResponse.status()).toBe(200);
    const meBody = await meResponse.json();
    expect(meBody.user.email).toBe(email);

    // Logout clears the cookie
    const logoutResponse = await request.post(apiUrl('/auth/logout'), {
      headers: { Cookie: cookie },
    });
    expect(logoutResponse.ok()).toBeTruthy();
    const logoutBody = await logoutResponse.json();
    expect(logoutBody.message).toBe('Logged out successfully');
  });
});
