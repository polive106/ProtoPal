import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { NoteRepository } from '@acme/domain';
import type { Note, CreateNoteDTO, UpdateNoteDTO } from '@acme/domain';
import type { DatabaseConnection } from '../../connections/sql';
import { notes } from '../../schema';

export class DrizzleNoteRepository implements NoteRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async create(dto: CreateNoteDTO): Promise<Note> {
    const now = new Date();
    const id = randomUUID();
    const row = {
      id,
      title: dto.title,
      content: dto.content,
      userId: dto.userId,
      createdAt: now,
      updatedAt: now,
    };
    this.db.insert(notes).values(row).run();
    return this.mapRow(row);
  }

  async findById(id: string): Promise<Note | null> {
    const row = this.db.select().from(notes).where(eq(notes.id, id)).get();
    return row ? this.mapRow(row) : null;
  }

  async findByUserId(userId: string): Promise<Note[]> {
    const rows = this.db.select().from(notes).where(eq(notes.userId, userId)).all();
    return rows.map((r) => this.mapRow(r));
  }

  async update(id: string, data: UpdateNoteDTO): Promise<Note> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;

    this.db.update(notes).set(updateData).where(eq(notes.id, id)).run();
    const updated = await this.findById(id);
    if (!updated) throw new Error('Note not found after update');
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.db.delete(notes).where(eq(notes.id, id)).run();
  }

  private mapRow(row: any): Note {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      userId: row.userId,
      createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt : new Date(row.updatedAt),
    };
  }
}
