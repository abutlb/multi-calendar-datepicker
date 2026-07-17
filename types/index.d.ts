// Type definitions for multi-calendar-datepicker
// Supports Gregorian, Hijri (official Umm al-Qura / tabular), and Jalali calendars.

export interface DateOnly {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
}

export type CalendarId = 'gregorian' | 'hijri' | 'jalali' | 'coptic' | 'ummalqura' | (string & {});
export type HijriMode = 'tabular' | 'ummalqura';
export type GregorianMonthNames = 'default' | 'levant' | 'both';
export type Digits = 'latin' | 'arabic' | 'persian';
export type PickerMode = 'single' | 'range';
export type ThemeOption = 'light' | 'dark' | 'auto' | string | Record<string, string>;

export interface DatepickerOptions {
  /** Which calendar the picker displays. Default 'gregorian'. */
  calendar?: CalendarId;
  /** Hijri algorithm: 'ummalqura' = official Saudi calendar (embedded table, AH 1318-1500). Default 'tabular'. */
  hijriMode?: HijriMode;
  /** ±N-day offset at the Gregorian↔Hijri boundary (local moon-sighting differences). Default 0. */
  hijriAdjust?: number;
  /** Arabic Gregorian month names: 'default' = يناير, 'levant' = كانون الثاني (Iraq/Levant), 'both' = combined. */
  gregorianMonths?: GregorianMonthNames;
  /** 'single' (default) or 'range' (from–to selection). */
  mode?: PickerMode;
  /** Show a second calendar's date inside each day cell (e.g. 'gregorian' under Hijri days). */
  secondaryCalendar?: CalendarId | null;
  /** Inline SVG markup used as the picker's background. */
  backgroundSvg?: string | null;
  /** Opacity 0-1 of the SVG background. Default 0.15. */
  backgroundSvgOpacity?: number;
  /** UI language: 'en' | 'ar' | 'fa'. Default 'en'. */
  locale?: string;
  dir?: 'ltr' | 'rtl';
  outputFormat?: string;
  /** Display pattern using YYYY, MM, DD tokens. Default 'YYYY-MM-DD'. */
  displayFormat?: string;
  /** Selector of a (hidden) input that receives the Gregorian ISO value. */
  outputTarget?: string | null;
  /** Selector of an element that renders resultTemplate. */
  resultTarget?: string | null;
  /** Template with {{gregorian}}, {{display}}, {{calendar}}, {{year}}, {{month}}, {{day}}, {{locale}}, {{gregorianStart}}, {{gregorianEnd}} tokens. */
  resultTemplate?: string;
  autoClose?: boolean;
  showTodayButton?: boolean;
  showClearButton?: boolean;
  showResult?: boolean;
  /** First day of week: 0=Sunday … 6=Saturday. Default 0. */
  weekStart?: number;
  /** Gregorian ISO string or DateOnly. */
  minDate?: string | DateOnly | null;
  maxDate?: string | DateOnly | null;
  /** Gregorian ISO strings. */
  disabledDates?: string[];
  /** 0=Sunday … 6=Saturday. */
  disabledWeekDays?: number[];
  /** Highlighted (weekend) columns: 0=Sunday … 6=Saturday. */
  weekendDays?: number[];
  theme?: ThemeOption;
  closeOnSelect?: boolean;
  /** Allow typing the date; parsed and validated on Enter/blur. Single mode only. */
  allowInput?: boolean;
  digits?: Digits;
  position?: 'auto' | 'top' | 'bottom';
  /** Separator used between range ends in the input display. Default ' – '. */
  rangeSeparator?: string;
}

export interface SingleResult {
  mode: 'single';
  calendar: string;
  displayDate: DateOnly;
  gregorianDate: DateOnly;
  gregorianValue: string;
  displayValue: string;
  locale: string;
}

