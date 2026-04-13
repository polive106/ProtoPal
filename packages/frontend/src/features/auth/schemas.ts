import { z } from 'zod';
import { INPUT_LIMITS } from '@acme/shared';

export type { LoginFormData, RegistrationFormData, ForgotPasswordFormData, ResetPasswordFormData } from '@acme/shared';

const emailField = z
  .string()
  .min(1, 'validation.emailRequired')
  .max(INPUT_LIMITS.EMAIL_MAX, 'validation.emailMaxLength')
  .email('validation.emailInvalid');

const passwordField = z
  .string()
  .min(1, 'validation.passwordRequired')
  .min(8, 'validation.passwordMinLength')
  .max(INPUT_LIMITS.PASSWORD_MAX, 'validation.passwordMaxLength')
  .regex(/[A-Z]/, 'validation.passwordUppercase')
  .regex(/[a-z]/, 'validation.passwordLowercase')
  .regex(/[0-9]/, 'validation.passwordNumber');

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'validation.passwordRequired'),
});

export const registrationSchema = z.object({
  firstName: z
    .string()
    .min(1, 'validation.firstNameRequired')
    .max(INPUT_LIMITS.FIRST_NAME_MAX, 'validation.firstNameMaxLength'),
  lastName: z
    .string()
    .min(1, 'validation.lastNameRequired')
    .max(INPUT_LIMITS.LAST_NAME_MAX, 'validation.lastNameMaxLength'),
  email: emailField,
  password: passwordField,
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z.object({
  password: passwordField,
});
