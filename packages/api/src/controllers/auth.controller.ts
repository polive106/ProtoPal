import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  Res,
  Inject,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  RegisterUser,
  RegisterUserError,
  LoginUser,
  LoginUserError,
  GetUserRoles,
  VerifyEmail,
  VerifyEmailError,
  ResendVerification,
  ResendVerificationError,
  type TokenBlacklistRepository,
} from '@acme/domain';
import { JwtService, type JwtPayload, type JwtRole } from '../services';
import { Public, CurrentUser } from '../common/decorators';
import { ZodValidationPipe } from '../common/decorators';
import { RateLimit } from '../common/guards';
import { JWT_SERVICE, TOKEN_BLACKLIST_REPOSITORY } from '../modules/tokens';
import { hashToken } from '../common/utils/hash-token';
import {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  type RegisterDto,
  type LoginDto,
  type ResendVerificationDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(RegisterUser) private readonly registerUser: RegisterUser,
    @Inject(LoginUser) private readonly loginUser: LoginUser,
    @Inject(GetUserRoles) private readonly getUserRoles: GetUserRoles,
    @Inject(VerifyEmail) private readonly verifyEmail: VerifyEmail,
    @Inject(ResendVerification) private readonly resendVerification: ResendVerification,
    @Inject(JWT_SERVICE) private readonly jwtService: JwtService,
    @Inject(TOKEN_BLACKLIST_REPOSITORY) private readonly tokenBlacklistRepo: TokenBlacklistRepository,
  ) {}

  @Public()
  @Post('register')
  @RateLimit({ windowMs: 60 * 60 * 1000, max: 3, keyPrefix: 'register' })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto) {
    try {
      const result = await this.registerUser.execute({
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });
      const response: Record<string, unknown> = {
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          status: result.user.status,
        },
      };
      if (process.env.NODE_ENV !== 'production') {
        response.verificationToken = result.verificationToken;
      }
      return response;
    } catch (error) {
      if (error instanceof RegisterUserError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Public()
  @Get('verify')
  async verify(@Query('token') token: string) {
    try {
      const user = await this.verifyEmail.execute({ token: token || '' });
      return {
        message: 'Email verified successfully. You can now log in.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
        },
      };
    } catch (error) {
      if (error instanceof VerifyEmailError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Public()
  @Post('resend-verification')
  @RateLimit({ windowMs: 60 * 60 * 1000, max: 3, keyPrefix: 'resend-verification' })
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(
    @Body(new ZodValidationPipe(resendVerificationSchema)) dto: ResendVerificationDto,
  ) {
    try {
      const result = await this.resendVerification.execute({ email: dto.email });
      const response: Record<string, unknown> = {
        message: 'Verification email sent. Please check your inbox.',
      };
      if (process.env.NODE_ENV !== 'production') {
        response.verificationToken = result.verificationToken;
      }
      return response;
    } catch (error) {
      if (error instanceof ResendVerificationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Public()
  @Post('login')
  @RateLimit({ windowMs: 15 * 60 * 1000, max: 5, keyPrefix: 'login' })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const userWithRoles = await this.loginUser.execute({
        email: dto.email,
        password: dto.password,
      });

      const jwtRoles: JwtRole[] = userWithRoles.roles.map((role) => ({
        roleId: role.roleId,
        roleName: role.roleName,
      }));

      const token = await this.jwtService.generateToken({
        sub: userWithRoles.userId,
        email: userWithRoles.email,
        firstName: userWithRoles.firstName,
        lastName: userWithRoles.lastName,
        status: userWithRoles.status,
        roles: jwtRoles,
      });

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 1000,
        path: '/',
      });

      return {
        message: 'Login successful',
        token,
        user: {
          id: userWithRoles.userId,
          email: userWithRoles.email,
          firstName: userWithRoles.firstName,
          lastName: userWithRoles.lastName,
          status: userWithRoles.status,
          roles: jwtRoles,
        },
      };
    } catch (error) {
      if (error instanceof LoginUserError) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }

  @Get('me')
  async getMe(@CurrentUser() authUser: JwtPayload) {
    const userWithRoles = await this.getUserRoles.execute(authUser.sub);

    if (!userWithRoles) {
      throw new NotFoundException('User not found');
    }

    return {
      user: {
        id: userWithRoles.userId,
        email: userWithRoles.email,
        firstName: userWithRoles.firstName,
        lastName: userWithRoles.lastName,
        status: userWithRoles.status,
        roles: userWithRoles.roles.map((r) => ({
          roleId: r.roleId,
          roleName: r.roleName,
        })),
      },
    };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token =
      (req.cookies as Record<string, string>)?.auth_token ??
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : undefined);

    if (token) {
      try {
        const payload = await this.jwtService.verifyToken(token);
        const exp = (payload as JwtPayload & { exp?: number }).exp;
        const expiresAt = exp ? new Date(exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.tokenBlacklistRepo.add(hashToken(token), expiresAt);
      } catch {
        // Token is already invalid/expired — no need to blacklist
      }
    }

    res.clearCookie('auth_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }
}
