import type { EmailService } from '@acme/domain';

export class ConsoleEmailService implements EmailService {
  private static verificationTokens = new Map<string, string>();
  private static resetTokens = new Map<string, string>();

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    ConsoleEmailService.verificationTokens.set(email, token);
    console.log(`[Email] Verification email for ${email}`);
    console.log(`[Email] Token: ${token}`);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    ConsoleEmailService.resetTokens.set(email, token);
    console.log(`[Email] Password reset email for ${email}`);
    console.log(`[Email] Reset token: ${token}`);
  }

  static getVerificationToken(email: string): string | undefined {
    return ConsoleEmailService.verificationTokens.get(email);
  }

  static getResetToken(email: string): string | undefined {
    return ConsoleEmailService.resetTokens.get(email);
  }
}
