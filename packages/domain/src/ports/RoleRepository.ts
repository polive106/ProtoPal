import type { Role, CreateRoleDTO } from '../entities/Role';

export interface RoleRepository {
  create(dto: CreateRoleDTO): Promise<Role>;
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
}
