const ARABIC  = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
const PERSIAN = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];

export function toArabicDigits(str) {
  return String(str).replace(/\d/g, d => ARABIC[d]);
}

export function toPersianDigits(str) {
  return String(str).replace(/\d/g, d => PERSIAN[d]);
}

/** Normalise Arabic-Indic (٠-٩) and Extended Arabic-Indic / Persian (۰-۹) digits to Latin. */
export function toLatinDigits(str) {
  return String(str)
    .replace(/[٠-٩]/g, d => ARABIC.indexOf(d))
    .replace(/[۰-۹]/g, d => PERSIAN.indexOf(d));
}

export function applyDigits(str, digits) {
  if (digits === 'arabic')  return toArabicDigits(str);
  if (digits === 'persian') return toPersianDigits(str);
  return toLatinDigits(str);
}

export function padStart(num, len = 2) {
  return String(num).padStart(len, '0');
}
