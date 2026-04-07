import { Test } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
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
  RequestPasswordReset,
  ResetPassword,
} from '@acme/domain';
import { AuthController } from './auth.controller';
import { JWT_SERVICE, TOKEN_BLACKLIST_REPOSITORY } from '../modules/tokens';
import { AuditLogService, AuditAction } from '../services';

const mockRegisterUser = { execute: vi.fn() };
const mockLoginUser = { execute: vi.fn() };
const mockGetUserRoles = { execute: vi.fn() };
const mockVerifyEmail = { execute: vi.fn() };
const mockResendVerification = { execute: vi.fn() };
const mockRequestPasswordReset = { execute: vi.fn() };
const mockResetPassword = { execute: vi.fn() };
const mockJwtService = { generateToken: vi.fn(), verifyToken: vi.fn() };
const mockTokenBlacklistRepo = { add: vi.fn(), exists: vi.fn(), deleteExpired: vi.fn() };
const mockAuditLogService = { log: vi.fn() };

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: RegisterUser, useValue: mockRegisterUser },
        { provide: LoginUser, useValue: mockLoginUser },
        { provide: GetUserRoles, useValue: mockGetUserRoles },
        { provide: VerifyEmail, useValue: mockVerifyEmail },
        { provide: ResendVerification, useValue: mockResendVerification },
        { provide: RequestPasswordReset, useValue: mockRequestPasswordReset },
        { provide: ResetPassword, useValue: mockResetPassword },
        { provide: JWT_SERVICE, useValue: mockJwtService },
        { provide: TOKEN_BLACKLIST_REPOSITORY, useValue: mockTokenBlacklistRepo },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  describe('register', () => {
    const dto = { email: 'test@example.com', password: 'Password1!', firstName: 'Test', lastName: 'User' };
    const mockReq = { ip: '127.0.0.1' } as any;

    it('returns 200 with generic message on success', async () => {
      const user = { id: 'u1', email: dto.email, firstName: dto.firstName, lastName: dto.lastName, status: 'pending' };
      mockRegisterUser.execute.mockResolvedValue({ user, verificationToken: 'test-token' });

      const result = await controller.register(dto, mockReq);

      expect(result).toEqual(
        expect.objectContaining({
          message: expect.stringContaining('Please check your email'),
        }),
      );
    });

    it('returns 200 with same generic message for duplicate email (prevent enumeration)', async () => {
      mockRegisterUser.execute.mockResolvedValue(null);

      const result = await controller.register(dto, mockReq);

      expect(result).toEqual(
        expect.objectContaining({
          message: expect.stringContaining('Please check your email'),
        }),
      );
    });

    it('throws BadRequestException on RegisterUserError', async () => {
      mockRegisterUser.execute.mockRejectedValue(new RegisterUserError('Email taken'));

      await expect(controller.register(dto, mockReq)).rejects.toThrow(BadRequestException);
    });

    it('re-throws other errors', async () => {
      const err = new Error('unexpected');
      mockRegisterUser.execute.mockRejectedValue(err);

      await expect(controller.register(dto, mockReq)).rejects.toThrow(err);
    });

    it('logs audit event on successful registration', async () => {
      const user = { id: 'u1', email: dto.email, firstName: dto.firstName, lastName: dto.lastName, status: 'pending' };
      mockRegisterUser.execute.mockResolvedValue({ user, verificationToken: 'test-token' });

      await controller.register(dto, mockReq);

      expect(mockAuditLogService.log).toHaveBeenCalledWith({
        action: AuditAction.REGISTER,
        userId: 'u1',
        ip: '127.0.0.1',
        outcome: 'success',
        metadata: { email: dto.email },
      });
    });

    it('logs audit event on duplicate email registration', async () => {
      mockRegisterUser.execute.mockResolvedValue(null);

      await controller.register(dto, mockReq);

      expect(mockAuditLogService.log).toHaveBeenCalledWith({
        action: AuditAction.REGISTER_FAILED,
        ip: '127.0.0.1',
        outcome: 'failure',
        metadata: { email: dto.email, reason: 'duplicate_email' },
      });
    });
  });

  describe('verify', () => {
    it('returns success when token is valid', async () => {
      const user = { id: 'u1', email: 'test@example.com', firstName: 'Test', lastName: 'User', status: 'approved' };
      mockVerifyEmail.execute.mockResolvedValue(user);

      const result = await controller.verify('valid-token');

      expect(result.message).toContain('Email verified successfully');
      expect(result.user.status).toBe('approved');
    });

    it('throws BadRequestException on VerifyEmailError', async () => {
      mockVerifyEmail.execute.mockRejectedValue(new VerifyEmailError('Invalid or expired'));

      await expect(controller.verify('bad-token')).rejects.toThrow(BadRequestException);
    });
  });

  describe('resendVerificationEmail', () => {
    it('returns generic message on success (prevent enumeration)', async () => {
      mockResendVerification.execute.mockResolvedValue({ verificationToken: 'new-token' });

      const result = await controller.resendVerificationEmail({ email: 'test@example.com' });

      expect(result.message).toContain('If a pending account exists');
    });

    it('returns same generic message when no pending account found (prevent enumeration)', async () => {
      mockResendVerification.execute.mockResolvedValue(null);

      const result = await controller.resendVerificationEmail({ email: 'test@example.com' });

      expect(result.message).toContain('If a pending account exists');
    });

    it('throws BadRequestException on ResendVerificationError', async () => {
      mockResendVerification.execute.mockRejectedValue(
        new ResendVerificationError('Email is required'),
      );

      await expect(controller.resendVerificationEmail({ email: '' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    const dto = { email: 'test@example.com', password: 'Password1!' };
    const mockReq = { ip: '10.0.0.1' } as any;
    const mockRes = { cookie: vi.fn(), clearCookie: vi.fn() } as any;

    it('returns 200 with user and sets cookie on success', async () => {
      const userWithRoles = {
        userId: 'u1',
        email: dto.email,
        firstName: 'Test',
        lastName: 'User',
        status: 'approved',
        tokenVersion: 0,
        roles: [{ roleId: 'r1', roleName: 'user' }],
      };
      mockLoginUser.execute.mockResolvedValue(userWithRoles);
      mockJwtService.generateToken.mockResolvedValue('token');

      const result = await controller.login(dto, mockReq, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith('auth_token', 'token', expect.objectContaining({ httpOnly: true, path: '/' }));
      expect(result).toEqual(
        expect.objectContaining({
          message: 'Login successful',
          token: 'token',
          user: expect.objectContaining({ id: 'u1', email: dto.email }),
        }),
      );
    });

    it('throws UnauthorizedException on LoginUserError', async () => {
      mockLoginUser.execute.mockRejectedValue(new LoginUserError('Invalid credentials'));

      await expect(controller.login(dto, mockReq, mockRes)).rejects.toThrow(UnauthorizedException);
    });

    it('logs audit event on successful login', async () => {
      const userWithRoles = {
        userId: 'u1',
        email: dto.email,
        firstName: 'Test',
        lastName: 'User',
        status: 'approved',
        tokenVersion: 0,
        roles: [{ roleId: 'r1', roleName: 'user' }],
      };
      mockLoginUser.execute.mockResolvedValue(userWithRoles);
      mockJwtService.generateToken.mockResolvedValue('token');

      await controller.login(dto, mockReq, mockRes);

      expect(mockAuditLogService.log).toHaveBeenCalledWith({
        action: AuditAction.LOGIN,
        userId: 'u1',
        ip: '10.0.0.1',
        outcome: 'success',
        metadata: { email: dto.email },
      });
    });

    it('logs audit event on failed login', async () => {
      mockLoginUser.execute.mockRejectedValue(new LoginUserError('Invalid credentials'));

      await expect(controller.login(dto, mockReq, mockRes)).rejects.toThrow(UnauthorizedException);

      expect(mockAuditLogService.log).toHaveBeenCalledWith({
        action: AuditAction.LOGIN_FAILED,
        ip: '10.0.0.1',
        outcome: 'failure',
        metadata: { email: dto.email, reason: 'Invalid credentials' },
      });
    });

    it('never includes password in audit log metadata', async () => {
      mockLoginUser.execute.mockRejectedValue(new LoginUserError('Invalid credentials'));

      await expect(controller.login(dto, mockReq, mockRes)).rejects.toThrow(UnauthorizedException);

      const logCall = mockAuditLogService.log.mock.calls[0]![0];
      expect(logCall.metadata).not.toHaveProperty('password');
    });
  });

  describe('getMe', () => {
    const authUser = { sub: 'u1', email: 'test@example.com', firstName: 'Test', lastName: 'User', status: 'approved', tokenVersion: 0, roles: [] };

    it('returns user with roles', async () => {
      mockGetUserRoles.execute.mockResolvedValue({
        userId: 'u1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        status: 'approved',
        roles: [{ roleId: 'r1', roleName: 'admin' }],
      });

      const result = await controller.getMe(authUser);

      expect(result.user).toEqual(
        expect.objectContaining({
          id: 'u1',
          roles: [{ roleId: 'r1', roleName: 'admin' }],
        }),
      );
    });

    it('throws NotFoundException when user not found', async () => {
      mockGetUserRoles.execute.mockResolvedValue(null);

      await expect(controller.getMe(authUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('logout', () => {
    it('clears auth_token cookie and returns message', async () => {
      const mockReq = { cookies: {}, headers: {}, ip: '127.0.0.1' } as any;
      const mockRes = { cookie: vi.fn(), clearCookie: vi.fn() } as any;

      const result = await controller.logout(mockReq, mockRes);

      expect(mockRes.clearCookie).toHaveBeenCalledWith('auth_token', { path: '/' });
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('blacklists token from cookie on logout', async () => {
      const mockReq = { cookies: { auth_token: 'my-token' }, headers: {}, ip: '127.0.0.1' } as any;
      const mockRes = { cookie: vi.fn(), clearCookie: vi.fn() } as any;
      mockJwtService.verifyToken.mockResolvedValue({ sub: 'u1', exp: Math.floor(Date.now() / 1000) + 3600 });
      mockTokenBlacklistRepo.add.mockResolvedValue(undefined);

      await controller.logout(mockReq, mockRes);

      expect(mockTokenBlacklistRepo.add).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Date),
      );
      expect(mockRes.clearCookie).toHaveBeenCalledWith('auth_token', { path: '/' });
    });

    it('still succeeds when token is invalid', async () => {
      const mockReq = { cookies: { auth_token: 'bad-token' }, headers: {}, ip: '127.0.0.1' } as any;
      const mockRes = { cookie: vi.fn(), clearCookie: vi.fn() } as any;
      mockJwtService.verifyToken.mockRejectedValue(new Error('invalid'));

      const result = await controller.logout(mockReq, mockRes);

      expect(mockTokenBlacklistRepo.add).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('logs audit event on logout with token', async () => {
      const mockReq = { cookies: { auth_token: 'my-token' }, headers: {}, ip: '192.168.1.1' } as any;
      const mockRes = { cookie: vi.fn(), clearCookie: vi.fn() } as any;
      mockJwtService.verifyToken.mockResolvedValue({ sub: 'u1', exp: Math.floor(Date.now() / 1000) + 3600 });
      mockTokenBlacklistRepo.add.mockResolvedValue(undefined);

      await controller.logout(mockReq, mockRes);

      expect(mockAuditLogService.log).toHaveBeenCalledWith({
        action: AuditAction.LOGOUT,
        userId: 'u1',
        ip: '192.168.1.1',
        outcome: 'success',
      });
    });

    it('logs audit event on logout without token', async () => {
      const mockReq = { cookies: {}, headers: {}, ip: '192.168.1.1' } as any;
      const mockRes = { cookie: vi.fn(), clearCookie: vi.fn() } as any;

      await controller.logout(mockReq, mockRes);

      expect(mockAuditLogService.log).toHaveBeenCalledWith({
        action: AuditAction.LOGOUT,
        ip: '192.168.1.1',
        outcome: 'success',
      });
    });
  });
});
