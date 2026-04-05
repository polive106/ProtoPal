import { api } from '@/lib/api';
import type { AuthUser, LoginRequest, RegisterRequest } from '@acme/shared';

export type { AuthUser, LoginRequest, RegisterRequest };

export interface RegisterResponse {
  message: string;
  user: { id: string; email: string; firstName: string; lastName: string; status: string };
  verificationToken?: string;
}

export interface VerifyEmailResponse {
  message: string;
  user: { id: string; email: string; firstName: string; lastName: string; status: string };
}

export interface ResendVerificationResponse {
  message: string;
  verificationToken?: string;
}

export const authApi = {
  login: (data: LoginRequest) => api.post<{ user: AuthUser }>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<RegisterResponse>('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get<{ user: AuthUser }>('/auth/me'),
  verifyEmail: (token: string) => api.get<VerifyEmailResponse>(`/auth/verify?token=${encodeURIComponent(token)}`),
  resendVerification: (email: string) =>
    api.post<ResendVerificationResponse>('/auth/resend-verification', { email }),
};
