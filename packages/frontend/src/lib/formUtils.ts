import type { FormEvent } from 'react';

export function handleFormSubmit(handler: () => void) {
  return (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handler();
  };
}

export function getFieldError(errors: unknown[]): string | undefined {
  if (errors.length === 0) return undefined;
  const err = errors[0];
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) {
    return (err as { message: string }).message;
  }
  return undefined;
}
