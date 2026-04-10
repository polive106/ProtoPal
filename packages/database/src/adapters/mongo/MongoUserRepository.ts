import { randomUUID } from 'crypto';
import type { Db, Collection } from 'mongodb';
import type { UserRepository, User, CreateUserDTO, UpdateUserDTO } from '@acme/domain';
import type { UserStatus } from '@acme/shared';

interface UserDoc {
  _id: string;
  email: string;
  passwordHash: string | null;
  firstName: string;
  lastName: string;
  isActive: boolean;
  status: string;
  tokenVersion: number;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class MongoUserRepository implements UserRepository {
  private readonly collection: Collection<UserDoc>;

  constructor(db: Db) {
    this.collection = db.collection<UserDoc>('users');
  }

  async create(dto: CreateUserDTO): Promise<User> {
    const now = new Date();
    const doc = {
      _id: randomUUID(),
      email: dto.email,
      passwordHash: dto.passwordHash ?? null,
      firstName: dto.firstName,
      lastName: dto.lastName,
      isActive: dto.isActive ?? true,
      status: (dto.status ?? 'pending') as string,
      tokenVersion: 0,
      lastLoginAt: null as Date | null,
      createdAt: now,
      updatedAt: now,
    };
    await this.collection.insertOne(doc);
    return this.mapDoc(doc);
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.collection.findOne({ _id: id });
    return doc ? this.mapDoc(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.collection.findOne({ email });
    return doc ? this.mapDoc(doc) : null;
  }

  async findAll(): Promise<User[]> {
    const docs = await this.collection.find().toArray();
    return docs.map((d) => this.mapDoc(d));
  }

  async findByStatus(status: UserStatus): Promise<User[]> {
    const docs = await this.collection.find({ status }).toArray();
    return docs.map((d) => this.mapDoc(d));
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.email !== undefined) updateData.email = data.email;
    if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.tokenVersion !== undefined) updateData.tokenVersion = data.tokenVersion;
    if (data.lastLoginAt !== undefined) updateData.lastLoginAt = data.lastLoginAt;

    await this.collection.updateOne({ _id: id }, { $set: updateData });
    const updated = await this.findById(id);
    if (!updated) throw new Error('User not found after update');
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: id });
  }

  private mapDoc(doc: any): User {
    return {
      id: doc._id,
      email: doc.email,
      passwordHash: doc.passwordHash ?? undefined,
      firstName: doc.firstName,
      lastName: doc.lastName,
      isActive: doc.isActive,
      status: doc.status,
      tokenVersion: doc.tokenVersion ?? 0,
      lastLoginAt: doc.lastLoginAt ?? undefined,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt),
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt),
    };
  }
}
