import type { User, CreateUserDTO, UpdateUserDTO } from '../entities/User';
import type { UserStatus } from '@acme/shared';

export interface UserRepository {
  create(dto: CreateUserDTO): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findByStatus(status: UserStatus): Promise<User[]>;
  update(id: string, data: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
}
