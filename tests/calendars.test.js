import { describe, it, expect } from 'vitest';
import { GregorianCalendar } from '../src/calendars/GregorianCalendar.js';
import { CopticCalendar }    from '../src/calendars/CopticCalendar.js';
import { HijriCalendar, extendUmmalquraData, isOfficialUmmalquraYear } from '../src/calendars/HijriCalendar.js';
import { JalaliCalendar }    from '../src/calendars/JalaliCalendar.js';
import { formatDate, parseDate } from '../src/core/Formatter.js';
import { toArabicDigits, toLatinDigits } from '../src/utils/numbers.js';
import { ResultRenderer } from '../src/core/ResultRenderer.js';

// ── Gregorian ─────────────────────────────────────────────────────────────

describe('GregorianCalendar', () => {
  const cal = new GregorianCalendar();

  it('isLeapYear', () => {
    expect(cal.isLeapYear(2024)).toBe(true);
    expect(cal.isLeapYear(2023)).toBe(false);
    expect(cal.isLeapYear(2000)).toBe(true);
    expect(cal.isLeapYear(1900)).toBe(false);
  });

  it('getMonthLength Feb leap', () => {
    expect(cal.getMonthLength(2024, 2)).toBe(29);
    expect(cal.getMonthLength(2023, 2)).toBe(28);
  });

  it('toGregorian / fromGregorian identity', () => {
    const d = { year: 2026, month: 6, day: 27 };
    expect(cal.toGregorian(d)).toEqual(d);
    expect(cal.fromGregorian(d)).toEqual(d);
  });

  it('validateDate', () => {
    expect(cal.validateDate({ year: 2024, month: 2, day: 29 })).toBe(true);
    expect(cal.validateDate({ year: 2023, month: 2, day: 29 })).toBe(false);
  });
});

// ── Hijri ─────────────────────────────────────────────────────────────────

describe('HijriCalendar (tabular)', () => {
  const cal = new HijriCalendar('tabular');

  it('converts 1447-01-12 to gregorian 2025-07-08 (standard tabular)', () => {
    // Standard civil tabular: 1 Muharram 1447 = 27 June 2025, so day 12 = 8 July.
    // (Official Umm al-Qura is 26 June — tabular is expected to differ by ±1-2 days.)
    const g = cal.toGregorian({ year: 1447, month: 1, day: 12 });
    expect(g).toEqual({ year: 2025, month: 7, day: 8 });
  });

  it('fromGregorian round-trip', () => {
    const h  = { year: 1447, month: 3, day: 15 };
    const g  = cal.toGregorian(h);
    const h2 = cal.fromGregorian(g);
    expect(h2).toEqual(h);
  });

  it('getMonthLength', () => {
    // odd months = 30 days
    expect(cal.getMonthLength(1447, 1)).toBe(30);
    // even months = 29 days
    expect(cal.getMonthLength(1447, 2)).toBe(29);
  });
});

describe('HijriCalendar (ummalqura — official Saudi table)', () => {
  const cal = new HijriCalendar('ummalqura');

  it('1 Muharram 1447 = 26 June 2025 (official)', () => {
    expect(cal.toGregorian({ year: 1447, month: 1, day: 1 }))
      .toEqual({ year: 2025, month: 6, day: 26 });
  });

  it('1 Muharram 1448 = 16 June 2026 (official)', () => {
    expect(cal.toGregorian({ year: 1448, month: 1, day: 1 }))
      .toEqual({ year: 2026, month: 6, day: 16 });
  });

  it('27 June 2026 = 12 Muharram 1448', () => {
    expect(cal.fromGregorian({ year: 2026, month: 6, day: 27 }))
      .toEqual({ year: 1448, month: 1, day: 12 });
  });

  it('1 Ramadan 1446 = 1 March 2025', () => {
    expect(cal.toGregorian({ year: 1446, month: 9, day: 1 }))
      .toEqual({ year: 2025, month: 3, day: 1 });
  });

  it('Eid al-Adha 1446 (10 Dhu al-Hijjah) = 6 June 2025', () => {
    expect(cal.toGregorian({ year: 1446, month: 12, day: 10 }))
      .toEqual({ year: 2025, month: 6, day: 6 });
  });

  it('table anchor: 1 Muharram 1318 = 30 April 1900', () => {
    expect(cal.toGregorian({ year: 1318, month: 1, day: 1 }))
      .toEqual({ year: 1900, month: 4, day: 30 });
  });

  it('extendUmmalquraData appends contiguous years after AH 1500', () => {
    expect(isOfficialUmmalquraYear(1500)).toBe(true);
    expect(isOfficialUmmalquraYear(1501)).toBe(false);

    // Last embedded day: 1500-12-30 = 2077-11-16
    const lastDay = cal.toGregorian({ year: 1500, month: 12, day: 30 });
    expect(lastDay).toEqual({ year: 2077, month: 11, day: 16 });

    // Append a synthetic 1501 (alternating 30/29 months = 0x555)
    const newLast = extendUmmalquraData([0x555]);
    expect(newLast).toBe(1501);
    expect(isOfficialUmmalquraYear(1501)).toBe(true);

    // Continuity: 1501-01-01 is the day right after 1500-12-30
    expect(cal.toGregorian({ year: 1501, month: 1, day: 1 }))
      .toEqual({ year: 2077, month: 11, day: 17 });
    expect(cal.getMonthLength(1501, 1)).toBe(30);
    expect(cal.getMonthLength(1501, 2)).toBe(29);
    expect(cal.fromGregorian({ year: 2077, month: 11, day: 17 }))
      .toEqual({ year: 1501, month: 1, day: 1 });

    // Bad data is rejected
    expect(() => extendUmmalquraData([0xFFF])).toThrow(); // 360 days — invalid
  });

  it('round-trip for every day of 1440-1450', () => {
    for (let y = 1440; y <= 1450; y++) {
      for (let m = 1; m <= 12; m++) {
        const len = cal.getMonthLength(y, m);
        expect(len === 29 || len === 30).toBe(true);
        for (let d = 1; d <= len; d++) {
          const g = cal.toGregorian({ year: y, month: m, day: d });
          expect(cal.fromGregorian(g)).toEqual({ year: y, month: m, day: d });
        }
      }
    }
  });
});

