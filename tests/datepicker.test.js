import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Datepicker } from '../src/core/Datepicker.js';
import { ResultRenderer } from '../src/core/ResultRenderer.js';
import { toPersianDigits, toLatinDigits, applyDigits } from '../src/utils/numbers.js';

function makeInput() {
  const input = document.createElement('input');
  input.id = 'dp';
  document.body.appendChild(input);
  return input;
}

function cellOf(picker, y, m, d) {
  return document.querySelector(
    `.mcd-day[data-year="${y}"][data-month="${m}"][data-day="${d}"]:not(.mcd-day--outside)`
  );
}

let input, dp;
afterEach(() => {
  if (dp) { dp.destroy(); dp = null; }
  document.body.innerHTML = '';
});

// ── Range selection ─────────────────────────────────────────────────────────

describe('Datepicker range mode', () => {
  beforeEach(() => {
    input = makeInput();
    dp = new Datepicker(input, { calendar: 'gregorian', mode: 'range' });
  });

  it('two clicks produce an ordered range and ISO interval value', () => {
    dp.setGregorianRange('2026-06-27', '2026-06-16'); // reversed on purpose
    expect(dp.getGregorianValue()).toBe('2026-06-16/2026-06-27');
    const r = dp.getResult();
    expect(r.mode).toBe('range');
    expect(r.gregorianStartValue).toBe('2026-06-16');
    expect(r.gregorianEndValue).toBe('2026-06-27');
  });

  it('clicking start then end via cells fires mcd:change once complete', () => {
    let changes = 0, rangeStarts = 0;
    input.addEventListener('mcd:change', () => changes++);
    input.addEventListener('mcd:range-start', () => rangeStarts++);

    dp.setGregorianValue = undefined; // ensure we go through the UI path
    // Navigate view to June 2026 via internal API
    dp._viewYear = 2026; dp._viewMonth = 6; dp._renderGrid();

    cellOf(dp._picker, 2026, 6, 10).click();
    expect(rangeStarts).toBe(1);
    expect(changes).toBe(0);

    cellOf(dp._picker, 2026, 6, 20).click();
    expect(changes).toBe(1);
    expect(dp.getGregorianValue()).toBe('2026-06-10/2026-06-20');
  });

  it('marks in-range cells with the CSS class', () => {
    dp.setGregorianRange('2026-06-10', '2026-06-13');
    dp._viewYear = 2026; dp._viewMonth = 6; dp._renderGrid();
    expect(cellOf(dp._picker, 2026, 6, 10).classList.contains('mcd-day--range-start')).toBe(true);
    expect(cellOf(dp._picker, 2026, 6, 11).classList.contains('mcd-day--in-range')).toBe(true);
    expect(cellOf(dp._picker, 2026, 6, 12).classList.contains('mcd-day--in-range')).toBe(true);
    expect(cellOf(dp._picker, 2026, 6, 13).classList.contains('mcd-day--range-end')).toBe(true);
  });

  it('hijri ummalqura range converts both ends correctly', () => {
    dp.destroy();
    dp = new Datepicker(input, {
      calendar: 'hijri', hijriMode: 'ummalqura', mode: 'range',
    });
    dp.setGregorianRange('2026-06-16', '2026-06-27');
    const r = dp.getRange();
    expect(r.start).toEqual({ year: 1448, month: 1, day: 1 });
    expect(r.end).toEqual({ year: 1448, month: 1, day: 12 });
  });
});

// ── Dual calendar display ───────────────────────────────────────────────────

