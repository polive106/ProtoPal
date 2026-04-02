import { type INestApplication, type Provider, type Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AuthGuard, RolesGuard, RateLimitGuard } from '../common/guards';
import { HttpExceptionFilter } from '../common/filters';
import { LoggingInterceptor } from '../common/interceptors';
import { JwtService, type JwtPayload } from '../services';
import { JWT_SERVICE } from '../modules/tokens';

export const mockUserPayload: JwtPayload = {
  sub: 'user-test-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  status: 'approved',
  roles: [{ roleId: 'role-1', roleName: 'user' }],
};

export async function createTestApp({
  controllers,
  providers,
}: {
  controllers: Type[];
  providers: Provider[];
}): Promise<{ app: INestApplication; jwtService: JwtService }> {
  const moduleRef = await Test.createTestingModule({
    controllers,
    providers: [...providers, { provide: JWT_SERVICE, useClass: JwtService }],
  }).compile();

  const app = moduleRef.createNestApplication();
  const jwtService = moduleRef.get<JwtService>(JWT_SERVICE);
  const reflector = moduleRef.get(Reflector);

  app.use(cookieParser());
  app.useGlobalGuards(
    new AuthGuard(jwtService, reflector),
    new RolesGuard(reflector),
    new RateLimitGuard(reflector),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.init();

  return { app, jwtService };
}

export async function authCookie(
  jwtService: JwtService,
  overrides?: Partial<JwtPayload>,
): Promise<string> {
  const payload: JwtPayload = { ...mockUserPayload, ...overrides };
  const token = await jwtService.generateToken(payload);
  return `auth_token=${token}`;
}
