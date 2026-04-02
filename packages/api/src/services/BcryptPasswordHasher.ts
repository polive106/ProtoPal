import bcrypt from 'bcrypt';
import type { PasswordHasher } from '@acme/domain';

export class BcryptPasswordHasher implements PasswordHasher {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
