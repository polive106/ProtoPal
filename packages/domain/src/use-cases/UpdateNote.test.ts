import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateNote, UpdateNoteError } from './UpdateNote';
import type { NoteRepository } from '../ports/NoteRepository';

describe('UpdateNote', () => {
  let noteRepo: NoteRepository;
  let updateNote: UpdateNote;

  const mockNote = {
    id: 'note-1',
    title: 'Old Title',
    content: 'Old content',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    noteRepo = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockNote),
      findByUserId: vi.fn(),
      update: vi.fn().mockResolvedValue({ ...mockNote, title: 'New Title' }),
      delete: vi.fn(),
    };
    updateNote = new UpdateNote(noteRepo);
  });

  it('should update a note successfully', async () => {
    const result = await updateNote.execute({
      noteId: 'note-1',
      userId: 'user-1',
      title: 'New Title',
    });

    expect(result.title).toBe('New Title');
    expect(noteRepo.update).toHaveBeenCalledWith('note-1', { title: 'New Title', content: undefined });
  });

  it('should throw if note not found', async () => {
    vi.mocked(noteRepo.findById).mockResolvedValue(null);
    await expect(
      updateNote.execute({ noteId: 'note-1', userId: 'user-1', title: 'New' })
    ).rejects.toThrow('Note not found');
  });

  it('should throw if user is not the owner', async () => {
    await expect(
      updateNote.execute({ noteId: 'note-1', userId: 'other-user', title: 'New' })
    ).rejects.toThrow('Not authorized');
  });
});
