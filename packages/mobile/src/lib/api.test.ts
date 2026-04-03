import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, ApiError, setToken, getToken } from './api';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('api client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setToken(null);
  });

  describe('setToken / getToken', () => {
    it('stores and retrieves the auth token', () => {
      expect(getToken()).toBeNull();
      setToken('test-token-123');
      expect(getToken()).toBe('test-token-123');
    });

    it('clears the token when set to null', () => {
      setToken('some-token');
      setToken(null);
      expect(getToken()).toBeNull();
    });
  });

  describe('Bearer auth header', () => {
    it('sends Authorization header when token is set', async () => {
      setToken('my-bearer-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'test' }),
      });

      await api.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-bearer-token',
          }),
        }),
      );
    });

    it('does not send Authorization header when no token is set', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'test' }),
      });

      await api.get('/test');

      const callHeaders = mockFetch.mock.calls[0]?.[1]?.headers as Record<string, string>;
      expect(callHeaders['Authorization']).toBeUndefined();
    });
  });

  describe('request methods', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 1, name: 'Test' }),
      });
    });

    it('makes GET requests', async () => {
      const result = await api.get('/users');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('makes POST requests with body', async () => {
      await api.post('/users', { name: 'John' });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'John' }),
        }),
      );
    });

    it('makes PUT requests with body', async () => {
      await api.put('/users/1', { name: 'Jane' });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'Jane' }),
        }),
      );
    });

    it('makes PATCH requests with body', async () => {
      await api.patch('/users/1', { name: 'Updated' });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ name: 'Updated' }),
        }),
      );
    });

    it('makes DELETE requests', async () => {
      await api.delete('/users/1');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('error handling', () => {
    it('throws ApiError on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' }),
      });

      await expect(api.get('/protected')).rejects.toThrow(ApiError);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' }),
      });

      await expect(api.get('/protected')).rejects.toMatchObject({ status: 401 });
    });

    it('handles 204 No Content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await api.delete('/users/1');
      expect(result).toBeUndefined();
    });

    it('handles JSON parse errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(api.get('/broken')).rejects.toThrow(ApiError);
    });
  });
});
