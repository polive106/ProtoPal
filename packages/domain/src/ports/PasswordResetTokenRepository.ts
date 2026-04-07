import type {
  PasswordResetToken,
  CreatePasswordResetTokenDTO,
} from '../entities/PasswordResetToken';

export interface PasswordResetTokenRepository {
  create(dto: CreatePasswordResetTokenDTO): Promise<PasswordResetToken>;
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
  markUsed(id: string): Promise<PasswordResetToken>;
  invalidateByUserId(userId: string): Promise<void>;
}