describe('Datepicker secondaryCalendar', () => {
  it('renders the Gregorian day inside Hijri cells', () => {
    input = makeInput();
    dp = new Datepicker(input, {
      calendar: 'hijri', hijriMode: 'ummalqura', secondaryCalendar: 'gregorian',
    });
    dp._viewYear = 1448; dp._viewMonth = 1; dp._renderGrid();

    const cell = cellOf(dp._picker, 1448, 1, 12); // = 2026-06-27
    const sec = cell.querySelector('.mcd-day-secondary');
    expect(sec).not.toBeNull();
    expect(sec.textContent).toBe('27');
    // aria-label carries both dates
    expect(cell.getAttribute('aria-label')).toContain('(2026-6-27)');
  });

  it('shows day/month on the secondary month boundary', () => {
    input = makeInput();
    dp = new Datepicker(input, {
      calendar: 'hijri', hijriMode: 'ummalqura', secondaryCalendar: 'gregorian',
    });
    dp._viewYear = 1448; dp._viewMonth = 1; dp._renderGrid();
    // 1448-01-16 = 2026-07-01 → secondary shows "1/7"
    const cell = cellOf(dp._picker, 1448, 1, 16);
    expect(cell.querySelector('.mcd-day-secondary').textContent).toBe('1/7');
  });
});

// ── Keyboard navigation ─────────────────────────────────────────────────────

describe('Datepicker keyboard navigation', () => {
  beforeEach(() => {
    input = makeInput();
    dp = new Datepicker(input, { calendar: 'gregorian' });
    dp._viewYear = 2026; dp._viewMonth = 6; dp._focusDate = { year: 2026, month: 6, day: 30 };
    dp._renderGrid();
  });

  function press(key, opts = {}) {
    dp._grid.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...opts }));
  }

  it('ArrowRight from the last day crosses into the next month', () => {
    press('ArrowRight');
    expect(dp._focusDate).toEqual({ year: 2026, month: 7, day: 1 });
    expect(dp._viewMonth).toBe(7); // view followed the focus
  });

  it('ArrowDown moves one week ahead', () => {
    dp._focusDate = { year: 2026, month: 6, day: 10 }; dp._renderGrid();
    press('ArrowDown');
    expect(dp._focusDate).toEqual({ year: 2026, month: 6, day: 17 });
  });

  it('RTL flips horizontal arrows', () => {
    dp.destroy();
    dp = new Datepicker(input, { calendar: 'gregorian', dir: 'rtl' });
    dp._viewYear = 2026; dp._viewMonth = 6; dp._focusDate = { year: 2026, month: 6, day: 10 };
    dp._renderGrid();
    dp._grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(dp._focusDate).toEqual({ year: 2026, month: 6, day: 9 });
  });

  it('PageDown moves a month, Shift+PageDown a year (day clamped)', () => {
    dp._focusDate = { year: 2026, month: 1, day: 31 }; dp._viewMonth = 1; dp._renderGrid();
    press('PageDown');
    expect(dp._focusDate).toEqual({ year: 2026, month: 2, day: 28 }); // clamped
    press('PageDown', { shiftKey: true });
    expect(dp._focusDate.year).toBe(2027);
  });

  it('Home/End jump to first/last day of month', () => {
    press('Home');
    expect(dp._focusDate.day).toBe(1);
    press('End');
    expect(dp._focusDate.day).toBe(30); // June
  });
});

// ── Manual input ────────────────────────────────────────────────────────────

describe('Datepicker allowInput', () => {
  beforeEach(() => {
    input = makeInput();
    dp = new Datepicker(input, { calendar: 'gregorian', allowInput: true });
  });

  it('commits a valid typed date on change', () => {
    input.value = '2026-03-15';
    input.dispatchEvent(new Event('change'));
    expect(dp.getGregorianValue()).toBe('2026-03-15');
  });

  it('reverts an invalid typed date', () => {
    dp.setGregorianValue('2026-03-15');
    input.value = '2026-13-45';
    input.dispatchEvent(new Event('change'));
    expect(input.value).toBe('2026-03-15');
    expect(dp.getGregorianValue()).toBe('2026-03-15');
  });

  it('accepts arabic-digit input', () => {
    input.value = '٢٠٢٦-٠٣-١٥';
    input.dispatchEvent(new Event('change'));
    expect(dp.getGregorianValue()).toBe('2026-03-15');
  });
});

// ── Polish ──────────────────────────────────────────────────────────────────

