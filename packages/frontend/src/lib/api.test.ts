import { describe, it, expect } from 'vitest';
import { ApiError } from './api';

describe('ApiError', () => {
  it('should create an error with status and message', () => {
    const error = new ApiError(404, 'Not found');
    expect(error.status).toBe(404);
    expect(error.message).toBe('Not found');
    expect(error.name).toBe('ApiError');
  });

  it('should include details when provided', () => {
    const details = { email: ['Email is required'] };
    const error = new ApiError(400, 'Validation failed', details);
    expect(error.details).toEqual(details);
  });
});
