import type { VerificationTokenRepository } from '../ports/VerificationTokenRepository';
import type { EmailService } from '../ports/EmailService';
import type { TokenGenerator } from '../ports/TokenGenerator';
import type { VerificationToken } from '../entities/VerificationToken';
import { VERIFICATION_TOKEN_EXPIRY_MS } from '../constants';

export class VerificationService {
  constructor(
    private readonly verificationTokenRepository: VerificationTokenRepository,
    private readonly emailService: EmailService,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async createAndSendVerification(userId: string, email: string): Promise<string> {
    const rawToken = this.tokenGenerator.generate();
    const tokenHash = this.tokenGenerator.hash(rawToken);

    await this.verificationTokenRepository.create({
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
    });

    await this.emailService.sendVerificationEmail(email, rawToken);

    return rawToken;
  }

  async invalidateUserTokens(userId: string): Promise<void> {
    await this.verificationTokenRepository.invalidateByUserId(userId);
  }

  async findTokenByRaw(rawToken: string): Promise<VerificationToken | null> {
    const tokenHash = this.tokenGenerator.hash(rawToken);
    return this.verificationTokenRepository.findByTokenHash(tokenHash);
  }

  async markVerified(id: string): Promise<VerificationToken> {
    return this.verificationTokenRepository.markVerified(id);
  }
}
