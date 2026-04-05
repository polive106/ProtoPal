import type {
  VerificationToken,
  CreateVerificationTokenDTO,
} from '../entities/VerificationToken';

export interface VerificationTokenRepository {
  create(dto: CreateVerificationTokenDTO): Promise<VerificationToken>;
  findByTokenHash(tokenHash: string): Promise<VerificationToken | null>;
  findActiveByUserId(userId: string): Promise<VerificationToken | null>;
  markVerified(id: string): Promise<VerificationToken>;
  invalidateByUserId(userId: string): Promise<void>;
}
