import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { UserRepository } from '@acme/domain';
import type { User, CreateUserDTO, UpdateUserDTO } from '@acme/domain';
import type { UserStatus } from '@acme/shared';
import type { DatabaseConnection } from '../connection';
import { users } from '../schema';

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async create(dto: CreateUserDTO): Promise<User> {
    const now = new Date();
    const id = randomUUID();
    const row = {
      id,
      email: dto.email,
      passwordHash: dto.passwordHash ?? null,
      firstName: dto.firstName,
      lastName: dto.lastName,
      isActive: dto.isActive ?? true,
      status: dto.status ?? 'pending' as const,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.db.insert(users).values(row).run();
    return this.mapRow(row);
  }

  async findById(id: string): Promise<User | null> {
    const row = this.db.select().from(users).where(eq(users.id, id)).get();
    return row ? this.mapRow(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = this.db.select().from(users).where(eq(users.email, email)).get();
    return row ? this.mapRow(row) : null;
  }

  async findAll(): Promise<User[]> {
    const rows = this.db.select().from(users).all();
    return rows.map((r) => this.mapRow(r));
  }

  async findByStatus(status: UserStatus): Promise<User[]> {
    const rows = this.db.select().from(users).where(eq(users.status, status)).all();
    return rows.map((r) => this.mapRow(r));
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.email !== undefined) updateData.email = data.email;
    if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.lastLoginAt !== undefined) updateData.lastLoginAt = data.lastLoginAt;

    this.db.update(users).set(updateData).where(eq(users.id, id)).run();
    const updated = await this.findById(id);
    if (!updated) throw new Error('User not found after update');
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.db.delete(users).where(eq(users.id, id)).run();
  }

  private mapRow(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash ?? undefined,
      firstName: row.firstName,
      lastName: row.lastName,
      isActive: row.isActive,
      status: row.status,
      lastLoginAt: row.lastLoginAt ?? undefined,
      createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt : new Date(row.updatedAt),
    };
  }
}
