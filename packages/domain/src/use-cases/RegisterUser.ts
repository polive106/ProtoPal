import type { UserRepository } from '../ports/UserRepository';
import type { RoleRepository } from '../ports/RoleRepository';
import type { UserRoleRepository } from '../ports/UserRoleRepository';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { VerificationService } from '../services/VerificationService';
import type { User } from '../entities/User';

export interface RegisterUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterUserResult {
  user: User;
  verificationToken: string;
}

export class RegisterUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegisterUserError';
  }
}

export class RegisterUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly verificationService: VerificationService,
  ) {}

  async execute(dto: RegisterUserDTO): Promise<RegisterUserResult> {
    const normalizedEmail = dto.email?.toLowerCase().trim() || '';
    const firstName = dto.firstName?.trim() || '';
    const lastName = dto.lastName?.trim() || '';

    this.validateEmail(normalizedEmail);
    this.validatePassword(dto.password);
    this.validateNames(firstName, lastName);

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new RegisterUserError('Email already registered');
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    const user = await this.userRepository.create({
      email: normalizedEmail,
      passwordHash,
      firstName,
      lastName,
      status: 'pending',
    });

    const userRole = await this.roleRepository.findByName('user');
    if (userRole) {
      await this.userRoleRepository.create({
        userId: user.id,
        roleId: userRole.id,
      });
    }

    const rawToken = await this.verificationService.createAndSendVerification(
      user.id,
      normalizedEmail,
    );

    return { user, verificationToken: rawToken };
  }

  private validateEmail(email: string): void {
    if (!email) {
      throw new RegisterUserError('Email is required');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new RegisterUserError('Invalid email format');
    }
  }

  private validatePassword(password: string): void {
    if (!password || password.length < 8) {
      throw new RegisterUserError('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      throw new RegisterUserError('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      throw new RegisterUserError('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      throw new RegisterUserError('Password must contain at least one number');
    }
  }

  private validateNames(firstName: string, lastName: string): void {
    if (!firstName) {
      throw new RegisterUserError('First name is required');
    }
    if (!lastName) {
      throw new RegisterUserError('Last name is required');
    }
  }
}
