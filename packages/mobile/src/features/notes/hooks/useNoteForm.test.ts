// @vitest-environment jsdom
vi.mock('expo-router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('../api', () => ({
  notesApi: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

vi.mock('@/lib/api', () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
      this.name = 'ApiError';
    }
  },
  setToken: vi.fn(),
}));

import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'expo-router';
import { notesApi } from '../api';
import { ApiError } from '@/lib/api';
import { useNoteForm } from './useNoteForm';

describe('useNoteForm', () => {
  const mockBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ back: mockBack } as any);
  });

  it('initializes in create mode with empty fields', () => {
    const { result } = renderHook(() => useNoteForm());

    expect(result.current.isEdit).toBe(false);
    expect(result.current.serverError).toBeNull();
    expect(result.current.isPending).toBe(false);
  });

  it('initializes in edit mode when note is provided', () => {
    const note = { id: '1', title: 'Existing', content: 'Body' };
    const { result } = renderHook(() => useNoteForm(note));

    expect(result.current.isEdit).toBe(true);
  });

  it('creates note and navigates back on success', async () => {
    const mockNote = { id: '1', title: 'New', content: 'Body', userId: 'u1', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
    vi.mocked(notesApi.create).mockResolvedValue(mockNote);

    const { result } = renderHook(() => useNoteForm());

    await act(async () => {
      result.current.form.setFieldValue('title', 'New');
      result.current.form.setFieldValue('content', 'Body');
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(notesApi.create).toHaveBeenCalledWith({ title: 'New', content: 'Body' });
    expect(mockBack).toHaveBeenCalled();
  });

  it('updates note and navigates back on success', async () => {
    const note = { id: '1', title: 'Old', content: 'Old body' };
    const mockNote = { id: '1', title: 'Updated', content: 'Old body', userId: 'u1', createdAt: '2024-01-01', updatedAt: '2024-01-02' };
    vi.mocked(notesApi.update).mockResolvedValue(mockNote);

    const { result } = renderHook(() => useNoteForm(note));

    await act(async () => {
      result.current.form.setFieldValue('title', 'Updated');
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(notesApi.update).toHaveBeenCalledWith('1', { title: 'Updated', content: 'Old body' });
    expect(mockBack).toHaveBeenCalled();
  });

  it('sets server error on ApiError', async () => {
    vi.mocked(notesApi.create).mockRejectedValue(new ApiError(400, 'Validation failed'));

    const { result } = renderHook(() => useNoteForm());

    await act(async () => {
      result.current.form.setFieldValue('title', 'Test');
      result.current.form.setFieldValue('content', 'Body');
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(result.current.serverError).toBe('Validation failed');
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('sets generic error on unknown error', async () => {
    vi.mocked(notesApi.create).mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useNoteForm());

    await act(async () => {
      result.current.form.setFieldValue('title', 'Test');
      result.current.form.setFieldValue('content', 'Body');
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(result.current.serverError).toBe('Failed to save note');
  });
});
