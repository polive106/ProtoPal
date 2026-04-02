export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  assignedAt: Date;
  assignedBy?: string;
}

export interface CreateUserRoleDTO {
  userId: string;
  roleId: string;
  assignedBy?: string;
}

export interface UserWithRoles {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  status: string;
  roles: Array<{
    roleId: string;
    roleName: string;
  }>;
}
