import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DATE_FORMAT } from '@/constants/format';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return DATE_FORMAT.EMPTY;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return DATE_FORMAT.EMPTY;
  return new Intl.DateTimeFormat(DATE_FORMAT.LOCALE, DATE_FORMAT.OPTIONS).format(d);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return DATE_FORMAT.EMPTY;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return DATE_FORMAT.EMPTY;
  return new Intl.DateTimeFormat(DATE_FORMAT.LOCALE, DATE_FORMAT.DATETIME_OPTIONS).format(d);
}

/**
 * Converts an instant into the value an `<input type="datetime-local">` expects.
 *
 * That input has NO timezone: the browser reads whatever string you give it as
 * LOCAL wall-clock time. Handing it a raw UTC ISO string (`iso.slice(0, 16)`)
 * therefore shows UTC digits labelled as local — and because `new Date(value)`
 * on the way back out also reads them as local, saving shifts the instant by the
 * offset. So the naive version is wrong twice, and the two errors compound
 * rather than cancel.
 *
 * Shifting by the offset first makes the digits the user's own wall clock.
 * Always pair with `fromDateTimeLocalInput` on the way back.
 */
export function toDateTimeLocalInput(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

/**
 * The inverse: reads a `datetime-local` value as the user's local wall-clock
 * time and returns the UTC instant to send to the API, which stores UTC.
 */
export function fromDateTimeLocalInput(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function pickErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
  return e.response?.data?.error?.message ?? e.message ?? fallback;
}
