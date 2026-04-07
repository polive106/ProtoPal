import type { UserRepository } from '../ports/UserRepository';
import type { VerificationService } from '../services/VerificationService';

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

export class ResendVerification {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationService: VerificationService,
  ) {}

  async execute(dto: ResendVerificationDTO): Promise<ResendVerificationResult | null> {
    const email = dto.email?.trim().toLowerCase() || '';
    if (!email) {
      throw new ResendVerificationError('Email is required');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user || user.status !== 'pending') {
      return null;
    }

    await this.verificationService.invalidateUserTokens(user.id);
    const rawToken = await this.verificationService.createAndSendVerification(user.id, email);

    return { verificationToken: rawToken };
  }
}
