import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUser, LoginUserError, AccountLockedError } from './LoginUser';
import type { UserRepository } from '../ports/UserRepository';
import type { UserRoleRepository } from '../ports/UserRoleRepository';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { LoginAttemptRepository } from '../ports/LoginAttemptRepository';
import type { User } from '../entities/User';
import type { LoginAttempt } from '../entities/LoginAttempt';

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    status: 'approved',
    tokenVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createMockLoginAttempt(overrides: Partial<LoginAttempt> = {}): LoginAttempt {
  return {
    id: 'attempt-1',
    email: 'test@example.com',
    attempts: 0,
    lockoutCount: 0,
    lockedUntil: null,
    lastAttemptAt: new Date(),
    createdAt: new Date(),
    ...overrides,
  };
}

describe('LoginUser', () => {
  let userRepo: UserRepository;
  let userRoleRepo: UserRoleRepository;
  let hasher: PasswordHasher;
  let loginAttemptRepo: LoginAttemptRepository;
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
        tokenVersion: 0,
        roles: [{ roleId: 'role-1', roleName: 'user' }],
      }),
      findByUserId: vi.fn(),
      delete: vi.fn(),
    };
    hasher = {
      hash: vi.fn(),
      verify: vi.fn().mockResolvedValue(true),
    };
    loginAttemptRepo = {
      findByEmail: vi.fn().mockResolvedValue(null),
      upsertFailedAttempt: vi.fn().mockResolvedValue(createMockLoginAttempt()),
      resetAttempts: vi.fn(),
      unlockAccount: vi.fn(),
    };
    loginUser = new LoginUser(userRepo, userRoleRepo, hasher, loginAttemptRepo);
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

  // === Account Lockout Tests ===

  it('should record failed attempt on invalid password', async () => {
    vi.mocked(hasher.verify).mockResolvedValue(false);

    await expect(loginUser.execute({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow('Invalid email or password');

    expect(loginAttemptRepo.upsertFailedAttempt).toHaveBeenCalledWith(
      'test@example.com',
      1,
      0,
      null,
    );
  });

  it('should increment existing failed attempts', async () => {
    vi.mocked(hasher.verify).mockResolvedValue(false);
    vi.mocked(loginAttemptRepo.findByEmail).mockResolvedValue(
      createMockLoginAttempt({ attempts: 3 }),
    );

    await expect(loginUser.execute({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow('Invalid email or password');

    expect(loginAttemptRepo.upsertFailedAttempt).toHaveBeenCalledWith(
      'test@example.com',
      4,
      0,
      null,
    );
  });

  it('should lock account after 5 consecutive failed attempts', async () => {
    vi.mocked(hasher.verify).mockResolvedValue(false);
    vi.mocked(loginAttemptRepo.findByEmail).mockResolvedValue(
      createMockLoginAttempt({ attempts: 4 }),
    );

    await expect(loginUser.execute({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow('Invalid email or password');

    expect(loginAttemptRepo.upsertFailedAttempt).toHaveBeenCalledWith(
      'test@example.com',
      5,
      1,
      expect.any(Date),
    );
  });

  it('should throw AccountLockedError when account is locked', async () => {
    const lockedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    vi.mocked(loginAttemptRepo.findByEmail).mockResolvedValue(
      createMockLoginAttempt({ attempts: 5, lockoutCount: 1, lockedUntil }),
    );

    const error = await loginUser.execute({ email: 'test@example.com', password: 'Password1' }).catch((e) => e);

    expect(error).toBeInstanceOf(AccountLockedError);
    expect(error.retryAfterSeconds).toBeGreaterThan(0);
    expect(error.message).toContain('Account is temporarily locked');
  });

  it('should allow login after lockout expires', async () => {
    const expiredLockout = new Date(Date.now() - 1000); // expired 1 second ago
    vi.mocked(loginAttemptRepo.findByEmail).mockResolvedValue(
      createMockLoginAttempt({ attempts: 5, lockoutCount: 1, lockedUntil: expiredLockout }),
    );

    const result = await loginUser.execute({
      email: 'test@example.com',
      password: 'Password1',
    });

    expect(result.userId).toBe('user-1');
  });

  it('should reset failure counter on successful login', async () => {
    vi.mocked(loginAttemptRepo.findByEmail).mockResolvedValue(
      createMockLoginAttempt({ attempts: 3 }),
    );

    await loginUser.execute({
      email: 'test@example.com',
      password: 'Password1',
    });

    expect(loginAttemptRepo.resetAttempts).toHaveBeenCalledWith('test@example.com');
  });

  it('should use exponential backoff for lockout duration (5min first)', async () => {
    vi.mocked(hasher.verify).mockResolvedValue(false);
    vi.mocked(loginAttemptRepo.findByEmail).mockResolvedValue(
      createMockLoginAttempt({ attempts: 4, lockoutCount: 0 }),
    );

    await expect(loginUser.execute({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow();

    const call = vi.mocked(loginAttemptRepo.upsertFailedAttempt).mock.calls[0]!;
    const lockedUntil = call[3] as Date;
    const durationMs = lockedUntil.getTime() - Date.now();
    // 5 minutes = 300_000ms, allow some tolerance
    expect(durationMs).toBeGreaterThan(290_000);
    expect(durationMs).toBeLessThan(310_000);
  });

  it('should use exponential backoff for lockout duration (15min second)', async () => {
    vi.mocked(hasher.verify).mockResolvedValue(false);
    vi.mocked(loginAttemptRepo.findByEmail).mockResolvedValue(
      createMockLoginAttempt({ attempts: 4, lockoutCount: 1 }),
    );

    await expect(loginUser.execute({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow();

    const call = vi.mocked(loginAttemptRepo.upsertFailedAttempt).mock.calls[0]!;
    const lockedUntil = call[3] as Date;
    const durationMs = lockedUntil.getTime() - Date.now();
    // 15 minutes = 900_000ms
    expect(durationMs).toBeGreaterThan(890_000);
    expect(durationMs).toBeLessThan(910_000);
  });

  it('should use exponential backoff for lockout duration (1hr third)', async () => {
    vi.mocked(hasher.verify).mockResolvedValue(false);
    vi.mocked(loginAttemptRepo.findByEmail).mockResolvedValue(
      createMockLoginAttempt({ attempts: 4, lockoutCount: 2 }),
    );

    await expect(loginUser.execute({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow();

    const call = vi.mocked(loginAttemptRepo.upsertFailedAttempt).mock.calls[0]!;
    const lockedUntil = call[3] as Date;
    const durationMs = lockedUntil.getTime() - Date.now();
    // 1 hour = 3_600_000ms
    expect(durationMs).toBeGreaterThan(3_590_000);
    expect(durationMs).toBeLessThan(3_610_000);
  });

  it('should cap lockout duration at 24hr', async () => {
    vi.mocked(hasher.verify).mockResolvedValue(false);
    vi.mocked(loginAttemptRepo.findByEmail).mockResolvedValue(
      createMockLoginAttempt({ attempts: 4, lockoutCount: 10 }),
    );

    await expect(loginUser.execute({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow();

    const call = vi.mocked(loginAttemptRepo.upsertFailedAttempt).mock.calls[0]!;
    const lockedUntil = call[3] as Date;
    const durationMs = lockedUntil.getTime() - Date.now();
    // 24 hours = 86_400_000ms
    expect(durationMs).toBeGreaterThan(86_390_000);
    expect(durationMs).toBeLessThan(86_410_000);
  });

  it('should not record failed attempt when user not found', async () => {
    vi.mocked(userRepo.findByEmail).mockResolvedValue(null);

    await expect(loginUser.execute({ email: 'test@example.com', password: 'pass' })).rejects.toThrow('Invalid email or password');

    // Should NOT track attempts for non-existent users (prevents user enumeration)
    expect(loginAttemptRepo.upsertFailedAttempt).not.toHaveBeenCalled();
  });
});
