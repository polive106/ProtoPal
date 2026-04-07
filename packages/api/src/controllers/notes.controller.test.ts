import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import {
  CreateNote,
  CreateNoteError,
  ListNotes,
  UpdateNote,
  UpdateNoteError,
  DeleteNote,
  DeleteNoteError,
  GetNote,
  GetNoteError,
} from '@acme/domain';
import { NotesController } from './notes.controller';

const mockCreateNote = { execute: vi.fn() };
const mockListNotes = { execute: vi.fn() };
const mockUpdateNote = { execute: vi.fn() };
const mockDeleteNote = { execute: vi.fn() };
const mockGetNote = { execute: vi.fn() };

const user = {
  sub: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  status: 'approved',
  tokenVersion: 0,
  roles: [],
};

describe('NotesController', () => {
  let controller: NotesController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        { provide: CreateNote, useValue: mockCreateNote },
        { provide: ListNotes, useValue: mockListNotes },
        { provide: UpdateNote, useValue: mockUpdateNote },
        { provide: DeleteNote, useValue: mockDeleteNote },
        { provide: GetNote, useValue: mockGetNote },
      ],
    }).compile();

    controller = module.get(NotesController);
  });

  describe('list', () => {
    it('returns notes from use case', async () => {
      const notes = [{ id: 'n1', title: 'Note 1' }];
      mockListNotes.execute.mockResolvedValue(notes);

      const result = await controller.list(user);

      expect(result).toEqual({ notes });
      expect(mockListNotes.execute).toHaveBeenCalledWith(user.sub);
    });
  });

  describe('create', () => {
    const dto = { title: 'New Note', content: 'Content' };

    it('returns created note on success', async () => {
      const note = { id: 'n1', title: dto.title, content: dto.content };
      mockCreateNote.execute.mockResolvedValue(note);

      const result = await controller.create(dto, user);

      expect(result).toEqual({ note });
    });

    it('throws BadRequestException on CreateNoteError', async () => {
      mockCreateNote.execute.mockRejectedValue(new CreateNoteError('invalid'));

      await expect(controller.create(dto, user)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('returns note on success', async () => {
      const note = { id: 'n1', title: 'Note' };
      mockGetNote.execute.mockResolvedValue(note);

      const result = await controller.findOne('n1', user);

      expect(result).toEqual({ note });
    });

    it('throws NotFoundException on GetNoteError with "not found"', async () => {
      mockGetNote.execute.mockRejectedValue(new GetNoteError('Note not found'));

      await expect(controller.findOne('n1', user)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException on GetNoteError without "not found"', async () => {
      mockGetNote.execute.mockRejectedValue(new GetNoteError('Access denied'));

      await expect(controller.findOne('n1', user)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    const dto = { title: 'Updated', content: 'Updated content' };

    it('returns updated note on success', async () => {
      const note = { id: 'n1', title: dto.title, content: dto.content };
      mockUpdateNote.execute.mockResolvedValue(note);

      const result = await controller.update('n1', dto, user);

      expect(result).toEqual({ note });
    });

    it('throws NotFoundException on UpdateNoteError with "not found"', async () => {
      mockUpdateNote.execute.mockRejectedValue(new UpdateNoteError('Note not found'));

      await expect(controller.update('n1', dto, user)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException on UpdateNoteError without "not found"', async () => {
      mockUpdateNote.execute.mockRejectedValue(new UpdateNoteError('Not your note'));

      await expect(controller.update('n1', dto, user)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('calls deleteNote.execute successfully', async () => {
      mockDeleteNote.execute.mockResolvedValue(undefined);

      const result = await controller.remove('n1', user);

      expect(result).toBeUndefined();
      expect(mockDeleteNote.execute).toHaveBeenCalledWith('n1', user.sub);
    });

    it('throws NotFoundException on DeleteNoteError with "not found"', async () => {
      mockDeleteNote.execute.mockRejectedValue(new DeleteNoteError('Note not found'));

      await expect(controller.remove('n1', user)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException on DeleteNoteError without "not found"', async () => {
      mockDeleteNote.execute.mockRejectedValue(new DeleteNoteError('Not allowed'));

      await expect(controller.remove('n1', user)).rejects.toThrow(ForbiddenException);
    });
  });
});
