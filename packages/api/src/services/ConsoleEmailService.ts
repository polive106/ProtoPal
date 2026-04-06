import type { EmailService } from '@acme/domain';

export class ConsoleEmailService implements EmailService {
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    console.log(`[Email] Verification email for ${email}`);
    console.log(`[Email] Token: ${token}`);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    console.log(`[Email] Password reset email for ${email}`);
    console.log(`[Email] Reset token: ${token}`);
  }
}
