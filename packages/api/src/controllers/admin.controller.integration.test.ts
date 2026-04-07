import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AdminController } from './admin.controller';
import { createTestApp, authCookie } from '../testing/test-app';
import { LOGIN_ATTEMPT_REPOSITORY } from '../modules/tokens';
import { AuditLogService } from '../services';
import type { JwtService } from '../services';

describe('AdminController (integration)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockLoginAttemptRepo = {
    findByEmail: vi.fn(),
    upsertFailedAttempt: vi.fn(),
    resetAttempts: vi.fn(),
    unlockAccount: vi.fn().mockResolvedValue(undefined),
  };
  const mockAuditLogService = { log: vi.fn() };

  beforeAll(async () => {
    const result = await createTestApp({
      controllers: [AdminController],
      providers: [
        { provide: LOGIN_ATTEMPT_REPOSITORY, useValue: mockLoginAttemptRepo },
        { provide: AuditLogService, useValue: mockAuditLogService },
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
    mockLoginAttemptRepo.unlockAccount.mockResolvedValue(undefined);
    process.env.DISABLE_RATE_LIMIT = 'true';
  });

  describe('POST /admin/unlock-account/:email', () => {
    it('returns 401 without auth', async () => {
      const res = await request(app.getHttpServer())
        .post('/admin/unlock-account/test@example.com');

      expect(res.status).toBe(401);
    });

    it('returns 403 for non-admin user', async () => {
      const cookie = await authCookie(jwtService, {
        roles: [{ roleId: 'role-1', roleName: 'user' }],
      });

      const res = await request(app.getHttpServer())
        .post('/admin/unlock-account/test@example.com')
        .set('Cookie', cookie);

      expect(res.status).toBe(403);
    });

    it('returns 200 for admin user and calls unlockAccount', async () => {
      const cookie = await authCookie(jwtService, {
        roles: [{ roleId: 'role-1', roleName: 'admin' }],
      });

      const res = await request(app.getHttpServer())
        .post('/admin/unlock-account/test@example.com')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('test@example.com');
      expect(res.body.message).toContain('unlocked');
      expect(mockLoginAttemptRepo.unlockAccount).toHaveBeenCalledWith('test@example.com');
    });
  });
});
