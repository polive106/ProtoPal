export interface EmailService {
  sendVerificationEmail(email: string, token: string): Promise<void>;
}
