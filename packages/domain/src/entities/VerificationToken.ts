export interface VerificationToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  verifiedAt: Date | null;
  createdAt: Date;
}

export interface CreateVerificationTokenDTO {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}