describe('Template + digits polish', () => {
  it('applyTemplate replaces every occurrence and range tokens', () => {
    const out = ResultRenderer.applyTemplate(
      '{{gregorian}} | {{gregorian}} | {{gregorianStart}}→{{gregorianEnd}}',
      { gregorian: 'X', gregorianStart: 'A', gregorianEnd: 'B' }
    );
    expect(out).toBe('X | X | A→B');
  });

  it('persian digits round-trip', () => {
    expect(toPersianDigits('1405')).toBe('۱۴۰۵');
    expect(toLatinDigits('۱۴۰۵')).toBe('1405');
    expect(applyDigits('12', 'persian')).toBe('۱۲');
  });

  it('day cells render localized digits', () => {
    input = makeInput();
    dp = new Datepicker(input, { calendar: 'gregorian', digits: 'arabic' });
    dp._viewYear = 2026; dp._viewMonth = 6; dp._renderGrid();
    const cell = cellOf(dp._picker, 2026, 6, 15);
    expect(cell.querySelector('.mcd-day-main').textContent).toBe('١٥');
  });
});

// ── Coptic in the picker (13 months) ────────────────────────────────────────

describe('Datepicker with Coptic calendar', () => {
  beforeEach(() => {
    input = makeInput();
    dp = new Datepicker(input, { calendar: 'coptic', locale: 'ar' });
  });

  it('month select has 13 entries ending with النسيء', () => {
    const opts = [...dp._selectMonth.options].map(o => o.textContent);
    expect(opts.length).toBe(13);
    expect(opts[0]).toBe('توت');
    expect(opts[12]).toBe('النسيء');
  });

  it('navigation wraps 13 → 1 and 1 → 13', () => {
    dp._viewYear = 1741; dp._viewMonth = 13; dp._renderGrid();
    dp._navigate(1);
    expect(dp._viewMonth).toBe(1);
    expect(dp._viewYear).toBe(1742);
    dp._navigate(-1);
    expect(dp._viewMonth).toBe(13);
    expect(dp._viewYear).toBe(1741);
  });

  it('keyboard ArrowRight crosses from Nasie into the new year', () => {
    // 1740 is non-leap → Nasie has 5 days
    dp._viewYear = 1740; dp._viewMonth = 13;
    dp._focusDate = { year: 1740, month: 13, day: 5 };
    dp._renderGrid();
    dp._grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(dp._focusDate).toEqual({ year: 1741, month: 1, day: 1 });
  });

  it('selecting a Coptic date outputs the right Gregorian value', () => {
    dp.setGregorianValue('2025-01-07'); // Coptic Christmas
    expect(dp.getDisplayValue()).toBe('1741-04-29');
    expect(dp.getGregorianValue()).toBe('2025-01-07');
  });
});

// ── gregorianMonths variant wiring ──────────────────────────────────────────

describe('Datepicker gregorianMonths option', () => {
  it('levant names appear in the month select', () => {
    input = makeInput();
    dp = new Datepicker(input, { calendar: 'gregorian', locale: 'ar', gregorianMonths: 'levant' });
    const opts = [...dp._selectMonth.options].map(o => o.textContent);
    expect(opts[0]).toBe('كانون الثاني');
    expect(opts[7]).toBe('آب');
  });
});

// ── Reopen after close ──────────────────────────────────────────────────────

describe('Datepicker reopen', () => {
  it('clicking the input reopens the picker after closeOnSelect', () => {
    input = makeInput();
    dp = new Datepicker(input, { calendar: 'gregorian' });
    input.dispatchEvent(new Event('focus'));
    expect(dp._open).toBe(true);
    dp._viewYear = 2026; dp._viewMonth = 6; dp._renderGrid();
    cellOf(dp._picker, 2026, 6, 15).click();
    expect(dp._open).toBe(false); // closeOnSelect
    input.dispatchEvent(new Event('click'));
    expect(dp._open).toBe(true);
  });
});
