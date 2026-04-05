import type { UserRepository } from '../ports/UserRepository';
import type { VerificationTokenRepository } from '../ports/VerificationTokenRepository';
import type { EmailService } from '../ports/EmailService';
import type { TokenGenerator } from '../ports/TokenGenerator';

export interface ResendVerificationDTO {
  email: string;
}

export interface ResendVerificationResult {
  verificationToken: string;
}

export class ResendVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResendVerificationError';
  }
}

const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export class ResendVerification {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationTokenRepository: VerificationTokenRepository,
    private readonly emailService: EmailService,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(dto: ResendVerificationDTO): Promise<ResendVerificationResult> {
    const email = dto.email?.trim().toLowerCase() || '';
    if (!email) {
      throw new ResendVerificationError('Email is required');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user || user.status !== 'pending') {
      throw new ResendVerificationError('No pending account found for this email');
    }

    await this.verificationTokenRepository.invalidateByUserId(user.id);

    const rawToken = this.tokenGenerator.generate();
    const tokenHash = this.tokenGenerator.hash(rawToken);

    await this.verificationTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
    });

    await this.emailService.sendVerificationEmail(email, rawToken);

    return { verificationToken: rawToken };
  }
}
