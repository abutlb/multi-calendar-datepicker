/**
 * ThemeManager — global singleton for registering, applying, and exporting themes.
 *
 * Usage:
 *   ThemeManager.register('my-theme', { name: 'My Theme', vars: { '--mcd-primary': '#f00' } });
 *   ThemeManager.applyGlobal('my-theme');          // injects :root override
 *   ThemeManager.applyToElement(el, 'my-theme');   // inline on one picker
 *   ThemeManager.exportCSS('my-theme');            // copy-pasteable CSS string
 *   ThemeManager.exportJS('my-theme');             // copy-pasteable JS snippet
 */
class _ThemeManager {
  constructor() {
    this._themes  = new Map();
    this._styleEl = null;
    this._activeGlobal = null;
  }

  /**
   * Register a theme.
   * @param {string} id  — unique key, e.g. 'rose'
   * @param {object} def — { name?, description?, vars: { '--mcd-...': '...' } }
   *                       or just the vars object directly.
   */
  register(id, def) {
    if (def && def.vars) {
      this._themes.set(id, { name: def.name || id, description: def.description || '', vars: def.vars });
    } else {
      this._themes.set(id, { name: id, description: '', vars: def });
    }
    return this; // chainable
  }

  /** Return full theme object or null */
  get(id) {
    return this._themes.get(id) || null;
  }

  /** Return just the vars object */
  getVars(id) {
    const t = this._themes.get(id);
    return t ? t.vars : null;
  }

  /** Return array of all registered theme objects with their id */
  getAll() {
    const result = [];
    this._themes.forEach((t, id) => result.push({ id, ...t }));
    return result;
  }

  /** Currently active global theme id */
  get active() { return this._activeGlobal; }

  /**
   * Apply a theme globally by injecting/replacing a <style> tag in <head>.
   * This overrides :root variables for every picker on the page.
   */
  applyGlobal(id) {
    const vars = this.getVars(id);
    if (!vars) return false;

    if (!this._styleEl) {
      this._styleEl = document.createElement('style');
      this._styleEl.id = 'mcd-global-theme';
      document.head.appendChild(this._styleEl);
    }

    const lines = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join('\n');
    this._styleEl.textContent = `:root {\n${lines}\n}`;
    this._activeGlobal = id;
    return true;
  }

  /** Remove the global theme override */
  resetGlobal() {
    if (this._styleEl) this._styleEl.textContent = '';
    this._activeGlobal = null;
  }

  /**
   * Apply a theme inline on a specific DOM element (one picker only).
   * Clears any previous inline theme vars first.
   */
  applyToElement(el, id) {
    this._clearElementVars(el);
    if (!id) return false;

    // Accept raw vars object too
    const vars = (typeof id === 'object') ? (id.vars || id) : this.getVars(id);
    if (!vars) return false;

    for (const [k, v] of Object.entries(vars)) {
      el.style.setProperty(k, v);
    }
    return true;
  }

  /** Remove all --mcd-* inline custom properties from an element */
  _clearElementVars(el) {
    const toRemove = [];
    for (const prop of el.style) {
      if (prop.startsWith('--mcd-')) toRemove.push(prop);
    }
    toRemove.forEach(p => el.style.removeProperty(p));
  }

  /**
   * Export a theme as a CSS string that can be shared and pasted directly.
   * @param {string} id
   * @param {string} selector — CSS selector to target, default ':root'
   */
  exportCSS(id, selector = ':root') {
    const t = this._themes.get(id);
    if (!t) return '';
    const lines = Object.entries(t.vars).map(([k, v]) => `  ${k}: ${v};`).join('\n');
    return `/* MCD Theme: ${t.name} */\n${selector} {\n${lines}\n}`;
  }

  /**
   * Export a theme as a JS snippet that can be shared with other developers.
   * The recipient pastes it after loading the library.
   */
  exportJS(id) {
    const t = this._themes.get(id);
    if (!t) return '';
    const vars = Object.entries(t.vars)
      .map(([k, v]) => `    '${k}': '${v}'`)
      .join(',\n');
    return (
      `MultiCalendarDatepicker.themes.register('${id}', {\n` +
      `  name: '${t.name}',\n` +
      `  description: '${t.description}',\n` +
      `  vars: {\n${vars}\n  }\n});`
    );
  }

  /**
   * Export ALL registered themes as a portable JS file content string.
   */
  exportAllJS() {
    const blocks = [];
    this._themes.forEach((t, id) => {
      const vars = Object.entries(t.vars)
        .map(([k, v]) => `    '${k}': '${v}'`)
        .join(',\n');
      blocks.push(
        `MultiCalendarDatepicker.themes.register('${id}', {\n` +
        `  name: '${t.name}',\n` +
        `  description: '${t.description}',\n` +
        `  vars: {\n${vars}\n  }\n});`
      );
    });
    return blocks.join('\n\n');
  }
}

export const ThemeManager = new _ThemeManager();