// ── Jalali ────────────────────────────────────────────────────────────────

describe('JalaliCalendar', () => {
  const cal = new JalaliCalendar();

  it('converts 1405-04-06 to gregorian 2026-06-27', () => {
    const g = cal.toGregorian({ year: 1405, month: 4, day: 6 });
    expect(g.year).toBe(2026);
    expect(g.month).toBe(6);
    expect(g.day).toBe(27);
  });

  it('fromGregorian 2026-06-27 = 1405-04-06', () => {
    const j = cal.fromGregorian({ year: 2026, month: 6, day: 27 });
    expect(j.year).toBe(1405);
    expect(j.month).toBe(4);
    expect(j.day).toBe(6);
  });

  it('isLeapYear (including 1403/1404 where the 2820-cycle rule fails)', () => {
    expect(cal.isLeapYear(1399)).toBe(true);  // 2020-21
    expect(cal.isLeapYear(1400)).toBe(false);
    expect(cal.isLeapYear(1403)).toBe(true);  // official: leap
    expect(cal.isLeapYear(1404)).toBe(false); // official: not leap
  });

  it('Nowruz anchors', () => {
    expect(cal.toGregorian({ year: 1403, month: 1, day: 1 })).toEqual({ year: 2024, month: 3, day: 20 });
    expect(cal.toGregorian({ year: 1404, month: 1, day: 1 })).toEqual({ year: 2025, month: 3, day: 21 });
    expect(cal.toGregorian({ year: 1405, month: 1, day: 1 })).toEqual({ year: 2026, month: 3, day: 21 });
  });
});

// ── Gregorian month-name variants ─────────────────────────────────────────

describe('GregorianCalendar month-name variants', () => {
  it('default = يناير…', () => {
    const cal = new GregorianCalendar();
    expect(cal.getMonths('ar')[0]).toBe('يناير');
    expect(cal.getMonths('ar')[11]).toBe('ديسمبر');
  });

  it('levant = كانون الثاني…', () => {
    const cal = new GregorianCalendar('levant');
    const m = cal.getMonths('ar');
    expect(m[0]).toBe('كانون الثاني');
    expect(m[1]).toBe('شباط');
    expect(m[6]).toBe('تموز');
    expect(m[11]).toBe('كانون الأول');
    // English unaffected
    expect(cal.getMonths('en')[0]).toBe('January');
  });

  it('both = combined names', () => {
    const cal = new GregorianCalendar('both');
    expect(cal.getMonths('ar')[0]).toBe('كانون الثاني / يناير');
  });
});

// ── Coptic ────────────────────────────────────────────────────────────────

