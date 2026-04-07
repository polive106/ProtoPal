import { JwtService } from './JwtService';

const payload = {
  sub: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  status: 'approved',
  tokenVersion: 0,
  roles: [{ roleId: 'role-1', roleName: 'user' }],
};

describe('JwtService', () => {
  it('throws when secret is too short', () => {
    expect(() => new JwtService('short')).toThrow('JWT_SECRET must be at least 32 characters');
  });

  it('throws when secret is empty', () => {
    expect(() => new JwtService('')).toThrow('JWT_SECRET must be at least 32 characters');
  });

  const service = new JwtService('test-secret-that-is-at-least-32-chars!');

  it('generateToken produces a string', async () => {
    const token = await service.generateToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('verifyToken round-trips correctly', async () => {
    const token = await service.generateToken(payload);
    const decoded = await service.verifyToken(token);

    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.firstName).toBe(payload.firstName);
    expect(decoded.lastName).toBe(payload.lastName);
    expect(decoded.status).toBe(payload.status);
    expect(decoded.roles).toEqual(payload.roles);
  });

  it('verifyToken throws on tampered token', async () => {
    const token = await service.generateToken(payload);
    const tampered = token.slice(0, -4) + 'xxxx';

    await expect(service.verifyToken(tampered)).rejects.toThrow();
  });

  it('verifyToken throws on expired token', async () => {
    const shortLivedService = new JwtService(
      'test-secret-that-is-at-least-32-chars!',
      '1s',
    );
    const token = await shortLivedService.generateToken(payload);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await expect(shortLivedService.verifyToken(token)).rejects.toThrow();
  });
});
