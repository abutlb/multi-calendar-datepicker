import { CalendarAdapter } from './CalendarAdapter.js';

/**
 * Hijri (Islamic) calendar.
 * Two modes:
 *   tabular   — purely algorithmic (Kuwaiti/arithmetic tabular calendar).
 *   ummalqura — official Saudi Umm al-Qura calendar. Primary source is an
 *               embedded month-length table covering AH 1318-1500
 *               (Gregorian 1900-2077), generated from the official
 *               Umm al-Qura data (same data as .NET UmAlQuraCalendar and
 *               the published KACST/Utrecht tables). Outside that range we
 *               fall back to Intl 'islamic-umalqura' (CLDR) when available,
 *               then to the tabular algorithm.
 *
 * hijriAdjust (constructor `adjust`): ±N day offset applied at the
 * Gregorian↔Hijri boundary for users whose local authority differs from
 * the printed calendar (e.g. moon-sighting announcements). Default 0.
 */

const MONTHS_AR = ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
const MONTHS_EN = ['Muharram','Safar','Rabi I','Rabi II','Jumada I','Jumada II','Rajab','Sha\'ban','Ramadan','Shawwal','Dhu al-Qi\'dah','Dhu al-Hijjah'];
const DAYS_AR   = ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
const DAYS_EN   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ── Gregorian ↔ JDN (standard Julian Day Number, proleptic Gregorian) ────────
// Date-based so both directions are exact inverses by construction.
// JDN 2451545 = 2000-01-01.

const _MS_2000  = Date.UTC(2000, 0, 1);
const _JDN_2000 = 2451545;

function gregorianToJD(y, m, d) {
  return Math.round((Date.UTC(y, m - 1, d) - _MS_2000) / 86400000) + _JDN_2000;
}

function jdToGregorian(jd) {
  const t = new Date(_MS_2000 + (jd - _JDN_2000) * 86400000);
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}

// ── Tabular (Kuwaiti) algorithm — works in standard JDN space ────────────────
// Epoch: 1 Muharram 1 AH = JDN 1948440 (16 July 622 Julian / 19 July 622 proleptic Gregorian).

function hijriToJD_tabular(h, m, d) {
  return Math.floor((11 * h + 3) / 30)
    + 354 * h
    + 30 * m
    - Math.floor((m - 1) / 2)
    + d
    + 1948440
    - 385;
}

