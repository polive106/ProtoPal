import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUser, LoginUserError } from './LoginUser';
import type { UserRepository } from '../ports/UserRepository';
import type { UserRoleRepository } from '../ports/UserRoleRepository';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { User } from '../entities/User';

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    status: 'approved',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('LoginUser', () => {
  let userRepo: UserRepository;
  let userRoleRepo: UserRoleRepository;
  let hasher: PasswordHasher;
  let loginUser: LoginUser;

  beforeEach(() => {
    userRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(createMockUser()),
      findAll: vi.fn(),
      findByStatus: vi.fn(),
      update: vi.fn().mockResolvedValue(createMockUser()),
      delete: vi.fn(),
    };
    userRoleRepo = {
      create: vi.fn(),
      getUserWithRoles: vi.fn().mockResolvedValue({
        userId: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        status: 'approved',
        roles: [{ roleId: 'role-1', roleName: 'user' }],
      }),
      findByUserId: vi.fn(),
      delete: vi.fn(),
    };
    hasher = {
      hash: vi.fn(),
      verify: vi.fn().mockResolvedValue(true),
    };
    loginUser = new LoginUser(userRepo, userRoleRepo, hasher);
  });

  it('should login successfully with valid credentials', async () => {
    const result = await loginUser.execute({
      email: 'test@example.com',
      password: 'Password1',
    });

    expect(result.userId).toBe('user-1');
    expect(result.roles).toHaveLength(1);
    expect(userRepo.update).toHaveBeenCalledWith('user-1', expect.objectContaining({ lastLoginAt: expect.any(Date) }));
  });

  it('should throw if email is empty', async () => {
    await expect(loginUser.execute({ email: '', password: 'pass' })).rejects.toThrow('Email is required');
  });

  it('should throw if password is empty', async () => {
    await expect(loginUser.execute({ email: 'test@example.com', password: '' })).rejects.toThrow('Password is required');
  });

  it('should throw if user not found', async () => {
    vi.mocked(userRepo.findByEmail).mockResolvedValue(null);
    await expect(loginUser.execute({ email: 'test@example.com', password: 'pass' })).rejects.toThrow('Invalid email or password');
  });

  it('should throw if password is invalid', async () => {
    vi.mocked(hasher.verify).mockResolvedValue(false);
    await expect(loginUser.execute({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow('Invalid email or password');
  });

  it('should throw if account is deactivated', async () => {
    vi.mocked(userRepo.findByEmail).mockResolvedValue(createMockUser({ isActive: false }));
    await expect(loginUser.execute({ email: 'test@example.com', password: 'pass' })).rejects.toThrow('deactivated');
  });

  it('should throw if account is pending', async () => {
    vi.mocked(userRepo.findByEmail).mockResolvedValue(createMockUser({ status: 'pending' }));
    await expect(loginUser.execute({ email: 'test@example.com', password: 'pass' })).rejects.toThrow('Please verify your email');
  });

  it('should throw if account is rejected', async () => {
    vi.mocked(userRepo.findByEmail).mockResolvedValue(createMockUser({ status: 'rejected' }));
    await expect(loginUser.execute({ email: 'test@example.com', password: 'pass' })).rejects.toThrow('rejected');
  });
});
