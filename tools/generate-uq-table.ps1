# ══════════════════════════════════════════════════════════════════════════
# Umm al-Qura table generator
#
# Regenerates the bit-encoded month-length table embedded in
# src/calendars/HijriCalendar.js from official data.
#
# Current source: .NET System.Globalization.UmAlQuraCalendar
#   (official Saudi data, AH 1318-1500 / 1900-2077 CE — same tables as
#    KACST and the published Utrecht/van Gent data).
#
# When official data beyond AH 1500 is published (KACST / official Saudi
# sources), extend this script's source or convert their tables to the
# same encoding, then either:
#   a) replace UQ_DATA in HijriCalendar.js and rebuild, or
#   b) ship the extra years at runtime without touching the library:
#        MultiCalendarDatepicker.extendUmmalquraData([0x..., 0x..., ...]);
#
# Encoding: one integer per Hijri year; bit i (0-based) = 1 means
# month i+1 has 30 days, 0 means 29 days.
#
# Usage:  powershell -File tools/generate-uq-table.ps1 [-From 1318] [-To 1500]
# ══════════════════════════════════════════════════════════════════════════

param(
  [int]$From = 1318,
  [int]$To   = 1500
)

$uq = New-Object System.Globalization.UmAlQuraCalendar

$anchor = $uq.ToDateTime($From, 1, 1, 0, 0, 0, 0)
Write-Host "// Anchor: 1 Muharram $From AH = $($anchor.ToString('yyyy-MM-dd'))"

$bits = @()
for ($y = $From; $y -le $To; $y++) {
  $b = 0
  for ($m = 1; $m -le 12; $m++) {
    $len = $uq.GetDaysInMonth($y, $m)
    if ($len -eq 30) { $b = $b -bor (1 -shl ($m - 1)) }
    elseif ($len -ne 29) { throw "Unexpected month length $len for $y-$m" }
  }
  $bits += $b
}

$hex = $bits | ForEach-Object { '0x{0:X}' -f $_ }
for ($i = 0; $i -lt $hex.Count; $i += 10) {
  $end   = [Math]::Min($i + 9, $hex.Count - 1)
  $chunk = $hex[$i..$end] -join ','
  Write-Host ("  {0}, // {1}-{2}" -f $chunk, ($From + $i), ($From + $end))
}

Write-Host ""
Write-Host "// Years: $($bits.Count) ($From-$To). Paste into UQ_DATA in src/calendars/HijriCalendar.js"
Write-Host "// or pass as an array to MultiCalendarDatepicker.extendUmmalquraData() for years > 1500."
