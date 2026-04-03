import { api } from '@/lib/api';
import type { AuthUser, LoginRequest, RegisterRequest } from '@acme/shared';

export type { AuthUser, LoginRequest, RegisterRequest };

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get<{ user: AuthUser }>('/auth/me'),
};
