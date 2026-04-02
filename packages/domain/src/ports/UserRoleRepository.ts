import type { UserRole, CreateUserRoleDTO, UserWithRoles } from '../entities/UserRole';

export interface UserRoleRepository {
  create(dto: CreateUserRoleDTO): Promise<UserRole>;
  getUserWithRoles(userId: string): Promise<UserWithRoles | null>;
  findByUserId(userId: string): Promise<UserRole[]>;
  delete(id: string): Promise<void>;
}
