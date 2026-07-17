import { getCalendar }        from './CalendarManager.js';
import { HijriCalendar }     from '../calendars/HijriCalendar.js';
import { GregorianCalendar } from '../calendars/GregorianCalendar.js';
import { formatDate, parseDate } from './Formatter.js';
import { ResultRenderer }     from './ResultRenderer.js';
import { positionPicker }     from './Positioning.js';
import { ThemeManager }       from './ThemeManager.js';
import { isDateDisabled }     from '../utils/validation.js';
import { dateOnlyEquals, dateOnlyCompare, parseISODateOnly, dateOnlyToString } from '../utils/dateOnly.js';
import { qs, create, on }     from '../utils/dom.js';
import { applyDigits }        from '../utils/numbers.js';

const DEFAULTS = {
  calendar:         'gregorian',
  hijriMode:        'tabular',
  gregorianMonths:  'default',  // 'default' (يناير) | 'levant' (كانون الثاني) | 'both'
  mode:             'single',   // 'single' | 'range'
  secondaryCalendar: null,      // e.g. 'gregorian' — small date shown inside each day cell
  backgroundSvg:        null,
  backgroundSvgOpacity: 0.15,
  locale:           'en',
  dir:              'ltr',
  outputFormat:     'YYYY-MM-DD',
  displayFormat:    'YYYY-MM-DD',
  outputTarget:     null,
  resultTarget:     null,
  resultTemplate:   'Gregorian: {{gregorian}}',
  autoClose:        true,
  showTodayButton:  true,
  showClearButton:  true,
  showResult:       true,
  weekStart:        0,
  minDate:          null,
  maxDate:          null,
  disabledDates:    [],
  disabledWeekDays: [],
  weekendDays:      [],
  theme:            'light',
  closeOnSelect:    true,
  allowInput:       false,
  digits:           'latin',    // 'latin' | 'arabic' | 'persian'
  position:         'auto',
  rangeSeparator:   ' – ', // used in the input display for ranges
};

const L10N = {
  en: { today: 'Today',  clear: 'Clear',       close: 'Close',  greg: 'Gregorian: ' },
  ar: { today: 'اليوم',  clear: 'مسح',         close: 'إغلاق',  greg: 'الميلادي: ' },
  fa: { today: 'امروز',  clear: 'پاک کردن',    close: 'بستن',   greg: 'میلادی: ' },
};

