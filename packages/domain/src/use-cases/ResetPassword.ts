import type { PasswordResetTokenRepository } from '../ports/PasswordResetTokenRepository';
import type { UserRepository } from '../ports/UserRepository';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { TokenGenerator } from '../ports/TokenGenerator';
import type { User } from '../entities/User';

export interface ResetPasswordDTO {
  token: string;
  password: string;
}

export class ResetPasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResetPasswordError';
  }
}

export class ResetPassword {
  constructor(
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(dto: ResetPasswordDTO): Promise<User> {
    const rawToken = dto.token?.trim() || '';
    if (!rawToken) {
      throw new ResetPasswordError('Reset token is required');
    }

    const password = dto.password || '';
    this.validatePassword(password);

    // Find token
    const tokenHash = this.tokenGenerator.hash(rawToken);
    const resetToken = await this.passwordResetTokenRepository.findByTokenHash(tokenHash);

    if (!resetToken) {
      throw new ResetPasswordError('Invalid or expired reset token');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new ResetPasswordError('Invalid or expired reset token');
    }

    if (resetToken.usedAt) {
      throw new ResetPasswordError('Reset token has already been used');
    }

    // Update password
    const passwordHash = await this.passwordHasher.hash(password);
    const user = await this.userRepository.update(resetToken.userId, { passwordHash });

    // Mark token as used and invalidate remaining tokens
    await this.passwordResetTokenRepository.markUsed(resetToken.id);
    await this.passwordResetTokenRepository.invalidateByUserId(resetToken.userId);

    return user;
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new ResetPasswordError('Password must be at least 8 characters');
    }
    if (password.length > 72) {
      throw new ResetPasswordError('Password must be at most 72 characters');
    }
    if (!/[A-Z]/.test(password)) {
      throw new ResetPasswordError('Password must contain an uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      throw new ResetPasswordError('Password must contain a lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      throw new ResetPasswordError('Password must contain a number');
    }
  }
}
