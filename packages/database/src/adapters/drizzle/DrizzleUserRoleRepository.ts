import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { UserRoleRepository, UserWithRoles } from '@acme/domain';
import type { UserRole, CreateUserRoleDTO } from '@acme/domain';
import type { DatabaseConnection } from '../../connections/sql';
import { userRoles, users, roles } from '../../schema';

export class DrizzleUserRoleRepository implements UserRoleRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async create(dto: CreateUserRoleDTO): Promise<UserRole> {
    const now = new Date();
    const id = randomUUID();
    const row = {
      id,
      userId: dto.userId,
      roleId: dto.roleId,
      assignedAt: now,
      assignedBy: dto.assignedBy ?? null,
    };
    await this.db.insert(userRoles).values(row);
    return {
      id,
      userId: dto.userId,
      roleId: dto.roleId,
      assignedAt: now,
      assignedBy: dto.assignedBy,
    };
  }

  async getUserWithRoles(userId: string): Promise<UserWithRoles | null> {
    const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return null;

    const userRoleRows = await this.db
      .select({
        roleId: userRoles.roleId,
        roleName: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      status: user.status,
      tokenVersion: user.tokenVersion ?? 0,
      roles: userRoleRows.map((r) => ({
        roleId: r.roleId,
        roleName: r.roleName,
      })),
    };
  }

  async findByUserId(userId: string): Promise<UserRole[]> {
    const rows = await this.db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId));
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      roleId: r.roleId,
      assignedAt: r.assignedAt instanceof Date ? r.assignedAt : new Date(r.assignedAt),
      assignedBy: r.assignedBy ?? undefined,
    }));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(userRoles).where(eq(userRoles.id, id));
  }
}