function addGregDays(g, n) {
  const d = new Date(Date.UTC(g.year, g.month - 1, g.day + n));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

let instanceCount = 0;

export class Datepicker {
  constructor(inputEl, options = {}) {
    this._input    = typeof inputEl === 'string' ? qs(inputEl) : inputEl;
    if (!this._input) throw new Error('MCD: input element not found');

    this._opts     = Object.assign({}, DEFAULTS, options);
    this._calendar = this._resolveCalendar();
    this._secondary = this._resolveSecondary();
    this._selected   = null;  // DateOnly in current calendar (single mode)
    this._rangeStart = null;  // DateOnly (range mode)
    this._rangeEnd   = null;
    this._focusDate  = null;  // DateOnly — keyboard focus position
    this._viewYear  = null;
    this._viewMonth = null;
    this._picker   = null;
    this._open     = false;
    this._id       = ++instanceCount;
    this._cleanups = [];

    this._applyTheme();
    this._buildPicker();
    this._applyBackground();
    this._bindInput();
    this._dispatch('mcd:init');
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  getGregorianValue() {
    if (this._opts.mode === 'range') {
      if (!this._rangeStart || !this._rangeEnd) return null;
      const gs = this._calendar.toGregorian(this._rangeStart);
      const ge = this._calendar.toGregorian(this._rangeEnd);
      return `${dateOnlyToString(gs)}/${dateOnlyToString(ge)}`;
    }
    if (!this._selected) return null;
    const g = this._calendar.toGregorian(this._selected);
    return dateOnlyToString(g);
  }

  getDisplayValue() {
    if (this._opts.mode === 'range') {
      if (!this._rangeStart) return '';
      const s = formatDate(this._rangeStart, this._opts.displayFormat, this._opts.digits);
      if (!this._rangeEnd) return s;
      const e = formatDate(this._rangeEnd, this._opts.displayFormat, this._opts.digits);
      return s + this._opts.rangeSeparator + e;
    }
    if (!this._selected) return '';
    return formatDate(this._selected, this._opts.displayFormat, this._opts.digits);
  }

  getResult() {
    if (this._opts.mode === 'range') {
      if (!this._rangeStart || !this._rangeEnd) return null;
      const gs = this._calendar.toGregorian(this._rangeStart);
      const ge = this._calendar.toGregorian(this._rangeEnd);
      return {
        mode:            'range',
        calendar:        this._opts.calendar,
        start:           { ...this._rangeStart },
        end:             { ...this._rangeEnd },
        gregorianStart:  gs,
        gregorianEnd:    ge,
        gregorianStartValue: dateOnlyToString(gs),
        gregorianEndValue:   dateOnlyToString(ge),
        gregorianValue:  `${dateOnlyToString(gs)}/${dateOnlyToString(ge)}`,
        displayValue:    this.getDisplayValue(),
        locale:          this._opts.locale,
      };
    }
    if (!this._selected) return null;
    const g = this._calendar.toGregorian(this._selected);
    return {
      mode:          'single',
      calendar:      this._opts.calendar,
      displayDate:   { ...this._selected },
      gregorianDate: g,
      gregorianValue: dateOnlyToString(g),
      displayValue:  this.getDisplayValue(),
      locale:        this._opts.locale,
    };
  }

  getRange() {
    if (!this._rangeStart || !this._rangeEnd) return null;
    return { start: { ...this._rangeStart }, end: { ...this._rangeEnd } };
  }

  setGregorianValue(isoString) {
    const g = parseISODateOnly(isoString);
    if (!g) return;
    this._selected = this._calendar.fromGregorian(g);
    this._viewYear  = this._selected.year;
    this._viewMonth = this._selected.month;
    this._focusDate = this._selected;
    this._updateAfterSelect(false);
    this._renderGrid();
  }

  setGregorianRange(startIso, endIso) {
    const gs = parseISODateOnly(startIso);
    const ge = parseISODateOnly(endIso);
    if (!gs || !ge) return;
    let s = this._calendar.fromGregorian(gs);
    let e = this._calendar.fromGregorian(ge);
    if (dateOnlyCompare(gs, ge) > 0) { const t = s; s = e; e = t; }
    this._rangeStart = s;
    this._rangeEnd   = e;
    this._viewYear  = s.year;
    this._viewMonth = s.month;
    this._focusDate = s;
    this._commitRange(false);
    this._renderGrid();
  }

  setCalendar(calId) {
    let gregorian = null, gs = null, ge = null;
    if (this._selected)   gregorian = this._calendar.toGregorian(this._selected);
    if (this._rangeStart) gs = this._calendar.toGregorian(this._rangeStart);
    if (this._rangeEnd)   ge = this._calendar.toGregorian(this._rangeEnd);
    this._opts.calendar = calId;
    this._calendar = this._resolveCalendar();
    if (gregorian) {
      this._selected = this._calendar.fromGregorian(gregorian);
      this._viewYear  = this._selected.year;
      this._viewMonth = this._selected.month;
    }
    if (gs) this._rangeStart = this._calendar.fromGregorian(gs);
    if (ge) this._rangeEnd   = this._calendar.fromGregorian(ge);
    this._fillSelects();
    this._renderWeekdays();
    this._renderGrid();
  }

  updateResult() {
    if (!this._opts.resultTarget) return;
    const r = this.getResult();
    if (!r) return;
    ResultRenderer.render(this._opts.resultTarget, this._templateData(), this._opts.resultTemplate);
  }

  clear() {
    this._selected   = null;
    this._rangeStart = null;
    this._rangeEnd   = null;
    this._input.value = '';
    if (this._opts.outputTarget) { const out = qs(this._opts.outputTarget); if (out) out.value = ''; }
    if (this._opts.resultTarget) ResultRenderer.clear(this._opts.resultTarget);
    this._updateResultPreview('');
    this._renderGrid();
    this._dispatch('mcd:clear');
  }

  destroy() {
    this._cleanups.forEach(fn => fn());
    this._picker && this._picker.remove();
    this._picker = null;
  }

  open()  { this._openPicker(); }
  close() { this._closePicker(); }

  // ── Internal ───────────────────────────────────────────────────────────────

  _resolveCalendar() {
    return this._resolveCalendarById(this._opts.calendar);
  }

  _resolveSecondary() {
    const id = this._opts.secondaryCalendar;
    if (!id || id === this._opts.calendar) return null;
    return this._resolveCalendarById(id);
  }

  _resolveCalendarById(id) {
    if (id === 'hijri' || id === 'ummalqura') {
      const mode = id === 'ummalqura' ? 'ummalqura' : (this._opts.hijriMode || 'tabular');
      // ummalqura uses the embedded official table — accurate as-is.
      // hijriAdjust remains available for local moon-sighting differences.
      const adjust = this._opts.hijriAdjust || 0;
      return new HijriCalendar(mode, adjust);
    }
    if (id === 'gregorian' && this._opts.gregorianMonths && this._opts.gregorianMonths !== 'default') {
      return new GregorianCalendar(this._opts.gregorianMonths);
    }
    return getCalendar(id);
  }

  _monthCount(cal = this._calendar) {
    return cal.getMonthCount ? cal.getMonthCount() : 12;
  }

  _l10n() {
    return L10N[this._opts.locale] || L10N.en;
  }

  _applyTheme() {
    const theme = this._opts.theme;
    if (!theme || theme === 'light') return;

    if (theme === 'dark' || theme === 'auto') {
      this._picker.classList.add(`mcd-theme-${theme}`);
      return;
    }

    if (typeof theme === 'object') {
      ThemeManager.applyToElement(this._picker, theme);
      return;
    }

    if (ThemeManager.get(theme)) {
      ThemeManager.applyToElement(this._picker, theme);
    }
  }

  /** Switch the theme on this picker instance at runtime. */
  setTheme(nameOrObj) {
    ThemeManager._clearElementVars(this._picker);
    this._picker.className = this._picker.className
      .replace(/\bmcd-theme-\S+/g, '').trim();

    this._opts.theme = nameOrObj;
    this._applyTheme();
  }

  _applyBackground() {
    const svg = this._opts.backgroundSvg;
    if (!svg) {
      this._picker.style.removeProperty('--mcd-bg-image');
      this._picker.style.removeProperty('--mcd-bg-image-opacity');
      return;
    }
    const encoded = encodeURIComponent(svg.trim());
    this._picker.style.setProperty(
      '--mcd-bg-image',
      `url("data:image/svg+xml;charset=utf-8,${encoded}")`
    );
    const op = this._opts.backgroundSvgOpacity;
    if (op !== undefined && op !== null) {
      this._picker.style.setProperty('--mcd-bg-image-opacity', String(op));
    }
  }

  setBackground(svgString, opacity) {
    this._opts.backgroundSvg = svgString || null;
    if (opacity !== undefined) this._opts.backgroundSvgOpacity = opacity;
    this._applyBackground();
  }

  clearBackground() {
    this._opts.backgroundSvg = null;
    this._picker.style.removeProperty('--mcd-bg-image');
    this._picker.style.removeProperty('--mcd-bg-image-opacity');
  }

  _buildPicker() {
    const picker = create('div', {
      class: 'mcd-picker',
      role:  'dialog',
      'aria-modal': 'true',
      'aria-label': 'Date picker',
      dir:   this._opts.dir,
    });

    // Header
    const header = create('div', { class: 'mcd-header' });

    this._btnPrev = create('button', { class: 'mcd-nav mcd-nav--prev', type: 'button', 'aria-label': 'Previous month' }, '‹');
    this._monthYearLabel = create('div', { class: 'mcd-month-year' });
    this._selectMonth = create('select', { class: 'mcd-select-month', 'aria-label': 'Month' });
    this._selectYear  = create('select', { class: 'mcd-select-year',  'aria-label': 'Year'  });
    this._btnNext = create('button', { class: 'mcd-nav mcd-nav--next', type: 'button', 'aria-label': 'Next month' }, '›');

    const monthYearWrap = create('div', { class: 'mcd-month-year-wrap' }, this._selectMonth, this._selectYear);
    header.append(this._btnPrev, monthYearWrap, this._btnNext);

    // Weekdays row
    this._weekdaysRow = create('div', { class: 'mcd-weekdays', role: 'row' });

    // Days grid
    this._grid = create('div', { class: 'mcd-grid', role: 'grid', 'aria-label': 'Calendar days' });

    // Result preview
    this._resultPreview = create('div', { class: 'mcd-result-preview' });

    // Footer
    this._footer = create('div', { class: 'mcd-footer' });

    const l10n = this._l10n();
    if (this._opts.showTodayButton) {
      this._btnToday = create('button', { class: 'mcd-btn mcd-btn--today', type: 'button' }, l10n.today);
      this._footer.appendChild(this._btnToday);
    }
    if (this._opts.showClearButton) {
      this._btnClear = create('button', { class: 'mcd-btn mcd-btn--clear', type: 'button' }, l10n.clear);
      this._footer.appendChild(this._btnClear);
    }
    this._btnClose = create('button', { class: 'mcd-btn mcd-btn--close', type: 'button' }, l10n.close);
    this._footer.appendChild(this._btnClose);

    picker.append(header, this._weekdaysRow, this._grid, this._resultPreview, this._footer);
    document.body.appendChild(picker);
    this._picker = picker;

    picker.style.display = 'none';
    this._initView();
    this._fillSelects();
    this._renderWeekdays();
    this._renderGrid();
    this._bindPickerEvents();
  }

  _initView() {
    const today = this._calendar.getToday();
    this._viewYear  = today.year;
    this._viewMonth = today.month;
    this._focusDate = today;
  }

  _fillSelects() {
    // Months
    this._selectMonth.innerHTML = '';
    const months = this._calendar.getMonths(this._opts.locale);
    months.forEach((name, i) => {
      const opt = create('option', { value: String(i + 1) }, name);
      this._selectMonth.appendChild(opt);
    });

    // Years: −100 … +50 around today's year in this calendar
    this._selectYear.innerHTML = '';
    const today = this._calendar.getToday();
    for (let y = today.year - 100; y <= today.year + 50; y++) {
      const opt = create('option', { value: String(y) }, String(y));
      this._selectYear.appendChild(opt);
    }
  }

  _updateSelects() {
    this._selectMonth.value = String(this._viewMonth);
    this._selectYear.value  = String(this._viewYear);
  }

  _renderWeekdays() {
    this._weekdaysRow.innerHTML = '';
    const days = this._calendar.getWeekdays(this._opts.locale, this._opts.weekStart);
    days.forEach(d => {
      const cell = create('div', { class: 'mcd-weekday', role: 'columnheader' }, d);
      this._weekdaysRow.appendChild(cell);
    });
  }

  _renderGrid() {
    this._grid.innerHTML = '';
    this._updateSelects();

    const cal    = this._calendar;
    const year   = this._viewYear;
    const month  = this._viewMonth;
    const len    = cal.getMonthLength(year, month);

    // Keep keyboard focus inside the visible month.
    if (!this._focusDate || this._focusDate.year !== year || this._focusDate.month !== month) {
      this._focusDate = { year, month, day: 1 };
    }
    if (this._focusDate.day > len) this._focusDate = { year, month, day: len };

    // Per-render context — computed once, not per cell.
    const ctx = {
      today:  cal.getToday(),
      secCal: this._secondary,
      gStart: this._rangeStart ? cal.toGregorian(this._rangeStart) : null,
      gEnd:   this._rangeEnd   ? cal.toGregorian(this._rangeEnd)   : null,
    };

    // What day-of-week does day 1 fall on?
    const firstGreg = cal.toGregorian({ year, month, day: 1 });
    const jsDate    = new Date(firstGreg.year, firstGreg.month - 1, firstGreg.day);
    const firstDow  = jsDate.getDay(); // 0=Sun
    const weekStart = this._opts.weekStart;
    const offset    = (firstDow - weekStart + 7) % 7;

    // Previous month filler
    const mc = this._monthCount(cal);
    const prevMonth = month === 1 ? mc : month - 1;
    const prevYear  = month === 1 ? year - 1 : year;
    const prevLen   = cal.getMonthLength(prevYear, prevMonth);

    for (let i = 0; i < offset; i++) {
      const day = prevLen - offset + 1 + i;
      this._grid.appendChild(this._makeDay(prevYear, prevMonth, day, true, ctx));
    }

    for (let d = 1; d <= len; d++) {
      this._grid.appendChild(this._makeDay(year, month, d, false, ctx));
    }

    // Next month filler
    const cells = offset + len;
    const remainder = cells % 7 === 0 ? 0 : 7 - (cells % 7);
    const nextMonth = month === mc ? 1 : month + 1;
    const nextYear  = month === mc ? year + 1 : year;
    for (let d = 1; d <= remainder; d++) {
      this._grid.appendChild(this._makeDay(nextYear, nextMonth, d, true, ctx));
    }
  }

  _makeDay(year, month, day, outside, ctx) {
    const dateOnly  = { year, month, day };
    const gregorian = this._calendar.toGregorian(dateOnly);
    const disabled  = isDateDisabled(gregorian, this._opts);
    const isToday   = dateOnlyEquals(dateOnly, ctx.today);
    const isRange   = this._opts.mode === 'range';

    const isSelected = !isRange && this._selected && dateOnlyEquals(dateOnly, this._selected);
    const isStart = isRange && ctx.gStart && dateOnlyCompare(gregorian, ctx.gStart) === 0;
    const isEnd   = isRange && ctx.gEnd   && dateOnlyCompare(gregorian, ctx.gEnd)   === 0;
    const inRange = isRange && ctx.gStart && ctx.gEnd
      && dateOnlyCompare(gregorian, ctx.gStart) > 0
      && dateOnlyCompare(gregorian, ctx.gEnd)   < 0;

    let cls = 'mcd-day';
    if (outside)    cls += ' mcd-day--outside';
    if (isToday)    cls += ' mcd-day--today';
    if (isSelected) cls += ' mcd-day--selected';
    if (isStart)    cls += ' mcd-day--selected mcd-day--range-start';
    if (isEnd)      cls += ' mcd-day--selected mcd-day--range-end';
    if (inRange)    cls += ' mcd-day--in-range';
    if (disabled)   cls += ' mcd-day--disabled';

    const { weekendDays } = this._opts;
    if (weekendDays && weekendDays.length) {
      const dow = new Date(gregorian.year, gregorian.month - 1, gregorian.day).getDay();
      if (weekendDays.includes(dow)) cls += ' mcd-day--weekend';
    }

    const isFocusTarget = !outside && dateOnlyEquals(dateOnly, this._focusDate);
    let ariaLabel = `${year}-${month}-${day}`;

    const cell = create('div', {
      class:          cls,
      role:           'gridcell',
      tabindex:       isFocusTarget && !disabled ? '0' : '-1',
      'aria-selected': (isSelected || isStart || isEnd) ? 'true' : 'false',
      'aria-disabled': disabled ? 'true' : 'false',
      'data-year':    String(year),
      'data-month':   String(month),
      'data-day':     String(day),
    });

    const main = create('span', { class: 'mcd-day-main' }, applyDigits(String(day), this._opts.digits));
    cell.appendChild(main);

    // Secondary calendar (dual display)
    if (ctx.secCal) {
      const sec = ctx.secCal.fromGregorian(gregorian);
      // Show "day" normally; "day/month" on the secondary month's first day.
      const secText = sec.day === 1 ? `${sec.day}/${sec.month}` : String(sec.day);
      cell.appendChild(create('span', { class: 'mcd-day-secondary' },
        applyDigits(secText, this._opts.digits)));
      ariaLabel += ` (${sec.year}-${sec.month}-${sec.day})`;
    }
    cell.setAttribute('aria-label', ariaLabel);

    if (!disabled) {
      cell.addEventListener('click', () => this._selectDay(dateOnly));
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._selectDay(dateOnly); }
      });
    }
    return cell;
  }

  // ── Selection ──────────────────────────────────────────────────────────────

  _selectDay(dateOnly) {
    this._focusDate = dateOnly;
    if (this._opts.mode === 'range') return this._selectRangeDay(dateOnly);

    this._selected = dateOnly;
    this._writeOutputs();
    this._dispatchChange();
    this._renderGrid();
    if (this._opts.closeOnSelect) this._closePicker();
  }

  _selectRangeDay(dateOnly) {
    if (!this._rangeStart || (this._rangeStart && this._rangeEnd)) {
      // First click (or restart after a complete range)
      this._rangeStart = dateOnly;
      this._rangeEnd   = null;
      this._input.value = this.getDisplayValue() + this._opts.rangeSeparator;
      this._dispatch('mcd:range-start', {
        calendar: this._opts.calendar,
        start:    { ...dateOnly },
        gregorianStart: this._calendar.toGregorian(dateOnly),
      });
      this._renderGrid();
      return;
    }

    // Second click — order the two ends chronologically.
    const g  = this._calendar.toGregorian(dateOnly);
    const gs = this._calendar.toGregorian(this._rangeStart);
    if (dateOnlyCompare(g, gs) < 0) {
      this._rangeEnd   = this._rangeStart;
      this._rangeStart = dateOnly;
    } else {
      this._rangeEnd = dateOnly;
    }
    this._commitRange(true);
    this._renderGrid();
    if (this._opts.closeOnSelect) this._closePicker();
  }

  _commitRange(fireEvent) {
    this._writeOutputs();
    if (fireEvent) this._dispatchChange();
  }

  _templateData() {
    const isRange = this._opts.mode === 'range';
    const data = {
      calendar: this._opts.calendar,
      locale:   this._opts.locale,
      display:  this.getDisplayValue(),
      gregorian: this.getGregorianValue() || '',
    };
    if (isRange && this._rangeStart && this._rangeEnd) {
      const gs = this._calendar.toGregorian(this._rangeStart);
      const ge = this._calendar.toGregorian(this._rangeEnd);
      data.gregorianStart = dateOnlyToString(gs);
      data.gregorianEnd   = dateOnlyToString(ge);
    } else if (!isRange && this._selected) {
      const g = this._calendar.toGregorian(this._selected);
      data.year  = String(g.year);
      data.month = String(g.month);
      data.day   = String(g.day);
    }
    return data;
  }

  _writeOutputs() {
    const gStr    = this.getGregorianValue() || '';
    const dispStr = this.getDisplayValue();

    this._input.value = dispStr;

    if (this._opts.outputTarget) {
      const out = qs(this._opts.outputTarget);
      if (out) out.value = gStr;
    }

    if (this._opts.resultTarget && gStr) {
      ResultRenderer.render(this._opts.resultTarget, this._templateData(), this._opts.resultTemplate);
    }

    if (this._opts.showResult && gStr) {
      this._updateResultPreview(this._l10n().greg + gStr);
    }
  }

  _dispatchChange() {
    const detail = {
      mode:         this._opts.mode,
      calendar:     this._opts.calendar,
      value:        this.getGregorianValue(),
      displayValue: this.getDisplayValue(),
      resultText:   ResultRenderer.applyTemplate(this._opts.resultTemplate, this._templateData()),
    };
    if (this._opts.mode === 'range') {
      detail.start = { ...this._rangeStart };
      detail.end   = { ...this._rangeEnd };
      detail.gregorianStart = this._calendar.toGregorian(this._rangeStart);
      detail.gregorianEnd   = this._calendar.toGregorian(this._rangeEnd);
    } else {
      detail.displayDate   = { ...this._selected };
      detail.gregorianDate = this._calendar.toGregorian(this._selected);
    }
    this._dispatch('mcd:change', detail);
    // Re-broadcast a native 'change' for frameworks/forms listening on the
    // input itself. Guarded because allowInput's own commit handler also
    // listens for 'change' on this input — without the guard this would
    // re-enter itself and recurse until the call stack overflows.
    this._suppressChangeCommit = true;
    this._input.dispatchEvent(new Event('change', { bubbles: true }));
    this._suppressChangeCommit = false;
  }

  _updateResultPreview(text) {
    if (!this._resultPreview) return;
    this._resultPreview.textContent = text;
    this._resultPreview.style.display = text ? '' : 'none';
  }

  _updateAfterSelect(fireEvent = true) {
    if (!this._selected) return;
    this._writeOutputs();
    if (fireEvent) this._dispatchChange();
  }

  // ── Input binding ──────────────────────────────────────────────────────────

  _bindInput() {
    const openFn = () => this._openPicker();
    this._input.addEventListener('focus', openFn);
    this._input.addEventListener('click', openFn); // reopen after closeOnSelect while still focused
    this._cleanups.push(() => {
      this._input.removeEventListener('focus', openFn);
      this._input.removeEventListener('click', openFn);
    });

    if (this._opts.allowInput && this._opts.mode !== 'range') {
      const commitFn = () => {
        if (this._suppressChangeCommit) return;
        const raw = this._input.value.trim();
        if (!raw) return;
        const parsed = parseDate(raw, this._opts.displayFormat);
        if (parsed && this._calendar.validateDate(parsed)) {
          this._selected  = parsed;
          this._viewYear  = parsed.year;
          this._viewMonth = parsed.month;
          this._focusDate = parsed;
          this._writeOutputs();
          this._dispatchChange();
          this._renderGrid();
        } else {
          // Invalid — restore the last valid value.
          this._input.value = this.getDisplayValue();
        }
      };
      this._input.addEventListener('change', commitFn);
      this._cleanups.push(() => this._input.removeEventListener('change', commitFn));
    }

    const keyFn = (e) => {
      if (e.key === 'Escape') { this._closePicker(); return; }
      if (e.key === 'Enter' && this._opts.allowInput && this._opts.mode !== 'range') {
        // Let the change handler commit; just close the picker.
        this._input.dispatchEvent(new Event('change'));
        return;
      }
      if (e.key === 'ArrowDown' && this._open) {
        // Move keyboard focus into the grid.
        e.preventDefault();
        this._focusCell(this._focusDate);
      }
    };
    this._input.addEventListener('keydown', keyFn);
    this._cleanups.push(() => this._input.removeEventListener('keydown', keyFn));
  }

  _bindPickerEvents() {
    this._cleanups.push(on(this._btnPrev, 'click', () => this._navigate(-1)));
    this._cleanups.push(on(this._btnNext, 'click', () => this._navigate(1)));
    this._cleanups.push(on(this._selectMonth, 'change', () => {
      this._viewMonth = +this._selectMonth.value;
      this._renderGrid();
    }));
    this._cleanups.push(on(this._selectYear, 'change', () => {
      this._viewYear = +this._selectYear.value;
      this._renderGrid();
    }));

    if (this._btnToday) {
      this._cleanups.push(on(this._btnToday, 'click', () => {
        const today = this._calendar.getToday();
        this._viewYear  = today.year;
        this._viewMonth = today.month;
        this._selectDay(today);
      }));
    }
    if (this._btnClear) {
      this._cleanups.push(on(this._btnClear, 'click', () => this.clear()));
    }
    this._cleanups.push(on(this._btnClose, 'click', () => this._closePicker()));

    // Close on outside click
    const outsideFn = (e) => {
      if (this._open && !this._picker.contains(e.target) && e.target !== this._input) {
        this._closePicker();
      }
    };
    document.addEventListener('mousedown', outsideFn, true);
    this._cleanups.push(() => document.removeEventListener('mousedown', outsideFn, true));

    // Keyboard navigation on the grid — date-based, crosses month boundaries.
    const gridKeyFn = (e) => this._handleGridKey(e);
    this._grid.addEventListener('keydown', gridKeyFn);
    this._cleanups.push(() => this._grid.removeEventListener('keydown', gridKeyFn));

    // Escape anywhere in the picker
    const pkKeyFn = (e) => {
      if (e.key === 'Escape') { this._closePicker(); this._input.focus(); }
    };
    this._picker.addEventListener('keydown', pkKeyFn);
    this._cleanups.push(() => this._picker.removeEventListener('keydown', pkKeyFn));
  }

  // ── Keyboard navigation ────────────────────────────────────────────────────

  _handleGridKey(e) {
    const rtl = this._opts.dir === 'rtl';
    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); this._moveFocusDays(rtl ? -1 : 1); break;
      case 'ArrowLeft':  e.preventDefault(); this._moveFocusDays(rtl ? 1 : -1); break;
      case 'ArrowDown':  e.preventDefault(); this._moveFocusDays(7);  break;
      case 'ArrowUp':    e.preventDefault(); this._moveFocusDays(-7); break;
      case 'Home': e.preventDefault(); this._setFocusDate({ year: this._viewYear, month: this._viewMonth, day: 1 }); break;
      case 'End':  e.preventDefault(); this._setFocusDate({
        year: this._viewYear, month: this._viewMonth,
        day: this._calendar.getMonthLength(this._viewYear, this._viewMonth),
      }); break;
      case 'PageDown': e.preventDefault(); e.shiftKey ? this._moveFocusYears(1)  : this._moveFocusMonths(1);  break;
      case 'PageUp':   e.preventDefault(); e.shiftKey ? this._moveFocusYears(-1) : this._moveFocusMonths(-1); break;
    }
  }

  _moveFocusDays(n) {
    const g = this._calendar.toGregorian(this._focusDate);
    const target = this._calendar.fromGregorian(addGregDays(g, n));
    this._setFocusDate(target);
  }

  _moveFocusMonths(n) {
    const mc = this._monthCount();
    let { year, month, day } = this._focusDate;
    month += n;
    while (month > mc) { month -= mc; year++; }
    while (month < 1)  { month += mc; year--; }
    const len = this._calendar.getMonthLength(year, month);
    if (day > len) day = len;
    this._setFocusDate({ year, month, day });
  }

  _moveFocusYears(n) {
    let { year, month, day } = this._focusDate;
    year += n;
    const len = this._calendar.getMonthLength(year, month);
    if (day > len) day = len;
    this._setFocusDate({ year, month, day });
  }

  _setFocusDate(dateOnly) {
    this._focusDate = dateOnly;
    if (dateOnly.year !== this._viewYear || dateOnly.month !== this._viewMonth) {
      this._viewYear  = dateOnly.year;
      this._viewMonth = dateOnly.month;
    }
    this._renderGrid();
    this._focusCell(dateOnly);
  }

  _focusCell(dateOnly) {
    if (!dateOnly) return;
    const sel = `.mcd-day[data-year="${dateOnly.year}"][data-month="${dateOnly.month}"][data-day="${dateOnly.day}"]:not(.mcd-day--outside)`;
    const cell = this._grid.querySelector(sel);
    if (cell) cell.focus();
  }

  // ── Navigation / open / close ──────────────────────────────────────────────

  _navigate(delta) {
    const mc = this._monthCount();
    this._viewMonth += delta;
    if (this._viewMonth > mc) { this._viewMonth = 1;  this._viewYear++; }
    if (this._viewMonth < 1)  { this._viewMonth = mc; this._viewYear--; }
    this._renderGrid();
  }

  _navigateYear(delta) {
    this._viewYear += delta;
    this._renderGrid();
  }

  _openPicker() {
    if (this._open) return;
    this._picker.style.display = '';
    positionPicker(this._picker, this._input, this._opts.position);
    this._open = true;
    this._dispatch('mcd:open');
  }

  _closePicker() {
    if (!this._open) return;
    this._picker.style.display = 'none';
    this._open = false;
    this._dispatch('mcd:close');
  }

  _dispatch(name, detail = {}) {
    this._input.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  }
}
