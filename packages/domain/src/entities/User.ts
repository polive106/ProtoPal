import type { UserStatus } from '@acme/shared';

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  status: UserStatus;
  tokenVersion: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  passwordHash?: string;
  firstName: string;
  lastName: string;
  isActive?: boolean;
  status?: UserStatus;
}

export interface UpdateUserDTO {
  email?: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  status?: UserStatus;
  tokenVersion?: number;
  lastLoginAt?: Date | null;
}
