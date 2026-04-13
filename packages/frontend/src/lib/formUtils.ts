import type { FormEvent } from 'react';
import i18n from '@acme/i18n';

export function handleFormSubmit(handler: () => void) {
  return (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handler();
  };
}

export function getFieldError(errors: unknown[], ns = 'auth'): string | undefined {
  if (errors.length === 0) return undefined;
  const err = errors[0];
  let message: string | undefined;
  if (typeof err === 'string') message = err;
  else if (err && typeof err === 'object' && 'message' in err) {
    message = (err as { message: string }).message;
  }
  if (!message) return undefined;

  if (message.startsWith('validation.')) {
    return i18n.t(message, { ns });
  }
  return message;
}
