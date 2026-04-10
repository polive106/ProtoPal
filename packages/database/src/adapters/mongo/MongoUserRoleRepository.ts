import { randomUUID } from 'crypto';
import type { Db, Collection } from 'mongodb';
import type { UserRoleRepository, UserWithRoles, UserRole, CreateUserRoleDTO } from '@acme/domain';

interface UserRoleDoc {
  _id: string;
  userId: string;
  roleId: string;
  assignedAt: Date;
  assignedBy: string | null;
}

interface UserDoc {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  status: string;
  tokenVersion: number;
}

interface RoleDoc {
  _id: string;
  name: string;
}

export class MongoUserRoleRepository implements UserRoleRepository {
  private readonly collection: Collection<UserRoleDoc>;
  private readonly usersCollection: Collection<UserDoc>;
  private readonly rolesCollection: Collection<RoleDoc>;

  constructor(db: Db) {
    this.collection = db.collection<UserRoleDoc>('user_roles');
    this.usersCollection = db.collection<UserDoc>('users');
    this.rolesCollection = db.collection<RoleDoc>('roles');
  }

  async create(dto: CreateUserRoleDTO): Promise<UserRole> {
    const now = new Date();
    const id = randomUUID();
    const doc = {
      _id: id,
      userId: dto.userId,
      roleId: dto.roleId,
      assignedAt: now,
      assignedBy: dto.assignedBy ?? null,
    };
    await this.collection.insertOne(doc);
    return {
      id,
      userId: dto.userId,
      roleId: dto.roleId,
      assignedAt: now,
      assignedBy: dto.assignedBy,
    };
  }

  async getUserWithRoles(userId: string): Promise<UserWithRoles | null> {
    const user = await this.usersCollection.findOne({ _id: userId });
    if (!user) return null;

    const userRoleDocs = await this.collection.find({ userId }).toArray();
    const roleIds = userRoleDocs.map((ur) => ur.roleId);
    const roleDocs = roleIds.length > 0
      ? await this.rolesCollection.find({ _id: { $in: roleIds } }).toArray()
      : [];

    const roleMap = new Map(roleDocs.map((r) => [r._id, r.name]));

    return {
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      status: user.status,
      tokenVersion: user.tokenVersion ?? 0,
      roles: userRoleDocs.map((ur) => ({
        roleId: ur.roleId,
        roleName: roleMap.get(ur.roleId) ?? '',
      })),
    };
  }

  async findByUserId(userId: string): Promise<UserRole[]> {
    const docs = await this.collection.find({ userId }).toArray();
    return docs.map((d) => ({
      id: d._id,
      userId: d.userId,
      roleId: d.roleId,
      assignedAt: d.assignedAt instanceof Date ? d.assignedAt : new Date(d.assignedAt),
      assignedBy: d.assignedBy ?? undefined,
    }));
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: id });
  }
}
