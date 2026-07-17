import { qs, setContent } from '../utils/dom.js';

/**
 * Renders a converted date into a resultTarget element using a template.
 * Uses textContent / value only — no innerHTML, no XSS risk.
 */
export class ResultRenderer {
  static render(targetSelector, data, template) {
    const el = qs(targetSelector);
    if (!el) return;
    const text = ResultRenderer.applyTemplate(template, data);
    setContent(el, text);
  }

  static clear(targetSelector) {
    const el = qs(targetSelector);
    if (!el) return;
    setContent(el, '');
  }

  static applyTemplate(template, data) {
    if (!template) return data.gregorian || '';
    // Generic: replaces every {{token}} with the matching data key
    // (gregorian, display, calendar, year, month, day, locale,
    //  gregorianStart, gregorianEnd, …).
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
      data[key] !== undefined && data[key] !== null ? String(data[key]) : '');
  }
}
