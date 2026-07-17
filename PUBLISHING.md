# دليل النشر — Publishing guide

كل شيء جاهز محلياً (git repo + CI + Pages workflow). الخطوات التالية تحتاج حساباتك أنت.

## 1) GitHub (مرة واحدة)

1. أنشئ مستودعاً جديداً على github.com باسم `multi-calendar-datepicker` (Public، بدون README — عندنا واحد)
2. استبدل `YOUR_GITHUB_USERNAME` باسم حسابك في:
   - `package.json` (حقول repository / homepage / bugs)
   - `README.md` (شارة CI في الأعلى)
3. ثم من مجلد المشروع:

```powershell
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/multi-calendar-datepicker.git
git branch -M main
git push -u origin main
```

4. **تفعيل الديمو الحي**: من إعدادات المستودع على GitHub:
   `Settings ← Pages ← Source: GitHub Actions`
   — سيعمل workflow النشر تلقائياً مع أول push، والديمو سيكون على:
   `https://YOUR_GITHUB_USERNAME.github.io/multi-calendar-datepicker/`

5. شارة CI ستتحول خضراء تلقائياً بعد أول تشغيل ناجح للاختبارات (58 اختباراً).

## 2) npm (مرة واحدة)

1. أنشئ حساباً على npmjs.com إن لم يكن عندك، ثم:

```powershell
npm login
# تحقق أولاً أن الاسم متاح:
npm view multi-calendar-datepicker
# إن كان محجوزاً، غيّر "name" في package.json (مثلاً @yourname/multi-calendar-datepicker)

npm publish --access public
```

2. بعد النشر، مكتبتك متاحة تلقائياً عبر CDN أيضاً:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/multi-calendar-datepicker/dist/multi-calendar-datepicker.css">
<script src="https://cdn.jsdelivr.net/npm/multi-calendar-datepicker/dist/multi-calendar-datepicker.js"></script>
```

## 3) الإصدارات القادمة — كل تحديث مستقبلاً

```powershell
# 1. عدّل الكود في src/ فقط (لا تلمس dist يدوياً)
npm run build          # يولّد dist
npm test               # 58+ اختباراً يجب أن تكون خضراء
# 2. حدّث CHANGELOG.md ورقم الإصدار:
npm version patch      # أو minor / major حسب حجم التغيير
git push --follow-tags
npm publish
```

## 4) أفكار الانتشار (عند الجاهزية)

- مقال: «لماذا يعرض متصفحك التاريخ الهجري خطأً؟» — القصة كاملة موثقة في `docs/ACCURACY.md`
- انشر في: حسوب I/O، مجتمعات X التقنية السعودية، r/javascript (بزاوية official Umm al-Qura accuracy)
- أضف المستودع إلى قوائم awesome: awesome-arabic, awesome-datepickers
- الجمهور المؤسسي: أنظمة حكومية وبنوك وتطبيقات HR خليجية — وثيقة الدقة مكتوبة لهم تحديداً
