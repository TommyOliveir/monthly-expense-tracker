import { Transform } from 'class-transformer';

export function normalizeEmail(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

/**
 * Trims and lowercases an email before validation, so "Tommy@Mail.com " from a
 * phone keyboard or autofill matches the account created as "tommy@mail.com".
 */
export function NormalizeEmail(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => normalizeEmail(value));
}
