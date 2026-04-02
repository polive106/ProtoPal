import type { UserRepository } from '../ports/UserRepository';
import type { UserRoleRepository } from '../ports/UserRoleRepository';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { UserWithRoles } from '../entities/UserRole';

export interface LoginUserDTO {
  email: string;
  password: string;
}

export class LoginUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LoginUserError';
  }
}

export class LoginUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(dto: LoginUserDTO): Promise<UserWithRoles> {
    const email = dto.email?.trim().toLowerCase() || '';
    const password = dto.password || '';

    if (!email) {
      throw new LoginUserError('Email is required');
    }
    if (!password) {
      throw new LoginUserError('Password is required');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new LoginUserError('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new LoginUserError('Invalid email or password');
    }

    const isPasswordValid = await this.passwordHasher.verify(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new LoginUserError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new LoginUserError('Your account has been deactivated');
    }

    if (user.status === 'pending') {
      throw new LoginUserError('Your account is pending approval');
    }

    if (user.status === 'rejected') {
      throw new LoginUserError('Your account has been rejected');
    }

    const [, userWithRoles] = await Promise.all([
      this.userRepository.update(user.id, { lastLoginAt: new Date() }),
      this.userRoleRepository.getUserWithRoles(user.id),
    ]);
    if (!userWithRoles) {
      throw new LoginUserError('Failed to retrieve user roles');
    }

    return userWithRoles;
  }
}
