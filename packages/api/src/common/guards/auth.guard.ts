import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { TokenBlacklistRepository } from '@acme/domain';
import { JwtService } from '../../services/JwtService';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { hashToken } from '../utils/hash-token';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly tokenBlacklistRepo?: TokenBlacklistRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token =
      (request.cookies as Record<string, string>)?.auth_token ??
      this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    if (this.tokenBlacklistRepo) {
      const isBlacklisted = await this.tokenBlacklistRepo.exists(hashToken(token));
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }

    try {
      const payload = await this.jwtService.verifyToken(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractBearerToken(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (authorization?.startsWith('Bearer ')) {
      return authorization.slice(7);
    }
    return undefined;
  }
}
