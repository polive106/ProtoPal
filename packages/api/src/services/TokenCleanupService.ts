import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { TokenBlacklistRepository } from '@acme/domain';
import { TOKEN_BLACKLIST_REPOSITORY } from '../modules/tokens';

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class TokenCleanupService implements OnModuleInit, OnModuleDestroy {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject(TOKEN_BLACKLIST_REPOSITORY)
    private readonly tokenBlacklistRepo: TokenBlacklistRepository,
  ) {}

  onModuleInit() {
    this.intervalId = setInterval(() => {
      this.cleanup();
    }, CLEANUP_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async cleanup(): Promise<number> {
    return this.tokenBlacklistRepo.deleteExpired();
  }
}
