export function getFieldError(errors: unknown[]): string {
  const first = errors[0];
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object' && 'message' in first) return String((first as any).message);
  return 'Invalid';
}
