export function ensureDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}
