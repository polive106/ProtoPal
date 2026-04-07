import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResetPassword, ResetPasswordError } from './ResetPassword';
import type { PasswordResetTokenRepository } from '../ports/PasswordResetTokenRepository';
import type { UserRepository } from '../ports/UserRepository';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { TokenGenerator } from '../ports/TokenGenerator';
import type { PasswordResetToken } from '../entities/PasswordResetToken';

function createMockResetToken(overrides: Partial<PasswordResetToken> = {}): PasswordResetToken {
  return {
    id: 'rt-1',
    userId: 'user-1',
    tokenHash: 'hashed-token',
    expiresAt: new Date(Date.now() + 3600000),
    usedAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('ResetPassword', () => {
  let resetTokenRepo: PasswordResetTokenRepository;
  let userRepo: UserRepository;
  let passwordHasher: PasswordHasher;
  let tokenGenerator: TokenGenerator;
  let resetPassword: ResetPassword;

  const validPassword = 'NewPass123';

  beforeEach(() => {
    resetTokenRepo = {
      create: vi.fn(),
      findByTokenHash: vi.fn().mockResolvedValue(createMockResetToken()),
      markUsed: vi.fn().mockResolvedValue(createMockResetToken({ usedAt: new Date() })),
      invalidateByUserId: vi.fn(),
    };
    userRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      findByStatus: vi.fn(),
      update: vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      delete: vi.fn(),
    };
    passwordHasher = {
      hash: vi.fn().mockResolvedValue('new-hashed-password'),
      verify: vi.fn(),
    };
    tokenGenerator = {
      generate: vi.fn(),
      hash: vi.fn().mockReturnValue('hashed-token'),
    };

    resetPassword = new ResetPassword(resetTokenRepo, userRepo, passwordHasher, tokenGenerator);
  });

  it('should reset password with a valid token', async () => {
    const result = await resetPassword.execute({ token: 'raw-token', password: validPassword });

    expect(tokenGenerator.hash).toHaveBeenCalledWith('raw-token');
    expect(resetTokenRepo.findByTokenHash).toHaveBeenCalledWith('hashed-token');
    expect(passwordHasher.hash).toHaveBeenCalledWith(validPassword);
    expect(userRepo.update).toHaveBeenCalledWith('user-1', { passwordHash: 'new-hashed-password' });
    expect(resetTokenRepo.markUsed).toHaveBeenCalledWith('rt-1');
    expect(resetTokenRepo.invalidateByUserId).toHaveBeenCalledWith('user-1');
    expect(result.email).toBe('test@example.com');
  });

  it('should throw if token is empty', async () => {
    await expect(resetPassword.execute({ token: '', password: validPassword }))
      .rejects.toThrow('Reset token is required');
  });

  it('should throw if token is not found', async () => {
    vi.mocked(resetTokenRepo.findByTokenHash).mockResolvedValue(null);

    await expect(resetPassword.execute({ token: 'invalid', password: validPassword }))
      .rejects.toThrow('Invalid or expired reset token');
  });

  it('should throw if token is expired', async () => {
    vi.mocked(resetTokenRepo.findByTokenHash).mockResolvedValue(
      createMockResetToken({ expiresAt: new Date(Date.now() - 1000) }),
    );

    await expect(resetPassword.execute({ token: 'expired', password: validPassword }))
      .rejects.toThrow('Invalid or expired reset token');
  });

  it('should throw if token is already used', async () => {
    vi.mocked(resetTokenRepo.findByTokenHash).mockResolvedValue(
      createMockResetToken({ usedAt: new Date() }),
    );

    await expect(resetPassword.execute({ token: 'used', password: validPassword }))
      .rejects.toThrow('Reset token has already been used');
  });

  it('should throw if password is too short', async () => {
    await expect(resetPassword.execute({ token: 'raw-token', password: 'Ab1' }))
      .rejects.toThrow('Password must be at least 8 characters');
  });

  it('should throw if password has no uppercase letter', async () => {
    await expect(resetPassword.execute({ token: 'raw-token', password: 'lowercase1' }))
      .rejects.toThrow('Password must contain an uppercase letter');
  });

  it('should throw if password has no lowercase letter', async () => {
    await expect(resetPassword.execute({ token: 'raw-token', password: 'UPPERCASE1' }))
      .rejects.toThrow('Password must contain a lowercase letter');
  });

  it('should throw if password has no number', async () => {
    await expect(resetPassword.execute({ token: 'raw-token', password: 'NoNumbers!' }))
      .rejects.toThrow('Password must contain a number');
  });

  it('should throw if password exceeds max length', async () => {
    const longPassword = 'A1' + 'a'.repeat(71);
    await expect(resetPassword.execute({ token: 'raw-token', password: longPassword }))
      .rejects.toThrow('Password must be at most 72 characters');
  });
});
