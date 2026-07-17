import { CalendarAdapter } from './CalendarAdapter.js';

/**
 * Coptic (Alexandrian) calendar — Era of Martyrs (Anno Martyrum).
 *
 * Purely arithmetic and exact forever:
 *   - 12 months of 30 days + a small 13th month (النسيء) of 5 days,
 *     6 days when the year is leap.
 *   - Leap years: AM year ≡ 3 (mod 4), no exceptions.
 *   - Epoch: 1 Thout AM 1 = 29 August 284 CE (Julian; identical to the
 *     proleptic Gregorian date in that century).
 *
 * Still in everyday use in Egypt for church dates and the agricultural
 * season calendar. Coptic new year (Nayrouz) falls on 11 September
 * (12 September in the year following a Coptic leap year).
 */

const MONTHS_AR = ['توت','بابه','هاتور','كيهك','طوبة','أمشير','برمهات','برمودة','بشنس','بؤونة','أبيب','مسرى','النسيء'];
const MONTHS_EN = ['Thout','Paopi','Hathor','Koiak','Tobi','Meshir','Paremhat','Parmouti','Pashons','Paoni','Epip','Mesori','Nasie'];
const DAYS_AR   = ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
const DAYS_EN   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Gregorian ↔ JDN (standard Julian Day Number, proleptic Gregorian).
const _MS_2000  = Date.UTC(2000, 0, 1);
const _JDN_2000 = 2451545;

function g2d(gy, gm, gd) {
  return Math.round((Date.UTC(gy, gm - 1, gd) - _MS_2000) / 86400000) + _JDN_2000;
}

function d2g(jdn) {
  const t = new Date(_MS_2000 + (jdn - _JDN_2000) * 86400000);
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}

// JDN of 1 Thout AM 1 (29 August 284 CE).
const COPTIC_EPOCH_JDN = g2d(284, 8, 29);

// Day offset (from the epoch) of 1 Thout of a given Coptic year.
function copticYearStart(y) {
  return 365 * (y - 1) + Math.floor(y / 4);
}

function copticToJDN(y, m, d) {
  return COPTIC_EPOCH_JDN + copticYearStart(y) + 30 * (m - 1) + d - 1;
}

function jdnToCoptic(jdn) {
  const d0 = jdn - COPTIC_EPOCH_JDN;
  let year = Math.floor(d0 / 366) + 1;
  while (copticYearStart(year + 1) <= d0) year++;
  const rem = d0 - copticYearStart(year);
  return { year, month: Math.floor(rem / 30) + 1, day: (rem % 30) + 1 };
}

export class CopticCalendar extends CalendarAdapter {
  id = 'coptic';
  name = 'Coptic';

  toGregorian({ year, month, day }) {
    return d2g(copticToJDN(year, month, day));
  }

  fromGregorian({ year, month, day }) {
    return jdnToCoptic(g2d(year, month, day));
  }

  getMonthCount() {
    return 13;
  }

  getMonthLength(year, month) {
    if (month <= 12) return 30;
    return this.isLeapYear(year) ? 6 : 5;
  }

  isLeapYear(year) {
    return ((year % 4) + 4) % 4 === 3;
  }

  getMonths(locale) {
    return locale === 'ar' ? MONTHS_AR : MONTHS_EN;
  }

  getWeekdays(locale, weekStart = 0) {
    const days = locale === 'ar' ? DAYS_AR : DAYS_EN;
    const result = [];
    for (let i = 0; i < 7; i++) result.push(days[(weekStart + i) % 7]);
    return result;
  }

  validateDate({ year, month, day }) {
    if (!year || month < 1 || month > 13 || day < 1) return false;
    return day <= this.getMonthLength(year, month);
  }

  getToday() {
    const n = new Date();
    return this.fromGregorian({ year: n.getFullYear(), month: n.getMonth() + 1, day: n.getDate() });
  }
}
