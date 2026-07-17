# Multi Calendar Datepicker

[![CI](https://github.com/abutlb/multi-calendar-datepicker/actions/workflows/ci.yml/badge.svg)](https://github.com/abutlb/multi-calendar-datepicker/actions/workflows/ci.yml)
![gzip size](https://img.shields.io/badge/gzip-~12%20kB-brightgreen)
![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![types](https://img.shields.io/badge/types-included-blue)
![license](https://img.shields.io/badge/license-MIT-blue)

Lightweight, dependency-free datepicker supporting **Gregorian** (with Levantine month names), **Hijri (official Umm al-Qura)**, **Jalali (Persian)**, and **Coptic** calendars — with range selection, dual-calendar display, RTL, and full CSS-variable theming.

> 🎯 **Why this library?** Browser `Intl` Hijri data diverges from the official
> Saudi Umm al-Qura calendar in **61 of 180 months (2030–2044)** — and varies by
> browser version. We embed the official table itself: **372/372 verified month
> starts, exact until 2077**. [Read the measurements →](docs/ACCURACY.md)

منتقي تواريخ خفيف بدون أي اعتماديات يدعم التقويم **الميلادي** (بأسماء يناير أو كانون الثاني) و**الهجري (أم القرى الرسمي)** و**الفارسي** و**القبطي** — مع اختيار نطاق، وعرض تقويمَين معاً، ودعم RTL، وتخصيص كامل عبر متغيرات CSS.

## Why this one? / لماذا هذه المكتبة؟

- **Official Umm al-Qura accuracy** — the Hijri calendar uses an embedded month-length table (AH 1318–1500 / 1900–2077 CE) generated from the official Saudi Umm al-Qura data (the same data behind .NET's `UmAlQuraCalendar` and the published KACST tables). Browser `Intl` CLDR data — which is consistently **one day late** vs. the official calendar — is only used as a fallback outside that range.
- **دقة أم القرى الرسمية** — جدول مضمّن من البيانات السعودية الرسمية، وليس بيانات المتصفح (CLDR) المتأخرة يوماً واحداً.
- Correct Jalali leap years via the jalaali-js breaks-table algorithm (1403 leap, 1404 not).
- Timezone-proof: all dates are plain `{year, month, day}` objects — no `Date` drift.

## Install / التثبيت

```html
<!-- CDN / plain script -->
<link rel="stylesheet" href="dist/multi-calendar-datepicker.css">
<script src="dist/multi-calendar-datepicker.js"></script>
```

```js
// ESM
import MCD, { Datepicker } from 'multi-calendar-datepicker';
import 'multi-calendar-datepicker/css';
```

## Quick start / البداية السريعة

```html
<input id="date" placeholder="اختر التاريخ">
<input type="hidden" id="date_db">
```

```js
const picker = new MultiCalendarDatepicker.Datepicker('#date', {
  calendar:     'hijri',
  hijriMode:    'ummalqura',   // official Saudi calendar
  locale:       'ar',
  dir:          'rtl',
  weekendDays:  [5, 6],        // Fri + Sat highlighted
  outputTarget: '#date_db',    // receives the Gregorian ISO value
});

picker.getGregorianValue();    // "2026-06-27"
picker.getDisplayValue();      // "1448-01-12"
```

## Range selection / اختيار نطاق

```js
new MultiCalendarDatepicker.Datepicker('#range', {
  calendar: 'hijri',
  hijriMode: 'ummalqura',
  mode: 'range',
});
// getGregorianValue() → "2026-06-16/2026-06-27"
// getResult() → { mode:'range', start, end, gregorianStart, gregorianEnd, ... }
```

## Dual calendar / عرض تقويمَين

Show the Gregorian date in small type inside every Hijri day cell (like phone calendars):

```js
new MultiCalendarDatepicker.Datepicker('#dual', {
  calendar: 'hijri',
  hijriMode: 'ummalqura',
  secondaryCalendar: 'gregorian',
});
```

## React

```jsx
import { MultiCalendarDatepicker } from 'multi-calendar-datepicker/react';
import 'multi-calendar-datepicker/css';

<MultiCalendarDatepicker
  options={{ calendar: 'hijri', hijriMode: 'ummalqura', locale: 'ar', dir: 'rtl' }}
  value={gregorianIso}
  onChange={detail => setGregorianIso(detail.value)}
  placeholder="اختر التاريخ"
/>
```

Or bring your own input with the hook:

```jsx
const { inputRef, pickerRef } = useMultiCalendarDatepicker({ calendar: 'hijri', hijriMode: 'ummalqura' });
return <input ref={inputRef} />;
```

## Options / الخيارات

| Option | Default | Description |
|---|---|---|
| `calendar` | `'gregorian'` | `'gregorian'` \| `'hijri'` \| `'jalali'` \| `'coptic'` |
| `hijriMode` | `'tabular'` | `'ummalqura'` = official Saudi calendar |
| `gregorianMonths` | `'default'` | `'levant'` = كانون الثاني… (Iraq/Levant) \| `'both'` |
| `hijriAdjust` | `0` | ±N-day shift for local moon-sighting differences |
| `mode` | `'single'` | `'range'` = from–to selection |
| `secondaryCalendar` | `null` | second calendar shown inside day cells |
| `locale` | `'en'` | `'en'` \| `'ar'` \| `'fa'` |
| `dir` | `'ltr'` | `'rtl'` for Arabic/Persian |
| `digits` | `'latin'` | `'arabic'` (١٢٣) \| `'persian'` (۱۲۳) |
| `displayFormat` | `'YYYY-MM-DD'` | display pattern |
| `outputTarget` | `null` | selector of input receiving Gregorian ISO |
| `resultTarget` / `resultTemplate` | — | render `{{gregorian}}`, `{{display}}`, `{{gregorianStart}}`, `{{gregorianEnd}}` … |
| `weekStart` | `0` | 0=Sun … 6=Sat |
| `weekendDays` | `[]` | highlighted columns, e.g. `[5,6]` |
| `minDate` / `maxDate` / `disabledDates` / `disabledWeekDays` | — | constraints (Gregorian) |
| `allowInput` | `false` | type the date manually (validated on Enter/blur) |
| `theme` | `'light'` | `'dark'` \| `'auto'` \| named theme \| inline vars object |
| `backgroundSvg` | `null` | inline SVG as picker background |

## Events / الأحداث

```js
input.addEventListener('mcd:change', e => {
  e.detail.value;          // Gregorian ISO ("s/e" in range mode)
  e.detail.displayValue;   // formatted in the active calendar
  e.detail.gregorianDate;  // {year, month, day}
});
// Also: mcd:init, mcd:open, mcd:close, mcd:clear, mcd:range-start
```

## Keyboard / لوحة المفاتيح

Arrows move by day/week (RTL-aware, crosses months) · `PageUp`/`PageDown` month · `Shift+PageUp/Down` year · `Home`/`End` first/last day · `Enter`/`Space` select · `Esc` close.

## Theming / التخصيص

Every visual property is a CSS variable (`--mcd-*`). Override globally on `:root` or per instance:

```css
.my-picker { --mcd-primary: #0d9488; --mcd-radius: 16px; }
```

## Longevity & self-renewal / التجدد الذاتي

The tool is designed to keep working without intervention:

| Component | Valid until | Then |
|---|---|---|
| Gregorian | forever | — |
| Coptic (pure arithmetic) | forever | — |
| Jalali (breaks table) | SH 3177 (~3798 CE) | — |
| Umm al-Qura **official table** | AH 1500 (**Nov 2077 CE**) | automatic fallback → `Intl` CLDR astronomical simulation (to ~2174 CE) → tabular approximation |
| UI year list | self-renewing (computed −100/+50 around today) | — |

**بعد 2077** الأداة لا تنكسر — تنتقل تلقائياً لمحاكاة CLDR الفلكية. وعندما تنشر السعودية بيانات ما بعد 1500هـ، يكفي سطر واحد بدون تعديل المكتبة:

```js
// Data generated with tools/generate-uq-table.ps1 from official sources
MultiCalendarDatepicker.extendUmmalquraData([0xABC, 0x5AD /* AH 1501, 1502, … */]);

MultiCalendarDatepicker.isOfficialUmmalquraYear(1501); // → true after extension
```

## Build & test

```bash
npm install
npm run build   # dist/ (UMD + ESM + CSS) from src/
npm test        # vitest
```

## License

MIT
