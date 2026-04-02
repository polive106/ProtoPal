import { describe, it, expect } from 'vitest';
import { noteFormSchema } from './schemas';

describe('noteFormSchema', () => {
  it('accepts valid note data', () => {
    const result = noteFormSchema.safeParse({ title: 'My Note', content: 'Some content' });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = noteFormSchema.safeParse({ title: '', content: 'Some content' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('Title is required');
    }
  });

  it('rejects empty content', () => {
    const result = noteFormSchema.safeParse({ title: 'My Note', content: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('Content is required');
    }
  });
});
