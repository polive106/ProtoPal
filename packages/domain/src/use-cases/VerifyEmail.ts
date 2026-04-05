import type { VerificationService } from '../services/VerificationService';
import type { UserRepository } from '../ports/UserRepository';
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
    private readonly verificationService: VerificationService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(dto: VerifyEmailDTO): Promise<User> {
    const rawToken = dto.token?.trim() || '';
    if (!rawToken) {
      throw new VerifyEmailError('Verification token is required');
    }

    const verificationToken = await this.verificationService.findTokenByRaw(rawToken);

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      throw new VerifyEmailError('Invalid or expired verification token');
    }

    if (verificationToken.verifiedAt) {
      throw new VerifyEmailError('Email has already been verified');
    }

    await this.verificationService.markVerified(verificationToken.id);
    const user = await this.userRepository.update(verificationToken.userId, {
      status: 'approved',
    });

    return user;
  }
}
