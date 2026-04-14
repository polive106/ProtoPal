import { ERROR_KEYS } from '@acme/shared';

export const ERROR_MESSAGE_TO_KEY: Record<string, string> = {
  // Auth - login
  'Invalid email or password': ERROR_KEYS.INVALID_CREDENTIALS,
  'Failed to retrieve user roles': ERROR_KEYS.INVALID_CREDENTIALS,

  // Auth - verification
  'Invalid or expired verification token': ERROR_KEYS.INVALID_VERIFICATION_TOKEN,
  'Verification token is required': ERROR_KEYS.INVALID_VERIFICATION_TOKEN,
  'Email has already been verified': ERROR_KEYS.EMAIL_ALREADY_VERIFIED,

  // Auth - password reset
  'Invalid or expired reset token': ERROR_KEYS.INVALID_RESET_TOKEN,
  'Reset token has already been used': ERROR_KEYS.RESET_TOKEN_USED,

  // Auth - user
  'User not found': ERROR_KEYS.USER_NOT_FOUND,

  // Notes
  'Note not found': ERROR_KEYS.NOTE_NOT_FOUND,
  'Not authorized to delete this note': ERROR_KEYS.NOTE_ACCESS_DENIED,
  'Not authorized to view this note': ERROR_KEYS.NOTE_ACCESS_DENIED,
  'Not authorized to update this note': ERROR_KEYS.NOTE_ACCESS_DENIED,
};
