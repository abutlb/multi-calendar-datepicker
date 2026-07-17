var Ct = Object.defineProperty;
var kt = (n, t, e) => t in n ? Ct(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var p = (n, t, e) => kt(n, typeof t != "symbol" ? t + "" : t, e);
class N {
  constructor() {
    /** Unique string id, e.g. 'gregorian' */
    p(this, "id", "");
    /** Human-readable name */
    p(this, "name", "");
  }
  /** Convert a date in this calendar to Gregorian DateOnly */
  toGregorian(t) {
    throw new Error("not implemented");
  }
  /** Convert a Gregorian DateOnly to this calendar's DateOnly */
  fromGregorian(t) {
    throw new Error("not implemented");
  }
  /** Number of days in a given month of this calendar */
  getMonthLength(t, e) {
    throw new Error("not implemented");
  }
  /** Number of months per year (13 for Coptic/Ethiopian-style calendars) */
  getMonthCount() {
    return 12;
  }
  /** Array of month name strings for the given locale */
  getMonths(t) {
    throw new Error("not implemented");
  }
  /** Array of weekday short names starting from weekStart */
  getWeekdays(t, e) {
    throw new Error("not implemented");
  }
  /** True if the year is a leap year in this calendar */
  isLeapYear(t) {
    return !1;
  }
  /** Validate a DateOnly; returns true if valid */
  validateDate(t) {
    throw new Error("not implemented");
  }
  /** Return today's date in this calendar as DateOnly */
  getToday() {
    throw new Error("not implemented");
  }
}
const et = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"], rt = ["كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"], Tt = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], Yt = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"], Gt = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
class ht extends N {
  /** @param monthVariant 'default' (يناير) | 'levant' (كانون الثاني) | 'both' (كانون الثاني / يناير) */
  constructor(e = "default") {
    super();
    p(this, "id", "gregorian");
    p(this, "name", "Gregorian");
    this.monthVariant = e;
  }
  toGregorian(e) {
    return { year: e.year, month: e.month, day: e.day };
  }
  fromGregorian(e) {
    return { year: e.year, month: e.month, day: e.day };
  }
  getMonthLength(e, r) {
    return new Date(e, r, 0).getDate();
  }
  isLeapYear(e) {
    return e % 4 === 0 && e % 100 !== 0 || e % 400 === 0;
  }
  getMonths(e) {
    return e === "ar" ? this.monthVariant === "levant" ? rt : this.monthVariant === "both" ? rt.map((r, a) => `${r} / ${et[a]}`) : et : Tt;
  }
  getWeekdays(e, r = 0) {
    const a = e === "ar" ? Yt : Gt, s = [];
    for (let i = 0; i < 7; i++) s.push(a[(r + i) % 7]);
    return s;
  }
  validateDate({ year: e, month: r, day: a }) {
    return !e || r < 1 || r > 12 || a < 1 ? !1 : a <= this.getMonthLength(e, r);
  }
  getToday() {
    const e = /* @__PURE__ */ new Date();
    return { year: e.getFullYear(), month: e.getMonth() + 1, day: e.getDate() };
  }
}
const $t = ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"], Bt = ["Muharram", "Safar", "Rabi I", "Rabi II", "Jumada I", "Jumada II", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"], Lt = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"], jt = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], dt = Date.UTC(2e3, 0, 1), lt = 2451545;
function q(n, t, e) {
  return Math.round((Date.UTC(n, t - 1, e) - dt) / 864e5) + lt;
}
function nt(n) {
  const t = new Date(dt + (n - lt) * 864e5);
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}
function Ft(n, t, e) {
  return Math.floor((11 * n + 3) / 30) + 354 * n + 30 * t - Math.floor((t - 1) / 2) + e + 1948440 - 385;
}
function Ut(n) {
  const t = n - 1948440 + 10632, e = Math.floor((t - 1) / 10631), r = t - 10631 * e + 354, a = Math.floor((10985 - r) / 5316) * Math.floor(50 * r / 17719) + Math.floor(r / 5670) * Math.floor(43 * r / 15238), s = r - Math.floor((30 - a) / 15) * Math.floor(17719 * a / 50) - Math.floor(a / 16) * Math.floor(15238 * a / 43) + 29, i = Math.floor(24 * s / 709), o = s - Math.floor(709 * i / 24);
  return { year: 30 * e + a - 30, month: i, day: o };
}
const B = 1318, m = [
  746,
  1769,
  3794,
  3748,
  3402,
  2710,
  1334,
  2741,
  3498,
  2980,
  // 1318-1327
  2889,
  2707,
  1323,
  2647,
  1206,
  2741,
  1450,
  3413,
  3370,
  2646,
  // 1328-1337
  1198,
  2397,
  748,
  1749,
  1706,
  1365,
  1195,
  2395,
  698,
  1397,
  // 1338-1347
  2994,
  1892,
  1865,
  1621,
  683,
  1371,
  2778,
  1748,
  3785,
  3474,
  // 1348-1357
  3365,
  2637,
  685,
  1389,
  2922,
  2898,
  2725,
  2635,
  1175,
  2359,
  // 1358-1367
  694,
  1397,
  3434,
  3410,
  2710,
  2349,
  605,
  1245,
  2778,
  1492,
  // 1368-1377
  3497,
  3410,
  2730,
  1238,
  2486,
  884,
  1897,
  1874,
  1701,
  1355,
  // 1378-1387
  2731,
  1370,
  2773,
  3538,
  3492,
  3401,
  2709,
  1325,
  2653,
  1370,
  // 1388-1397
  2773,
  1706,
  1685,
  1323,
  2647,
  1198,
  2422,
  1388,
  2901,
  2730,
  // 1398-1407
  2645,
  1197,
  2397,
  730,
  1497,
  3506,
  2980,
  2890,
  2645,
  693,
  // 1408-1417
  1397,
  2922,
  3026,
  3012,
  2953,
  2709,
  1325,
  1453,
  2922,
  1748,
  // 1418-1427
  3529,
  3474,
  2726,
  2390,
  686,
  1389,
  874,
  2901,
  2730,
  2381,
  // 1428-1437
  1181,
  2397,
  698,
  1461,
  1450,
  3413,
  2714,
  2350,
  622,
  1373,
  // 1438-1447
  2778,
  1748,
  1701,
  1355,
  2711,
  1358,
  2734,
  1452,
  2985,
  3474,
  // 1448-1457
  2853,
  1611,
  3243,
  1370,
  2901,
  1746,
  3749,
  3658,
  2709,
  1325,
  // 1458-1467
  2733,
  876,
  1881,
  1746,
  1685,
  1325,
  2651,
  1210,
  2490,
  948,
  // 1468-1477
  2921,
  2898,
  2726,
  1206,
  2413,
  748,
  1753,
  3762,
  3412,
  3370,
  // 1478-1487
  2646,
  1198,
  2413,
  3434,
  2900,
  2857,
  2707,
  1323,
  2647,
  1334,
  // 1488-1497
  2741,
  1706,
  3731
  // 1498-1500
], Rt = q(1900, 4, 30), v = (() => {
  const n = [Rt];
  for (let t = 0; t < m.length; t++) {
    let e = 0;
    for (let r = 0; r < 12; r++) e += m[t] >> r & 1 ? 30 : 29;
    n.push(n[t] + e);
  }
  return n;
})();
function Pt(n) {
  for (const t of n) {
    let e = 0;
    for (let r = 0; r < 12; r++) e += t >> r & 1 ? 30 : 29;
    if (e < 354 || e > 355) throw new Error("MCD: invalid Umm al-Qura year data: " + t);
    m.push(t), v.push(v[v.length - 1] + e);
  }
  return B + m.length - 1;
}
function Nt(n) {
  const t = n - B;
  return t >= 0 && t < m.length;
}
function It(n, t) {
  const e = n - B;
  return e < 0 || e >= m.length ? null : m[e] >> t - 1 & 1 ? 30 : 29;
}
function Ot(n, t, e) {
  const r = n - B;
  if (r < 0 || r >= m.length) return null;
  let a = v[r];
  const s = m[r];
  for (let i = 0; i < t - 1; i++) a += s >> i & 1 ? 30 : 29;
  return a + e - 1;
}
function Vt(n) {
  if (n < v[0] || n >= v[m.length]) return null;
  let t = 0, e = m.length - 1;
  for (; t < e; ) {
    const s = t + e + 1 >> 1;
    v[s] <= n ? t = s : e = s - 1;
  }
  let r = n - v[t];
  const a = m[t];
  for (let s = 0; s < 12; s++) {
    const i = a >> s & 1 ? 30 : 29;
    if (r < i) return { year: B + t, month: s + 1, day: r + 1 };
    r -= i;
  }
  return null;
}
function j(n, t, e, r) {
  if (!r) return { year: n, month: t, day: e };
  const a = new Date(Date.UTC(n, t - 1, e + r));
  return { year: a.getUTCFullYear(), month: a.getUTCMonth() + 1, day: a.getUTCDate() };
}
function Ht() {
  try {
    return new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      year: "numeric",
      month: "numeric",
      day: "numeric"
    }).formatToParts(new Date(Date.UTC(2e3, 0, 1))), !0;
  } catch {
    return !1;
  }
}
const U = Ht(), Wt = U ? new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
  year: "numeric",
  month: "numeric",
  day: "numeric"
}) : null;
function K(n, t, e) {
  const r = Wt.formatToParts(new Date(Date.UTC(n, t - 1, e))), a = (s) => parseInt(r.find((i) => i.type === s).value);
  return { year: a("year"), month: a("month"), day: a("day") };
}
let P = null, ut = 0;
function qt() {
  if (!P) {
    const n = K(2e3, 1, 1);
    ut = Date.UTC(2e3, 0, 1) - (n.day - 1) * 864e5, P = { year: n.year, month: n.month };
  }
}
const at = /* @__PURE__ */ new Map();
function H(n, t) {
  qt();
  const e = `${n}-${t}`, r = at.get(e);
  if (r) return r;
  let a = ut + Math.round(
    (n - P.year) * 354.367 + (t - P.month) * 29.53
  ) * 864e5;
  for (let s = 0; s < 16; s++) {
    const i = new Date(a), o = K(i.getUTCFullYear(), i.getUTCMonth() + 1, i.getUTCDate()), c = (o.year - n) * 12 + (o.month - t);
    if (c === 0) {
      if (o.day === 1) {
        const u = { year: i.getUTCFullYear(), month: i.getUTCMonth() + 1, day: i.getUTCDate() };
        return at.set(e, u), u;
      }
      a -= (o.day - 1) * 864e5;
    } else
      a -= Math.round(c * 29.53) * 864e5;
  }
  return null;
}
class z extends N {
  constructor(e = "tabular", r = 0) {
    super();
    p(this, "id", "hijri");
    p(this, "name", "Hijri");
    this.mode = e, this.adjust = r;
  }
  toGregorian({ year: e, month: r, day: a }) {
    if (this.mode === "ummalqura") {
      const s = Ot(e, r, a);
      if (s !== null) {
        const i = nt(s);
        return j(i.year, i.month, i.day, -this.adjust);
      }
      if (U) {
        const i = H(e, r);
        if (i) {
          const o = j(i.year, i.month, i.day, a - 1);
          return j(o.year, o.month, o.day, -this.adjust);
        }
      }
    }
    return nt(Ft(e, r, a));
  }
  fromGregorian({ year: e, month: r, day: a }) {
    if (this.mode === "ummalqura") {
      const s = j(e, r, a, this.adjust), i = Vt(q(s.year, s.month, s.day));
      if (i) return i;
      if (U) return K(s.year, s.month, s.day);
    }
    return Ut(q(e, r, a));
  }
  getMonthLength(e, r) {
    if (this.mode === "ummalqura") {
      const a = It(e, r);
      if (a !== null) return a;
      if (U) {
        const s = H(e, r), i = H(
          r === 12 ? e + 1 : e,
          r === 12 ? 1 : r + 1
        );
        if (s && i)
          return Math.round((Date.UTC(i.year, i.month - 1, i.day) - Date.UTC(s.year, s.month - 1, s.day)) / 864e5);
      }
    }
    return r % 2 === 1 || r === 12 && this.isLeapYear(e) ? 30 : 29;
  }
  isLeapYear(e) {
    return (11 * e + 14) % 30 < 11;
  }
  getMonths(e) {
    return e === "ar" ? $t : Bt;
  }
  getWeekdays(e, r = 6) {
    const a = e === "ar" ? Lt : jt, s = [];
    for (let i = 0; i < 7; i++) s.push(a[(r + i) % 7]);
    return s;
  }
  validateDate({ year: e, month: r, day: a }) {
    return !e || r < 1 || r > 12 || a < 1 ? !1 : a <= this.getMonthLength(e, r);
  }
  getToday() {
    const e = /* @__PURE__ */ new Date();
    return this.fromGregorian({ year: e.getFullYear(), month: e.getMonth() + 1, day: e.getDate() });
  }
}
const Jt = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"], Qt = ["Farvardin", "Ordibehesht", "Khordad", "Tir", "Mordad", "Shahrivar", "Mehr", "Aban", "Azar", "Dey", "Bahman", "Esfand"], Kt = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"], zt = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"], Xt = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function y(n, t) {
  return Math.floor(n / t);
}
function A(n, t) {
  return n - Math.floor(n / t) * t;
}
const ft = Date.UTC(2e3, 0, 1), _t = 2451545;
function X(n, t, e) {
  return Math.round((Date.UTC(n, t - 1, e) - ft) / 864e5) + _t;
}
function gt(n) {
  const t = new Date(ft + (n - _t) * 864e5);
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}
const F = [
  -61,
  9,
  38,
  199,
  426,
  686,
  756,
  818,
  1111,
  1181,
  1210,
  1635,
  2060,
  2097,
  2192,
  2262,
  2324,
  2394,
  2456,
  3178
];
function Z(n) {
  const t = F.length, e = n + 621;
  let r = -14, a = F[0], s = 0;
  if (n < a || n >= F[t - 1]) throw new Error("Invalid Jalali year " + n);
  for (let d = 1; d < t; d++) {
    const f = F[d];
    if (s = f - a, n < f) break;
    r = r + y(s, 33) * 8 + y(A(s, 33), 4), a = f;
  }
  let i = n - a;
  r = r + y(i, 33) * 8 + y(A(i, 33) + 3, 4), A(s, 33) === 4 && s - i === 4 && (r += 1);
  const o = y(e, 4) - y((y(e, 100) + 1) * 3, 4) - 150, c = 20 + r - o;
  s - i < 6 && (i = i - s + y(s + 4, 33) * 33);
  let u = A(A(i + 1, 33) - 1, 4);
  return u === -1 && (u = 4), { leap: u, gy: e, march: c };
}
function Zt(n, t, e) {
  const r = Z(n);
  return X(r.gy, 3, r.march) + (t - 1) * 31 - y(t, 7) * (t - 7) + e - 1;
}
function te(n) {
  const t = gt(n).year;
  let e = t - 621;
  const r = Z(e), a = X(t, 3, r.march);
  let s = n - a;
  if (s >= 0) {
    if (s <= 185)
      return { year: e, month: 1 + y(s, 31), day: A(s, 31) + 1 };
    s -= 186;
  } else
    e -= 1, s += 179, r.leap === 1 && (s += 1);
  return { year: e, month: 7 + y(s, 30), day: A(s, 30) + 1 };
}
function mt(n) {
  return Z(n).leap === 0;
}
function ee(n, t) {
  return t <= 6 ? 31 : t <= 11 || mt(n) ? 30 : 29;
}
class re extends N {
  constructor() {
    super(...arguments);
    p(this, "id", "jalali");
    p(this, "name", "Jalali");
  }
  toGregorian({ year: e, month: r, day: a }) {
    return gt(Zt(e, r, a));
  }
  fromGregorian({ year: e, month: r, day: a }) {
    return te(X(e, r, a));
  }
  getMonthLength(e, r) {
    return ee(e, r);
  }
  isLeapYear(e) {
    return mt(e);
  }
  getMonths(e) {
    return e === "ar" || e === "fa" ? Jt : Qt;
  }
  getWeekdays(e, r = 6) {
    const a = e === "fa" ? zt : e === "ar" ? Kt : Xt, s = [];
    for (let i = 0; i < 7; i++) s.push(a[(r + i) % 7]);
    return s;
  }
  validateDate({ year: e, month: r, day: a }) {
    return !e || r < 1 || r > 12 || a < 1 ? !1 : a <= this.getMonthLength(e, r);
  }
  getToday() {
    const e = /* @__PURE__ */ new Date();
    return this.fromGregorian({ year: e.getFullYear(), month: e.getMonth() + 1, day: e.getDate() });
  }
}
const ne = ["توت", "بابه", "هاتور", "كيهك", "طوبة", "أمشير", "برمهات", "برمودة", "بشنس", "بؤونة", "أبيب", "مسرى", "النسيء"], ae = ["Thout", "Paopi", "Hathor", "Koiak", "Tobi", "Meshir", "Paremhat", "Parmouti", "Pashons", "Paoni", "Epip", "Mesori", "Nasie"], se = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"], ie = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], pt = Date.UTC(2e3, 0, 1), yt = 2451545;
function xt(n, t, e) {
  return Math.round((Date.UTC(n, t - 1, e) - pt) / 864e5) + yt;
}
function oe(n) {
  const t = new Date(pt + (n - yt) * 864e5);
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}
const Dt = xt(284, 8, 29);
function J(n) {
  return 365 * (n - 1) + Math.floor(n / 4);
}
function ce(n, t, e) {
  return Dt + J(n) + 30 * (t - 1) + e - 1;
}
function he(n) {
  const t = n - Dt;
  let e = Math.floor(t / 366) + 1;
  for (; J(e + 1) <= t; ) e++;
  const r = t - J(e);
  return { year: e, month: Math.floor(r / 30) + 1, day: r % 30 + 1 };
}
class de extends N {
  constructor() {
    super(...arguments);
    p(this, "id", "coptic");
    p(this, "name", "Coptic");
  }
  toGregorian({ year: e, month: r, day: a }) {
    return oe(ce(e, r, a));
  }
  fromGregorian({ year: e, month: r, day: a }) {
    return he(xt(e, r, a));
  }
  getMonthCount() {
    return 13;
  }
  getMonthLength(e, r) {
    return r <= 12 ? 30 : this.isLeapYear(e) ? 6 : 5;
  }
  isLeapYear(e) {
    return (e % 4 + 4) % 4 === 3;
  }
  getMonths(e) {
    return e === "ar" ? ne : ae;
  }
  getWeekdays(e, r = 0) {
    const a = e === "ar" ? se : ie, s = [];
    for (let i = 0; i < 7; i++) s.push(a[(r + i) % 7]);
    return s;
  }
  validateDate({ year: e, month: r, day: a }) {
    return !e || r < 1 || r > 13 || a < 1 ? !1 : a <= this.getMonthLength(e, r);
  }
  getToday() {
    const e = /* @__PURE__ */ new Date();
    return this.fromGregorian({ year: e.getFullYear(), month: e.getMonth() + 1, day: e.getDate() });
  }
}
const tt = /* @__PURE__ */ new Map();
function C(n) {
  tt.set(n.id, n);
}
function bt(n) {
  const t = tt.get(n);
  if (!t) throw new Error(`Unknown calendar: ${n}`);
  return t;
}
function le() {
  return [...tt.values()];
}
C(new ht());
C(new z("tabular"));
C(new re());
C(new de());
const vt = new z("ummalqura");
vt.id = "ummalqura";
C(vt);
const wt = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"], At = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
function ue(n) {
  return String(n).replace(/\d/g, (t) => wt[t]);
}
function fe(n) {
  return String(n).replace(/\d/g, (t) => At[t]);
}
function Mt(n) {
  return String(n).replace(/[٠-٩]/g, (t) => wt.indexOf(t)).replace(/[۰-۹]/g, (t) => At.indexOf(t));
}
function Q(n, t) {
  return t === "arabic" ? ue(n) : t === "persian" ? fe(n) : Mt(n);
}
function st(n, t = 2) {
  return String(n).padStart(t, "0");
}
function R(n, t = "YYYY-MM-DD", e = "latin") {
  if (!n) return "";
  const { year: r, month: a, day: s } = n;
  let i = t.replace("YYYY", String(r)).replace("MM", st(a)).replace("DD", st(s));
  return Q(i, e);
}
function St(n, t = "YYYY-MM-DD") {
  if (!n) return null;
  const e = Mt(String(n)).trim(), r = t.includes("-") ? "-" : "/", a = e.split(r);
  if (a.length !== 3) return null;
  const s = t.replace(/[/-]/g, r).split(r), i = {};
  s.forEach((d, f) => {
    i[d] = a[f];
  });
  const o = parseInt(i.YYYY, 10), c = parseInt(i.MM, 10), u = parseInt(i.DD, 10);
  return isNaN(o) || isNaN(c) || isNaN(u) ? null : { year: o, month: c, day: u };
}
function E(n, t = document) {
  return typeof n == "string" ? t.querySelector(n) : n;
}
function h(n, t = {}, ...e) {
  const r = document.createElement(n);
  for (const [a, s] of Object.entries(t))
    a === "class" ? r.className = s : a.startsWith("data-") || a.startsWith("aria-") || a === "role" || a === "tabindex" ? r.setAttribute(a, s) : r[a] = s;
  for (const a of e)
    a != null && r.appendChild(typeof a == "string" ? document.createTextNode(a) : a);
  return r;
}
function it(n, t) {
  if (!n) return;
  const e = n.tagName.toLowerCase();
  e === "input" || e === "textarea" ? n.value = t : n.textContent = t;
}
function w(n, t, e, r) {
  return n.addEventListener(t, e, r), () => n.removeEventListener(t, e, r);
}
class M {
  static render(t, e, r) {
    const a = E(t);
    if (!a) return;
    const s = M.applyTemplate(r, e);
    it(a, s);
  }
  static clear(t) {
    const e = E(t);
    e && it(e, "");
  }
  static applyTemplate(t, e) {
    return t ? t.replace(/\{\{(\w+)\}\}/g, (r, a) => e[a] !== void 0 && e[a] !== null ? String(e[a]) : "") : e.gregorian || "";
  }
}
function _e(n, t, e = "auto") {
  const r = t.getBoundingClientRect(), a = n.offsetHeight || 320, s = window.innerHeight - r.bottom, i = r.top;
  let o = !1;
  e === "top" ? o = !0 : e === "auto" && (o = s < a && i > s);
  const c = window.pageXOffset, u = window.pageYOffset;
  n.style.position = "absolute", n.style.zIndex = "99999", o ? n.style.top = `${r.top + u - a - 4}px` : n.style.top = `${r.bottom + u + 4}px`;
  let d = r.left + c;
  const f = n.offsetWidth || 300;
  d + f > window.innerWidth + c && (d = window.innerWidth + c - f - 8), d < c && (d = c + 8), n.style.left = `${d}px`;
}
class ge {
  constructor() {
    this._themes = /* @__PURE__ */ new Map(), this._styleEl = null, this._activeGlobal = null;
  }
  /**
   * Register a theme.
   * @param {string} id  — unique key, e.g. 'rose'
   * @param {object} def — { name?, description?, vars: { '--mcd-...': '...' } }
   *                       or just the vars object directly.
   */
  register(t, e) {
    return e && e.vars ? this._themes.set(t, { name: e.name || t, description: e.description || "", vars: e.vars }) : this._themes.set(t, { name: t, description: "", vars: e }), this;
  }
  /** Return full theme object or null */
  get(t) {
    return this._themes.get(t) || null;
  }
  /** Return just the vars object */
  getVars(t) {
    const e = this._themes.get(t);
    return e ? e.vars : null;
  }
  /** Return array of all registered theme objects with their id */
  getAll() {
    const t = [];
    return this._themes.forEach((e, r) => t.push({ id: r, ...e })), t;
  }
  /** Currently active global theme id */
  get active() {
    return this._activeGlobal;
  }
  /**
   * Apply a theme globally by injecting/replacing a <style> tag in <head>.
   * This overrides :root variables for every picker on the page.
   */
  applyGlobal(t) {
    const e = this.getVars(t);
    if (!e) return !1;
    this._styleEl || (this._styleEl = document.createElement("style"), this._styleEl.id = "mcd-global-theme", document.head.appendChild(this._styleEl));
    const r = Object.entries(e).map(([a, s]) => `  ${a}: ${s};`).join(`
`);
    return this._styleEl.textContent = `:root {
${r}
}`, this._activeGlobal = t, !0;
  }
  /** Remove the global theme override */
  resetGlobal() {
    this._styleEl && (this._styleEl.textContent = ""), this._activeGlobal = null;
  }
  /**
   * Apply a theme inline on a specific DOM element (one picker only).
   * Clears any previous inline theme vars first.
   */
  applyToElement(t, e) {
    if (this._clearElementVars(t), !e) return !1;
    const r = typeof e == "object" ? e.vars || e : this.getVars(e);
    if (!r) return !1;
    for (const [a, s] of Object.entries(r))
      t.style.setProperty(a, s);
    return !0;
  }
  /** Remove all --mcd-* inline custom properties from an element */
  _clearElementVars(t) {
    const e = [];
    for (const r of t.style)
      r.startsWith("--mcd-") && e.push(r);
    e.forEach((r) => t.style.removeProperty(r));
  }
  /**
   * Export a theme as a CSS string that can be shared and pasted directly.
   * @param {string} id
   * @param {string} selector — CSS selector to target, default ':root'
   */
  exportCSS(t, e = ":root") {
    const r = this._themes.get(t);
    if (!r) return "";
    const a = Object.entries(r.vars).map(([s, i]) => `  ${s}: ${i};`).join(`
`);
    return `/* MCD Theme: ${r.name} */
${e} {
${a}
}`;
  }
  /**
   * Export a theme as a JS snippet that can be shared with other developers.
   * The recipient pastes it after loading the library.
   */
  exportJS(t) {
    const e = this._themes.get(t);
    if (!e) return "";
    const r = Object.entries(e.vars).map(([a, s]) => `    '${a}': '${s}'`).join(`,
`);
    return `MultiCalendarDatepicker.themes.register('${t}', {
  name: '${e.name}',
  description: '${e.description}',
  vars: {
${r}
  }
});`;
  }
  /**
   * Export ALL registered themes as a portable JS file content string.
   */
  exportAllJS() {
    const t = [];
    return this._themes.forEach((e, r) => {
      const a = Object.entries(e.vars).map(([s, i]) => `    '${s}': '${i}'`).join(`,
`);
      t.push(
        `MultiCalendarDatepicker.themes.register('${r}', {
  name: '${e.name}',
  description: '${e.description}',
  vars: {
${a}
  }
});`
      );
    }), t.join(`

`);
  }
}
const S = new ge();
function x(n, t = "-") {
  return `${n.year}${t}${String(n.month).padStart(2, "0")}${t}${String(n.day).padStart(2, "0")}`;
}
function W(n, t) {
  return n && t && n.year === t.year && n.month === t.month && n.day === t.day;
}
function b(n, t) {
  return n.year !== t.year ? n.year - t.year : n.month !== t.month ? n.month - t.month : n.day - t.day;
}
function $(n) {
  if (!n) return null;
  const t = String(n).match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  return t ? { year: +t[1], month: +t[2], day: +t[3] } : null;
}
function me(n, t) {
  const { minDate: e, maxDate: r, disabledDates: a = [], disabledWeekDays: s = [] } = t;
  if (e) {
    const i = typeof e == "string" ? $(e) : e;
    if (i && b(n, i) < 0) return !0;
  }
  if (r) {
    const i = typeof r == "string" ? $(r) : r;
    if (i && b(n, i) > 0) return !0;
  }
  if (a.length) {
    const i = `${n.year}-${String(n.month).padStart(2, "0")}-${String(n.day).padStart(2, "0")}`;
    if (a.includes(i)) return !0;
  }
  if (s.length) {
    const i = new Date(n.year, n.month - 1, n.day);
    if (s.includes(i.getDay())) return !0;
  }
  return !1;
}
const pe = {
  calendar: "gregorian",
  hijriMode: "tabular",
  gregorianMonths: "default",
  // 'default' (يناير) | 'levant' (كانون الثاني) | 'both'
  mode: "single",
  // 'single' | 'range'
  secondaryCalendar: null,
  // e.g. 'gregorian' — small date shown inside each day cell
  backgroundSvg: null,
  backgroundSvgOpacity: 0.15,
  locale: "en",
  dir: "ltr",
  outputFormat: "YYYY-MM-DD",
  displayFormat: "YYYY-MM-DD",
  outputTarget: null,
  resultTarget: null,
  resultTemplate: "Gregorian: {{gregorian}}",
  autoClose: !0,
  showTodayButton: !0,
  showClearButton: !0,
  showResult: !0,
  weekStart: 0,
  minDate: null,
  maxDate: null,
  disabledDates: [],
  disabledWeekDays: [],
  weekendDays: [],
  theme: "light",
  closeOnSelect: !0,
  allowInput: !1,
  digits: "latin",
  // 'latin' | 'arabic' | 'persian'
  position: "auto",
  rangeSeparator: " – "
  // used in the input display for ranges
}, ot = {
  en: { today: "Today", clear: "Clear", close: "Close", greg: "Gregorian: " },
  ar: { today: "اليوم", clear: "مسح", close: "إغلاق", greg: "الميلادي: " },
  fa: { today: "امروز", clear: "پاک کردن", close: "بستن", greg: "میلادی: " }
};
function ye(n, t) {
  const e = new Date(Date.UTC(n.year, n.month - 1, n.day + t));
  return { year: e.getUTCFullYear(), month: e.getUTCMonth() + 1, day: e.getUTCDate() };
}
let xe = 0;
class ct {
  constructor(t, e = {}) {
    if (this._input = typeof t == "string" ? E(t) : t, !this._input) throw new Error("MCD: input element not found");
    this._opts = Object.assign({}, pe, e), this._calendar = this._resolveCalendar(), this._secondary = this._resolveSecondary(), this._selected = null, this._rangeStart = null, this._rangeEnd = null, this._focusDate = null, this._viewYear = null, this._viewMonth = null, this._picker = null, this._open = !1, this._id = ++xe, this._cleanups = [], this._applyTheme(), this._buildPicker(), this._applyBackground(), this._bindInput(), this._dispatch("mcd:init");
  }
  // ── Public API ─────────────────────────────────────────────────────────────
  getGregorianValue() {
    if (this._opts.mode === "range") {
      if (!this._rangeStart || !this._rangeEnd) return null;
      const e = this._calendar.toGregorian(this._rangeStart), r = this._calendar.toGregorian(this._rangeEnd);
      return `${x(e)}/${x(r)}`;
    }
    if (!this._selected) return null;
    const t = this._calendar.toGregorian(this._selected);
    return x(t);
  }
  getDisplayValue() {
    if (this._opts.mode === "range") {
      if (!this._rangeStart) return "";
      const t = R(this._rangeStart, this._opts.displayFormat, this._opts.digits);
      if (!this._rangeEnd) return t;
      const e = R(this._rangeEnd, this._opts.displayFormat, this._opts.digits);
      return t + this._opts.rangeSeparator + e;
    }
    return this._selected ? R(this._selected, this._opts.displayFormat, this._opts.digits) : "";
  }
  getResult() {
    if (this._opts.mode === "range") {
      if (!this._rangeStart || !this._rangeEnd) return null;
      const e = this._calendar.toGregorian(this._rangeStart), r = this._calendar.toGregorian(this._rangeEnd);
      return {
        mode: "range",
        calendar: this._opts.calendar,
        start: { ...this._rangeStart },
        end: { ...this._rangeEnd },
        gregorianStart: e,
        gregorianEnd: r,
        gregorianStartValue: x(e),
        gregorianEndValue: x(r),
        gregorianValue: `${x(e)}/${x(r)}`,
        displayValue: this.getDisplayValue(),
        locale: this._opts.locale
      };
    }
    if (!this._selected) return null;
    const t = this._calendar.toGregorian(this._selected);
    return {
      mode: "single",
      calendar: this._opts.calendar,
      displayDate: { ...this._selected },
      gregorianDate: t,
      gregorianValue: x(t),
      displayValue: this.getDisplayValue(),
      locale: this._opts.locale
    };
  }
  getRange() {
    return !this._rangeStart || !this._rangeEnd ? null : { start: { ...this._rangeStart }, end: { ...this._rangeEnd } };
  }
  setGregorianValue(t) {
    const e = $(t);
    e && (this._selected = this._calendar.fromGregorian(e), this._viewYear = this._selected.year, this._viewMonth = this._selected.month, this._focusDate = this._selected, this._updateAfterSelect(!1), this._renderGrid());
  }
  setGregorianRange(t, e) {
    const r = $(t), a = $(e);
    if (!r || !a) return;
    let s = this._calendar.fromGregorian(r), i = this._calendar.fromGregorian(a);
    if (b(r, a) > 0) {
      const o = s;
      s = i, i = o;
    }
    this._rangeStart = s, this._rangeEnd = i, this._viewYear = s.year, this._viewMonth = s.month, this._focusDate = s, this._commitRange(!1), this._renderGrid();
  }
  setCalendar(t) {
    let e = null, r = null, a = null;
    this._selected && (e = this._calendar.toGregorian(this._selected)), this._rangeStart && (r = this._calendar.toGregorian(this._rangeStart)), this._rangeEnd && (a = this._calendar.toGregorian(this._rangeEnd)), this._opts.calendar = t, this._calendar = this._resolveCalendar(), e && (this._selected = this._calendar.fromGregorian(e), this._viewYear = this._selected.year, this._viewMonth = this._selected.month), r && (this._rangeStart = this._calendar.fromGregorian(r)), a && (this._rangeEnd = this._calendar.fromGregorian(a)), this._fillSelects(), this._renderWeekdays(), this._renderGrid();
  }
  updateResult() {
    !this._opts.resultTarget || !this.getResult() || M.render(this._opts.resultTarget, this._templateData(), this._opts.resultTemplate);
  }
  clear() {
    if (this._selected = null, this._rangeStart = null, this._rangeEnd = null, this._input.value = "", this._opts.outputTarget) {
      const t = E(this._opts.outputTarget);
      t && (t.value = "");
    }
    this._opts.resultTarget && M.clear(this._opts.resultTarget), this._updateResultPreview(""), this._renderGrid(), this._dispatch("mcd:clear");
  }
  destroy() {
    this._cleanups.forEach((t) => t()), this._picker && this._picker.remove(), this._picker = null;
  }
  open() {
    this._openPicker();
  }
  close() {
    this._closePicker();
  }
  // ── Internal ───────────────────────────────────────────────────────────────
  _resolveCalendar() {
    return this._resolveCalendarById(this._opts.calendar);
  }
  _resolveSecondary() {
    const t = this._opts.secondaryCalendar;
    return !t || t === this._opts.calendar ? null : this._resolveCalendarById(t);
  }
  _resolveCalendarById(t) {
    if (t === "hijri" || t === "ummalqura") {
      const e = t === "ummalqura" ? "ummalqura" : this._opts.hijriMode || "tabular", r = this._opts.hijriAdjust || 0;
      return new z(e, r);
    }
    return t === "gregorian" && this._opts.gregorianMonths && this._opts.gregorianMonths !== "default" ? new ht(this._opts.gregorianMonths) : bt(t);
  }
  _monthCount(t = this._calendar) {
    return t.getMonthCount ? t.getMonthCount() : 12;
  }
  _l10n() {
    return ot[this._opts.locale] || ot.en;
  }
  _applyTheme() {
    const t = this._opts.theme;
    if (!(!t || t === "light")) {
      if (t === "dark" || t === "auto") {
        this._picker.classList.add(`mcd-theme-${t}`);
        return;
      }
      if (typeof t == "object") {
        S.applyToElement(this._picker, t);
        return;
      }
      S.get(t) && S.applyToElement(this._picker, t);
    }
  }
  /** Switch the theme on this picker instance at runtime. */
  setTheme(t) {
    S._clearElementVars(this._picker), this._picker.className = this._picker.className.replace(/\bmcd-theme-\S+/g, "").trim(), this._opts.theme = t, this._applyTheme();
  }
  _applyBackground() {
    const t = this._opts.backgroundSvg;
    if (!t) {
      this._picker.style.removeProperty("--mcd-bg-image"), this._picker.style.removeProperty("--mcd-bg-image-opacity");
      return;
    }
    const e = encodeURIComponent(t.trim());
    this._picker.style.setProperty(
      "--mcd-bg-image",
      `url("data:image/svg+xml;charset=utf-8,${e}")`
    );
    const r = this._opts.backgroundSvgOpacity;
    r != null && this._picker.style.setProperty("--mcd-bg-image-opacity", String(r));
  }
  setBackground(t, e) {
    this._opts.backgroundSvg = t || null, e !== void 0 && (this._opts.backgroundSvgOpacity = e), this._applyBackground();
  }
  clearBackground() {
    this._opts.backgroundSvg = null, this._picker.style.removeProperty("--mcd-bg-image"), this._picker.style.removeProperty("--mcd-bg-image-opacity");
  }
  _buildPicker() {
    const t = h("div", {
      class: "mcd-picker",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Date picker",
      dir: this._opts.dir
    }), e = h("div", { class: "mcd-header" });
    this._btnPrev = h("button", { class: "mcd-nav mcd-nav--prev", type: "button", "aria-label": "Previous month" }, "‹"), this._monthYearLabel = h("div", { class: "mcd-month-year" }), this._selectMonth = h("select", { class: "mcd-select-month", "aria-label": "Month" }), this._selectYear = h("select", { class: "mcd-select-year", "aria-label": "Year" }), this._btnNext = h("button", { class: "mcd-nav mcd-nav--next", type: "button", "aria-label": "Next month" }, "›");
    const r = h("div", { class: "mcd-month-year-wrap" }, this._selectMonth, this._selectYear);
    e.append(this._btnPrev, r, this._btnNext), this._weekdaysRow = h("div", { class: "mcd-weekdays", role: "row" }), this._grid = h("div", { class: "mcd-grid", role: "grid", "aria-label": "Calendar days" }), this._resultPreview = h("div", { class: "mcd-result-preview" }), this._footer = h("div", { class: "mcd-footer" });
    const a = this._l10n();
    this._opts.showTodayButton && (this._btnToday = h("button", { class: "mcd-btn mcd-btn--today", type: "button" }, a.today), this._footer.appendChild(this._btnToday)), this._opts.showClearButton && (this._btnClear = h("button", { class: "mcd-btn mcd-btn--clear", type: "button" }, a.clear), this._footer.appendChild(this._btnClear)), this._btnClose = h("button", { class: "mcd-btn mcd-btn--close", type: "button" }, a.close), this._footer.appendChild(this._btnClose), t.append(e, this._weekdaysRow, this._grid, this._resultPreview, this._footer), document.body.appendChild(t), this._picker = t, t.style.display = "none", this._initView(), this._fillSelects(), this._renderWeekdays(), this._renderGrid(), this._bindPickerEvents();
  }
  _initView() {
    const t = this._calendar.getToday();
    this._viewYear = t.year, this._viewMonth = t.month, this._focusDate = t;
  }
  _fillSelects() {
    this._selectMonth.innerHTML = "", this._calendar.getMonths(this._opts.locale).forEach((r, a) => {
      const s = h("option", { value: String(a + 1) }, r);
      this._selectMonth.appendChild(s);
    }), this._selectYear.innerHTML = "";
    const e = this._calendar.getToday();
    for (let r = e.year - 100; r <= e.year + 50; r++) {
      const a = h("option", { value: String(r) }, String(r));
      this._selectYear.appendChild(a);
    }
  }
  _updateSelects() {
    this._selectMonth.value = String(this._viewMonth), this._selectYear.value = String(this._viewYear);
  }
  _renderWeekdays() {
    this._weekdaysRow.innerHTML = "", this._calendar.getWeekdays(this._opts.locale, this._opts.weekStart).forEach((e) => {
      const r = h("div", { class: "mcd-weekday", role: "columnheader" }, e);
      this._weekdaysRow.appendChild(r);
    });
  }
  _renderGrid() {
    this._grid.innerHTML = "", this._updateSelects();
    const t = this._calendar, e = this._viewYear, r = this._viewMonth, a = t.getMonthLength(e, r);
    (!this._focusDate || this._focusDate.year !== e || this._focusDate.month !== r) && (this._focusDate = { year: e, month: r, day: 1 }), this._focusDate.day > a && (this._focusDate = { year: e, month: r, day: a });
    const s = {
      today: t.getToday(),
      secCal: this._secondary,
      gStart: this._rangeStart ? t.toGregorian(this._rangeStart) : null,
      gEnd: this._rangeEnd ? t.toGregorian(this._rangeEnd) : null
    }, i = t.toGregorian({ year: e, month: r, day: 1 }), c = new Date(i.year, i.month - 1, i.day).getDay(), u = this._opts.weekStart, d = (c - u + 7) % 7, f = this._monthCount(t), k = r === 1 ? f : r - 1, T = r === 1 ? e - 1 : e, I = t.getMonthLength(T, k);
    for (let l = 0; l < d; l++) {
      const V = I - d + 1 + l;
      this._grid.appendChild(this._makeDay(T, k, V, !0, s));
    }
    for (let l = 1; l <= a; l++)
      this._grid.appendChild(this._makeDay(e, r, l, !1, s));
    const g = d + a, Y = g % 7 === 0 ? 0 : 7 - g % 7, O = r === f ? 1 : r + 1, L = r === f ? e + 1 : e;
    for (let l = 1; l <= Y; l++)
      this._grid.appendChild(this._makeDay(L, O, l, !0, s));
  }
  _makeDay(t, e, r, a, s) {
    const i = { year: t, month: e, day: r }, o = this._calendar.toGregorian(i), c = me(o, this._opts), u = W(i, s.today), d = this._opts.mode === "range", f = !d && this._selected && W(i, this._selected), k = d && s.gStart && b(o, s.gStart) === 0, T = d && s.gEnd && b(o, s.gEnd) === 0, I = d && s.gStart && s.gEnd && b(o, s.gStart) > 0 && b(o, s.gEnd) < 0;
    let g = "mcd-day";
    a && (g += " mcd-day--outside"), u && (g += " mcd-day--today"), f && (g += " mcd-day--selected"), k && (g += " mcd-day--selected mcd-day--range-start"), T && (g += " mcd-day--selected mcd-day--range-end"), I && (g += " mcd-day--in-range"), c && (g += " mcd-day--disabled");
    const { weekendDays: Y } = this._opts;
    if (Y && Y.length) {
      const _ = new Date(o.year, o.month - 1, o.day).getDay();
      Y.includes(_) && (g += " mcd-day--weekend");
    }
    const O = !a && W(i, this._focusDate);
    let L = `${t}-${e}-${r}`;
    const l = h("div", {
      class: g,
      role: "gridcell",
      tabindex: O && !c ? "0" : "-1",
      "aria-selected": f || k || T ? "true" : "false",
      "aria-disabled": c ? "true" : "false",
      "data-year": String(t),
      "data-month": String(e),
      "data-day": String(r)
    }), V = h("span", { class: "mcd-day-main" }, Q(String(r), this._opts.digits));
    if (l.appendChild(V), s.secCal) {
      const _ = s.secCal.fromGregorian(o), Et = _.day === 1 ? `${_.day}/${_.month}` : String(_.day);
      l.appendChild(h(
        "span",
        { class: "mcd-day-secondary" },
        Q(Et, this._opts.digits)
      )), L += ` (${_.year}-${_.month}-${_.day})`;
    }
    return l.setAttribute("aria-label", L), c || (l.addEventListener("click", () => this._selectDay(i)), l.addEventListener("keydown", (_) => {
      (_.key === "Enter" || _.key === " ") && (_.preventDefault(), this._selectDay(i));
    })), l;
  }
  // ── Selection ──────────────────────────────────────────────────────────────
  _selectDay(t) {
    if (this._focusDate = t, this._opts.mode === "range") return this._selectRangeDay(t);
    this._selected = t, this._writeOutputs(), this._dispatchChange(), this._renderGrid(), this._opts.closeOnSelect && this._closePicker();
  }
  _selectRangeDay(t) {
    if (!this._rangeStart || this._rangeStart && this._rangeEnd) {
      this._rangeStart = t, this._rangeEnd = null, this._input.value = this.getDisplayValue() + this._opts.rangeSeparator, this._dispatch("mcd:range-start", {
        calendar: this._opts.calendar,
        start: { ...t },
        gregorianStart: this._calendar.toGregorian(t)
      }), this._renderGrid();
      return;
    }
    const e = this._calendar.toGregorian(t), r = this._calendar.toGregorian(this._rangeStart);
    b(e, r) < 0 ? (this._rangeEnd = this._rangeStart, this._rangeStart = t) : this._rangeEnd = t, this._commitRange(!0), this._renderGrid(), this._opts.closeOnSelect && this._closePicker();
  }
  _commitRange(t) {
    this._writeOutputs(), t && this._dispatchChange();
  }
  _templateData() {
    const t = this._opts.mode === "range", e = {
      calendar: this._opts.calendar,
      locale: this._opts.locale,
      display: this.getDisplayValue(),
      gregorian: this.getGregorianValue() || ""
    };
    if (t && this._rangeStart && this._rangeEnd) {
      const r = this._calendar.toGregorian(this._rangeStart), a = this._calendar.toGregorian(this._rangeEnd);
      e.gregorianStart = x(r), e.gregorianEnd = x(a);
    } else if (!t && this._selected) {
      const r = this._calendar.toGregorian(this._selected);
      e.year = String(r.year), e.month = String(r.month), e.day = String(r.day);
    }
    return e;
  }
  _writeOutputs() {
    const t = this.getGregorianValue() || "", e = this.getDisplayValue();
    if (this._input.value = e, this._opts.outputTarget) {
      const r = E(this._opts.outputTarget);
      r && (r.value = t);
    }
    this._opts.resultTarget && t && M.render(this._opts.resultTarget, this._templateData(), this._opts.resultTemplate), this._opts.showResult && t && this._updateResultPreview(this._l10n().greg + t);
  }
  _dispatchChange() {
    const t = {
      mode: this._opts.mode,
      calendar: this._opts.calendar,
      value: this.getGregorianValue(),
      displayValue: this.getDisplayValue(),
      resultText: M.applyTemplate(this._opts.resultTemplate, this._templateData())
    };
    this._opts.mode === "range" ? (t.start = { ...this._rangeStart }, t.end = { ...this._rangeEnd }, t.gregorianStart = this._calendar.toGregorian(this._rangeStart), t.gregorianEnd = this._calendar.toGregorian(this._rangeEnd)) : (t.displayDate = { ...this._selected }, t.gregorianDate = this._calendar.toGregorian(this._selected)), this._dispatch("mcd:change", t), this._suppressChangeCommit = !0, this._input.dispatchEvent(new Event("change", { bubbles: !0 })), this._suppressChangeCommit = !1;
  }
  _updateResultPreview(t) {
    this._resultPreview && (this._resultPreview.textContent = t, this._resultPreview.style.display = t ? "" : "none");
  }
  _updateAfterSelect(t = !0) {
    this._selected && (this._writeOutputs(), t && this._dispatchChange());
  }
  // ── Input binding ──────────────────────────────────────────────────────────
  _bindInput() {
    const t = () => this._openPicker();
    if (this._input.addEventListener("focus", t), this._input.addEventListener("click", t), this._cleanups.push(() => {
      this._input.removeEventListener("focus", t), this._input.removeEventListener("click", t);
    }), this._opts.allowInput && this._opts.mode !== "range") {
      const r = () => {
        if (this._suppressChangeCommit) return;
        const a = this._input.value.trim();
        if (!a) return;
        const s = St(a, this._opts.displayFormat);
        s && this._calendar.validateDate(s) ? (this._selected = s, this._viewYear = s.year, this._viewMonth = s.month, this._focusDate = s, this._writeOutputs(), this._dispatchChange(), this._renderGrid()) : this._input.value = this.getDisplayValue();
      };
      this._input.addEventListener("change", r), this._cleanups.push(() => this._input.removeEventListener("change", r));
    }
    const e = (r) => {
      if (r.key === "Escape") {
        this._closePicker();
        return;
      }
      if (r.key === "Enter" && this._opts.allowInput && this._opts.mode !== "range") {
        this._input.dispatchEvent(new Event("change"));
        return;
      }
      r.key === "ArrowDown" && this._open && (r.preventDefault(), this._focusCell(this._focusDate));
    };
    this._input.addEventListener("keydown", e), this._cleanups.push(() => this._input.removeEventListener("keydown", e));
  }
  _bindPickerEvents() {
    this._cleanups.push(w(this._btnPrev, "click", () => this._navigate(-1))), this._cleanups.push(w(this._btnNext, "click", () => this._navigate(1))), this._cleanups.push(w(this._selectMonth, "change", () => {
      this._viewMonth = +this._selectMonth.value, this._renderGrid();
    })), this._cleanups.push(w(this._selectYear, "change", () => {
      this._viewYear = +this._selectYear.value, this._renderGrid();
    })), this._btnToday && this._cleanups.push(w(this._btnToday, "click", () => {
      const a = this._calendar.getToday();
      this._viewYear = a.year, this._viewMonth = a.month, this._selectDay(a);
    })), this._btnClear && this._cleanups.push(w(this._btnClear, "click", () => this.clear())), this._cleanups.push(w(this._btnClose, "click", () => this._closePicker()));
    const t = (a) => {
      this._open && !this._picker.contains(a.target) && a.target !== this._input && this._closePicker();
    };
    document.addEventListener("mousedown", t, !0), this._cleanups.push(() => document.removeEventListener("mousedown", t, !0));
    const e = (a) => this._handleGridKey(a);
    this._grid.addEventListener("keydown", e), this._cleanups.push(() => this._grid.removeEventListener("keydown", e));
    const r = (a) => {
      a.key === "Escape" && (this._closePicker(), this._input.focus());
    };
    this._picker.addEventListener("keydown", r), this._cleanups.push(() => this._picker.removeEventListener("keydown", r));
  }
  // ── Keyboard navigation ────────────────────────────────────────────────────
  _handleGridKey(t) {
    const e = this._opts.dir === "rtl";
    switch (t.key) {
      case "ArrowRight":
        t.preventDefault(), this._moveFocusDays(e ? -1 : 1);
        break;
      case "ArrowLeft":
        t.preventDefault(), this._moveFocusDays(e ? 1 : -1);
        break;
      case "ArrowDown":
        t.preventDefault(), this._moveFocusDays(7);
        break;
      case "ArrowUp":
        t.preventDefault(), this._moveFocusDays(-7);
        break;
      case "Home":
        t.preventDefault(), this._setFocusDate({ year: this._viewYear, month: this._viewMonth, day: 1 });
        break;
      case "End":
        t.preventDefault(), this._setFocusDate({
          year: this._viewYear,
          month: this._viewMonth,
          day: this._calendar.getMonthLength(this._viewYear, this._viewMonth)
        });
        break;
      case "PageDown":
        t.preventDefault(), t.shiftKey ? this._moveFocusYears(1) : this._moveFocusMonths(1);
        break;
      case "PageUp":
        t.preventDefault(), t.shiftKey ? this._moveFocusYears(-1) : this._moveFocusMonths(-1);
        break;
    }
  }
  _moveFocusDays(t) {
    const e = this._calendar.toGregorian(this._focusDate), r = this._calendar.fromGregorian(ye(e, t));
    this._setFocusDate(r);
  }
  _moveFocusMonths(t) {
    const e = this._monthCount();
    let { year: r, month: a, day: s } = this._focusDate;
    for (a += t; a > e; )
      a -= e, r++;
    for (; a < 1; )
      a += e, r--;
    const i = this._calendar.getMonthLength(r, a);
    s > i && (s = i), this._setFocusDate({ year: r, month: a, day: s });
  }
  _moveFocusYears(t) {
    let { year: e, month: r, day: a } = this._focusDate;
    e += t;
    const s = this._calendar.getMonthLength(e, r);
    a > s && (a = s), this._setFocusDate({ year: e, month: r, day: a });
  }
  _setFocusDate(t) {
    this._focusDate = t, (t.year !== this._viewYear || t.month !== this._viewMonth) && (this._viewYear = t.year, this._viewMonth = t.month), this._renderGrid(), this._focusCell(t);
  }
  _focusCell(t) {
    if (!t) return;
    const e = `.mcd-day[data-year="${t.year}"][data-month="${t.month}"][data-day="${t.day}"]:not(.mcd-day--outside)`, r = this._grid.querySelector(e);
    r && r.focus();
  }
  // ── Navigation / open / close ──────────────────────────────────────────────
  _navigate(t) {
    const e = this._monthCount();
    this._viewMonth += t, this._viewMonth > e && (this._viewMonth = 1, this._viewYear++), this._viewMonth < 1 && (this._viewMonth = e, this._viewYear--), this._renderGrid();
  }
  _navigateYear(t) {
    this._viewYear += t, this._renderGrid();
  }
  _openPicker() {
    this._open || (this._picker.style.display = "", _e(this._picker, this._input, this._opts.position), this._open = !0, this._dispatch("mcd:open"));
  }
  _closePicker() {
    this._open && (this._picker.style.display = "none", this._open = !1, this._dispatch("mcd:close"));
  }
  _dispatch(t, e = {}) {
    this._input.dispatchEvent(new CustomEvent(t, { bubbles: !0, detail: e }));
  }
}
function D(n, t, e, r) {
  return {
    "--mcd-primary": n,
    "--mcd-primary-text": t,
    "--mcd-hover-bg": e,
    "--mcd-hover-text": r,
    "--mcd-today-ring": n,
    "--mcd-selected-bg": n,
    "--mcd-selected-text": t,
    "--mcd-day-focus-ring": n,
    "--mcd-day-hover-text": r,
    "--mcd-day-hover-bg": e,
    "--mcd-nav-hover-bg": e,
    "--mcd-nav-hover-text": r,
    "--mcd-btn-today-bg": n,
    "--mcd-btn-today-text": t,
    "--mcd-btn-today-border": n,
    "--mcd-btn-today-hover-bg": n
  };
}
const De = {
  name: "Light",
  description: "Default light theme",
  vars: {
    "--mcd-bg": "#ffffff",
    "--mcd-text": "#111827",
    "--mcd-muted": "#6b7280",
    "--mcd-border": "#e5e7eb",
    "--mcd-primary": "#2563eb",
    "--mcd-primary-text": "#ffffff",
    "--mcd-hover-bg": "#eff6ff",
    "--mcd-hover-text": "#2563eb",
    "--mcd-outside-text": "#d1d5db",
    "--mcd-shadow": "0 10px 30px rgba(0,0,0,.12)",
    "--mcd-radius": "12px",
    ...D("#2563eb", "#ffffff", "#eff6ff", "#2563eb")
  }
}, be = {
  name: "Dark",
  description: "Dark mode",
  vars: {
    "--mcd-bg": "#111827",
    "--mcd-text": "#f9fafb",
    "--mcd-muted": "#9ca3af",
    "--mcd-border": "#374151",
    "--mcd-primary": "#3b82f6",
    "--mcd-primary-text": "#ffffff",
    "--mcd-hover-bg": "#1e3a5f",
    "--mcd-hover-text": "#93c5fd",
    "--mcd-outside-text": "#4b5563",
    "--mcd-shadow": "0 10px 30px rgba(0,0,0,.4)",
    "--mcd-day-text": "#f9fafb",
    "--mcd-today-text": "#f9fafb",
    "--mcd-weekday-text": "#9ca3af",
    "--mcd-nav-text": "#f9fafb",
    "--mcd-select-bg": "#1f2937",
    "--mcd-select-text": "#f9fafb",
    "--mcd-select-border": "#4b5563",
    "--mcd-btn-bg": "#1f2937",
    "--mcd-btn-text": "#f9fafb",
    "--mcd-btn-border": "#4b5563",
    "--mcd-btn-hover-bg": "#1e3a5f",
    "--mcd-btn-hover-text": "#93c5fd",
    ...D("#3b82f6", "#ffffff", "#1e3a5f", "#93c5fd")
  }
}, ve = {
  name: "Midnight",
  description: "Deep dark with indigo accent",
  vars: {
    "--mcd-bg": "#0f172a",
    "--mcd-text": "#e2e8f0",
    "--mcd-muted": "#94a3b8",
    "--mcd-border": "#1e293b",
    "--mcd-primary": "#6366f1",
    "--mcd-primary-text": "#ffffff",
    "--mcd-hover-bg": "#1e1b4b",
    "--mcd-hover-text": "#a5b4fc",
    "--mcd-outside-text": "#334155",
    "--mcd-shadow": "0 10px 40px rgba(0,0,0,.5)",
    "--mcd-radius": "14px",
    "--mcd-day-text": "#e2e8f0",
    "--mcd-today-text": "#e2e8f0",
    "--mcd-weekday-text": "#94a3b8",
    "--mcd-nav-text": "#e2e8f0",
    "--mcd-select-bg": "#1e293b",
    "--mcd-select-text": "#e2e8f0",
    "--mcd-select-border": "#334155",
    "--mcd-btn-bg": "#1e293b",
    "--mcd-btn-text": "#e2e8f0",
    "--mcd-btn-border": "#334155",
    "--mcd-btn-hover-bg": "#1e1b4b",
    "--mcd-btn-hover-text": "#a5b4fc",
    ...D("#6366f1", "#ffffff", "#1e1b4b", "#a5b4fc")
  }
}, we = {
  name: "Ocean",
  description: "Deep ocean with cyan accent",
  vars: {
    "--mcd-bg": "#0c4a6e",
    "--mcd-text": "#e0f2fe",
    "--mcd-muted": "#7dd3fc",
    "--mcd-border": "#075985",
    "--mcd-primary": "#22d3ee",
    "--mcd-primary-text": "#0c4a6e",
    "--mcd-hover-bg": "#075985",
    "--mcd-hover-text": "#e0f2fe",
    "--mcd-outside-text": "#0369a1",
    "--mcd-shadow": "0 10px 30px rgba(0,0,0,.35)",
    "--mcd-day-text": "#e0f2fe",
    "--mcd-today-text": "#e0f2fe",
    "--mcd-weekday-text": "#7dd3fc",
    "--mcd-nav-text": "#e0f2fe",
    "--mcd-select-bg": "#075985",
    "--mcd-select-text": "#e0f2fe",
    "--mcd-select-border": "#0369a1",
    "--mcd-btn-bg": "#075985",
    "--mcd-btn-text": "#e0f2fe",
    "--mcd-btn-border": "#0369a1",
    "--mcd-btn-hover-bg": "#0369a1",
    "--mcd-btn-hover-text": "#ffffff",
    ...D("#22d3ee", "#0c4a6e", "#075985", "#e0f2fe")
  }
}, Ae = {
  name: "Warm",
  description: "Warm parchment tones with amber accent",
  vars: {
    "--mcd-bg": "#fffbf0",
    "--mcd-text": "#1c1917",
    "--mcd-muted": "#78716c",
    "--mcd-border": "#e7e5e4",
    "--mcd-primary": "#b45309",
    "--mcd-primary-text": "#ffffff",
    "--mcd-hover-bg": "#fef3c7",
    "--mcd-hover-text": "#b45309",
    "--mcd-outside-text": "#d6d3d1",
    "--mcd-shadow": "0 8px 24px rgba(180,83,9,.12)",
    "--mcd-radius": "10px",
    "--mcd-select-bg": "#fff7ed",
    "--mcd-select-text": "#1c1917",
    "--mcd-select-border": "#d6d3d1",
    ...D("#b45309", "#ffffff", "#fef3c7", "#b45309")
  }
}, Me = {
  name: "Rose",
  description: "Rose / pink accent on light background",
  vars: D("#e11d48", "#ffffff", "#fff1f2", "#e11d48")
}, Se = {
  name: "Emerald",
  description: "Green accent on light background",
  vars: D("#059669", "#ffffff", "#ecfdf5", "#059669")
}, Ee = {
  name: "Amber",
  description: "Warm gold accent on light background",
  vars: D("#d97706", "#ffffff", "#fffbeb", "#d97706")
}, Ce = {
  name: "Violet",
  description: "Purple accent on light background",
  vars: D("#7c3aed", "#ffffff", "#f5f3ff", "#7c3aed")
}, ke = {
  name: "Teal",
  description: "Teal accent on light background",
  vars: D("#0d9488", "#ffffff", "#f0fdfa", "#0d9488")
}, Te = {
  light: De,
  dark: be,
  midnight: ve,
  ocean: we,
  warm: Ae,
  rose: Me,
  emerald: Se,
  amber: Ee,
  violet: Ce,
  teal: ke
};
Object.entries(Te).forEach(([n, t]) => S.register(n, t));
const G = {
  /**
   * Initialise one or more datepickers.
   * If selector is omitted, scans the document for [data-mcd] elements.
   */
  init(n, t = {}) {
    if (!n) {
      document.querySelectorAll("[data-mcd]").forEach((e) => {
        G._initElement(e, {});
      });
      return;
    }
    if (typeof n == "string") {
      const e = E(n);
      return e ? G._initElement(e, t) : null;
    }
    return G._initElement(n, t);
  },
  _initElement(n, t) {
    const e = Object.assign({}, G._readDataAttrs(n), t);
    return new ct(n, e);
  },
  _readDataAttrs(n) {
    const t = {};
    return n.dataset.calendar && (t.calendar = n.dataset.calendar), n.dataset.locale && (t.locale = n.dataset.locale), n.dataset.dir && (t.dir = n.dataset.dir), n.dataset.output && (t.outputTarget = n.dataset.output), n.dataset.result && (t.resultTarget = n.dataset.result), n.dataset.format && (t.displayFormat = n.dataset.format), n.dataset.theme && (t.theme = n.dataset.theme), n.dataset.digits && (t.digits = n.dataset.digits), n.dataset.hijriMode && (t.hijriMode = n.dataset.hijriMode), n.dataset.gregorianMonths && (t.gregorianMonths = n.dataset.gregorianMonths), n.dataset.hijriAdjust && (t.hijriAdjust = parseInt(n.dataset.hijriAdjust, 10)), n.dataset.mode && (t.mode = n.dataset.mode), n.dataset.secondary && (t.secondaryCalendar = n.dataset.secondary), n.dataset.weekStart && (t.weekStart = parseInt(n.dataset.weekStart, 10)), n.dataset.allowInput && (t.allowInput = n.dataset.allowInput === "true"), n.dataset.resultTemplate && (t.resultTemplate = n.dataset.resultTemplate), t;
  },
  // ── Sub-modules ────────────────────────────────────────────────────────
  Datepicker: ct,
  registerCalendar: C,
  getCalendar: bt,
  getRegisteredCalendars: le,
  formatDate: R,
  parseDate: St,
  ResultRenderer: M,
  /** Append official Umm al-Qura data for years after AH 1500 (post-2077). */
  extendUmmalquraData: Pt,
  isOfficialUmmalquraYear: Nt,
  /** Theme system */
  themes: S
};
typeof window < "u" && (window.MultiCalendarDatepicker = G);
export {
  ct as Datepicker,
  M as ResultRenderer,
  S as ThemeManager,
  G as default,
  Pt as extendUmmalquraData,
  R as formatDate,
  bt as getCalendar,
  Nt as isOfficialUmmalquraYear,
  St as parseDate,
  C as registerCalendar
};
