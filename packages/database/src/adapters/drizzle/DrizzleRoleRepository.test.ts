import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { DatabaseConnection } from '../../connections/sql';
import { setupTestDb, teardownTestDb, clearTables } from './test-helper';
import { DrizzleRoleRepository } from './DrizzleRoleRepository';

describe('DrizzleRoleRepository', () => {
  let db: DatabaseConnection;
  let repo: DrizzleRoleRepository;

  beforeAll(async () => {
    db = await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await clearTables();
    repo = new DrizzleRoleRepository(db);
  });

  it('should create and find a role by id', async () => {
    const role = await repo.create({ name: 'admin', displayName: 'Administrator' });
    expect(role.id).toBeTruthy();
    expect(role.name).toBe('admin');
    expect(role.displayName).toBe('Administrator');
    expect(role.createdAt).toBeInstanceOf(Date);

    const found = await repo.findById(role.id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe('admin');
  });

  it('should find a role by name', async () => {
    await repo.create({ name: 'user', displayName: 'User' });
    const found = await repo.findByName('user');
    expect(found).not.toBeNull();
    expect(found!.displayName).toBe('User');
  });

  it('should return null for non-existent role', async () => {
    expect(await repo.findById('non-existent')).toBeNull();
    expect(await repo.findByName('non-existent')).toBeNull();
  });

  it('should find all roles', async () => {
    await repo.create({ name: 'admin', displayName: 'Administrator' });
    await repo.create({ name: 'user', displayName: 'User' });
    const all = await repo.findAll();
    expect(all).toHaveLength(2);
  });

  it('should default isSystem to false', async () => {
    const role = await repo.create({ name: 'custom', displayName: 'Custom' });
    expect(role.isSystem).toBe(false);
  });

  it('should accept isSystem flag', async () => {
    const role = await repo.create({ name: 'admin', displayName: 'Administrator', isSystem: true });
    expect(role.isSystem).toBe(true);
  });

  it('should handle optional description', async () => {
    const noDesc = await repo.create({ name: 'basic', displayName: 'Basic' });
    expect(noDesc.description).toBeUndefined();

    const withDesc = await repo.create({ name: 'admin', displayName: 'Admin', description: 'Full access' });
    expect(withDesc.description).toBe('Full access');
  });
});
