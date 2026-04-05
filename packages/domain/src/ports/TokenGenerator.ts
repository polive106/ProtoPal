export interface TokenGenerator {
  generate(): string;
  hash(token: string): string;
}
