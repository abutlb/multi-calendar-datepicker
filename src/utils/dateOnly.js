export function dateOnlyToString(d, sep = '-') {
  return `${d.year}${sep}${String(d.month).padStart(2,'0')}${sep}${String(d.day).padStart(2,'0')}`;
}

export function dateOnlyEquals(a, b) {
  return a && b && a.year === b.year && a.month === b.month && a.day === b.day;
}

export function dateOnlyCompare(a, b) {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function parseISODateOnly(str) {
  if (!str) return null;
  const m = String(str).match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (!m) return null;
  return { year: +m[1], month: +m[2], day: +m[3] };
}
