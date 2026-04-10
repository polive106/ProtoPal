import { randomUUID } from 'crypto';
import type { Db, Collection } from 'mongodb';
import type { NoteRepository, Note, CreateNoteDTO, UpdateNoteDTO } from '@acme/domain';

interface NoteDoc {
  _id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MongoNoteRepository implements NoteRepository {
  private readonly collection: Collection<NoteDoc>;

  constructor(db: Db) {
    this.collection = db.collection<NoteDoc>('notes');
  }

  async create(dto: CreateNoteDTO): Promise<Note> {
    const now = new Date();
    const doc = {
      _id: randomUUID(),
      title: dto.title,
      content: dto.content,
      userId: dto.userId,
      createdAt: now,
      updatedAt: now,
    };
    await this.collection.insertOne(doc);
    return this.mapDoc(doc);
  }

  async findById(id: string): Promise<Note | null> {
    const doc = await this.collection.findOne({ _id: id });
    return doc ? this.mapDoc(doc) : null;
  }

  async findByUserId(userId: string): Promise<Note[]> {
    const docs = await this.collection.find({ userId }).toArray();
    return docs.map((d) => this.mapDoc(d));
  }

  async update(id: string, data: UpdateNoteDTO): Promise<Note> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;

    await this.collection.updateOne({ _id: id }, { $set: updateData });
    const updated = await this.findById(id);
    if (!updated) throw new Error('Note not found after update');
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: id });
  }

  private mapDoc(doc: any): Note {
    return {
      id: doc._id,
      title: doc.title,
      content: doc.content,
      userId: doc.userId,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt),
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt),
    };
  }
}
