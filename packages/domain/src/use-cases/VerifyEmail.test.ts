import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerifyEmail, VerifyEmailError } from './VerifyEmail';
import type { VerificationTokenRepository } from '../ports/VerificationTokenRepository';
import type { UserRepository } from '../ports/UserRepository';
import type { TokenGenerator } from '../ports/TokenGenerator';
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
  let verificationTokenRepo: VerificationTokenRepository;
  let userRepo: UserRepository;
  let tokenGenerator: TokenGenerator;
  let verifyEmail: VerifyEmail;

  beforeEach(() => {
    verificationTokenRepo = {
      create: vi.fn(),
      findByTokenHash: vi.fn().mockResolvedValue(createMockToken()),
      findActiveByUserId: vi.fn(),
      markVerified: vi.fn().mockResolvedValue(createMockToken({ verifiedAt: new Date() })),
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
    tokenGenerator = {
      generate: vi.fn(),
      hash: vi.fn().mockReturnValue('hashed-token'),
    };
    verifyEmail = new VerifyEmail(verificationTokenRepo, userRepo, tokenGenerator);
  });

  it('should verify a valid token and approve the user', async () => {
    const result = await verifyEmail.execute({ token: 'raw-token-123' });

    expect(tokenGenerator.hash).toHaveBeenCalledWith('raw-token-123');
    expect(verificationTokenRepo.findByTokenHash).toHaveBeenCalledWith('hashed-token');
    expect(verificationTokenRepo.markVerified).toHaveBeenCalledWith('vt-1');
    expect(userRepo.update).toHaveBeenCalledWith('user-1', { status: 'approved' });
    expect(result.status).toBe('approved');
  });

  it('should throw if token is not found', async () => {
    vi.mocked(verificationTokenRepo.findByTokenHash).mockResolvedValue(null);

    await expect(verifyEmail.execute({ token: 'invalid-token' }))
      .rejects.toThrow('Invalid or expired verification token');
  });

  it('should throw if token is expired', async () => {
    vi.mocked(verificationTokenRepo.findByTokenHash).mockResolvedValue(
      createMockToken({ expiresAt: new Date(Date.now() - 1000) }),
    );

    await expect(verifyEmail.execute({ token: 'expired-token' }))
      .rejects.toThrow('Invalid or expired verification token');
  });

  it('should throw if token is already verified', async () => {
    vi.mocked(verificationTokenRepo.findByTokenHash).mockResolvedValue(
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
