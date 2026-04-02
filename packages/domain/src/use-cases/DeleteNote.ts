import type { NoteRepository } from '../ports/NoteRepository';

export class DeleteNoteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeleteNoteError';
  }
}

export class DeleteNote {
  constructor(private readonly noteRepository: NoteRepository) {}

  async execute(noteId: string, userId: string): Promise<void> {
    const note = await this.noteRepository.findById(noteId);
    if (!note) {
      throw new DeleteNoteError('Note not found');
    }
    if (note.userId !== userId) {
      throw new DeleteNoteError('Not authorized to delete this note');
    }
    await this.noteRepository.delete(noteId);
  }
}
