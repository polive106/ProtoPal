import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestPasswordReset, RequestPasswordResetError } from './RequestPasswordReset';
import type { UserRepository } from '../ports/UserRepository';
import type { PasswordResetTokenRepository } from '../ports/PasswordResetTokenRepository';
import type { EmailService } from '../ports/EmailService';
import type { TokenGenerator } from '../ports/TokenGenerator';
import type { User } from '../entities/User';

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed-pw',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    status: 'approved',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('RequestPasswordReset', () => {
  let userRepo: UserRepository;
  let resetTokenRepo: PasswordResetTokenRepository;
  let emailService: EmailService;
  let tokenGenerator: TokenGenerator;
  let requestReset: RequestPasswordReset;

  beforeEach(() => {
    userRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(createMockUser()),
      findAll: vi.fn(),
      findByStatus: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    resetTokenRepo = {
      create: vi.fn().mockResolvedValue({
        id: 'rt-1',
        userId: 'user-1',
        tokenHash: 'hashed-token',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
        createdAt: new Date(),
      }),
      findByTokenHash: vi.fn(),
      markUsed: vi.fn(),
      invalidateByUserId: vi.fn(),
    };
    emailService = {
      sendVerificationEmail: vi.fn(),
      sendPasswordResetEmail: vi.fn(),
    };
    tokenGenerator = {
      generate: vi.fn().mockReturnValue('raw-token-123'),
      hash: vi.fn().mockReturnValue('hashed-token'),
    };

    requestReset = new RequestPasswordReset(userRepo, resetTokenRepo, emailService, tokenGenerator);
  });

  it('should generate a reset token and send email for existing user', async () => {
    const result = await requestReset.execute({ email: 'test@example.com' });

    expect(result).not.toBeNull();
    expect(result!.resetToken).toBe('raw-token-123');
    expect(resetTokenRepo.invalidateByUserId).toHaveBeenCalledWith('user-1');
    expect(tokenGenerator.generate).toHaveBeenCalled();
    expect(tokenGenerator.hash).toHaveBeenCalledWith('raw-token-123');
    expect(resetTokenRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        tokenHash: 'hashed-token',
      }),
    );
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com', 'raw-token-123');
  });

  it('should return null for non-existent email (no enumeration)', async () => {
    vi.mocked(userRepo.findByEmail).mockResolvedValue(null);

    const result = await requestReset.execute({ email: 'unknown@example.com' });

    expect(result).toBeNull();
    expect(resetTokenRepo.create).not.toHaveBeenCalled();
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('should normalize email to lowercase and trim', async () => {
    await requestReset.execute({ email: '  Test@Example.COM  ' });

    expect(userRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should throw if email is empty', async () => {
    await expect(requestReset.execute({ email: '' }))
      .rejects.toThrow(RequestPasswordResetError);
    await expect(requestReset.execute({ email: '  ' }))
      .rejects.toThrow('Email is required');
  });

  it('should invalidate existing tokens before creating new one', async () => {
    await requestReset.execute({ email: 'test@example.com' });

    const invalidateCall = vi.mocked(resetTokenRepo.invalidateByUserId).mock.invocationCallOrder[0]!;
    const createCall = vi.mocked(resetTokenRepo.create).mock.invocationCallOrder[0]!;
    expect(invalidateCall).toBeLessThan(createCall);
  });
});
