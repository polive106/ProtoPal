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
  let interpolation: Record<string, unknown> | undefined;
  if (typeof err === 'string') {
    message = err;
  } else if (err && typeof err === 'object') {
    if ('message' in err) message = (err as { message: string }).message;
    if ('maximum' in err) interpolation = { max: (err as { maximum: number }).maximum };
    if ('minimum' in err) interpolation = { min: (err as { minimum: number }).minimum };
  }
  if (!message) return undefined;

  if (message.startsWith('validation.')) {
    return i18n.t(message, { ns, ...interpolation });
  }
  return message;
}
