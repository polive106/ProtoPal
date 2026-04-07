import { INPUT_LIMITS } from '@acme/shared';

export class PasswordValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordValidationError';
  }
}

export function validatePassword(password: string): void {
  if (!password || password.length < 8) {
    throw new PasswordValidationError('Password must be at least 8 characters');
  }
  if (password.length > INPUT_LIMITS.PASSWORD_MAX) {
    throw new PasswordValidationError(`Password must be at most ${INPUT_LIMITS.PASSWORD_MAX} characters`);
  }
  if (!/[A-Z]/.test(password)) {
    throw new PasswordValidationError('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    throw new PasswordValidationError('Password must contain a lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    throw new PasswordValidationError('Password must contain a number');
  }
}
