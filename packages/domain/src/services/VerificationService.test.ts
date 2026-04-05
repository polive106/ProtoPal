import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerificationService } from './VerificationService';
import type { VerificationTokenRepository } from '../ports/VerificationTokenRepository';
import type { EmailService } from '../ports/EmailService';
import type { TokenGenerator } from '../ports/TokenGenerator';
import { VERIFICATION_TOKEN_EXPIRY_MS } from '../constants';

describe('VerificationService', () => {
  let verificationTokenRepo: VerificationTokenRepository;
  let emailService: EmailService;
  let tokenGenerator: TokenGenerator;
  let service: VerificationService;

  beforeEach(() => {
    verificationTokenRepo = {
      create: vi.fn().mockResolvedValue({
        id: 'vt-1',
        userId: 'user-1',
        tokenHash: 'hashed-token',
        expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
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
    service = new VerificationService(
      verificationTokenRepo,
      emailService,
      tokenGenerator,
    );
  });

  describe('createAndSendVerification', () => {
    it('should generate a token, store the hash, and send verification email', async () => {
      const rawToken = await service.createAndSendVerification('user-1', 'test@example.com');

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
      expect(rawToken).toBe('raw-token-123');
    });

    it('should set token expiry based on VERIFICATION_TOKEN_EXPIRY_MS', async () => {
      const before = Date.now();
      await service.createAndSendVerification('user-1', 'test@example.com');
      const after = Date.now();

      const createCall = vi.mocked(verificationTokenRepo.create).mock.calls[0]?.[0];
      const expiresAt = createCall!.expiresAt.getTime();
      expect(expiresAt).toBeGreaterThanOrEqual(before + VERIFICATION_TOKEN_EXPIRY_MS);
      expect(expiresAt).toBeLessThanOrEqual(after + VERIFICATION_TOKEN_EXPIRY_MS);
    });
  });

  describe('invalidateUserTokens', () => {
    it('should invalidate all tokens for a user', async () => {
      await service.invalidateUserTokens('user-1');

      expect(verificationTokenRepo.invalidateByUserId).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findTokenByRaw', () => {
    it('should hash the raw token and look up by hash', async () => {
      const mockToken = {
        id: 'vt-1',
        userId: 'user-1',
        tokenHash: 'hashed-token',
        expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
        verifiedAt: null,
        createdAt: new Date(),
      };
      vi.mocked(verificationTokenRepo.findByTokenHash).mockResolvedValue(mockToken);

      const result = await service.findTokenByRaw('raw-token-123');

      expect(tokenGenerator.hash).toHaveBeenCalledWith('raw-token-123');
      expect(verificationTokenRepo.findByTokenHash).toHaveBeenCalledWith('hashed-token');
      expect(result).toBe(mockToken);
    });

    it('should return null when token is not found', async () => {
      vi.mocked(verificationTokenRepo.findByTokenHash).mockResolvedValue(null);

      const result = await service.findTokenByRaw('unknown-token');

      expect(result).toBeNull();
    });
  });

  describe('markVerified', () => {
    it('should mark a token as verified', async () => {
      const verifiedToken = {
        id: 'vt-1',
        userId: 'user-1',
        tokenHash: 'hashed-token',
        expiresAt: new Date(),
        verifiedAt: new Date(),
        createdAt: new Date(),
      };
      vi.mocked(verificationTokenRepo.markVerified).mockResolvedValue(verifiedToken);

      const result = await service.markVerified('vt-1');

      expect(verificationTokenRepo.markVerified).toHaveBeenCalledWith('vt-1');
      expect(result).toBe(verifiedToken);
    });
  });
});
