export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleDTO {
  name: string;
  displayName: string;
  description?: string;
  isSystem?: boolean;
}

export const SYSTEM_ROLES = [
  { name: 'admin', displayName: 'Administrator' },
  { name: 'user', displayName: 'User' },
] as const;
