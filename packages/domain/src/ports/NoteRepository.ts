import type { Note, CreateNoteDTO, UpdateNoteDTO } from '../entities/Note';

export interface NoteRepository {
  create(dto: CreateNoteDTO): Promise<Note>;
  findById(id: string): Promise<Note | null>;
  findByUserId(userId: string): Promise<Note[]>;
  update(id: string, data: UpdateNoteDTO): Promise<Note>;
  delete(id: string): Promise<void>;
}
