import type { APIRequestContext } from '@playwright/test';

const API_BASE = 'http://localhost:3000';

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export async function registerUser(
  request: APIRequestContext,
  userData: { email: string; password: string; firstName: string; lastName: string },
) {
  const response = await request.post(apiUrl('/auth/register'), { data: userData });
  return response;
}

export async function loginAs(
  request: APIRequestContext,
  credentials: { email: string; password: string },
): Promise<string> {
  const response = await request.post(apiUrl('/auth/login'), { data: credentials });
  const cookies = response.headers()['set-cookie'] || '';
  // Extract auth_token cookie value
  const match = cookies.match(/auth_token=([^;]+)/);
  return match ? `auth_token=${match[1]}` : '';
}

export async function getVerificationToken(
  request: APIRequestContext,
  email: string,
): Promise<string> {
  const response = await request.get(apiUrl(`/dev/mailbox/verification-token?email=${encodeURIComponent(email)}`));
  const body = await response.json();
  return body.token;
}

export async function registerAndVerify(
  request: APIRequestContext,
  userData: { email: string; password: string; firstName: string; lastName: string },
): Promise<{ cookie: string }> {
  await registerUser(request, userData);
  const token = await getVerificationToken(request, userData.email);
  if (token) {
    await verifyEmail(request, token);
  }
  const cookie = await loginAs(request, { email: userData.email, password: userData.password });
  return { cookie };
}

export async function verifyEmail(
  request: APIRequestContext,
  token: string,
) {
  return request.post(apiUrl('/auth/verify'), { data: { token } });
}

export async function resendVerification(
  request: APIRequestContext,
  email: string,
) {
  return request.post(apiUrl('/auth/resend-verification'), { data: { email } });
}

export async function forgotPassword(
  request: APIRequestContext,
  email: string,
) {
  return request.post(apiUrl('/auth/forgot-password'), { data: { email } });
}

export async function resetPassword(
  request: APIRequestContext,
  data: { token: string; password: string },
) {
  return request.post(apiUrl('/auth/reset-password'), { data });
}

export async function createNote(
  request: APIRequestContext,
  cookie: string,
  data: { title: string; content: string },
) {
  const response = await request.post(apiUrl('/notes'), {
    data,
    headers: { Cookie: cookie },
  });
  return response;
}
