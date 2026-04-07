import type { UserRepository } from '../ports/UserRepository';
import type { UserRoleRepository } from '../ports/UserRoleRepository';
import type { PasswordHasher } from '../ports/PasswordHasher';
import type { LoginAttemptRepository } from '../ports/LoginAttemptRepository';
import type { UserWithRoles } from '../entities/UserRole';

export interface LoginUserDTO {
  email: string;
  password: string;
}

export class LoginUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LoginUserError';
  }
}

export class AccountLockedError extends LoginUserError {
  public readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super(`Account is temporarily locked. Try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`);
    this.name = 'AccountLockedError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// Lockout durations in milliseconds: 5min, 15min, 1hr, 4hr, 24hr
const LOCKOUT_DURATIONS_MS = [
  5 * 60 * 1000,
  15 * 60 * 1000,
  60 * 60 * 1000,
  4 * 60 * 60 * 1000,
  24 * 60 * 60 * 1000,
];

const MAX_FAILED_ATTEMPTS = 5;

function getLockoutDurationMs(lockoutCount: number): number {
  const index = Math.min(lockoutCount, LOCKOUT_DURATIONS_MS.length - 1);
  return LOCKOUT_DURATIONS_MS[index] ?? LOCKOUT_DURATIONS_MS[LOCKOUT_DURATIONS_MS.length - 1]!;
}

export class LoginUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly loginAttemptRepository: LoginAttemptRepository
  ) {}

  async execute(dto: LoginUserDTO): Promise<UserWithRoles> {
    const email = dto.email?.trim().toLowerCase() || '';
    const password = dto.password || '';

    if (!email) {
      throw new LoginUserError('Email is required');
    }
    if (!password) {
      throw new LoginUserError('Password is required');
    }

    // Check if account is locked
    const attempt = await this.loginAttemptRepository.findByEmail(email);
    if (attempt?.lockedUntil) {
      const now = Date.now();
      const lockedUntilMs = attempt.lockedUntil.getTime();
      if (lockedUntilMs > now) {
        const retryAfterSeconds = Math.ceil((lockedUntilMs - now) / 1000);
        throw new AccountLockedError(retryAfterSeconds);
      }
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new LoginUserError('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new LoginUserError('Invalid email or password');
    }

    const isPasswordValid = await this.passwordHasher.verify(password, user.passwordHash);
    if (!isPasswordValid) {
      await this.recordFailedAttempt(email, attempt?.attempts ?? 0, attempt?.lockoutCount ?? 0);
      throw new LoginUserError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new LoginUserError('Your account has been deactivated');
    }

    if (user.status === 'pending') {
      throw new LoginUserError('Please verify your email');
    }

    if (user.status === 'rejected') {
      throw new LoginUserError('Your account has been rejected');
    }

    // Reset failed attempts on successful login
    if (attempt && attempt.attempts > 0) {
      await this.loginAttemptRepository.resetAttempts(email);
    }

    const [, userWithRoles] = await Promise.all([
      this.userRepository.update(user.id, { lastLoginAt: new Date() }),
      this.userRoleRepository.getUserWithRoles(user.id),
    ]);
    if (!userWithRoles) {
      throw new LoginUserError('Failed to retrieve user roles');
    }

    return userWithRoles;
  }

  private async recordFailedAttempt(email: string, currentAttempts: number, currentLockoutCount: number): Promise<void> {
    const newAttempts = currentAttempts + 1;

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      const durationMs = getLockoutDurationMs(currentLockoutCount);
      const lockedUntil = new Date(Date.now() + durationMs);
      await this.loginAttemptRepository.upsertFailedAttempt(
        email,
        newAttempts,
        currentLockoutCount + 1,
        lockedUntil,
      );
    } else {
      await this.loginAttemptRepository.upsertFailedAttempt(
        email,
        newAttempts,
        currentLockoutCount,
        null,
      );
    }
  }
}
