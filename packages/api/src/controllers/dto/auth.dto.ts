import { z } from 'zod';
import { INPUT_LIMITS } from '@acme/shared';

export const loginSchema = z.object({
  email: z.string().max(INPUT_LIMITS.EMAIL_MAX).email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  email: z.string().max(INPUT_LIMITS.EMAIL_MAX).email(),
  password: z
    .string()
    .min(8)
    .max(INPUT_LIMITS.PASSWORD_MAX, `Password must be at most ${INPUT_LIMITS.PASSWORD_MAX} characters`)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  firstName: z.string().min(1).max(INPUT_LIMITS.FIRST_NAME_MAX),
  lastName: z.string().min(1).max(INPUT_LIMITS.LAST_NAME_MAX),
});

export const resendVerificationSchema = z.object({
  email: z.string().max(INPUT_LIMITS.EMAIL_MAX).email(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().max(INPUT_LIMITS.EMAIL_MAX).email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .max(INPUT_LIMITS.PASSWORD_MAX, `Password must be at most ${INPUT_LIMITS.PASSWORD_MAX} characters`)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type ResendVerificationDto = z.infer<typeof resendVerificationSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
