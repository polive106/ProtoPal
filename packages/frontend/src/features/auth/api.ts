import { api } from '@/lib/api';
import type { AuthUser, LoginRequest, RegisterRequest } from '@acme/shared';

export type { AuthUser, LoginRequest, RegisterRequest };

interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
}

export interface RegisterResponse {
  message: string;
}

export interface VerifyEmailResponse {
  message: string;
  user: UserSummary;
}

export interface ResendVerificationResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const authApi = {
  login: (data: LoginRequest) => api.post<{ user: AuthUser }>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<RegisterResponse>('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get<{ user: AuthUser }>('/auth/me'),
  verifyEmail: (token: string) => api.post<VerifyEmailResponse>('/auth/verify', { token }),
  resendVerification: (email: string) =>
    api.post<ResendVerificationResponse>('/auth/resend-verification', { email }),
  forgotPassword: (email: string) =>
    api.post<ForgotPasswordResponse>('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) =>
    api.post<ResetPasswordResponse>('/auth/reset-password', data),
};
