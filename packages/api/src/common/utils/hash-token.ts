import { CryptoTokenGenerator } from '../../services/CryptoTokenGenerator';

const tokenGenerator = new CryptoTokenGenerator();

export function hashToken(token: string): string {
  return tokenGenerator.hash(token);
}
