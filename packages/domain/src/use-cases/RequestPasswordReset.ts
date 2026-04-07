import type { UserRepository } from '../ports/UserRepository';
import type { PasswordResetTokenRepository } from '../ports/PasswordResetTokenRepository';
import type { EmailService } from '../ports/EmailService';
import type { TokenGenerator } from '../ports/TokenGenerator';
import { PASSWORD_RESET_TOKEN_EXPIRY_MS } from '../constants';

export interface RequestPasswordResetDTO {
  email: string;
}

export interface RequestPasswordResetResult {
  resetToken: string;
}

export class RequestPasswordResetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RequestPasswordResetError';
  }
}

export class RequestPasswordReset {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly emailService: EmailService,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(dto: RequestPasswordResetDTO): Promise<RequestPasswordResetResult | null> {
    const email = dto.email?.trim().toLowerCase() || '';
    if (!email) {
      throw new RequestPasswordResetError('Email is required');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    await this.passwordResetTokenRepository.invalidateByUserId(user.id);

    const rawToken = this.tokenGenerator.generate();
    const tokenHash = this.tokenGenerator.hash(rawToken);

    await this.passwordResetTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MS),
    });

    await this.emailService.sendPasswordResetEmail(email, rawToken);

    return { resetToken: rawToken };
  }
}
