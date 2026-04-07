import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerifyEmail, VerifyEmailError } from './VerifyEmail';
import type { UserRepository } from '../ports/UserRepository';
import type { VerificationService } from '../services/VerificationService';
import type { VerificationToken } from '../entities/VerificationToken';

function createMockToken(overrides: Partial<VerificationToken> = {}): VerificationToken {
  return {
    id: 'vt-1',
    userId: 'user-1',
    tokenHash: 'hashed-token',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    verifiedAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('VerifyEmail', () => {
  let verificationService: VerificationService;
  let userRepo: UserRepository;
  let verifyEmail: VerifyEmail;

  beforeEach(() => {
    verificationService = {
      createAndSendVerification: vi.fn(),
      invalidateUserTokens: vi.fn(),
      findTokenByRaw: vi.fn().mockResolvedValue(createMockToken()),
      markVerified: vi.fn().mockResolvedValue(createMockToken({ verifiedAt: new Date() })),
    } as unknown as VerificationService;
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
        tokenVersion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      delete: vi.fn(),
    };
    verifyEmail = new VerifyEmail(verificationService, userRepo);
  });

  it('should verify a valid token and approve the user', async () => {
    const result = await verifyEmail.execute({ token: 'raw-token-123' });

    expect(verificationService.findTokenByRaw).toHaveBeenCalledWith('raw-token-123');
    expect(verificationService.markVerified).toHaveBeenCalledWith('vt-1');
    expect(userRepo.update).toHaveBeenCalledWith('user-1', { status: 'approved' });
    expect(result.status).toBe('approved');
  });

  it('should throw if token is not found', async () => {
    vi.mocked(verificationService.findTokenByRaw).mockResolvedValue(null);

    await expect(verifyEmail.execute({ token: 'invalid-token' }))
      .rejects.toThrow('Invalid or expired verification token');
  });

  it('should throw if token is expired', async () => {
    vi.mocked(verificationService.findTokenByRaw).mockResolvedValue(
      createMockToken({ expiresAt: new Date(Date.now() - 1000) }),
    );

    await expect(verifyEmail.execute({ token: 'expired-token' }))
      .rejects.toThrow('Invalid or expired verification token');
  });

  it('should throw if token is already verified', async () => {
    vi.mocked(verificationService.findTokenByRaw).mockResolvedValue(
      createMockToken({ verifiedAt: new Date() }),
    );

    await expect(verifyEmail.execute({ token: 'used-token' }))
      .rejects.toThrow('Email has already been verified');
  });

  it('should throw if token is empty', async () => {
    await expect(verifyEmail.execute({ token: '' }))
      .rejects.toThrow('Verification token is required');
  });
});