export interface RangeResult {
  mode: 'range';
  calendar: string;
  start: DateOnly;
  end: DateOnly;
  gregorianStart: DateOnly;
  gregorianEnd: DateOnly;
  gregorianStartValue: string;
  gregorianEndValue: string;
  gregorianValue: string; // "start/end"
  displayValue: string;
  locale: string;
}

export declare class CalendarAdapter {
  id: string;
  name: string;
  toGregorian(d: DateOnly): DateOnly;
  fromGregorian(g: DateOnly): DateOnly;
  getMonthLength(year: number, month: number): number;
  /** Months per year — 13 for Coptic/Ethiopian-style calendars. Default 12. */
  getMonthCount(): number;
  isLeapYear(year: number): boolean;
  getMonths(locale: string): string[];
  getWeekdays(locale: string, weekStart?: number): string[];
  validateDate(d: DateOnly): boolean;
  getToday(): DateOnly;
}

export declare class Datepicker {
  constructor(input: string | HTMLElement, options?: DatepickerOptions);

  /** Gregorian ISO value ("YYYY-MM-DD", or "start/end" in range mode); null when nothing selected. */
  getGregorianValue(): string | null;
  getDisplayValue(): string;
  getResult(): SingleResult | RangeResult | null;
  getRange(): { start: DateOnly; end: DateOnly } | null;
  setGregorianValue(iso: string): void;
  setGregorianRange(startIso: string, endIso: string): void;
  setCalendar(calendarId: CalendarId): void;
  setTheme(theme: ThemeOption): void;
  setBackground(svg: string, opacity?: number): void;
  clearBackground(): void;
  updateResult(): void;
  clear(): void;
  open(): void;
  close(): void;
  destroy(): void;
}

export declare function registerCalendar(adapter: CalendarAdapter): void;
export declare function getCalendar(id: string): CalendarAdapter;

/**
 * Append official Umm al-Qura month-length data for years after the embedded
 * table (AH 1501+, i.e. after Nov 2077). Each entry: bit i = 1 → month i+1
 * has 30 days. Years must be contiguous. Returns the new last covered year.
 * Generate entries with tools/generate-uq-table.ps1.
 */
export declare function extendUmmalquraData(yearBits: number[]): number;
/** Whether a Hijri year is covered by embedded/extended official data (vs. fallback). */
export declare function isOfficialUmmalquraYear(year: number): boolean;
export declare function formatDate(d: DateOnly, format?: string, digits?: Digits): string;
export declare function parseDate(value: string, format?: string): DateOnly | null;

export declare const ResultRenderer: {
  render(targetSelector: string, data: Record<string, unknown>, template: string): void;
  clear(targetSelector: string): void;
  applyTemplate(template: string, data: Record<string, unknown>): string;
};

export declare const ThemeManager: {
  register(id: string, def: Record<string, string>): void;
  get(id: string): Record<string, string> | undefined;
  applyToElement(el: HTMLElement, theme: string | Record<string, string>): void;
};

declare const MCD: {
  init(selector?: string | HTMLElement, options?: DatepickerOptions): Datepicker | null | void;
  Datepicker: typeof Datepicker;
  registerCalendar: typeof registerCalendar;
  getCalendar: typeof getCalendar;
  formatDate: typeof formatDate;
  parseDate: typeof parseDate;
  ResultRenderer: typeof ResultRenderer;
  extendUmmalquraData: typeof extendUmmalquraData;
  isOfficialUmmalquraYear: typeof isOfficialUmmalquraYear;
  themes: typeof ThemeManager;
};

export default MCD;

declare global {
  interface Window {
    MultiCalendarDatepicker: typeof MCD;
  }

  interface HTMLElementEventMap {
    'mcd:init': CustomEvent;
    'mcd:open': CustomEvent;
    'mcd:close': CustomEvent;
    'mcd:clear': CustomEvent;
    'mcd:change': CustomEvent;
    'mcd:range-start': CustomEvent;
  }
}
