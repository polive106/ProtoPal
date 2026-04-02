import type { NoteRepository } from '../ports/NoteRepository';
import type { Note } from '../entities/Note';

export class GetNoteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GetNoteError';
  }
}

export class GetNote {
  constructor(private readonly noteRepository: NoteRepository) {}

  async execute(noteId: string, userId: string): Promise<Note> {
    const note = await this.noteRepository.findById(noteId);
    if (!note) {
      throw new GetNoteError('Note not found');
    }
    if (note.userId !== userId) {
      throw new GetNoteError('Not authorized to view this note');
    }
    return note;
  }
}
