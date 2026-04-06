import { AuditLogService, AuditAction } from './AuditLogService';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    service = new AuditLogService();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('logs structured JSON with required fields', () => {
    service.log({
      action: AuditAction.LOGIN,
      userId: 'user-123',
      ip: '192.168.1.1',
      outcome: 'success',
    });

    expect(logSpy).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(logSpy.mock.calls[0]![0] as string);
    expect(logged).toMatchObject({
      action: 'LOGIN',
      userId: 'user-123',
      ip: '192.168.1.1',
      outcome: 'success',
    });
    expect(logged.timestamp).toBeDefined();
    expect(() => new Date(logged.timestamp)).not.toThrow();
  });

  it('defaults userId to anonymous when not provided', () => {
    service.log({
      action: AuditAction.LOGOUT,
      outcome: 'success',
    });

    const logged = JSON.parse(logSpy.mock.calls[0]![0] as string);
    expect(logged.userId).toBe('anonymous');
  });

  it('defaults ip to unknown when not provided', () => {
    service.log({
      action: AuditAction.LOGOUT,
      outcome: 'success',
    });

    const logged = JSON.parse(logSpy.mock.calls[0]![0] as string);
    expect(logged.ip).toBe('unknown');
  });

  it('includes metadata when provided', () => {
    service.log({
      action: AuditAction.LOGIN,
      userId: 'user-123',
      ip: '10.0.0.1',
      outcome: 'success',
      metadata: { email: 'test@example.com' },
    });

    const logged = JSON.parse(logSpy.mock.calls[0]![0] as string);
    expect(logged.metadata).toEqual({ email: 'test@example.com' });
  });

  it('omits metadata key when not provided', () => {
    service.log({
      action: AuditAction.LOGIN,
      userId: 'user-123',
      outcome: 'success',
    });

    const logged = JSON.parse(logSpy.mock.calls[0]![0] as string);
    expect(logged).not.toHaveProperty('metadata');
  });

  it.each(['password', 'token', 'secret', 'authorization', 'cookie'])(
    'strips sensitive key "%s" from metadata',
    (key) => {
      service.log({
        action: AuditAction.LOGIN,
        outcome: 'success',
        metadata: { [key]: 'sensitive-value', email: 'test@example.com' },
      });

      const logged = JSON.parse(logSpy.mock.calls[0]![0] as string);
      expect(logged.metadata).not.toHaveProperty(key);
      expect(logged.metadata.email).toBe('test@example.com');
    },
  );

  it('strips sensitive keys case-insensitively', () => {
    service.log({
      action: AuditAction.LOGIN,
      outcome: 'success',
      metadata: { Password: 'secret', Token: 'abc', safe: 'value' },
    });

    const logged = JSON.parse(logSpy.mock.calls[0]![0] as string);
    expect(logged.metadata).not.toHaveProperty('Password');
    expect(logged.metadata).not.toHaveProperty('Token');
    expect(logged.metadata.safe).toBe('value');
  });

  it('supports all audit action types', () => {
    const actions = [
      AuditAction.LOGIN,
      AuditAction.LOGIN_FAILED,
      AuditAction.LOGOUT,
      AuditAction.REGISTER,
      AuditAction.REGISTER_FAILED,
      AuditAction.ROLE_BYPASS_ADMIN,
    ];

    for (const action of actions) {
      logSpy.mockClear();
      service.log({ action, outcome: 'success' });
      const logged = JSON.parse(logSpy.mock.calls[0]![0] as string);
      expect(logged.action).toBe(action);
    }
  });
});
