import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUser, RegisterUserError } from './RegisterUser';
import type { UserRepository } from '../ports/UserRepository';
import type { RoleRepository } from '../ports/RoleRepository';
import type { UserRoleRepository } from '../ports/UserRoleRepository';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { VerificationTokenRepository } from '../ports/VerificationTokenRepository';
import type { EmailService } from '../ports/EmailService';
import type { TokenGenerator } from '../ports/TokenGenerator';
import type { User } from '../entities/User';

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('RegisterUser', () => {
  let userRepo: UserRepository;
  let roleRepo: RoleRepository;
  let userRoleRepo: UserRoleRepository;
  let hasher: PasswordHasher;
  let verificationTokenRepo: VerificationTokenRepository;
  let emailService: EmailService;
  let tokenGenerator: TokenGenerator;
  let registerUser: RegisterUser;

  beforeEach(() => {
    userRepo = {
      create: vi.fn().mockResolvedValue(createMockUser()),
      findById: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(null),
      findAll: vi.fn(),
      findByStatus: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    roleRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByName: vi.fn().mockResolvedValue({ id: 'role-1', name: 'user', displayName: 'User', isSystem: true, createdAt: new Date(), updatedAt: new Date() }),
      findAll: vi.fn(),
    };
    userRoleRepo = {
      create: vi.fn().mockResolvedValue({ id: 'ur-1', userId: 'user-1', roleId: 'role-1', assignedAt: new Date() }),
      getUserWithRoles: vi.fn(),
      findByUserId: vi.fn(),
      delete: vi.fn(),
    };
    hasher = {
      hash: vi.fn().mockResolvedValue('hashed-password'),
      verify: vi.fn(),
    };
    verificationTokenRepo = {
      create: vi.fn().mockResolvedValue({
        id: 'vt-1',
        userId: 'user-1',
        tokenHash: 'hashed-token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        verifiedAt: null,
        createdAt: new Date(),
      }),
      findByTokenHash: vi.fn(),
      findActiveByUserId: vi.fn(),
      markVerified: vi.fn(),
      invalidateByUserId: vi.fn(),
    };
    emailService = {
      sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
    };
    tokenGenerator = {
      generate: vi.fn().mockReturnValue('raw-token-123'),
      hash: vi.fn().mockReturnValue('hashed-token'),
    };
    registerUser = new RegisterUser(
      userRepo,
      roleRepo,
      userRoleRepo,
      hasher,
      verificationTokenRepo,
      emailService,
      tokenGenerator,
    );
  });

  it('should register a new user with pending status', async () => {
    const result = await registerUser.execute({
      email: 'test@example.com',
      password: 'Password1',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
    expect(hasher.hash).toHaveBeenCalledWith('Password1');
    expect(userRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'pending' }),
    );
    expect(userRoleRepo.create).toHaveBeenCalled();
  });

  it('should generate a verification token and send email', async () => {
    const result = await registerUser.execute({
      email: 'test@example.com',
      password: 'Password1',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(tokenGenerator.generate).toHaveBeenCalled();
    expect(tokenGenerator.hash).toHaveBeenCalledWith('raw-token-123');
    expect(verificationTokenRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        tokenHash: 'hashed-token',
      }),
    );
    expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
      'test@example.com',
      'raw-token-123',
    );
    expect(result.verificationToken).toBe('raw-token-123');
  });

  it('should throw if email is already registered', async () => {
    vi.mocked(userRepo.findByEmail).mockResolvedValue(createMockUser());

    await expect(
      registerUser.execute({
        email: 'test@example.com',
        password: 'Password1',
        firstName: 'John',
        lastName: 'Doe',
      })
    ).rejects.toThrow(RegisterUserError);
  });

  it('should throw if email is empty', async () => {
    await expect(
      registerUser.execute({
        email: '',
        password: 'Password1',
        firstName: 'John',
        lastName: 'Doe',
      })
    ).rejects.toThrow('Email is required');
  });

  it('should throw if email format is invalid', async () => {
    await expect(
      registerUser.execute({
        email: 'not-an-email',
        password: 'Password1',
        firstName: 'John',
        lastName: 'Doe',
      })
    ).rejects.toThrow('Invalid email format');
  });

  it('should throw if password is too short', async () => {
    await expect(
      registerUser.execute({
        email: 'test@example.com',
        password: 'Short1',
        firstName: 'John',
        lastName: 'Doe',
      })
    ).rejects.toThrow('Password must be at least 8 characters');
  });

  it('should throw if password has no uppercase', async () => {
    await expect(
      registerUser.execute({
        email: 'test@example.com',
        password: 'password1',
        firstName: 'John',
        lastName: 'Doe',
      })
    ).rejects.toThrow('Password must contain at least one uppercase letter');
  });

  it('should throw if password has no lowercase', async () => {
    await expect(
      registerUser.execute({
        email: 'test@example.com',
        password: 'PASSWORD1',
        firstName: 'John',
        lastName: 'Doe',
      })
    ).rejects.toThrow('Password must contain at least one lowercase letter');
  });

  it('should throw if password has no number', async () => {
    await expect(
      registerUser.execute({
        email: 'test@example.com',
        password: 'Password',
        firstName: 'John',
        lastName: 'Doe',
      })
    ).rejects.toThrow('Password must contain at least one number');
  });

  it('should throw if first name is empty', async () => {
    await expect(
      registerUser.execute({
        email: 'test@example.com',
        password: 'Password1',
        firstName: '',
        lastName: 'Doe',
      })
    ).rejects.toThrow('First name is required');
  });

  it('should throw if last name is empty', async () => {
    await expect(
      registerUser.execute({
        email: 'test@example.com',
        password: 'Password1',
        firstName: 'John',
        lastName: '',
      })
    ).rejects.toThrow('Last name is required');
  });

  it('should normalize email to lowercase', async () => {
    await registerUser.execute({
      email: 'TEST@EXAMPLE.COM',
      password: 'Password1',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(userRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
  });
});
