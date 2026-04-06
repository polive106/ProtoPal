import { test, expect } from '@playwright/test';
import { apiUrl, registerUser, loginAs, verifyEmail, resendVerification, registerAndVerify } from '../fixtures/api-helpers';
import { testCredentials } from '../fixtures';

test.describe('Auth API @api', () => {
  test('Register new user → 201 with pending status', async ({ request }) => {
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
    expect(body.user.status).toBe('pending');
    expect(body.message).toContain('check your email');
    expect(body.verificationToken).toBeTruthy();
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

  test('Login with pending account → 401 "Please verify your email"', async ({ request }) => {
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
    expect(body.message).toContain('Please verify your email');
  });

  test('Verify email with valid token → account approved', async ({ request }) => {
    const email = `auth-verify-${Date.now()}@example.com`;
    const regResponse = await registerUser(request, {
      email,
      password: 'TestPass1',
      firstName: 'Verify',
      lastName: 'User',
    });
    const regBody = await regResponse.json();
    const token = regBody.verificationToken;

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
    const regResponse = await registerUser(request, {
      email,
      password: 'TestPass1',
      firstName: 'Double',
      lastName: 'User',
    });
    const regBody = await regResponse.json();
    const token = regBody.verificationToken;

    // First verification succeeds
    const first = await verifyEmail(request, token);
    expect(first.status()).toBe(200);

    // Second verification fails
    const second = await verifyEmail(request, token);
    expect(second.status()).toBe(400);
  });

  test('Resend verification → new token works, old invalidated', async ({ request }) => {
    const email = `auth-resend-${Date.now()}@example.com`;
    const regResponse = await registerUser(request, {
      email,
      password: 'TestPass1',
      firstName: 'Resend',
      lastName: 'User',
    });
    const regBody = await regResponse.json();
    const oldToken = regBody.verificationToken;

    // Resend
    const resendResponse = await resendVerification(request, email);
    expect(resendResponse.status()).toBe(200);
    const resendBody = await resendResponse.json();
    const newToken = resendBody.verificationToken;
    expect(newToken).toBeTruthy();
    expect(newToken).not.toBe(oldToken);

    // Old token should be invalidated
    const oldVerify = await verifyEmail(request, oldToken);
    expect(oldVerify.status()).toBe(400);

    // New token should work
    const newVerify = await verifyEmail(request, newToken);
    expect(newVerify.status()).toBe(200);
  });

  test('Resend verification for non-pending account → 400', async ({ request }) => {
    // Use already-approved seeded user
    const response = await resendVerification(request, testCredentials.user.email);
    expect(response.status()).toBe(400);
  });

  test('Login with valid credentials (seeded user) → 200 + cookie', async ({ request }) => {
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

  test('Register with oversized password → 400', async ({ request }) => {
    const response = await registerUser(request, {
      email: `auth-long-pw-${Date.now()}@example.com`,
      password: 'A'.repeat(71) + 'a1',
      firstName: 'Long',
      lastName: 'Password',
    });

    expect(response.status()).toBe(400);
  });

  test('Full flow: register → verify → login → me → logout', async ({ request }) => {
    const email = `auth-flow-${Date.now()}@example.com`;
    const password = 'TestPass1';

    // Register (creates pending account)
    const regResponse = await registerUser(request, {
      email,
      password,
      firstName: 'Flow',
      lastName: 'Tester',
    });
    expect(regResponse.status()).toBe(201);
    const regBody = await regResponse.json();
    expect(regBody.user.status).toBe('pending');

    // Verify email
    const verifyResponse = await verifyEmail(request, regBody.verificationToken);
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
});
