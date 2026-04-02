import type { UserRoleRepository } from '../ports/UserRoleRepository';
import type { UserWithRoles } from '../entities/UserRole';

export class GetUserRoles {
  constructor(private readonly userRoleRepository: UserRoleRepository) {}

  async execute(userId: string): Promise<UserWithRoles> {
    const userWithRoles = await this.userRoleRepository.getUserWithRoles(userId);
    if (!userWithRoles) {
      throw new Error('User not found');
    }
    return userWithRoles;
  }
}
