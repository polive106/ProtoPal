import { test, expect } from '@playwright/test';
import {
  apiUrl,
  registerUser,
  registerAndVerify,
  forgotPassword,
  resetPassword,
} from '../fixtures/api-helpers';

test.describe('Password Reset API @api', () => {
  test('Request reset for existing user → 200 with resetToken', async ({ request }) => {
    const email = `reset-test-${Date.now()}@example.com`;
    await registerAndVerify(request, {
      email,
      password: 'OldPass123',
      firstName: 'Reset',
      lastName: 'User',
    });

    const response = await forgotPassword(request, email);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.message).toContain('password reset link');
    expect(body.resetToken).toBeTruthy();
  });

  test('Request reset for non-existent email → 200 (no enumeration)', async ({ request }) => {
    const response = await forgotPassword(request, `no-such-user-${Date.now()}@example.com`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.message).toContain('password reset link');
    expect(body.resetToken).toBeUndefined();
  });

  test('Reset password with valid token → 200, can login with new password', async ({ request }) => {
    const email = `reset-valid-${Date.now()}@example.com`;
    const oldPassword = 'OldPass123';
    const newPassword = 'NewPass456';

    await registerAndVerify(request, {
      email,
      password: oldPassword,
      firstName: 'Valid',
      lastName: 'Reset',
    });

    // Request reset
    const forgotRes = await forgotPassword(request, email);
    const { resetToken } = await forgotRes.json();

    // Reset password
    const resetRes = await resetPassword(request, { token: resetToken, password: newPassword });
    expect(resetRes.status()).toBe(200);
    const resetBody = await resetRes.json();
    expect(resetBody.message).toContain('reset successfully');

    // Login with new password should succeed
    const loginRes = await request.post(apiUrl('/auth/login'), {
      data: { email, password: newPassword },
    });
    expect(loginRes.status()).toBe(200);

    // Login with old password should fail
    const oldLoginRes = await request.post(apiUrl('/auth/login'), {
      data: { email, password: oldPassword },
    });
    expect(oldLoginRes.status()).toBe(401);
  });

  test('Reset with invalid token → 400', async ({ request }) => {
    const response = await resetPassword(request, {
      token: 'completely-invalid-token',
      password: 'NewPass123',
    });

    expect(response.status()).toBe(400);
  });

  test('Reset with already-used token → 400', async ({ request }) => {
    const email = `reset-used-${Date.now()}@example.com`;

    await registerAndVerify(request, {
      email,
      password: 'OldPass123',
      firstName: 'Used',
      lastName: 'Token',
    });

    const forgotRes = await forgotPassword(request, email);
    const { resetToken } = await forgotRes.json();

    // Use the token
    await resetPassword(request, { token: resetToken, password: 'NewPass123' });

    // Try to use it again
    const secondRes = await resetPassword(request, { token: resetToken, password: 'AnotherPass1' });
    expect(secondRes.status()).toBe(400);
  });

  test('Reset with weak password → 400', async ({ request }) => {
    const email = `reset-weak-${Date.now()}@example.com`;

    await registerAndVerify(request, {
      email,
      password: 'OldPass123',
      firstName: 'Weak',
      lastName: 'Password',
    });

    const forgotRes = await forgotPassword(request, email);
    const { resetToken } = await forgotRes.json();

    // Too short
    const res1 = await resetPassword(request, { token: resetToken, password: 'Ab1' });
    expect(res1.status()).toBe(400);

    // No uppercase
    const res2 = await resetPassword(request, { token: resetToken, password: 'lowercase1' });
    expect(res2.status()).toBe(400);

    // No number
    const res3 = await resetPassword(request, { token: resetToken, password: 'NoNumbers!' });
    expect(res3.status()).toBe(400);
  });

  test('Forgot password with invalid email format → 400', async ({ request }) => {
    const response = await forgotPassword(request, 'not-an-email');
    expect(response.status()).toBe(400);
  });
});
