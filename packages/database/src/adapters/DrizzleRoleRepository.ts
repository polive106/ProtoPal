import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { RoleRepository } from '@acme/domain';
import type { Role, CreateRoleDTO } from '@acme/domain';
import type { DatabaseConnection } from '../connection';
import { roles } from '../schema';

export class DrizzleRoleRepository implements RoleRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async create(dto: CreateRoleDTO): Promise<Role> {
    const now = new Date();
    const id = randomUUID();
    const row = {
      id,
      name: dto.name,
      displayName: dto.displayName,
      description: dto.description ?? null,
      isSystem: dto.isSystem ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.db.insert(roles).values(row).run();
    return this.mapRow(row);
  }

  async findById(id: string): Promise<Role | null> {
    const row = this.db.select().from(roles).where(eq(roles.id, id)).get();
    return row ? this.mapRow(row) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const row = this.db.select().from(roles).where(eq(roles.name, name)).get();
    return row ? this.mapRow(row) : null;
  }

  async findAll(): Promise<Role[]> {
    const rows = this.db.select().from(roles).all();
    return rows.map((r) => this.mapRow(r));
  }

  private mapRow(row: any): Role {
    return {
      id: row.id,
      name: row.name,
      displayName: row.displayName,
      description: row.description ?? undefined,
      isSystem: row.isSystem,
      createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt : new Date(row.updatedAt),
    };
  }
}
