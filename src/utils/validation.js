import { dateOnlyCompare, parseISODateOnly } from './dateOnly.js';

export function isDateDisabled(gregorianDate, opts) {
  const { minDate, maxDate, disabledDates = [], disabledWeekDays = [] } = opts;

  if (minDate) {
    const min = typeof minDate === 'string' ? parseISODateOnly(minDate) : minDate;
    if (min && dateOnlyCompare(gregorianDate, min) < 0) return true;
  }
  if (maxDate) {
    const max = typeof maxDate === 'string' ? parseISODateOnly(maxDate) : maxDate;
    if (max && dateOnlyCompare(gregorianDate, max) > 0) return true;
  }
  if (disabledDates.length) {
    const key = `${gregorianDate.year}-${String(gregorianDate.month).padStart(2,'0')}-${String(gregorianDate.day).padStart(2,'0')}`;
    if (disabledDates.includes(key)) return true;
  }
  if (disabledWeekDays.length) {
    const jsDate = new Date(gregorianDate.year, gregorianDate.month - 1, gregorianDate.day);
    if (disabledWeekDays.includes(jsDate.getDay())) return true;
  }
  return false;
}
