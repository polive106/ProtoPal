import { z } from 'zod';
import { INPUT_LIMITS } from '../constants';

const emailField = z
  .string()
  .min(1, 'Email is required')
  .max(INPUT_LIMITS.EMAIL_MAX, `Email must be at most ${INPUT_LIMITS.EMAIL_MAX} characters`)
  .email('Invalid email address');

const passwordField = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Minimum 8 characters')
  .max(INPUT_LIMITS.PASSWORD_MAX, `Password must be at most ${INPUT_LIMITS.PASSWORD_MAX} characters`)
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[0-9]/, 'Must contain a number');

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registrationSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(INPUT_LIMITS.FIRST_NAME_MAX, `First name must be at most ${INPUT_LIMITS.FIRST_NAME_MAX} characters`),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(INPUT_LIMITS.LAST_NAME_MAX, `Last name must be at most ${INPUT_LIMITS.LAST_NAME_MAX} characters`),
  email: emailField,
  password: passwordField,
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: passwordField,
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
