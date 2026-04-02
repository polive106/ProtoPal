import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateNote, CreateNoteError } from './CreateNote';
import type { NoteRepository } from '../ports/NoteRepository';

describe('CreateNote', () => {
  let noteRepo: NoteRepository;
  let createNote: CreateNote;

  beforeEach(() => {
    noteRepo = {
      create: vi.fn().mockResolvedValue({
        id: 'note-1',
        title: 'Test Note',
        content: 'Test content',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    createNote = new CreateNote(noteRepo);
  });

  it('should create a note successfully', async () => {
    const result = await createNote.execute({
      title: 'Test Note',
      content: 'Test content',
      userId: 'user-1',
    });

    expect(result.id).toBe('note-1');
    expect(noteRepo.create).toHaveBeenCalledWith({
      title: 'Test Note',
      content: 'Test content',
      userId: 'user-1',
    });
  });

  it('should throw if title is empty', async () => {
    await expect(
      createNote.execute({ title: '', content: 'content', userId: 'user-1' })
    ).rejects.toThrow('Title is required');
  });

  it('should throw if content is empty', async () => {
    await expect(
      createNote.execute({ title: 'Title', content: '', userId: 'user-1' })
    ).rejects.toThrow('Content is required');
  });

  it('should throw if userId is empty', async () => {
    await expect(
      createNote.execute({ title: 'Title', content: 'Content', userId: '' })
    ).rejects.toThrow('User ID is required');
  });
});
