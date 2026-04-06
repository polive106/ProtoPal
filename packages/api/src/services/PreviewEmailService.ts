import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { exec } from 'child_process';
import type { EmailService } from '@acme/domain';

export class PreviewEmailService implements EmailService {
  private readonly baseUrl: string;

  constructor(baseUrl = 'http://localhost:5173') {
    this.baseUrl = baseUrl;
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verifyUrl = `${this.baseUrl}/verify?token=${token}`;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
    .card { background: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #111; font-size: 24px; }
    p { color: #555; line-height: 1.6; }
    .btn { display: inline-block; background: #111; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0; }
    .token { background: #f0f0f0; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 12px; word-break: break-all; color: #666; }
    .meta { font-size: 12px; color: #999; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Verify Your Email</h1>
    <p>Hi there! Please confirm your email address (<strong>${email}</strong>) by clicking the button below:</p>
    <a href="${verifyUrl}" class="btn">Verify Email</a>
    <p>Or copy and paste this link into your browser:</p>
    <div class="token">${verifyUrl}</div>
    <div class="meta">
      <p>This link expires in 24 hours.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>`;

    const filePath = join(tmpdir(), `email-preview-${Date.now()}.html`);
    await writeFile(filePath, html);

    const openCmd = process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${openCmd} "${filePath}"`, (err) => {
      if (err) {
        console.log(`[Email Preview] Could not open browser: ${err.message}`);
      }
    });

    console.log(`[Email Preview] Verification email for ${email}`);
    console.log(`[Email Preview] File: ${filePath}`);
    console.log(`[Email Preview] Verify URL: ${verifyUrl}`);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.baseUrl}/reset-password?token=${token}`;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
    .card { background: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #111; font-size: 24px; }
    p { color: #555; line-height: 1.6; }
    .btn { display: inline-block; background: #111; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0; }
    .token { background: #f0f0f0; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 12px; word-break: break-all; color: #666; }
    .meta { font-size: 12px; color: #999; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Reset Your Password</h1>
    <p>We received a request to reset the password for <strong>${email}</strong>. Click the button below to set a new password:</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p>Or copy and paste this link into your browser:</p>
    <div class="token">${resetUrl}</div>
    <div class="meta">
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>`;

    const filePath = join(tmpdir(), `email-preview-${Date.now()}.html`);
    await writeFile(filePath, html);

    const openCmd = process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${openCmd} "${filePath}"`, (err) => {
      if (err) {
        console.log(`[Email Preview] Could not open browser: ${err.message}`);
      }
    });

    console.log(`[Email Preview] Password reset email for ${email}`);
    console.log(`[Email Preview] File: ${filePath}`);
    console.log(`[Email Preview] Reset URL: ${resetUrl}`);
  }
}
