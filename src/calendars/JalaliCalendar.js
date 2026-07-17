import { CalendarAdapter } from './CalendarAdapter.js';

/**
 * Jalali (Persian / Solar Hijri) calendar.
 * Algorithm: jalaali-js (Behrooz Kamali / breaks-table method, based on
 * Kazimierz Borkowski's research) — matches the official Iranian calendar,
 * including the years where the naive 2820-year-cycle rule is wrong
 * (e.g. 1403 is leap, 1404 is not).
 * Valid range: Jalali years -61 to 3177.
 */

const MONTHS_FA = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const MONTHS_EN = ['Farvardin','Ordibehesht','Khordad','Tir','Mordad','Shahrivar','Mehr','Aban','Azar','Dey','Bahman','Esfand'];
const DAYS_AR   = ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
const DAYS_FA   = ['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه'];
const DAYS_EN   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function div(a, b) { return Math.floor(a / b); }
function mod(a, b) { return a - Math.floor(a / b) * b; }

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

// Years when the 33-year leap cycle pattern shifts.
const BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210,
  1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178,
];

/**
 * Leap status and Farvardin-1 Gregorian date for a Jalali year.
 * Returns { leap: 0..4 (0 = leap year), gy, march: day-of-March of Nowruz }.
 */
function jalCal(jy) {
  const bl = BREAKS.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = BREAKS[0];
  let jump = 0;

  if (jy < jp || jy >= BREAKS[bl - 1]) throw new Error('Invalid Jalali year ' + jy);

  for (let i = 1; i < bl; i++) {
    const jm = BREAKS[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  let n = jy - jp;

  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;

  return { leap, gy, march };
}

function jalaliToJDN(jy, jm, jd) {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

function jdnToJalali(jdn) {
  const gy = d2g(jdn).year;
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;
  if (k >= 0) {
    if (k <= 185) {
      return { year: jy, month: 1 + div(k, 31), day: mod(k, 31) + 1 };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  return { year: jy, month: 7 + div(k, 30), day: mod(k, 30) + 1 };
}

function jalaliIsLeap(year) {
  return jalCal(year).leap === 0;
}

function jalaliMonthLength(year, month) {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return jalaliIsLeap(year) ? 30 : 29;
}

export class JalaliCalendar extends CalendarAdapter {
  id = 'jalali';
  name = 'Jalali';

  toGregorian({ year, month, day }) {
    return d2g(jalaliToJDN(year, month, day));
  }

  fromGregorian({ year, month, day }) {
    return jdnToJalali(g2d(year, month, day));
  }

  getMonthLength(year, month) {
    return jalaliMonthLength(year, month);
  }

  isLeapYear(year) {
    return jalaliIsLeap(year);
  }

  getMonths(locale) {
    return (locale === 'ar' || locale === 'fa') ? MONTHS_FA : MONTHS_EN;
  }

  getWeekdays(locale, weekStart = 6) {
    const days = locale === 'fa' ? DAYS_FA : (locale === 'ar' ? DAYS_AR : DAYS_EN);
    const result = [];
    for (let i = 0; i < 7; i++) result.push(days[(weekStart + i) % 7]);
    return result;
  }

  validateDate({ year, month, day }) {
    if (!year || month < 1 || month > 12 || day < 1) return false;
    return day <= this.getMonthLength(year, month);
  }

  getToday() {
    const n = new Date();
    return this.fromGregorian({ year: n.getFullYear(), month: n.getMonth() + 1, day: n.getDate() });
  }
}
