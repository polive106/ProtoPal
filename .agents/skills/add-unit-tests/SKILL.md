---
name: add-unit-tests
description: Add unit tests for domain logic, database adapters, API endpoints, or frontend components using Vitest patterns.
---

## Layer-Specific Patterns

### Domain Tests (mock repositories)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MyUseCase } from '../MyUseCase';
import type { MyRepository } from '../../ports/MyRepository';

describe('MyUseCase', () => {
  let repo: MyRepository;
  let useCase: MyUseCase;

  beforeEach(() => {
    repo = {
      create: vi.fn().mockResolvedValue({ id: '1', name: 'test' }),
      findById: vi.fn(),
      // ... mock all methods
    };
    useCase = new MyUseCase(repo);
  });

  it('should create successfully', async () => {
    const result = await useCase.execute({ name: 'test' });
    expect(result.id).toBe('1');
  });
});
```

### Database Tests (in-memory SQLite)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { sql } from 'drizzle-orm';
import { createTestConnection } from '../../connection';
import { MyAdapter } from '../MyAdapter';

describe('MyAdapter', () => {
  let db: DatabaseConnection;
  let adapter: MyAdapter;

  beforeEach(() => {
    db = createTestConnection();
    db.run(sql`CREATE TABLE IF NOT EXISTS ...`);
    adapter = new MyAdapter(db);
  });
});
```

### Frontend Widget Tests (props-only, no mocking)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyWidget } from './MyWidget';

describe('MyWidget', () => {
  const defaultProps = {
    title: 'Test',
    onClick: vi.fn(),
  };

  it('renders with props', () => {
    render(<MyWidget {...defaultProps} />);
    expect(screen.getByTestId('my-widget')).toBeDefined();
  });

  it('calls onClick when clicked', () => {
    render(<MyWidget {...defaultProps} />);
    fireEvent.click(screen.getByTestId('my-widget-btn'));
    expect(defaultProps.onClick).toHaveBeenCalled();
  });
});
```

### Frontend Hook Tests (mock API + providers)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMyHook } from './useMyHook';

vi.mock('../api', () => ({
  myApi: { list: vi.fn().mockResolvedValue([]) },
}));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useMyHook', () => {
  it('fetches data', async () => {
    const { result } = renderHook(() => useMyHook(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
```

### Mobile Hook Tests (mock API + RN modules)

```typescript
// @vitest-environment jsdom
vi.mock('expo-router', () => ({ useRouter: vi.fn() }));
vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(), setItemAsync: vi.fn(), deleteItemAsync: vi.fn(),
}));
vi.mock('../api', () => ({
  myApi: { list: vi.fn(), create: vi.fn() },
}));

import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMyHook } from './useMyHook';

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useMyHook', () => {
  it('fetches data', async () => {
    const { result } = renderHook(() => useMyHook(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
```

### Mobile Widget Tests (mock RN components to DOM)

```typescript
// @vitest-environment jsdom
vi.mock('react-native', () => {
  const React = require('react');
  return {
    View: (props: any) => React.createElement('div', props),
    Text: (props: any) => React.createElement('span', props),
    Pressable: ({ testID, onPress, children, ...props }: any) =>
      React.createElement('div', { 'data-testid': testID, onClick: onPress, ...props }, children),
  };
});

vi.mock('@acme/design-system-mobile', () => {
  const React = require('react');
  return {
    Card: ({ children, ...props }: any) => React.createElement('div', props, children),
    // ... mock other components
  };
});
```

### Frontend Integration Tests (mock only API boundary)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyFeature } from './MyFeature';

vi.mock('../api', () => ({
  myApi: { list: vi.fn().mockResolvedValue([{ id: '1', name: 'Test' }]) },
}));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('MyFeature', () => {
  it('renders complete feature with real hooks and widgets', () => {
    render(<MyFeature />, { wrapper: createWrapper() });
    expect(screen.getByTestId('my-feature')).toBeDefined();
  });
});
```