function jdToHijri_tabular(jd) {
  const l  = jd - 1948440 + 10632;
  const n  = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j  = Math.floor((10985 - l2) / 5316) * Math.floor(50 * l2 / 17719)
            + Math.floor(l2 / 5670) * Math.floor(43 * l2 / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor(17719 * j / 50)
            - Math.floor(j / 16) * Math.floor(15238 * j / 43) + 29;
  const month = Math.floor(24 * l3 / 709);
  const day   = l3 - Math.floor(709 * month / 24);
  const year  = 30 * n + j - 30;
  return { year, month, day };
}

// ── Umm al-Qura official table ───────────────────────────────────────────────
// 12 bits per Hijri year: bit i = 1 → month i+1 has 30 days, 0 → 29 days.
// Covers AH 1318-1500. Generated from the official Umm al-Qura calendar data
// (verified against .NET System.Globalization.UmAlQuraCalendar and the
// published tables: 1 Muharram 1318 = 30 April 1900).

const UQ_START_YEAR = 1318;
// prettier-ignore
const UQ_DATA = [
  0x2EA,0x6E9,0xED2,0xEA4,0xD4A,0xA96,0x536,0xAB5,0xDAA,0xBA4, // 1318-1327
  0xB49,0xA93,0x52B,0xA57,0x4B6,0xAB5,0x5AA,0xD55,0xD2A,0xA56, // 1328-1337
  0x4AE,0x95D,0x2EC,0x6D5,0x6AA,0x555,0x4AB,0x95B,0x2BA,0x575, // 1338-1347
  0xBB2,0x764,0x749,0x655,0x2AB,0x55B,0xADA,0x6D4,0xEC9,0xD92, // 1348-1357
  0xD25,0xA4D,0x2AD,0x56D,0xB6A,0xB52,0xAA5,0xA4B,0x497,0x937, // 1358-1367
  0x2B6,0x575,0xD6A,0xD52,0xA96,0x92D,0x25D,0x4DD,0xADA,0x5D4, // 1368-1377
  0xDA9,0xD52,0xAAA,0x4D6,0x9B6,0x374,0x769,0x752,0x6A5,0x54B, // 1378-1387
  0xAAB,0x55A,0xAD5,0xDD2,0xDA4,0xD49,0xA95,0x52D,0xA5D,0x55A, // 1388-1397
  0xAD5,0x6AA,0x695,0x52B,0xA57,0x4AE,0x976,0x56C,0xB55,0xAAA, // 1398-1407
  0xA55,0x4AD,0x95D,0x2DA,0x5D9,0xDB2,0xBA4,0xB4A,0xA55,0x2B5, // 1408-1417
  0x575,0xB6A,0xBD2,0xBC4,0xB89,0xA95,0x52D,0x5AD,0xB6A,0x6D4, // 1418-1427
  0xDC9,0xD92,0xAA6,0x956,0x2AE,0x56D,0x36A,0xB55,0xAAA,0x94D, // 1428-1437
  0x49D,0x95D,0x2BA,0x5B5,0x5AA,0xD55,0xA9A,0x92E,0x26E,0x55D, // 1438-1447
  0xADA,0x6D4,0x6A5,0x54B,0xA97,0x54E,0xAAE,0x5AC,0xBA9,0xD92, // 1448-1457
  0xB25,0x64B,0xCAB,0x55A,0xB55,0x6D2,0xEA5,0xE4A,0xA95,0x52D, // 1458-1467
  0xAAD,0x36C,0x759,0x6D2,0x695,0x52D,0xA5B,0x4BA,0x9BA,0x3B4, // 1468-1477
  0xB69,0xB52,0xAA6,0x4B6,0x96D,0x2EC,0x6D9,0xEB2,0xD54,0xD2A, // 1478-1487
  0xA56,0x4AE,0x96D,0xD6A,0xB54,0xB29,0xA93,0x52B,0xA57,0x536, // 1488-1497
  0xAB5,0x6AA,0xE93,                                            // 1498-1500
];

// JDN of 1 Muharram 1318 AH = 30 April 1900.
const UQ_ANCHOR_JDN = gregorianToJD(1900, 4, 30);

// Cumulative year-start JDNs (index i → 1 Muharram of year UQ_START_YEAR+i).
const UQ_YEAR_START = (() => {
  const starts = [UQ_ANCHOR_JDN];
  for (let i = 0; i < UQ_DATA.length; i++) {
    let days = 0;
    for (let m = 0; m < 12; m++) days += (UQ_DATA[i] >> m) & 1 ? 30 : 29;
    starts.push(starts[i] + days);
  }
  return starts;
})();

/**
 * Append official Umm al-Qura data for years after the embedded table
 * (i.e. starting at AH 1501). Call once, before creating pickers.
 *
 * Each entry is a 12-bit number: bit i = 1 → month i+1 has 30 days.
 * Years must be contiguous with the end of the current table.
 * Regenerate from official data with tools/generate-uq-table.ps1.
 *
 *   MultiCalendarDatepicker.extendUmmalquraData([0xABC, 0x5AD, ...]);
 *
 * Returns the new last covered Hijri year.
 */
export function extendUmmalquraData(yearBits) {
  for (const bits of yearBits) {
    let days = 0;
    for (let m = 0; m < 12; m++) days += (bits >> m) & 1 ? 30 : 29;
    // An Umm al-Qura year is always 354 or 355 days.
    if (days < 354 || days > 355) throw new Error('MCD: invalid Umm al-Qura year data: ' + bits);
    UQ_DATA.push(bits);
    UQ_YEAR_START.push(UQ_YEAR_START[UQ_YEAR_START.length - 1] + days);
  }
  return UQ_START_YEAR + UQ_DATA.length - 1;
}

/** Whether a Hijri year is covered by embedded/extended official data. */
export function isOfficialUmmalquraYear(hYear) {
  const idx = hYear - UQ_START_YEAR;
  return idx >= 0 && idx < UQ_DATA.length;
}

function uqMonthLength(hYear, hMonth) {
  const idx = hYear - UQ_START_YEAR;
  if (idx < 0 || idx >= UQ_DATA.length) return null;
  return (UQ_DATA[idx] >> (hMonth - 1)) & 1 ? 30 : 29;
}

function uqToJDN(hYear, hMonth, hDay) {
  const idx = hYear - UQ_START_YEAR;
  if (idx < 0 || idx >= UQ_DATA.length) return null;
  let jdn = UQ_YEAR_START[idx];
  const bits = UQ_DATA[idx];
  for (let m = 0; m < hMonth - 1; m++) jdn += (bits >> m) & 1 ? 30 : 29;
  return jdn + hDay - 1;
}

function jdnToUQ(jdn) {
  if (jdn < UQ_YEAR_START[0] || jdn >= UQ_YEAR_START[UQ_DATA.length]) return null;
  // Binary search for the year containing this JDN.
  let lo = 0, hi = UQ_DATA.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (UQ_YEAR_START[mid] <= jdn) lo = mid; else hi = mid - 1;
  }
  let rem = jdn - UQ_YEAR_START[lo];
  const bits = UQ_DATA[lo];
  for (let m = 0; m < 12; m++) {
    const len = (bits >> m) & 1 ? 30 : 29;
    if (rem < len) return { year: UQ_START_YEAR + lo, month: m + 1, day: rem + 1 };
    rem -= len;
  }
  return null; // unreachable
}

// ── Intl 'islamic-umalqura' fallback (years outside the embedded table) ──────

function _shiftGreg(year, month, day, n) {
  if (!n) return { year, month, day };
  const d = new Date(Date.UTC(year, month - 1, day + n));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function _checkIntlUQ() {
  try {
    new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      year: 'numeric', month: 'numeric', day: 'numeric'
    }).formatToParts(new Date(Date.UTC(2000, 0, 1)));
    return true;
  } catch (e) { return false; }
}

