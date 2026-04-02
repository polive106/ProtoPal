import type { NoteRepository } from '../ports/NoteRepository';
import type { Note, CreateNoteDTO } from '../entities/Note';

export class CreateNoteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CreateNoteError';
  }
}

export class CreateNote {
  constructor(private readonly noteRepository: NoteRepository) {}

  async execute(dto: CreateNoteDTO): Promise<Note> {
    const title = dto.title?.trim() || '';
    const content = dto.content?.trim() || '';

    if (!title) {
      throw new CreateNoteError('Title is required');
    }
    if (!content) {
      throw new CreateNoteError('Content is required');
    }
    if (!dto.userId) {
      throw new CreateNoteError('User ID is required');
    }

    return this.noteRepository.create({
      title,
      content,
      userId: dto.userId,
    });
  }
}
