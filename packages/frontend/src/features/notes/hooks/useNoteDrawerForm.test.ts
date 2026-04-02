import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNoteDrawerForm } from './useNoteDrawerForm';

describe('useNoteDrawerForm', () => {
  const defaultProps = {
    open: true,
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onOpenChange: vi.fn(),
  };

  it('initializes with empty values when no note provided', () => {
    const { result } = renderHook(() => useNoteDrawerForm(defaultProps));

    expect(result.current.form.state.values).toEqual({ title: '', content: '' });
    expect(result.current.serverError).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isEdit).toBe(false);
  });

  it('initializes with note values when note provided', () => {
    const note = { id: '1', title: 'Test', content: 'Body' };
    const { result } = renderHook(() => useNoteDrawerForm({ ...defaultProps, note }));

    expect(result.current.form.state.values.title).toBe('Test');
    expect(result.current.form.state.values.content).toBe('Body');
    expect(result.current.isEdit).toBe(true);
  });

  it('resets fields when open changes', () => {
    const note = { id: '1', title: 'Test', content: 'Body' };
    const { result, rerender } = renderHook(
      (props) => useNoteDrawerForm(props),
      { initialProps: { ...defaultProps, open: false, note } },
    );

    act(() => {
      result.current.form.setFieldValue('title', 'Changed');
    });

    rerender({ ...defaultProps, open: true, note });

    expect(result.current.form.state.values.title).toBe('Test');
    expect(result.current.form.state.values.content).toBe('Body');
  });

  it('calls onSubmit and onOpenChange(false) on successful submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useNoteDrawerForm({ open: true, onSubmit, onOpenChange }),
    );

    act(() => {
      result.current.form.setFieldValue('title', 'My Title');
      result.current.form.setFieldValue('content', 'My Content');
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({ title: 'My Title', content: 'My Content' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('sets serverError when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Save failed'));
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useNoteDrawerForm({ open: true, onSubmit, onOpenChange }),
    );

    act(() => {
      result.current.form.setFieldValue('title', 'A title');
      result.current.form.setFieldValue('content', 'Some content');
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(result.current.serverError).toBe('Save failed');
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('setServerError clears the error', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() =>
      useNoteDrawerForm({ ...defaultProps, onSubmit }),
    );

    act(() => {
      result.current.form.setFieldValue('title', 'A title');
      result.current.form.setFieldValue('content', 'Some content');
    });

    await act(async () => {
      await result.current.form.handleSubmit();
    });

    expect(result.current.serverError).toBe('fail');

    act(() => {
      result.current.setServerError(null);
    });

    expect(result.current.serverError).toBeNull();
  });

  it('handleCancel calls onOpenChange(false)', () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useNoteDrawerForm({ ...defaultProps, onOpenChange }),
    );

    act(() => {
      result.current.handleCancel();
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
