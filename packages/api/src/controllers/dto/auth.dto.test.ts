import { describe, it, expect } from 'vitest';
import { loginSchema } from './auth.dto';

describe('loginSchema', () => {
  it('rejects password shorter than 8 characters', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'short' });
    expect(result.success).toBe(false);
  });

  it('accepts password of exactly 8 characters', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '12345678' });
    expect(result.success).toBe(true);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '' });
    expect(result.success).toBe(false);
  });
});
