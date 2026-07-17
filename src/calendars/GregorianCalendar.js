import { CalendarAdapter } from './CalendarAdapter.js';

const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
// Levantine / Syriac month names — everyday usage in Iraq, Syria, Lebanon,
// Jordan and Palestine (same Gregorian arithmetic, different names).
const MONTHS_AR_LEVANT = ['كانون الثاني','شباط','آذار','نيسان','أيار','حزيران','تموز','آب','أيلول','تشرين الأول','تشرين الثاني','كانون الأول'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_AR  = ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
const DAYS_EN  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export class GregorianCalendar extends CalendarAdapter {
  id = 'gregorian';
  name = 'Gregorian';

  /** @param monthVariant 'default' (يناير) | 'levant' (كانون الثاني) | 'both' (كانون الثاني / يناير) */
  constructor(monthVariant = 'default') {
    super();
    this.monthVariant = monthVariant;
  }

  toGregorian(d) { return { year: d.year, month: d.month, day: d.day }; }

  fromGregorian(g) { return { year: g.year, month: g.month, day: g.day }; }

  getMonthLength(year, month) {
    return new Date(year, month, 0).getDate();
  }

  isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  getMonths(locale) {
    if (locale === 'ar') {
      if (this.monthVariant === 'levant') return MONTHS_AR_LEVANT;
      if (this.monthVariant === 'both') {
        return MONTHS_AR_LEVANT.map((m, i) => `${m} / ${MONTHS_AR[i]}`);
      }
      return MONTHS_AR;
    }
    return MONTHS_EN;
  }

  getWeekdays(locale, weekStart = 0) {
    const days = locale === 'ar' ? DAYS_AR : DAYS_EN;
    const result = [];
    for (let i = 0; i < 7; i++) result.push(days[(weekStart + i) % 7]);
    return result;
  }

  validateDate({ year, month, day }) {
    if (!year || month < 1 || month > 12 || day < 1) return false;
    return day <= this.getMonthLength(year, month);
  }

  getToday() {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() + 1, day: n.getDate() };
  }
}
