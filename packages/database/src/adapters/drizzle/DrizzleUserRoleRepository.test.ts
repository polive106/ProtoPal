import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { DatabaseConnection } from '../../connections/sql';
import { setupTestDb, teardownTestDb, clearTables, insertTestUser } from './test-helper';
import { roles as rolesTable } from '../../schema';
import { DrizzleUserRoleRepository } from './DrizzleUserRoleRepository';

describe('DrizzleUserRoleRepository', () => {
  let db: DatabaseConnection;
  let repo: DrizzleUserRoleRepository;
  const userId = 'user-1';
  const roleId = 'role-1';
  const roleName = 'admin';

  beforeAll(async () => {
    db = await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await clearTables();
    // Seed a user and a role for getUserWithRoles to join against
    await insertTestUser(db, userId, 'test@example.com');
    await insertTestUser(db, 'admin-user');
    await db.insert(rolesTable).values({
      id: roleId,
      name: roleName,
      displayName: 'Administrator',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    repo = new DrizzleUserRoleRepository(db);
  });

  it('should create a user role assignment', async () => {
    const ur = await repo.create({ userId, roleId });
    expect(ur.id).toBeTruthy();
    expect(ur.userId).toBe(userId);
    expect(ur.roleId).toBe(roleId);
    expect(ur.assignedAt).toBeInstanceOf(Date);
  });

  it('should find user roles by userId', async () => {
    await repo.create({ userId, roleId });
    const roles = await repo.findByUserId(userId);
    expect(roles).toHaveLength(1);
    expect(roles[0]!.roleId).toBe(roleId);
  });

  it('should return empty array for user with no roles', async () => {
    const roles = await repo.findByUserId('no-roles-user');
    expect(roles).toHaveLength(0);
  });

  it('should delete a user role assignment', async () => {
    const ur = await repo.create({ userId, roleId });
    await repo.delete(ur.id);
    const roles = await repo.findByUserId(userId);
    expect(roles).toHaveLength(0);
  });

  it('should get user with roles', async () => {
    await repo.create({ userId, roleId });
    const result = await repo.getUserWithRoles(userId);
    expect(result).not.toBeNull();
    expect(result!.userId).toBe(userId);
    expect(result!.email).toBe('test@example.com');
    expect(result!.roles).toHaveLength(1);
    expect(result!.roles[0]!.roleId).toBe(roleId);
    expect(result!.roles[0]!.roleName).toBe(roleName);
  });

  it('should return null for non-existent user in getUserWithRoles', async () => {
    const result = await repo.getUserWithRoles('non-existent');
    expect(result).toBeNull();
  });

  it('should handle assignedBy', async () => {
    const ur = await repo.create({ userId, roleId, assignedBy: 'admin-user' });
    expect(ur.assignedBy).toBe('admin-user');
  });
});
