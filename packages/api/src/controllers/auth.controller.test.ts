import { Test } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { RegisterUser, RegisterUserError, LoginUser, LoginUserError, GetUserRoles } from '@acme/domain';
import { AuthController } from './auth.controller';
import { JWT_SERVICE } from '../modules/tokens';

const mockRegisterUser = { execute: vi.fn() };
const mockLoginUser = { execute: vi.fn() };
const mockGetUserRoles = { execute: vi.fn() };
const mockJwtService = { generateToken: vi.fn(), verifyToken: vi.fn() };

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
        { provide: JWT_SERVICE, useValue: mockJwtService },
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  describe('register', () => {
    const dto = { email: 'test@example.com', password: 'Password1!', firstName: 'Test', lastName: 'User' };

    it('returns 201 with user on success', async () => {
      const user = { id: 'u1', email: dto.email, firstName: dto.firstName, lastName: dto.lastName, status: 'approved' };
      mockRegisterUser.execute.mockResolvedValue(user);

      const result = await controller.register(dto);

      expect(result).toEqual({
        message: 'Registration successful.',
        user: { id: 'u1', email: dto.email, firstName: dto.firstName, lastName: dto.lastName, status: 'approved' },
      });
    });

    it('throws BadRequestException on RegisterUserError', async () => {
      mockRegisterUser.execute.mockRejectedValue(new RegisterUserError('Email taken'));

      await expect(controller.register(dto)).rejects.toThrow(BadRequestException);
    });

    it('re-throws other errors', async () => {
      const err = new Error('unexpected');
      mockRegisterUser.execute.mockRejectedValue(err);

      await expect(controller.register(dto)).rejects.toThrow(err);
    });
  });

  describe('login', () => {
    const dto = { email: 'test@example.com', password: 'Password1!' };
    const mockRes = { cookie: vi.fn(), clearCookie: vi.fn() } as any;

    it('returns 200 with user and sets cookie on success', async () => {
      const userWithRoles = {
        userId: 'u1',
        email: dto.email,
        firstName: 'Test',
        lastName: 'User',
        status: 'approved',
        roles: [{ roleId: 'r1', roleName: 'user' }],
      };
      mockLoginUser.execute.mockResolvedValue(userWithRoles);
      mockJwtService.generateToken.mockResolvedValue('token');

      const result = await controller.login(dto, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith('auth_token', 'token', expect.objectContaining({ httpOnly: true, path: '/' }));
      expect(result).toEqual(
        expect.objectContaining({
          message: 'Login successful',
          user: expect.objectContaining({ id: 'u1', email: dto.email }),
        }),
      );
    });

    it('throws UnauthorizedException on LoginUserError', async () => {
      mockLoginUser.execute.mockRejectedValue(new LoginUserError('Invalid credentials'));

      await expect(controller.login(dto, mockRes)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    const authUser = { sub: 'u1', email: 'test@example.com', firstName: 'Test', lastName: 'User', status: 'approved', roles: [] };

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
    it('clears auth_token cookie and returns message', () => {
      const mockRes = { cookie: vi.fn(), clearCookie: vi.fn() } as any;

      const result = controller.logout(mockRes);

      expect(mockRes.clearCookie).toHaveBeenCalledWith('auth_token', { path: '/' });
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
