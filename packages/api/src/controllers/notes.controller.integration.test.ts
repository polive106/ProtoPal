import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
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
import { createTestApp, authCookie } from '../testing/test-app';
import { clearRateLimitStore } from '../common/guards/rate-limit.guard';
import type { JwtService } from '../services';

describe('NotesController (integration)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let cookie: string;

  const mockCreateNote = { execute: vi.fn() };
  const mockListNotes = { execute: vi.fn() };
  const mockUpdateNote = { execute: vi.fn() };
  const mockDeleteNote = { execute: vi.fn() };
  const mockGetNote = { execute: vi.fn() };

  beforeAll(async () => {
    const result = await createTestApp({
      controllers: [NotesController],
      providers: [
        { provide: CreateNote, useValue: mockCreateNote },
        { provide: ListNotes, useValue: mockListNotes },
        { provide: UpdateNote, useValue: mockUpdateNote },
        { provide: DeleteNote, useValue: mockDeleteNote },
        { provide: GetNote, useValue: mockGetNote },
      ],
    });
    app = result.app;
    jwtService = result.jwtService;
    cookie = await authCookie(jwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.resetAllMocks();
    clearRateLimitStore();
  });

  describe('GET /notes', () => {
    it('returns 401 without auth', async () => {
      const res = await request(app.getHttpServer()).get('/notes');

      expect(res.status).toBe(401);
    });

    it('returns 200 with notes', async () => {
      const notes = [
        { id: 'note-1', title: 'Note 1', content: 'Content 1', userId: 'user-test-id' },
        { id: 'note-2', title: 'Note 2', content: 'Content 2', userId: 'user-test-id' },
      ];
      mockListNotes.execute.mockResolvedValue(notes);

      const res = await request(app.getHttpServer())
        .get('/notes')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ notes });
    });
  });

  describe('POST /notes', () => {
    const validBody = { title: 'My Note', content: 'Some content' };

    it('returns 201 on success', async () => {
      const note = { id: 'note-1', ...validBody, userId: 'user-test-id' };
      mockCreateNote.execute.mockResolvedValue(note);

      const res = await request(app.getHttpServer())
        .post('/notes')
        .set('Cookie', cookie)
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ note });
    });

    it('returns 400 on validation error', async () => {
      const res = await request(app.getHttpServer())
        .post('/notes')
        .set('Cookie', cookie)
        .send({});

      expect(res.status).toBe(400);
    });

    it('returns 400 on domain error', async () => {
      mockCreateNote.execute.mockRejectedValue(
        new CreateNoteError('Invalid note'),
      );

      const res = await request(app.getHttpServer())
        .post('/notes')
        .set('Cookie', cookie)
        .send(validBody);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /notes/:id', () => {
    it('returns 200 with note', async () => {
      const note = { id: 'note-1', title: 'Note', content: 'Content', userId: 'user-test-id' };
      mockGetNote.execute.mockResolvedValue(note);

      const res = await request(app.getHttpServer())
        .get('/notes/note-1')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ note });
    });

    it('returns 404 when not found', async () => {
      mockGetNote.execute.mockRejectedValue(
        new GetNoteError('Note not found'),
      );

      const res = await request(app.getHttpServer())
        .get('/notes/note-1')
        .set('Cookie', cookie);

      expect(res.status).toBe(404);
    });

    it('returns 403 on access denied', async () => {
      mockGetNote.execute.mockRejectedValue(
        new GetNoteError('Access denied'),
      );

      const res = await request(app.getHttpServer())
        .get('/notes/note-1')
        .set('Cookie', cookie);

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /notes/:id', () => {
    it('returns 200 on success', async () => {
      const note = { id: 'note-1', title: 'Updated', content: 'Content', userId: 'user-test-id' };
      mockUpdateNote.execute.mockResolvedValue(note);

      const res = await request(app.getHttpServer())
        .patch('/notes/note-1')
        .set('Cookie', cookie)
        .send({ title: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ note });
    });

    it('returns 404 when not found', async () => {
      mockUpdateNote.execute.mockRejectedValue(
        new UpdateNoteError('Note not found'),
      );

      const res = await request(app.getHttpServer())
        .patch('/notes/note-1')
        .set('Cookie', cookie)
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
    });

    it('returns 403 on access denied', async () => {
      mockUpdateNote.execute.mockRejectedValue(
        new UpdateNoteError('Access denied'),
      );

      const res = await request(app.getHttpServer())
        .patch('/notes/note-1')
        .set('Cookie', cookie)
        .send({ title: 'Updated' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /notes/:id', () => {
    it('returns 204 on success', async () => {
      mockDeleteNote.execute.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .delete('/notes/note-1')
        .set('Cookie', cookie);

      expect(res.status).toBe(204);
    });

    it('returns 404 when not found', async () => {
      mockDeleteNote.execute.mockRejectedValue(
        new DeleteNoteError('Note not found'),
      );

      const res = await request(app.getHttpServer())
        .delete('/notes/note-1')
        .set('Cookie', cookie);

      expect(res.status).toBe(404);
    });

    it('returns 403 on access denied', async () => {
      mockDeleteNote.execute.mockRejectedValue(
        new DeleteNoteError('Access denied'),
      );

      const res = await request(app.getHttpServer())
        .delete('/notes/note-1')
        .set('Cookie', cookie);

      expect(res.status).toBe(403);
    });
  });
});
