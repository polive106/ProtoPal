/** User account status */
export type UserStatus = 'pending' | 'verified' | 'approved' | 'rejected';

/** System role names */
export type RoleName = 'admin' | 'user';

/** Authenticated user returned by the API */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  roles: Array<{ roleId: string; roleName: string }>;
}

/** POST /auth/login request body */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /auth/register request body */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
