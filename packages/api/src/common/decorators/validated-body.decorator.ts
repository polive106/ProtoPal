import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { type ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const messages = result.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('; ');
      throw new BadRequestException(messages);
    }
    return result.data;
  }
}
