import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TokenCleanupService } from './TokenCleanupService';

describe('TokenCleanupService', () => {
  let service: TokenCleanupService;
  let mockRepo: { deleteExpired: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.useFakeTimers();
    mockRepo = { deleteExpired: vi.fn().mockResolvedValue(0) };
    service = new TokenCleanupService(mockRepo as any);
  });

  afterEach(() => {
    service.onModuleDestroy();
    vi.useRealTimers();
  });

  it('calls deleteExpired on cleanup', async () => {
    mockRepo.deleteExpired.mockResolvedValue(3);

    const deleted = await service.cleanup();

    expect(deleted).toBe(3);
    expect(mockRepo.deleteExpired).toHaveBeenCalledOnce();
  });

  it('starts interval on module init and calls cleanup periodically', async () => {
    service.onModuleInit();

    // Advance 1 hour
    vi.advanceTimersByTime(60 * 60 * 1000);

    expect(mockRepo.deleteExpired).toHaveBeenCalledOnce();

    // Advance another hour
    vi.advanceTimersByTime(60 * 60 * 1000);

    expect(mockRepo.deleteExpired).toHaveBeenCalledTimes(2);
  });

  it('clears interval on module destroy', () => {
    service.onModuleInit();
    service.onModuleDestroy();

    vi.advanceTimersByTime(60 * 60 * 1000);

    expect(mockRepo.deleteExpired).not.toHaveBeenCalled();
  });
});
