import { describe, it, expect } from 'vitest';
import { loginSchema, registrationSchema } from './schemas';

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'pass123' });
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'pass123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('validation.emailRequired');
    }
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'pass123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('validation.emailInvalid');
    }
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('validation.passwordRequired');
    }
  });
});

describe('registrationSchema', () => {
  const validData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'Password1',
  };

  it('accepts valid registration data', () => {
    const result = registrationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects empty first name', () => {
    const result = registrationSchema.safeParse({ ...validData, firstName: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('validation.firstNameRequired');
    }
  });

  it('rejects empty last name', () => {
    const result = registrationSchema.safeParse({ ...validData, lastName: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('validation.lastNameRequired');
    }
  });

  it('rejects password shorter than 8 characters', () => {
    const result = registrationSchema.safeParse({ ...validData, password: 'Ab1' });
    expect(result.success).toBe(false);
  });

  it('rejects password without uppercase letter', () => {
    const result = registrationSchema.safeParse({ ...validData, password: 'password1' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('validation.passwordUppercase');
    }
  });

  it('rejects password without lowercase letter', () => {
    const result = registrationSchema.safeParse({ ...validData, password: 'PASSWORD1' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('validation.passwordLowercase');
    }
  });

  it('rejects password without number', () => {
    const result = registrationSchema.safeParse({ ...validData, password: 'Passwordd' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('validation.passwordNumber');
    }
  });
});
