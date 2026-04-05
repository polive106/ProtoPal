import type { VerificationTokenRepository } from '../ports/VerificationTokenRepository';
import type { UserRepository } from '../ports/UserRepository';
import type { TokenGenerator } from '../ports/TokenGenerator';
import type { User } from '../entities/User';

export interface VerifyEmailDTO {
  token: string;
}

export class VerifyEmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VerifyEmailError';
  }
}

export class VerifyEmail {
  constructor(
    private readonly verificationTokenRepository: VerificationTokenRepository,
    private readonly userRepository: UserRepository,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(dto: VerifyEmailDTO): Promise<User> {
    const rawToken = dto.token?.trim() || '';
    if (!rawToken) {
      throw new VerifyEmailError('Verification token is required');
    }

    const tokenHash = this.tokenGenerator.hash(rawToken);
    const verificationToken = await this.verificationTokenRepository.findByTokenHash(tokenHash);

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      throw new VerifyEmailError('Invalid or expired verification token');
    }

    if (verificationToken.verifiedAt) {
      throw new VerifyEmailError('Email has already been verified');
    }

    await this.verificationTokenRepository.markVerified(verificationToken.id);
    const user = await this.userRepository.update(verificationToken.userId, {
      status: 'approved',
    });

    return user;
  }
}
