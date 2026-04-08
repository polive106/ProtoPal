import {
  Controller,
  Post,
  Get,
  Body,
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
  AccountLockedError,
  GetUserRoles,
  VerifyEmail,
  VerifyEmailError,
  ResendVerification,
  ResendVerificationError,
  RequestPasswordReset,
  RequestPasswordResetError,
  ResetPassword,
  ResetPasswordError,
  type TokenBlacklistRepository,
} from '@acme/domain';
import { JwtService, type JwtPayload, type JwtRole, AuditLogService, AuditAction } from '../services';
import { Public, CurrentUser } from '../common/decorators';
import { ZodValidationPipe } from '../common/decorators';
import { RateLimit } from '../common/guards';
import { JWT_SERVICE, TOKEN_BLACKLIST_REPOSITORY } from '../modules/tokens';
import { hashToken } from '../common/utils/hash-token';
import {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  type RegisterDto,
  type LoginDto,
  type ResendVerificationDto,
  type ForgotPasswordDto,
  type ResetPasswordDto,
  type VerifyEmailDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(RegisterUser) private readonly registerUser: RegisterUser,
    @Inject(LoginUser) private readonly loginUser: LoginUser,
    @Inject(GetUserRoles) private readonly getUserRoles: GetUserRoles,
    @Inject(VerifyEmail) private readonly verifyEmail: VerifyEmail,
    @Inject(ResendVerification) private readonly resendVerification: ResendVerification,
    @Inject(RequestPasswordReset) private readonly requestPasswordReset: RequestPasswordReset,
    @Inject(ResetPassword) private readonly resetPasswordUseCase: ResetPassword,
    @Inject(JWT_SERVICE) private readonly jwtService: JwtService,
    @Inject(TOKEN_BLACKLIST_REPOSITORY) private readonly tokenBlacklistRepo: TokenBlacklistRepository,
    @Inject(AuditLogService) private readonly auditLogService: AuditLogService,
  ) {}

  @Public()
  @Post('register')
  @RateLimit({ windowMs: 60 * 60 * 1000, max: 3, keyPrefix: 'register' })
  @HttpCode(HttpStatus.OK)
  async register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto,
    @Req() req: Request,
  ) {
    try {
      const result = await this.registerUser.execute({
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });

      // Return identical response whether email exists or not (prevent enumeration)
      const genericMessage = 'Registration successful. Please check your email to verify your account.';

      if (!result) {
        this.auditLogService.log({
          action: AuditAction.REGISTER_FAILED,
          ip: req.ip,
          outcome: 'failure',
          metadata: { email: dto.email, reason: 'duplicate_email' },
        });
        return { message: genericMessage };
      }

      this.auditLogService.log({
        action: AuditAction.REGISTER,
        userId: result.user.id,
        ip: req.ip,
        outcome: 'success',
        metadata: { email: dto.email },
      });

      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV] Verification token for ${dto.email}: ${result.verificationToken}`);
      }
      return { message: genericMessage };
    } catch (error) {
      if (error instanceof RegisterUserError) {
        this.auditLogService.log({
          action: AuditAction.REGISTER_FAILED,
          ip: req.ip,
          outcome: 'failure',
          metadata: { email: dto.email, reason: error.message },
        });
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(
    @Body(new ZodValidationPipe(verifyEmailSchema)) dto: VerifyEmailDto,
  ) {
    try {
      const user = await this.verifyEmail.execute({ token: dto.token });
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

      // Return identical response whether email exists/pending or not (prevent enumeration)
      const genericMessage = 'If a pending account exists for this email, a verification email has been sent.';

      if (!result) {
        return { message: genericMessage };
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV] Resend verification token for ${dto.email}: ${result.verificationToken}`);
      }
      return { message: genericMessage };
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
    @Req() req: Request,
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
        tokenVersion: userWithRoles.tokenVersion,
        roles: jwtRoles,
      });

      const isMobileClient = req.headers['x-client-type'] === 'mobile';

      if (!isMobileClient) {
        res.cookie('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 1000,
          path: '/',
        });
      }

      this.auditLogService.log({
        action: AuditAction.LOGIN,
        userId: userWithRoles.userId,
        ip: req.ip,
        outcome: 'success',
        metadata: { email: dto.email },
      });

      const responseBody: Record<string, unknown> = {
        message: 'Login successful',
        user: {
          id: userWithRoles.userId,
          email: userWithRoles.email,
          firstName: userWithRoles.firstName,
          lastName: userWithRoles.lastName,
          status: userWithRoles.status,
          roles: jwtRoles,
        },
      };

      if (isMobileClient) {
        responseBody.token = token;
      }

      return responseBody;
    } catch (error) {
      if (error instanceof AccountLockedError) {
        this.auditLogService.log({
          action: AuditAction.LOGIN_FAILED,
          ip: req.ip,
          outcome: 'failure',
          metadata: { email: dto.email, reason: 'account_locked' },
        });
        res.setHeader('Retry-After', String(error.retryAfterSeconds));
        res.status(HttpStatus.TOO_MANY_REQUESTS).json({
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: error.message,
          retryAfter: error.retryAfterSeconds,
        });
        return;
      }
      if (error instanceof LoginUserError) {
        this.auditLogService.log({
          action: AuditAction.LOGIN_FAILED,
          ip: req.ip,
          outcome: 'failure',
          metadata: { email: dto.email, reason: error.message },
        });
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }

  @Public()
  @Post('forgot-password')
  @RateLimit({ windowMs: 60 * 60 * 1000, max: 3, keyPrefix: 'forgot-password' })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema)) dto: ForgotPasswordDto,
    @Req() req: Request,
  ) {
    try {
      const result = await this.requestPasswordReset.execute({ email: dto.email });

      this.auditLogService.log({
        action: AuditAction.PASSWORD_RESET_REQUESTED,
        ip: req.ip,
        outcome: 'success',
        metadata: { email: dto.email },
      });

      const response: Record<string, unknown> = {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
      if (process.env.NODE_ENV !== 'production' && result) {
        response.resetToken = result.resetToken;
      }
      return response;
    } catch (error) {
      if (error instanceof RequestPasswordResetError) {
        this.auditLogService.log({
          action: AuditAction.PASSWORD_RESET_FAILED,
          ip: req.ip,
          outcome: 'failure',
          metadata: { reason: error.message },
        });
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) dto: ResetPasswordDto,
    @Req() req: Request,
  ) {
    try {
      const user = await this.resetPasswordUseCase.execute({
        token: dto.token,
        password: dto.password,
      });

      this.auditLogService.log({
        action: AuditAction.PASSWORD_RESET_COMPLETED,
        userId: user.id,
        ip: req.ip,
        outcome: 'success',
      });

      return {
        message: 'Password has been reset successfully. You can now log in with your new password.',
      };
    } catch (error) {
      if (error instanceof ResetPasswordError) {
        this.auditLogService.log({
          action: AuditAction.PASSWORD_RESET_FAILED,
          ip: req.ip,
          outcome: 'failure',
          metadata: { reason: error.message },
        });
        throw new BadRequestException(error.message);
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

    let logoutUserId: string | undefined;

    if (token) {
      try {
        const payload = await this.jwtService.verifyToken(token);
        logoutUserId = payload.sub;
        const exp = (payload as JwtPayload & { exp?: number }).exp;
        const expiresAt = exp ? new Date(exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.tokenBlacklistRepo.add(hashToken(token), expiresAt);
      } catch {
        // Token is already invalid/expired — no need to blacklist
      }
    }

    this.auditLogService.log({
      action: AuditAction.LOGOUT,
      ...(logoutUserId && { userId: logoutUserId }),
      ip: req.ip,
      outcome: 'success',
    });

    res.clearCookie('auth_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }
}
