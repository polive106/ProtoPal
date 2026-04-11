import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { Db } from 'mongodb';
import { setupTestDb, teardownTestDb, clearCollections } from './test-helper';
import { MongoUserRoleRepository } from './MongoUserRoleRepository';

describe('MongoUserRoleRepository', () => {
  let db: Db;
  let repo: MongoUserRoleRepository;
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
    await clearCollections();
    // Seed a user and a role for getUserWithRoles to join against
    await db.collection('users').insertOne({
      _id: userId as any,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      status: 'approved',
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await db.collection('roles').insertOne({
      _id: roleId as any,
      name: roleName,
      displayName: 'Administrator',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    repo = new MongoUserRoleRepository(db);
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
