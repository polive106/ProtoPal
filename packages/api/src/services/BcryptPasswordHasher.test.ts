import { BcryptPasswordHasher } from './BcryptPasswordHasher';

describe('BcryptPasswordHasher', () => {
  const hasher = new BcryptPasswordHasher();

  it('hash returns a string different from the input', async () => {
    const password = 'my-secret-password';
    const hashed = await hasher.hash(password);

    expect(typeof hashed).toBe('string');
    expect(hashed).not.toBe(password);
  });

  it('hash returns different hashes for the same input', async () => {
    const password = 'my-secret-password';
    const hash1 = await hasher.hash(password);
    const hash2 = await hasher.hash(password);

    expect(hash1).not.toBe(hash2);
  });

  it('verify returns true for matching password', async () => {
    const password = 'my-secret-password';
    const hashed = await hasher.hash(password);

    const result = await hasher.verify(password, hashed);
    expect(result).toBe(true);
  });

  it('verify returns false for wrong password', async () => {
    const password = 'my-secret-password';
    const hashed = await hasher.hash(password);

    const result = await hasher.verify('wrong-password', hashed);
    expect(result).toBe(false);
  });
});
