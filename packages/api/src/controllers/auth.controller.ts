import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Inject,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  RegisterUser,
  RegisterUserError,
  LoginUser,
  LoginUserError,
  GetUserRoles,
} from '@acme/domain';
import { JwtService, type JwtPayload, type JwtRole } from '../services';
import { Public, CurrentUser } from '../common/decorators';
import { ZodValidationPipe } from '../common/decorators';
import { RateLimit } from '../common/guards';
import { JWT_SERVICE } from '../modules/tokens';
import { registerSchema, loginSchema, type RegisterDto, type LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(RegisterUser) private readonly registerUser: RegisterUser,
    @Inject(LoginUser) private readonly loginUser: LoginUser,
    @Inject(GetUserRoles) private readonly getUserRoles: GetUserRoles,
    @Inject(JWT_SERVICE) private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Post('register')
  @RateLimit({ windowMs: 60 * 60 * 1000, max: 3, keyPrefix: 'register' })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto) {
    try {
      const user = await this.registerUser.execute({
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });
      return {
        message: 'Registration successful.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
        },
      };
    } catch (error) {
      if (error instanceof RegisterUserError) {
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
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }
}
