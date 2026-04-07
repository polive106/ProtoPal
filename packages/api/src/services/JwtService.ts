import { SignJWT, jwtVerify } from 'jose';

export interface JwtRole {
  roleId: string;
  roleName: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  tokenVersion: number;
  roles: JwtRole[];
}

export class JwtService {
  private readonly secret: Uint8Array;
  private readonly expiresIn: string;

  constructor(secret: string, expiresIn = '24h') {
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters');
    }
    this.secret = new TextEncoder().encode(secret);
    this.expiresIn = expiresIn;
  }

  async generateToken(payload: JwtPayload): Promise<string> {
    return new SignJWT({ ...payload } as unknown as Record<string, unknown>)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.expiresIn)
      .sign(this.secret);
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    const { payload } = await jwtVerify(token, this.secret);
    return payload as unknown as JwtPayload;
  }
}
