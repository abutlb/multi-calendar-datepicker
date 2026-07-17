# Why our Hijri dates are exact — لماذا تواريخنا الهجرية دقيقة

## الخلاصة في سطرين

بيانات المتصفح للتقويم الهجري (`Intl` / CLDR) **غير مستقرة**: تختلف من إصدار متصفح
لآخر، وحتى أحدث إصدار (منتصف 2026) يخالف التقويم الرسمي السعودي في **61 شهراً من
أصل 180** للفترة 2030–2044. هذه المكتبة تضمّن جدول أم القرى الرسمي نفسه — فالنتيجة
مطابقة للتقويم الرسمي ولهاتف المستخدم دائماً، على أي متصفح وأي إصدار.

## The measurements — القياسات (reproducible)

We compared every month start for AH 1435–1465 (372 months, 2013–2044 CE) against
the official Umm al-Qura tables (via .NET `System.Globalization.UmAlQuraCalendar`,
Microsoft's implementation of the official Saudi data, cross-checked with the
Utrecht University / van Gent academic tables).

| Implementation | Exact months | Off-by-one months |
|---|---|---|
| **This library (embedded official table)** | **372 / 372** | 0 |
| `Intl` islamic-umalqura — Edge 2026, ICU 78 | 311 / 372 | **61** (all in AH 1451–1465 ≈ 2030–2044) |
| `Intl` islamic-umalqura — Node 24, ICU 78 | 311 / 372 | 61 (same months) |
| Earlier 2026 browser builds (observed) | — | +1 day **even for current dates** (e.g. showed 11 Muharram when the official calendar and the user's phone said 12) |

Two failure modes, both real:

1. **Version instability** — earlier CLDR datasets were one day late even for the
   *current* date; users on non-updated browsers still get that. Your app's
   correctness should not depend on the user's browser build.
2. **Future-date divergence** — even the newest ICU diverges from the official
   tables in **a third of all months beyond ~2030**. Any future date — contract
   expiry, iqama renewal, appointment, Ramadan planning — lands on the wrong day.

## حلّنا — Our approach

1. **Embedded official table** — month lengths for AH 1318–1500 (1900–2077 CE),
   bit-encoded in ~550 bytes, generated directly from the official data.
   Verified: 372/372 month starts exact, 10,958 consecutive days round-trip clean.
2. Zero dependence on browser data inside the official range. `Intl` is only a
   fallback beyond 2077, then the pure tabular algorithm.
3. `hijriAdjust: ±N` for communities following local moon sighting.
4. When Saudi Arabia publishes data beyond AH 1500, one line extends the table:
   ```js
   MultiCalendarDatepicker.extendUmmalquraData([...]);  // tools/generate-uq-table.ps1
   ```

## Jalali accuracy too — ودقة الفارسي أيضاً

The widely-copied 2820-year-cycle algorithm marks the wrong leap years — e.g.
**1404 as leap instead of 1403**. We use the breaks-table method (jalaali-js /
Borkowski), matching the official Iranian calendar; verified over every day of
2015–2044 plus Nowruz anchors.

## أعد التحقق بنفسك — Reproduce it

```powershell
# Windows — the official oracle, nothing to install:
$uq = New-Object System.Globalization.UmAlQuraCalendar
$uq.ToDateTime(1452,1,1,0,0,0,0)    # → 3 May 2030 (official 1 Muharram 1452)
```

```js
// The same day through the browser's Intl:
new Intl.DateTimeFormat('en-u-ca-islamic-umalqura').format(new Date('2030-05-03'))
// → "12/30/1451 AH"  — still last year! Intl starts 1452 a day late (4 May).
```

Official: 1 Muharram 1452 = **3 May 2030**. Current ICU says 3 May is still
30 Dhu al-Hijjah 1451 — the whole month lands one day late.

Full suites: `npm test` — 58 tests, including the 372-month verification against
the official table and tens of thousands of round-trip days across all four calendars.
