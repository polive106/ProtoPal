import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteNote, DeleteNoteError } from './DeleteNote';
import type { NoteRepository } from '../ports/NoteRepository';

describe('DeleteNote', () => {
  let noteRepo: NoteRepository;
  let deleteNote: DeleteNote;

  const mockNote = {
    id: 'note-1',
    title: 'Title',
    content: 'Content',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    noteRepo = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockNote),
      findByUserId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    deleteNote = new DeleteNote(noteRepo);
  });

  it('should delete a note successfully', async () => {
    await deleteNote.execute('note-1', 'user-1');
    expect(noteRepo.delete).toHaveBeenCalledWith('note-1');
  });

  it('should throw if note not found', async () => {
    vi.mocked(noteRepo.findById).mockResolvedValue(null);
    await expect(deleteNote.execute('note-1', 'user-1')).rejects.toThrow('Note not found');
  });

  it('should throw if user is not the owner', async () => {
    await expect(deleteNote.execute('note-1', 'other-user')).rejects.toThrow('Not authorized');
  });
});
