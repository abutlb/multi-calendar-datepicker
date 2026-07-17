# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/), versioning: [SemVer](https://semver.org/).

## [1.1.0] — 2026-07-17

### Added
- **Official Umm al-Qura table** embedded (AH 1318–1500 / 1900–2077 CE), generated from
  official Saudi data (.NET `UmAlQuraCalendar` / KACST / Utrecht tables). Verified against
  the official source: 372/372 month starts exact.
- **Range selection** (`mode: 'range'`): from–to picking, ordered automatically,
  ISO-interval output (`"2026-06-16/2026-06-27"`), `mcd:range-start` event,
  `setGregorianRange()` / `getRange()`.
- **Dual calendar display** (`secondaryCalendar`): second calendar's date rendered
  small inside each day cell (e.g. Gregorian under Hijri).
- **Coptic calendar** (`calendar: 'coptic'`): 13 months incl. النسيء, pure arithmetic,
  exact forever. Verified anchors: Nayrouz 1741 = 11 Sep 2024, Coptic Christmas = 7 Jan 2025.
- **Levantine Gregorian month names** (`gregorianMonths: 'levant' | 'both'`):
  كانون الثاني، شباط… as used in Iraq and the Levant.
- **Future-proofing API**: `extendUmmalquraData()` to append post-1500 AH official data
  without touching the library; `isOfficialUmmalquraYear()`; `tools/generate-uq-table.ps1`.
- **Keyboard navigation**: date-based, crosses month boundaries, RTL-aware arrows,
  PageUp/Down (±month), Shift+PageUp/Down (±year), Home/End.
- **Manual input** (`allowInput`): parsed and validated on Enter/blur, accepts Arabic
  and Persian digits, reverts invalid entries.
- **Persian support**: `digits: 'persian'` (۱۲۳), `locale: 'fa'` UI strings and weekday names.
- **SVG background** (`backgroundSvg`, `setBackground()`, `clearBackground()`).
- TypeScript definitions (`types/index.d.ts`), React wrapper (`multi-calendar-datepicker/react`).

### Fixed
- **Umm al-Qura dates were 13–16 days off** in `toGregorian` (broken month-start search
  silently falling back to a broken tabular path). Now table-driven and exact.
- **Tabular Hijri round-trip off by one day** on ~98% of dates (incorrect Julian Day
  conversion missing the Jan/Feb adjustment). Rewritten on standard JDN arithmetic.
- **Jalali leap years wrong** for 1403/1404 and others (2820-year-cycle algorithm).
  Replaced with the jalaali-js breaks-table algorithm.
- Day cells now honour the `digits` option (previously always Latin).
- Result templates replace **all** token occurrences (previously first only).
- Clicking the input reopens the picker after `closeOnSelect`.
- `getToday()` hoisted out of the per-cell loop (42× fewer conversions per render).

### Changed
- `dist/` is now **generated** from `src/` by Vite (UMD + ESM + CSS) — no more manual syncing.
- `hijriAdjust` default is `0` (the embedded official table needs no correction).

## [1.0.0]

Initial version: Gregorian / Hijri (tabular + approximate Umm al-Qura) / Jalali,
theming via CSS variables, RTL, Arabic digits, min/max/disabled dates, themes.
