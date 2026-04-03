import { api } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  roles: Array<{ roleId: string; roleName: string }>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get<{ user: AuthUser }>('/auth/me'),
};
