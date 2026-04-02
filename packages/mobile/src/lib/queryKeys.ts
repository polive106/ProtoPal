export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  notes: {
    all: ['notes'] as const,
    list: (filters?: Record<string, unknown>) => ['notes', 'list', filters] as const,
    detail: (id: string) => ['notes', 'detail', id] as const,
  },
} as const;
