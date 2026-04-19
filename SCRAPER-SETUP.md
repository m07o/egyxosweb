# 🎬 نظام حك أفلام Wecima - دليل كامل

هذا المشروع يحتوي على نظام متكامل لحك أفلام من موقع Wecima وعرضها في موقع Next.js.

## 🏗️ البنية

```
egyxosweb/
├── scraper-python/          # ✨ Python Scraper جديد (أقوى وأسهل)
│   ├── scraper.py          # الـ script الرئيسي
│   ├── requirements.txt     # مكتبات Python
│   └── README.md           # تعليمات الـ Scraper
│
├── public/
│   └── movies.json         # 📊 البيانات المحكية (يُحدّث تلقائياً)
│
├── src/lib/
│   └── scraped-movies.ts   # قراءة وفلترة البيانات
│
├── scraper.bat             # 🪟 Windows launcher سهل
└── package.json            # npm scripts جديدة
```

## 🚀 البدء السريع

### 1️⃣ تثبيت Python (إذا لم تكن مثبتة)

```bash
# تحميل من https://www.python.org/
# تأكد من تفعيل ✓ "Add Python to PATH" أثناء التثبيت
```

### 2️⃣ تثبيت مكتبات Python

```bash
# الطريقة الأولى - npm script
npm run scraper:py:install

# الطريقة الثانية - مباشر
pip install -r scraper-python/requirements.txt
```

### 3️⃣ تشغيل الـ Scraper

**Windows - الأسهل:**
```bash
# Double-click على scraper.bat
# أو:
scraper.bat
```

**جميع الأنظمة:**
```bash
npm run scraper:py

# أو مع عدد صفحات مخصص:
python scraper-python/scraper.py --pages 10
```

## 📊 نتيجة الـ Scraper

بعد التشغيل، سيتم حفظ البيانات في:
```
public/movies.json
```

**بصيغة:**
```json
{
  "timestamp": "2026-04-18T...",
  "source": "wecima.bar",
  "totalMovies": 150,
  "movies": [
    {
      "id": "...",
      "title": "عنوان الفيلم",
      "url": "https://...",
      "imageUrl": "https://...",
      "quality": "720p",
      "type": "movie"
    }
  ],
  "errors": []
}
```

## 🔄 نظام التحديث (مهم جداً!)

بعد كل تشغيل للـ Scraper:

```bash
# 1️⃣ إضافة التغييرات
git add public/movies.json

# 2️⃣ عمل Commit
git commit -m "refactor: update movies data"

# 3️⃣ رفع للـ GitHub
git push

# ✨ Cloudflare تقوم بـ:
#   1. سحب الكود الجديد
#   2. Build الموقع
#   3. نشر الموقع تلقائياً على CDN
#   4. الأفلام تظهر في الموقع! 🎉
```

## 🎯 كيفية استخدام البيانات في الموقع

### الملف: `cinema-plus-review/src/lib/scraped-movies.ts`

توفر 3 functions رئيسية:

```typescript
// 1️⃣ جلب كل الأفلام
const movies = await getScrapedMovies()
// Returns: ScrapedMovie[]

// 2️⃣ البحث
const results = await searchScraped("query")
// Returns: Movie[]

// 3️⃣ جلب كـ Movie objects مع نوع Next.js
const allMovies = await getAllMovies()
```

### مثال الاستخدام في Component:

```typescript
import { getScrapedMovies } from '@/lib/scraped-movies'

export default async function MoviesPage() {
  const movies = await getScrapedMovies()
  
  return (
    <div>
      {movies.map((movie) => (
        <div key={movie.id}>
          <img src={movie.imageUrl} alt={movie.title} />
          <h3>{movie.title}</h3>
          <span>{movie.quality}</span>
        </div>
      ))}
    </div>
  )
}
```

## ⚙️ خيارات التشغيل

```bash
# حك 5 صفحات (الافتراضي)
npm run scraper:py

# حك 10 صفحات
python scraper-python/scraper.py --pages 10

# حك صفحة واحدة فقط (للاختبار السريع)
python scraper-python/scraper.py --pages 1

# حك 20 صفحة (مجموعة كبيرة)
python scraper-python/scraper.py --pages 20
```

