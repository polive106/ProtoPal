import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResendVerification, ResendVerificationError } from './ResendVerification';
import type { UserRepository } from '../ports/UserRepository';
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

describe('ResendVerification', () => {
  let userRepo: UserRepository;
  let verificationTokenRepo: VerificationTokenRepository;
  let emailService: EmailService;
  let tokenGenerator: TokenGenerator;
  let resendVerification: ResendVerification;

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
    verificationTokenRepo = {
      create: vi.fn().mockResolvedValue({
        id: 'vt-2',
        userId: 'user-1',
        tokenHash: 'new-hashed-token',
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
      generate: vi.fn().mockReturnValue('new-raw-token'),
      hash: vi.fn().mockReturnValue('new-hashed-token'),
    };
    resendVerification = new ResendVerification(
      userRepo,
      verificationTokenRepo,
      emailService,
      tokenGenerator,
    );
  });

  it('should invalidate old tokens and send a new verification email', async () => {
    const result = await resendVerification.execute({ email: 'test@example.com' });

    expect(userRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(verificationTokenRepo.invalidateByUserId).toHaveBeenCalledWith('user-1');
    expect(tokenGenerator.generate).toHaveBeenCalled();
    expect(tokenGenerator.hash).toHaveBeenCalledWith('new-raw-token');
    expect(verificationTokenRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        tokenHash: 'new-hashed-token',
      }),
    );
    expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
      'test@example.com',
      'new-raw-token',
    );
    expect(result.verificationToken).toBe('new-raw-token');
  });

  it('should throw if email is not found', async () => {
    vi.mocked(userRepo.findByEmail).mockResolvedValue(null);

    await expect(resendVerification.execute({ email: 'unknown@example.com' }))
      .rejects.toThrow('No pending account found for this email');
  });

  it('should throw if user is already approved', async () => {
    vi.mocked(userRepo.findByEmail).mockResolvedValue(createMockUser({ status: 'approved' }));

    await expect(resendVerification.execute({ email: 'test@example.com' }))
      .rejects.toThrow('No pending account found for this email');
  });

  it('should throw if email is empty', async () => {
    await expect(resendVerification.execute({ email: '' }))
      .rejects.toThrow('Email is required');
  });

  it('should normalize email to lowercase', async () => {
    await resendVerification.execute({ email: 'TEST@EXAMPLE.COM' });

    expect(userRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
  });
});
