import { padStart, applyDigits } from '../utils/numbers.js';
import { toLatinDigits } from '../utils/numbers.js';

/**
 * Format a DateOnly {year,month,day} into a string using a format pattern.
 * Supported tokens: YYYY MM DD / -
 */
export function formatDate(dateOnly, format = 'YYYY-MM-DD', digits = 'latin') {
  if (!dateOnly) return '';
  const { year, month, day } = dateOnly;
  let result = format
    .replace('YYYY', String(year))
    .replace('MM', padStart(month))
    .replace('DD', padStart(day));
  return applyDigits(result, digits);
}

/**
 * Parse a formatted date string back to DateOnly.
 * Normalises arabic digits first.
 */
export function parseDate(value, format = 'YYYY-MM-DD') {
  if (!value) return null;
  const str = toLatinDigits(String(value)).trim();
  const sep = format.includes('-') ? '-' : '/';
  const parts = str.split(sep);
  if (parts.length !== 3) return null;

  const tokenOrder = format.replace(/[/-]/g, sep).split(sep);
  const map = {};
  tokenOrder.forEach((tok, i) => { map[tok] = parts[i]; });

  const year  = parseInt(map['YYYY'], 10);
  const month = parseInt(map['MM'],   10);
  const day   = parseInt(map['DD'],   10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}
