import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResendVerification, ResendVerificationError } from './ResendVerification';
import type { UserRepository } from '../ports/UserRepository';
import type { VerificationService } from '../services/VerificationService';
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
    tokenVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('ResendVerification', () => {
  let userRepo: UserRepository;
  let verificationService: VerificationService;
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
    verificationService = {
      createAndSendVerification: vi.fn().mockResolvedValue('new-raw-token'),
      invalidateUserTokens: vi.fn().mockResolvedValue(undefined),
      findTokenByRaw: vi.fn(),
      markVerified: vi.fn(),
    } as unknown as VerificationService;
    resendVerification = new ResendVerification(
      userRepo,
      verificationService,
    );
  });

  it('should invalidate old tokens and send a new verification email via VerificationService', async () => {
    const result = await resendVerification.execute({ email: 'test@example.com' });

    expect(userRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(verificationService.invalidateUserTokens).toHaveBeenCalledWith('user-1');
    expect(verificationService.createAndSendVerification).toHaveBeenCalledWith(
      'user-1',
      'test@example.com',
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