describe('CopticCalendar', () => {
  const cal = new CopticCalendar();

  it('Nayrouz (1 Thout) anchors', () => {
    // 1 Thout 1741 AM = 11 September 2024
    expect(cal.toGregorian({ year: 1741, month: 1, day: 1 }))
      .toEqual({ year: 2024, month: 9, day: 11 });
    // 1 Thout 1740 AM = 12 September 2023 (follows leap year 1739)
    expect(cal.toGregorian({ year: 1740, month: 1, day: 1 }))
      .toEqual({ year: 2023, month: 9, day: 12 });
    // 1 Thout 1742 AM = 11 September 2025
    expect(cal.toGregorian({ year: 1742, month: 1, day: 1 }))
      .toEqual({ year: 2025, month: 9, day: 11 });
  });

  it('Coptic Christmas: 29 Kiahk 1741 = 7 January 2025', () => {
    expect(cal.toGregorian({ year: 1741, month: 4, day: 29 }))
      .toEqual({ year: 2025, month: 1, day: 7 });
  });

  it('leap years: AM ≡ 3 (mod 4), Nasie 6 days', () => {
    expect(cal.isLeapYear(1739)).toBe(true);
    expect(cal.isLeapYear(1740)).toBe(false);
    expect(cal.getMonthLength(1739, 13)).toBe(6);
    expect(cal.getMonthLength(1740, 13)).toBe(5);
    expect(cal.getMonthLength(1741, 5)).toBe(30);
    expect(cal.getMonthCount()).toBe(13);
  });

  it('validateDate honours the 13th month', () => {
    expect(cal.validateDate({ year: 1739, month: 13, day: 6 })).toBe(true);
    expect(cal.validateDate({ year: 1740, month: 13, day: 6 })).toBe(false);
    expect(cal.validateDate({ year: 1740, month: 14, day: 1 })).toBe(false);
  });

  it('round-trip + continuity for every day 2015-2035', () => {
    let prev = null;
    let cur = { year: 2015, month: 1, day: 1 };
    const end = Date.UTC(2035, 11, 31);
    while (Date.UTC(cur.year, cur.month - 1, cur.day) <= end) {
      const c = cal.fromGregorian(cur);
      expect(cal.toGregorian(c)).toEqual(cur);
      if (prev) {
        const ok = (c.year === prev.year && c.month === prev.month && c.day === prev.day + 1)
          || (c.day === 1 && ((c.month === prev.month + 1 && c.year === prev.year)
              || (c.month === 1 && prev.month === 13 && c.year === prev.year + 1)));
        expect(ok).toBe(true);
      }
      prev = c;
      const n = new Date(Date.UTC(cur.year, cur.month - 1, cur.day + 1));
      cur = { year: n.getUTCFullYear(), month: n.getUTCMonth() + 1, day: n.getUTCDate() };
    }
  });
});

// ── Formatter ─────────────────────────────────────────────────────────────

describe('Formatter', () => {
  it('formatDate YYYY-MM-DD', () => {
    expect(formatDate({ year: 2026, month: 6, day: 27 }, 'YYYY-MM-DD')).toBe('2026-06-27');
  });

  it('formatDate DD/MM/YYYY', () => {
    expect(formatDate({ year: 2026, month: 6, day: 27 }, 'DD/MM/YYYY')).toBe('27/06/2026');
  });

  it('parseDate YYYY-MM-DD', () => {
    expect(parseDate('2026-06-27', 'YYYY-MM-DD')).toEqual({ year: 2026, month: 6, day: 27 });
  });

  it('parseDate DD/MM/YYYY', () => {
    expect(parseDate('27/06/2026', 'DD/MM/YYYY')).toEqual({ year: 2026, month: 6, day: 27 });
  });

  it('arabic digits round-trip', () => {
    const arabic = toArabicDigits('2026-06-27');
    expect(arabic).toBe('٢٠٢٦-٠٦-٢٧');
    expect(toLatinDigits(arabic)).toBe('2026-06-27');
  });

  it('formatDate arabic digits', () => {
    const result = formatDate({ year: 2026, month: 6, day: 27 }, 'YYYY-MM-DD', 'arabic');
    expect(result).toBe('٢٠٢٦-٠٦-٢٧');
  });
});

// ── ResultRenderer ────────────────────────────────────────────────────────

describe('ResultRenderer.applyTemplate', () => {
  it('substitutes {{gregorian}}', () => {
    const out = ResultRenderer.applyTemplate('الميلادي: {{gregorian}}', { gregorian: '2025-06-08' });
    expect(out).toBe('الميلادي: 2025-06-08');
  });

  it('substitutes multiple tokens', () => {
    const out = ResultRenderer.applyTemplate(
      'تم اختيار {{display}}، والميلادي المقابل هو {{gregorian}}',
      { display: '1447-01-12', gregorian: '2025-06-08' }
    );
    expect(out).toBe('تم اختيار 1447-01-12، والميلادي المقابل هو 2025-06-08');
  });
});
