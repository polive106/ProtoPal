import type { NoteRepository } from '../ports/NoteRepository';
import type { Note } from '../entities/Note';

export class ListNotes {
  constructor(private readonly noteRepository: NoteRepository) {}

  async execute(userId: string): Promise<Note[]> {
    return this.noteRepository.findByUserId(userId);
  }
}
