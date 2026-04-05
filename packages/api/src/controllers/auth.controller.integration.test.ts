import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
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
} from '@acme/domain';
import { AuthController } from './auth.controller';
import { createTestApp, authCookie, mockUserPayload } from '../testing/test-app';
import { clearRateLimitStore } from '../common/guards/rate-limit.guard';
import { TOKEN_BLACKLIST_REPOSITORY } from '../modules/tokens';
import type { JwtService } from '../services';

describe('AuthController (integration)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockRegisterUser = { execute: vi.fn() };
  const mockLoginUser = { execute: vi.fn() };
  const mockGetUserRoles = { execute: vi.fn() };
  const mockVerifyEmail = { execute: vi.fn() };
  const mockResendVerification = { execute: vi.fn() };
  const mockTokenBlacklistRepo = {
    add: vi.fn().mockResolvedValue(undefined),
    exists: vi.fn().mockResolvedValue(false),
    deleteExpired: vi.fn().mockResolvedValue(0),
  };

  beforeAll(async () => {
    const result = await createTestApp({
      controllers: [AuthController],
      providers: [
        { provide: RegisterUser, useValue: mockRegisterUser },
        { provide: LoginUser, useValue: mockLoginUser },
        { provide: GetUserRoles, useValue: mockGetUserRoles },
        { provide: VerifyEmail, useValue: mockVerifyEmail },
        { provide: ResendVerification, useValue: mockResendVerification },
        { provide: TOKEN_BLACKLIST_REPOSITORY, useValue: mockTokenBlacklistRepo },
      ],
    });
    app = result.app;
    jwtService = result.jwtService;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.resetAllMocks();
    mockTokenBlacklistRepo.add.mockResolvedValue(undefined);
    mockTokenBlacklistRepo.exists.mockResolvedValue(false);
    mockTokenBlacklistRepo.deleteExpired.mockResolvedValue(0);
    clearRateLimitStore();
  });

  describe('POST /auth/register', () => {
    const validBody = {
      email: 'new@example.com',
      password: 'Password1',
      firstName: 'Jane',
      lastName: 'Doe',
    };

    it('returns 201 on success with pending status', async () => {
      mockRegisterUser.execute.mockResolvedValue({
        user: {
          id: 'user-1',
          email: validBody.email,
          firstName: validBody.firstName,
          lastName: validBody.lastName,
          status: 'pending',
        },
        verificationToken: 'test-token-123',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('Please check your email');
      expect(res.body.user.status).toBe('pending');
      expect(res.body.verificationToken).toBe('test-token-123');
    });

    it('returns 400 on validation error', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'bad@example.com', password: 'Password1' });

      expect(res.status).toBe(400);
    });

    it('returns 400 on domain error', async () => {
      mockRegisterUser.execute.mockRejectedValue(
        new RegisterUserError('Email already exists'),
      );

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validBody);

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    const validBody = { email: 'test@example.com', password: 'Password1' };

    it('returns 200 with Set-Cookie on success', async () => {
      mockLoginUser.execute.mockResolvedValue({
        userId: 'user-1',
        email: validBody.email,
        firstName: 'Test',
        lastName: 'User',
        status: 'approved',
        roles: [{ roleId: 'role-1', roleName: 'user' }],
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(validBody);

      expect(res.status).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
      const cookie = Array.isArray(res.headers['set-cookie'])
        ? res.headers['set-cookie'][0]
        : res.headers['set-cookie'];
      expect(cookie).toContain('auth_token=');
      expect(res.body.message).toBe('Login successful');
      expect(res.body.user).toBeDefined();
    });

    it('returns 401 on bad credentials', async () => {
      mockLoginUser.execute.mockRejectedValue(
        new LoginUserError('Invalid credentials'),
      );

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(validBody);

      expect(res.status).toBe(401);
    });

    it('returns 400 on validation error', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /auth/me', () => {
    it('returns 401 without cookie', async () => {
      const res = await request(app.getHttpServer()).get('/auth/me');

      expect(res.status).toBe(401);
    });

    it('returns 200 with valid cookie', async () => {
      const cookie = await authCookie(jwtService);

      mockGetUserRoles.execute.mockResolvedValue({
        userId: mockUserPayload.sub,
        email: mockUserPayload.email,
        firstName: mockUserPayload.firstName,
        lastName: mockUserPayload.lastName,
        status: 'approved',
        roles: [{ roleId: 'role-1', roleName: 'user' }],
      });

      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe(mockUserPayload.sub);
    });

    it('returns 404 when user not found', async () => {
      const cookie = await authCookie(jwtService);

      mockGetUserRoles.execute.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', cookie);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /auth/logout', () => {
    it('clears the auth cookie', async () => {
      const res = await request(app.getHttpServer()).post('/auth/logout');

      expect(res.status).toBe(200);
      const cookie = Array.isArray(res.headers['set-cookie'])
        ? res.headers['set-cookie'][0]
        : res.headers['set-cookie'];
      expect(cookie).toContain('auth_token=');
    });

    it('blacklists token and subsequent requests are rejected', async () => {
      const cookie = await authCookie(jwtService);

      // Logout with the token
      const logoutRes = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', cookie);
      expect(logoutRes.status).toBe(200);
      expect(mockTokenBlacklistRepo.add).toHaveBeenCalled();

      // Simulate blacklist check returning true for the blacklisted token
      mockTokenBlacklistRepo.exists.mockResolvedValue(true);

      // Try to access protected endpoint with the same token
      const meRes = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', cookie);

      expect(meRes.status).toBe(401);
    });
  });
});
