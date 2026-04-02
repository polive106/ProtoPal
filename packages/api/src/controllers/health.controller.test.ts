import { describe, it, expect } from 'vitest';
import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('should return ok status', async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    const controller = module.get(HealthController);
    const result = controller.check();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });

  it('should return ready status', async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    const controller = module.get(HealthController);
    const result = controller.ready();
    expect(result.status).toBe('ready');
  });
});