const _HAS_INTL_UQ = _checkIntlUQ();

const _intlUQFmt = _HAS_INTL_UQ
  ? new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      year: 'numeric', month: 'numeric', day: 'numeric'
    })
  : null;

function _gregToHijriIntl(year, month, day) {
  const parts = _intlUQFmt.formatToParts(new Date(Date.UTC(year, month - 1, day)));
  const get = t => parseInt(parts.find(p => p.type === t).value);
  return { year: get('year'), month: get('month'), day: get('day') };
}

// Anchor normalised to day 1 of its Hijri month so month-start estimates
// carry no day-of-month bias.
let _uqAnchorH = null, _uqAnchorMs = 0;
function _ensureUQAnchor() {
  if (!_uqAnchorH) {
    const h  = _gregToHijriIntl(2000, 1, 1);
    _uqAnchorMs = Date.UTC(2000, 0, 1) - (h.day - 1) * 86400000;
    _uqAnchorH  = { year: h.year, month: h.month };
  }
}

const _uqMonthStartCache = new Map();

// Gregorian date of day 1 of the given Hijri month, per Intl data.
// Iterative correction: read the Hijri date at the estimate, jump by the
// month/day difference, repeat — converges in a few steps regardless of drift.
function _intlMonthStart(hYear, hMonth) {
  _ensureUQAnchor();
  const cacheKey = `${hYear}-${hMonth}`;
  const cached = _uqMonthStartCache.get(cacheKey);
  if (cached) return cached;

  let ms = _uqAnchorMs + Math.round(
    (hYear  - _uqAnchorH.year)  * 354.367 +
    (hMonth - _uqAnchorH.month) * 29.53
  ) * 86400000;

  for (let i = 0; i < 16; i++) {
    const d = new Date(ms);
    const h = _gregToHijriIntl(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    const monthsOff = (h.year - hYear) * 12 + (h.month - hMonth);
    if (monthsOff === 0) {
      if (h.day === 1) {
        const start = { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
        _uqMonthStartCache.set(cacheKey, start);
        return start;
      }
      ms -= (h.day - 1) * 86400000;
    } else {
      ms -= Math.round(monthsOff * 29.53) * 86400000;
    }
  }
  return null;
}

// ── Calendar class ───────────────────────────────────────────────────────────

export class HijriCalendar extends CalendarAdapter {
  id = 'hijri';
  name = 'Hijri';

  constructor(mode = 'tabular', adjust = 0) {
    super();
    this.mode   = mode;   // 'tabular' | 'ummalqura'
    this.adjust = adjust; // ±N days offset vs the calendar data
  }

  toGregorian({ year, month, day }) {
    if (this.mode === 'ummalqura') {
      const jdn = uqToJDN(year, month, day);
      if (jdn !== null) {
        const g = jdToGregorian(jdn);
        return _shiftGreg(g.year, g.month, g.day, -this.adjust);
      }
      if (_HAS_INTL_UQ) {
        const start = _intlMonthStart(year, month);
        if (start) {
          const g = _shiftGreg(start.year, start.month, start.day, day - 1);
          return _shiftGreg(g.year, g.month, g.day, -this.adjust);
        }
      }
    }
    return jdToGregorian(hijriToJD_tabular(year, month, day));
  }

  fromGregorian({ year, month, day }) {
    if (this.mode === 'ummalqura') {
      const sh = _shiftGreg(year, month, day, this.adjust);
      const h = jdnToUQ(gregorianToJD(sh.year, sh.month, sh.day));
      if (h) return h;
      if (_HAS_INTL_UQ) return _gregToHijriIntl(sh.year, sh.month, sh.day);
    }
    return jdToHijri_tabular(gregorianToJD(year, month, day));
  }

  getMonthLength(year, month) {
    if (this.mode === 'ummalqura') {
      const len = uqMonthLength(year, month);
      if (len !== null) return len;
      if (_HAS_INTL_UQ) {
        const s1 = _intlMonthStart(year, month);
        const s2 = _intlMonthStart(
          month === 12 ? year + 1 : year,
          month === 12 ? 1 : month + 1
        );
        if (s1 && s2) {
          return Math.round((Date.UTC(s2.year, s2.month - 1, s2.day)
                           - Date.UTC(s1.year, s1.month - 1, s1.day)) / 86400000);
        }
      }
    }
    // tabular: odd months 30 days, even 29, except month 12 in leap year
    if (month % 2 === 1) return 30;
    if (month === 12 && this.isLeapYear(year)) return 30;
    return 29;
  }

  isLeapYear(year) {
    return (11 * year + 14) % 30 < 11;
  }

  getMonths(locale) {
    return locale === 'ar' ? MONTHS_AR : MONTHS_EN;
  }

  getWeekdays(locale, weekStart = 6) {
    const days = locale === 'ar' ? DAYS_AR : DAYS_EN;
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
