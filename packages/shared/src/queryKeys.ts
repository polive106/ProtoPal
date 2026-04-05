export function createQueryKeys(prefix: string) {
  return {
    auth: {
      me: [prefix, 'auth', 'me'] as const,
    },
    notes: {
      all: [prefix, 'notes'] as const,
      list: (filters?: Record<string, unknown>) =>
        [prefix, 'notes', 'list', filters] as const,
      detail: (id: string) => [prefix, 'notes', 'detail', id] as const,
    },
  } as const;
}

/** Default (unprefixed) keys for backwards-compat / tests */
export const queryKeys = createQueryKeys('app');
