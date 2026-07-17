/**
 * Built-in themes for Multi Calendar Datepicker.
 *
 * Each theme is an object:
 *   { name, description, vars: { '--mcd-variable': 'value', ... } }
 *
 * Partial themes (accent-only) inherit all other vars from :root defaults.
 * Full themes override the entire color palette.
 *
 * Share a theme by exporting its vars object — the receiver passes it to:
 *   MultiCalendarDatepicker.themes.register('my-theme', themeObj)
 */

// ── Helper ────────────────────────────────────────────────────────────────────
function accent(primary, primaryText, hoverBg, hoverText) {
  return {
    '--mcd-primary':            primary,
    '--mcd-primary-text':       primaryText,
    '--mcd-hover-bg':           hoverBg,
    '--mcd-hover-text':         hoverText,
    '--mcd-today-ring':         primary,
    '--mcd-selected-bg':        primary,
    '--mcd-selected-text':      primaryText,
    '--mcd-day-focus-ring':     primary,
    '--mcd-day-hover-text':     hoverText,
    '--mcd-day-hover-bg':       hoverBg,
    '--mcd-nav-hover-bg':       hoverBg,
    '--mcd-nav-hover-text':     hoverText,
    '--mcd-btn-today-bg':       primary,
    '--mcd-btn-today-text':     primaryText,
    '--mcd-btn-today-border':   primary,
    '--mcd-btn-today-hover-bg': primary,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Full themes — override entire color palette
// ═══════════════════════════════════════════════════════════════════════════════

export const themeLight = {
  name: 'Light',
  description: 'Default light theme',
  vars: {
    '--mcd-bg':            '#ffffff',
    '--mcd-text':          '#111827',
    '--mcd-muted':         '#6b7280',
    '--mcd-border':        '#e5e7eb',
    '--mcd-primary':       '#2563eb',
    '--mcd-primary-text':  '#ffffff',
    '--mcd-hover-bg':      '#eff6ff',
    '--mcd-hover-text':    '#2563eb',
    '--mcd-outside-text':  '#d1d5db',
    '--mcd-shadow':        '0 10px 30px rgba(0,0,0,.12)',
    '--mcd-radius':        '12px',
    ...accent('#2563eb', '#ffffff', '#eff6ff', '#2563eb'),
  },
};

export const themeDark = {
  name: 'Dark',
  description: 'Dark mode',
  vars: {
    '--mcd-bg':             '#111827',
    '--mcd-text':           '#f9fafb',
    '--mcd-muted':          '#9ca3af',
    '--mcd-border':         '#374151',
    '--mcd-primary':        '#3b82f6',
    '--mcd-primary-text':   '#ffffff',
    '--mcd-hover-bg':       '#1e3a5f',
    '--mcd-hover-text':     '#93c5fd',
    '--mcd-outside-text':   '#4b5563',
    '--mcd-shadow':         '0 10px 30px rgba(0,0,0,.4)',
    '--mcd-day-text':       '#f9fafb',
    '--mcd-today-text':     '#f9fafb',
    '--mcd-weekday-text':   '#9ca3af',
    '--mcd-nav-text':       '#f9fafb',
    '--mcd-select-bg':      '#1f2937',
    '--mcd-select-text':    '#f9fafb',
    '--mcd-select-border':  '#4b5563',
    '--mcd-btn-bg':         '#1f2937',
    '--mcd-btn-text':       '#f9fafb',
    '--mcd-btn-border':     '#4b5563',
    '--mcd-btn-hover-bg':   '#1e3a5f',
    '--mcd-btn-hover-text': '#93c5fd',
    ...accent('#3b82f6', '#ffffff', '#1e3a5f', '#93c5fd'),
  },
};

export const themeMidnight = {
  name: 'Midnight',
  description: 'Deep dark with indigo accent',
  vars: {
    '--mcd-bg':             '#0f172a',
    '--mcd-text':           '#e2e8f0',
    '--mcd-muted':          '#94a3b8',
    '--mcd-border':         '#1e293b',
    '--mcd-primary':        '#6366f1',
    '--mcd-primary-text':   '#ffffff',
    '--mcd-hover-bg':       '#1e1b4b',
    '--mcd-hover-text':     '#a5b4fc',
    '--mcd-outside-text':   '#334155',
    '--mcd-shadow':         '0 10px 40px rgba(0,0,0,.5)',
    '--mcd-radius':         '14px',
    '--mcd-day-text':       '#e2e8f0',
    '--mcd-today-text':     '#e2e8f0',
    '--mcd-weekday-text':   '#94a3b8',
    '--mcd-nav-text':       '#e2e8f0',
    '--mcd-select-bg':      '#1e293b',
    '--mcd-select-text':    '#e2e8f0',
    '--mcd-select-border':  '#334155',
    '--mcd-btn-bg':         '#1e293b',
    '--mcd-btn-text':       '#e2e8f0',
    '--mcd-btn-border':     '#334155',
    '--mcd-btn-hover-bg':   '#1e1b4b',
    '--mcd-btn-hover-text': '#a5b4fc',
    ...accent('#6366f1', '#ffffff', '#1e1b4b', '#a5b4fc'),
  },
};

export const themeOcean = {
  name: 'Ocean',
  description: 'Deep ocean with cyan accent',
  vars: {
    '--mcd-bg':             '#0c4a6e',
    '--mcd-text':           '#e0f2fe',
    '--mcd-muted':          '#7dd3fc',
    '--mcd-border':         '#075985',
    '--mcd-primary':        '#22d3ee',
    '--mcd-primary-text':   '#0c4a6e',
    '--mcd-hover-bg':       '#075985',
    '--mcd-hover-text':     '#e0f2fe',
    '--mcd-outside-text':   '#0369a1',
    '--mcd-shadow':         '0 10px 30px rgba(0,0,0,.35)',
    '--mcd-day-text':       '#e0f2fe',
    '--mcd-today-text':     '#e0f2fe',
    '--mcd-weekday-text':   '#7dd3fc',
    '--mcd-nav-text':       '#e0f2fe',
    '--mcd-select-bg':      '#075985',
    '--mcd-select-text':    '#e0f2fe',
    '--mcd-select-border':  '#0369a1',
    '--mcd-btn-bg':         '#075985',
    '--mcd-btn-text':       '#e0f2fe',
    '--mcd-btn-border':     '#0369a1',
    '--mcd-btn-hover-bg':   '#0369a1',
    '--mcd-btn-hover-text': '#ffffff',
    ...accent('#22d3ee', '#0c4a6e', '#075985', '#e0f2fe'),
  },
};

export const themeWarm = {
  name: 'Warm',
  description: 'Warm parchment tones with amber accent',
  vars: {
    '--mcd-bg':            '#fffbf0',
    '--mcd-text':          '#1c1917',
    '--mcd-muted':         '#78716c',
    '--mcd-border':        '#e7e5e4',
    '--mcd-primary':       '#b45309',
    '--mcd-primary-text':  '#ffffff',
    '--mcd-hover-bg':      '#fef3c7',
    '--mcd-hover-text':    '#b45309',
    '--mcd-outside-text':  '#d6d3d1',
    '--mcd-shadow':        '0 8px 24px rgba(180,83,9,.12)',
    '--mcd-radius':        '10px',
    '--mcd-select-bg':     '#fff7ed',
    '--mcd-select-text':   '#1c1917',
    '--mcd-select-border': '#d6d3d1',
    ...accent('#b45309', '#ffffff', '#fef3c7', '#b45309'),
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Accent themes — partial, inherit light background from :root
// ═══════════════════════════════════════════════════════════════════════════════

export const themeRose = {
  name: 'Rose',
  description: 'Rose / pink accent on light background',
  vars: accent('#e11d48', '#ffffff', '#fff1f2', '#e11d48'),
};

export const themeEmerald = {
  name: 'Emerald',
  description: 'Green accent on light background',
  vars: accent('#059669', '#ffffff', '#ecfdf5', '#059669'),
};

export const themeAmber = {
  name: 'Amber',
  description: 'Warm gold accent on light background',
  vars: accent('#d97706', '#ffffff', '#fffbeb', '#d97706'),
};

export const themeViolet = {
  name: 'Violet',
  description: 'Purple accent on light background',
  vars: accent('#7c3aed', '#ffffff', '#f5f3ff', '#7c3aed'),
};

export const themeTeal = {
  name: 'Teal',
  description: 'Teal accent on light background',
  vars: accent('#0d9488', '#ffffff', '#f0fdfa', '#0d9488'),
};

// ── All built-in themes ───────────────────────────────────────────────────────
export const builtinThemes = {
  light:    themeLight,
  dark:     themeDark,
  midnight: themeMidnight,
  ocean:    themeOcean,
  warm:     themeWarm,
  rose:     themeRose,
  emerald:  themeEmerald,
  amber:    themeAmber,
  violet:   themeViolet,
  teal:     themeTeal,
};
