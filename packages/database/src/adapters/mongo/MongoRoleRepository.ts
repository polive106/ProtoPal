import { randomUUID } from 'crypto';
import type { Db, Collection } from 'mongodb';
import type { RoleRepository, Role, CreateRoleDTO } from '@acme/domain';
import { ensureDate } from './utils';

interface RoleDoc {
  _id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class MongoRoleRepository implements RoleRepository {
  private readonly collection: Collection<RoleDoc>;

  constructor(db: Db) {
    this.collection = db.collection<RoleDoc>('roles');
  }

  async create(dto: CreateRoleDTO): Promise<Role> {
    const now = new Date();
    const doc: RoleDoc = {
      _id: randomUUID(),
      name: dto.name,
      displayName: dto.displayName,
      description: dto.description ?? null,
      isSystem: dto.isSystem ?? false,
      createdAt: now,
      updatedAt: now,
    };
    await this.collection.insertOne(doc);
    return this.mapDoc(doc);
  }

  async findById(id: string): Promise<Role | null> {
    const doc = await this.collection.findOne({ _id: id });
    return doc ? this.mapDoc(doc) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const doc = await this.collection.findOne({ name });
    return doc ? this.mapDoc(doc) : null;
  }

  async findAll(): Promise<Role[]> {
    const docs = await this.collection.find().toArray();
    return docs.map((d) => this.mapDoc(d));
  }

  private mapDoc(doc: RoleDoc): Role {
    return {
      id: doc._id,
      name: doc.name,
      displayName: doc.displayName,
      description: doc.description ?? undefined,
      isSystem: doc.isSystem,
      createdAt: ensureDate(doc.createdAt),
      updatedAt: ensureDate(doc.updatedAt),
    };
  }
}
