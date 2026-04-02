import type { NoteRepository } from '../ports/NoteRepository';
import type { Note } from '../entities/Note';

export interface UpdateNoteInput {
  noteId: string;
  userId: string;
  title?: string;
  content?: string;
}

export class UpdateNoteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UpdateNoteError';
  }
}

export class UpdateNote {
  constructor(private readonly noteRepository: NoteRepository) {}

  async execute(input: UpdateNoteInput): Promise<Note> {
    const note = await this.noteRepository.findById(input.noteId);
    if (!note) {
      throw new UpdateNoteError('Note not found');
    }
    if (note.userId !== input.userId) {
      throw new UpdateNoteError('Not authorized to update this note');
    }

    return this.noteRepository.update(input.noteId, {
      title: input.title?.trim(),
      content: input.content?.trim(),
    });
  }
}