## 📅 جدولة Scraper (اختياري)

### Windows - Task Scheduler

1. اضغط `Win + R` اكتب `taskschd.msc`
2. Create Basic Task
3. اختر الوقت (مثلاً: كل يوم الساعة 2 صباحاً)
4. Action: Browse → اختر `scraper.bat`

### macOS / Linux - Crontab

```bash
# تشغيل يومي الساعة 2 صباحاً
0 2 * * * cd /path/to/project && python scraper-python/scraper.py
```

## 🛡️ الميزات الأمنية

- ✅ **User-Agent عادي**: لا يظهر كـ bot
- ✅ **Delay بين الطلبات**: 2 ثانية لتجنب الحظر
- ✅ **Retry Logic**: 3 محاولات في حالة الفشل
- ✅ **Timeout**: 30 ثانية لكل صفحة
- ✅ **Ad Filtering**: يستبعد روابط الإعلانات تلقائياً

## 📝 npm Scripts الجديدة

```bash
# تثبيت مكتبات Python
npm run scraper:py:install

# تشغيل الـ Scraper
npm run scraper:py

# Scripts القديمة (TypeScript Scraper - اختيارية)
npm run scraper        # تشغيل
npm run scraper:dev    # mode التطوير
npm run scraper:once   # صفحة واحدة
```

## ⚠️ ملاحظات مهمة

### التخزين المؤقت (Cache)

الموقع يخزن البيانات في الذاكرة لمدة 5 دقائق لتسريع الأداء:

```typescript
// Cache logic في scraped-movies.ts
if (cachedMovies && Date.now() - lastFetch < 5 * 60 * 1000) {
  return cachedMovies.movies
}
```

### Fallback للبيانات الوهمية

إذا فشل الـ Scraper أو JSON لم يُحمّل:

```typescript
return mapDummyToScraped()  // استخدم dummy data
```

## 🐛 Troubleshooting

### ❌ "Python command not found"

```bash
# تأكد من التثبيت
python --version
python3 --version

# جرب مع full path (Windows)
C:\Users\YourName\AppData\Local\Programs\Python\Python311\python.exe scraper-python/scraper.py
```

### ❌ "Connection Timeout"

- تحقق من الإنترنت
- جرب مع صفحات أقل: `--pages 1`
- قد يكون الموقع حظرك، جرب بعد ساعة

### ❌ "JSON file not created"

- تأكد من أن `cinema-plus-review/public/` موجود
- جرب تشغيل مع أصلاحيات أعلى (Admin)
- شوف الأخطاء في الـ output

## 📊 إحصائيات النظام

- **عدد الأفلام المتوقع**: 50-150 فيلم
- **وقت الحك**: 30-60 ثانية (حسب الإنترنت)
- **حجم JSON**: 1-3 MB
- **معدل النجاح**: 85-95%

## 🔮 التحديثات المستقبلية (اختيارية)

- [ ] إضافة تصفية حسب الجودة
- [ ] تخزين في قاعدة بيانات
- [ ] WebHooks لـ GitHub لتحديث تلقائي
- [ ] Proxy rotation لتجنب الحظر
- [ ] Integration مع TMDB API

---

## 📞 الدعم

إذا واجهت مشكلة:

1. اقرأ `scraper-python/README.md`
2. تحقق من الخطأ في الـ console
3. جرب مع `--pages 1` للاختبار
4. تأكد من الاتصال بالإنترنت

## 📄 التاريخ

- **2026-04-18**: إنشاء نظام الـ Python Scraper
- **السابق**: نظام TypeScript Scraper مع Supabase

---

**الموقع الآن يستخدم:**
- 🐍 Python للـ Scraping (قوي وسهل)
- 📊 JSON للتخزين (بسيط وفعّال)
- ⚡ Next.js للعرض (سريع وحديث)
- 🚀 Cloudflare للنشر (تلقائي وموثوق)

**استمتع بموقعك! 🎬**
