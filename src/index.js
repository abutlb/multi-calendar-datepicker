import './styles/main.css';
import { Datepicker }          from './core/Datepicker.js';
import { registerCalendar, getCalendar, getRegisteredCalendars } from './core/CalendarManager.js';
import { formatDate, parseDate } from './core/Formatter.js';
import { ResultRenderer }      from './core/ResultRenderer.js';
import { ThemeManager }        from './core/ThemeManager.js';
import { builtinThemes }       from './themes/index.js';
import { extendUmmalquraData, isOfficialUmmalquraYear } from './calendars/HijriCalendar.js';
import { qs }                  from './utils/dom.js';

// Register all built-in themes
Object.entries(builtinThemes).forEach(([id, def]) => ThemeManager.register(id, def));

const MCD = {
  /**
   * Initialise one or more datepickers.
   * If selector is omitted, scans the document for [data-mcd] elements.
   */
  init(selector, options = {}) {
    if (!selector) {
      document.querySelectorAll('[data-mcd]').forEach(el => {
        MCD._initElement(el, {});
      });
      return;
    }
    if (typeof selector === 'string') {
      const el = qs(selector);
      if (!el) return null;
      return MCD._initElement(el, options);
    }
    return MCD._initElement(selector, options);
  },

  _initElement(el, overrides) {
    const opts = Object.assign({}, MCD._readDataAttrs(el), overrides);
    return new Datepicker(el, opts);
  },

  _readDataAttrs(el) {
    const map = {};
    if (el.dataset.calendar)       map.calendar       = el.dataset.calendar;
    if (el.dataset.locale)         map.locale         = el.dataset.locale;
    if (el.dataset.dir)            map.dir            = el.dataset.dir;
    if (el.dataset.output)         map.outputTarget   = el.dataset.output;
    if (el.dataset.result)         map.resultTarget   = el.dataset.result;
    if (el.dataset.format)         map.displayFormat  = el.dataset.format;
    if (el.dataset.theme)          map.theme          = el.dataset.theme;
    if (el.dataset.digits)         map.digits         = el.dataset.digits;
    if (el.dataset.hijriMode)      map.hijriMode      = el.dataset.hijriMode;
    if (el.dataset.gregorianMonths) map.gregorianMonths = el.dataset.gregorianMonths;
    if (el.dataset.hijriAdjust)    map.hijriAdjust    = parseInt(el.dataset.hijriAdjust, 10);
    if (el.dataset.mode)           map.mode           = el.dataset.mode;
    if (el.dataset.secondary)      map.secondaryCalendar = el.dataset.secondary;
    if (el.dataset.weekStart)      map.weekStart      = parseInt(el.dataset.weekStart, 10);
    if (el.dataset.allowInput)     map.allowInput     = el.dataset.allowInput === 'true';
    if (el.dataset.resultTemplate) map.resultTemplate = el.dataset.resultTemplate;
    return map;
  },

  // ── Sub-modules ────────────────────────────────────────────────────────
  Datepicker,
  registerCalendar,
  getCalendar,
  getRegisteredCalendars,
  formatDate,
  parseDate,
  ResultRenderer,

  /** Append official Umm al-Qura data for years after AH 1500 (post-2077). */
  extendUmmalquraData,
  isOfficialUmmalquraYear,

  /** Theme system */
  themes: ThemeManager,
};

// UMD / CDN global
if (typeof window !== 'undefined') {
  window.MultiCalendarDatepicker = MCD;
}

export default MCD;
export {
  Datepicker, registerCalendar, getCalendar, formatDate, parseDate,
  ResultRenderer, ThemeManager, extendUmmalquraData, isOfficialUmmalquraYear,
};
