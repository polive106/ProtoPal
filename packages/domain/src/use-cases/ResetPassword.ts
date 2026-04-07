import type { PasswordResetTokenRepository } from '../ports/PasswordResetTokenRepository';
import type { UserRepository } from '../ports/UserRepository';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { TokenGenerator } from '../ports/TokenGenerator';
import type { User } from '../entities/User';
import { validatePassword, PasswordValidationError } from '../validation/password';

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

    try {
      validatePassword(dto.password || '');
    } catch (error) {
      if (error instanceof PasswordValidationError) {
        throw new ResetPasswordError(error.message);
      }
      throw error;
    }

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

    const existingUser = await this.userRepository.findById(resetToken.userId);
    if (!existingUser) {
      throw new ResetPasswordError('User not found');
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const user = await this.userRepository.update(resetToken.userId, {
      passwordHash,
      tokenVersion: existingUser.tokenVersion + 1,
    });

    await Promise.all([
      this.passwordResetTokenRepository.markUsed(resetToken.id),
      this.passwordResetTokenRepository.invalidateByUserId(resetToken.userId),
    ]);

    return user;
  }
}
