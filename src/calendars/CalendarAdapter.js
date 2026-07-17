/**
 * Base interface all calendar adapters must implement.
 * Dates are always plain {year, month, day} objects (DateOnly) — no JS Date.
 */
export class CalendarAdapter {
  /** Unique string id, e.g. 'gregorian' */
  id = '';
  /** Human-readable name */
  name = '';

  /** Convert a date in this calendar to Gregorian DateOnly */
  toGregorian(dateOnly) { throw new Error('not implemented'); }

  /** Convert a Gregorian DateOnly to this calendar's DateOnly */
  fromGregorian(gregorianDateOnly) { throw new Error('not implemented'); }

  /** Number of days in a given month of this calendar */
  getMonthLength(year, month) { throw new Error('not implemented'); }

  /** Number of months per year (13 for Coptic/Ethiopian-style calendars) */
  getMonthCount() { return 12; }

  /** Array of month name strings for the given locale */
  getMonths(locale) { throw new Error('not implemented'); }

  /** Array of weekday short names starting from weekStart */
  getWeekdays(locale, weekStart) { throw new Error('not implemented'); }

  /** True if the year is a leap year in this calendar */
  isLeapYear(year) { return false; }

  /** Validate a DateOnly; returns true if valid */
  validateDate(dateOnly) { throw new Error('not implemented'); }

  /** Return today's date in this calendar as DateOnly */
  getToday() { throw new Error('not implemented'); }
}
