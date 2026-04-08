import { test, expect } from '@playwright/test';
import { apiUrl, registerUser, loginAs, verifyEmail, resendVerification, registerAndVerify, getVerificationToken } from '../fixtures/api-helpers';
import { testCredentials } from '../fixtures';

test.describe('Auth API @api', () => {
  test('Register new user → 200 with generic message (no token in body)', async ({ request }) => {
    const email = `auth-test-${Date.now()}@example.com`;
    const response = await registerUser(request, {
      email,
      password: 'TestPass1',
      firstName: 'Auth',
      lastName: 'Tester',
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toContain('check your email');
    expect(body.verificationToken).toBeUndefined();
  });

  test('Register duplicate email → 200 with same generic message (no enumeration)', async ({ request }) => {
    const email = `auth-dup-${Date.now()}@example.com`;
    const userData = {
      email,
      password: 'TestPass1',
      firstName: 'Dup',
      lastName: 'User',
    };

    await registerUser(request, userData);
    const response = await registerUser(request, userData);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toContain('check your email');
    expect(body.verificationToken).toBeUndefined();
  });

  test('Login with pending account → 401 generic error (no enumeration)', async ({ request }) => {
    const email = `auth-pending-${Date.now()}@example.com`;
    await registerUser(request, {
      email,
      password: 'TestPass1',
      firstName: 'Pending',
      lastName: 'User',
    });

    const response = await request.post(apiUrl('/auth/login'), {
      data: { email, password: 'TestPass1' },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.message).toContain('Invalid email or password');
  });

  test('Login with non-existent email → same 401 as wrong password (no enumeration)', async ({ request }) => {
    const response = await request.post(apiUrl('/auth/login'), {
      data: { email: `nonexistent-${Date.now()}@example.com`, password: 'TestPass1' },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.message).toContain('Invalid email or password');
  });

  test('Verify email with valid token via POST → account approved', async ({ request }) => {
    const email = `auth-verify-${Date.now()}@example.com`;
    await registerUser(request, {
      email,
      password: 'TestPass1',
      firstName: 'Verify',
      lastName: 'User',
    });
    const token = await getVerificationToken(request, email);

    const verifyResponse = await verifyEmail(request, token);
    expect(verifyResponse.status()).toBe(200);
    const verifyBody = await verifyResponse.json();
    expect(verifyBody.user.status).toBe('approved');
    expect(verifyBody.message).toContain('Email verified successfully');

    // Now can login
    const cookie = await loginAs(request, { email, password: 'TestPass1' });
    expect(cookie).toContain('auth_token');
  });

  test('Verify with invalid token → 400', async ({ request }) => {
    const response = await verifyEmail(request, 'completely-invalid-token');
    expect(response.status()).toBe(400);
  });

  test('Verify already verified token → 400', async ({ request }) => {
    const email = `auth-double-${Date.now()}@example.com`;
    await registerUser(request, {
      email,
      password: 'TestPass1',
      firstName: 'Double',
      lastName: 'User',
    });
    const token = await getVerificationToken(request, email);

    // First verification succeeds
    const first = await verifyEmail(request, token);
    expect(first.status()).toBe(200);

    // Second verification fails
    const second = await verifyEmail(request, token);
    expect(second.status()).toBe(400);
  });

  test('Resend verification → new token works, old invalidated', async ({ request }) => {
    const email = `auth-resend-${Date.now()}@example.com`;
    await registerUser(request, {
      email,
      password: 'TestPass1',
      firstName: 'Resend',
      lastName: 'User',
    });
    const oldToken = await getVerificationToken(request, email);

    // Resend
    const resendResponse = await resendVerification(request, email);
    expect(resendResponse.status()).toBe(200);
    const resendBody = await resendResponse.json();
    expect(resendBody.verificationToken).toBeUndefined();

    // Get new token from dev mailbox
    const newToken = await getVerificationToken(request, email);
    expect(newToken).toBeTruthy();
    expect(newToken).not.toBe(oldToken);

    // Old token should be invalidated
    const oldVerify = await verifyEmail(request, oldToken);
    expect(oldVerify.status()).toBe(400);

    // New token should work
    const newVerify = await verifyEmail(request, newToken);
    expect(newVerify.status()).toBe(200);
  });

  test('Resend verification for non-pending account → 200 same message (no enumeration)', async ({ request }) => {
    // Use already-approved seeded user — should return same 200 as pending account
    const response = await resendVerification(request, testCredentials.user.email);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toContain('If a pending account exists');
  });

  test('Resend verification for non-existent email → 200 same message (no enumeration)', async ({ request }) => {
    const response = await resendVerification(request, `nonexistent-${Date.now()}@example.com`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toContain('If a pending account exists');
  });

  test('Web login → 200 + cookie, no token in body', async ({ request }) => {
    const response = await request.post(apiUrl('/auth/login'), {
      data: testCredentials.user,
    });

    expect(response.status()).toBe(200);
    const cookies = response.headers()['set-cookie'] || '';
    expect(cookies).toContain('auth_token');
    const body = await response.json();
    expect(body.token).toBeUndefined();
    expect(body.user).toBeDefined();
  });

  test('Mobile login → 200 + token in body, no cookie', async ({ request }) => {
    const response = await request.post(apiUrl('/auth/login'), {
      data: testCredentials.user,
      headers: { 'X-Client-Type': 'mobile' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token).toBeTruthy();
    expect(body.user).toBeDefined();
    const cookies = response.headers()['set-cookie'] || '';
    expect(cookies).not.toContain('auth_token');
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

  test('Logout invalidates the token', async ({ request }) => {
    const cookie = await loginAs(request, testCredentials.user);
    expect(cookie).toContain('auth_token');

    const meResponse = await request.get(apiUrl('/auth/me'), {
      headers: { Cookie: cookie },
    });
    expect(meResponse.status()).toBe(200);

    const logoutResponse = await request.post(apiUrl('/auth/logout'), {
      headers: { Cookie: cookie },
    });
    expect(logoutResponse.ok()).toBeTruthy();

    const revokedResponse = await request.get(apiUrl('/auth/me'), {
      headers: { Cookie: cookie },
    });
    expect(revokedResponse.status()).toBe(401);
  });

  test('Register with password exceeding 72 chars → 400', async ({ request }) => {
    const response = await registerUser(request, {
      email: `auth-long-pw-${Date.now()}@example.com`,
      password: 'A'.repeat(71) + 'a1',
      firstName: 'Long',
      lastName: 'Password',
    });

    expect(response.status()).toBe(400);
  });

  test('Full flow: register → verify (POST) → login → me → logout', async ({ request }) => {
    const email = `auth-flow-${Date.now()}@example.com`;
    const password = 'TestPass1';

    // Register (creates pending account)
    const regResponse = await registerUser(request, {
      email,
      password,
      firstName: 'Flow',
      lastName: 'Tester',
    });
    expect(regResponse.status()).toBe(200);
    const regBody = await regResponse.json();
    expect(regBody.message).toContain('check your email');
    expect(regBody.verificationToken).toBeUndefined();

    // Get verification token from dev mailbox
    const token = await getVerificationToken(request, email);
    expect(token).toBeTruthy();

    // Verify email via POST
    const verifyResponse = await verifyEmail(request, token);
    expect(verifyResponse.status()).toBe(200);

    // Login (now approved)
    const cookie = await loginAs(request, { email, password });
    expect(cookie).toContain('auth_token');

    // Me (authenticated)
    const meResponse = await request.get(apiUrl('/auth/me'), {
      headers: { Cookie: cookie },
    });
    expect(meResponse.status()).toBe(200);
    const meBody = await meResponse.json();
    expect(meBody.user.email).toBe(email);

    // Logout
    const logoutResponse = await request.post(apiUrl('/auth/logout'), {
      headers: { Cookie: cookie },
    });
    expect(logoutResponse.ok()).toBeTruthy();
  });

  test('GET /auth/verify returns 404 (POST only)', async ({ request }) => {
    const response = await request.get(apiUrl('/auth/verify?token=some-token'));
    // NestJS returns 404 for unregistered GET routes
    expect(response.status()).toBe(404);
  });
});
