import { describe, it, expect, vi } from 'vitest';
import { handleFormSubmit, getFieldError } from './formUtils';

describe('handleFormSubmit', () => {
  it('calls preventDefault and stopPropagation on the event', () => {
    const handler = vi.fn();
    const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as any;

    handleFormSubmit(handler)(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('calls the handler function', () => {
    const handler = vi.fn();
    const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as any;

    handleFormSubmit(handler)(event);

    expect(handler).toHaveBeenCalled();
  });
});

describe('getFieldError', () => {
  it('returns undefined for empty array', () => {
    expect(getFieldError([])).toBeUndefined();
  });

  it('returns the string when first error is a string', () => {
    expect(getFieldError(['Email is required'])).toBe('Email is required');
  });

  it('extracts message from object with message property', () => {
    expect(getFieldError([{ message: 'Invalid email' }])).toBe('Invalid email');
  });

  it('returns undefined for non-string, non-object errors', () => {
    expect(getFieldError([42])).toBeUndefined();
  });

  it('uses only the first error', () => {
    expect(getFieldError(['First error', 'Second error'])).toBe('First error');
  });
});
