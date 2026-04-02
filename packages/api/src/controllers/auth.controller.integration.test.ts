import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  RegisterUser,
  RegisterUserError,
  LoginUser,
  LoginUserError,
  GetUserRoles,
} from '@acme/domain';
import { AuthController } from './auth.controller';
import { createTestApp, authCookie, mockUserPayload } from '../testing/test-app';
import { clearRateLimitStore } from '../common/guards/rate-limit.guard';
import type { JwtService } from '../services';

describe('AuthController (integration)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockRegisterUser = { execute: vi.fn() };
  const mockLoginUser = { execute: vi.fn() };
  const mockGetUserRoles = { execute: vi.fn() };

  beforeAll(async () => {
    const result = await createTestApp({
      controllers: [AuthController],
      providers: [
        { provide: RegisterUser, useValue: mockRegisterUser },
        { provide: LoginUser, useValue: mockLoginUser },
        { provide: GetUserRoles, useValue: mockGetUserRoles },
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
    clearRateLimitStore();
  });

  describe('POST /auth/register', () => {
    const validBody = {
      email: 'new@example.com',
      password: 'Password1',
      firstName: 'Jane',
      lastName: 'Doe',
    };

    it('returns 201 on success', async () => {
      mockRegisterUser.execute.mockResolvedValue({
        id: 'user-1',
        email: validBody.email,
        firstName: validBody.firstName,
        lastName: validBody.lastName,
        status: 'pending',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        message: 'Registration successful.',
        user: {
          id: 'user-1',
          email: validBody.email,
          firstName: validBody.firstName,
          lastName: validBody.lastName,
          status: 'pending',
        },
      });
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
  });
});
