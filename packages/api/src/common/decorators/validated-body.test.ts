import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './validated-body.decorator';

describe('ZodValidationPipe', () => {
  const schema = z.object({ name: z.string() });
  let pipe: ZodValidationPipe;

  beforeEach(() => {
    pipe = new ZodValidationPipe(schema);
  });

  it('passes through valid data', () => {
    const result = pipe.transform({ name: 'Alice' }, { type: 'body', metatype: undefined, data: undefined });
    expect(result).toEqual({ name: 'Alice' });
  });

  it('throws BadRequestException with formatted message for invalid data', () => {
    expect(() =>
      pipe.transform({ name: 123 }, { type: 'body', metatype: undefined, data: undefined }),
    ).toThrow(BadRequestException);
  });

  it('handles multiple validation errors joined by semicolons', () => {
    const multiSchema = z.object({
      name: z.string(),
      age: z.number(),
    });
    const multiPipe = new ZodValidationPipe(multiSchema);

    try {
      multiPipe.transform({ name: 123, age: 'not-a-number' }, { type: 'body', metatype: undefined, data: undefined });
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const message = (error as BadRequestException).message;
      expect(message).toContain(';');
    }
  });
});
