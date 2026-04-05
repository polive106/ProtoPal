import { randomBytes, createHash } from 'crypto';
import type { TokenGenerator } from '@acme/domain';

export class CryptoTokenGenerator implements TokenGenerator {
  generate(): string {
    return randomBytes(32).toString('hex');
  }

  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
