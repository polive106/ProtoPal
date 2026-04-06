import { Injectable } from '@nestjs/common';

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  REGISTER_FAILED = 'REGISTER_FAILED',
  ROLE_BYPASS_ADMIN = 'ROLE_BYPASS_ADMIN',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  PASSWORD_RESET_FAILED = 'PASSWORD_RESET_FAILED',
}

export interface AuditLogEntry {
  action: AuditAction;
  userId?: string;
  ip?: string;
  outcome: 'success' | 'failure';
  metadata?: Record<string, unknown>;
}

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'cookie'];

@Injectable()
export class AuditLogService {
  log(entry: AuditLogEntry): void {
    const sanitizedMetadata = entry.metadata
      ? this.sanitize(entry.metadata)
      : undefined;

    const logEntry: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      action: entry.action,
      userId: entry.userId ?? 'anonymous',
      ip: entry.ip ?? 'unknown',
      outcome: entry.outcome,
    };

    if (sanitizedMetadata) {
      logEntry.metadata = sanitizedMetadata;
    }

    console.log(JSON.stringify(logEntry));
  }

  private sanitize(obj: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([key]) => !SENSITIVE_KEYS.includes(key.toLowerCase()),
      ),
    );
  }
}
