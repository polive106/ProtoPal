import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AuthGuard, RolesGuard, RateLimitGuard } from './common/guards';
import { HttpExceptionFilter } from './common/filters';
import { LoggingInterceptor } from './common/interceptors';
import { JwtService } from './services';
import type { TokenBlacklistRepository } from '@acme/domain';
import { JWT_SERVICE, TOKEN_BLACKLIST_REPOSITORY } from './modules/tokens';

export const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
];

export function getAllowedOrigins(): string[] {
  const envOrigins = process.env.CORS_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(',').map((origin) => origin.trim());
  }
  return DEFAULT_ORIGINS;
}

export function createCorsOriginHandler(allowedOrigins: string[]) {
  return (origin: string | undefined, callback: (err: Error | null, origin?: string | boolean) => void) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, origin);
      return;
    }
    callback(null, false);
  };
}

export function validateStartupEnv(): void {
  if (!process.env.NODE_ENV) {
    console.warn('WARNING: NODE_ENV is not explicitly set');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is required');
  }
}

async function bootstrap() {
  validateStartupEnv();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  app.use(helmet());

  const allowedOrigins = getAllowedOrigins();
  app.enableCors({
    origin: createCorsOriginHandler(allowedOrigins),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
  });

  const reflector = app.get(Reflector);
  const jwtService = app.get<JwtService>(JWT_SERVICE);
  const tokenBlacklistRepo = app.get<TokenBlacklistRepository>(TOKEN_BLACKLIST_REPOSITORY);
  app.useGlobalGuards(
    new AuthGuard(jwtService, reflector, tokenBlacklistRepo),
    new RolesGuard(reflector),
    new RateLimitGuard(reflector),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);
  console.log(`Server running at http://localhost:${port}`);
}

if (!process.env.VITEST) {
  bootstrap();
}
