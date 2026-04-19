# 🎬 Python Wecima Scraper

سكرابر قوي لحك أفلام من موقع Wecima وحفظها في JSON للموقع الرئيسي.

## ⚙️ متطلبات التثبيت

- **Python 3.8+**
- **pip** (مدير حزم Python)

## 🚀 البدء السريع

### 1️⃣ تثبيت المتطلبات (مرة واحدة فقط)

```bash
# Windows
python -m pip install -r scraper-python/requirements.txt

# macOS / Linux
python3 -m pip install -r scraper-python/requirements.txt
```

أو استخدم npm script:
```bash
npm run scraper:py:install
```

### 2️⃣ تشغيل الـ Scraper

**الطريقة الأولى - Windows (الأسهل):**
```bash
# Double-click على ملف scraper.bat
# أو شغل من Terminal:
scraper.bat
```

**الطريقة الثانية - npm script:**
```bash
npm run scraper:py
```

**الطريقة الثالثة - مباشر Python:**
```bash
python scraper-python/scraper.py --pages 5
```

## 📊 خيارات التشغيل

```bash
# حك 5 صفحات (افتراضي)
python scraper-python/scraper.py

# حك 10 صفحات
python scraper-python/scraper.py --pages 10

# حك صفحة واحدة فقط (للاختبار)
python scraper-python/scraper.py --pages 1
```

## 📁 ملف الإخراج

البيانات تُحفظ في:
```
egyxosweb/public/movies.json
```

**بنية الملف:**
```json
{
  "timestamp": "2026-04-18T12:00:00.000000",
  "source": "wecima.bar",
  "totalMovies": 150,
  "movies": [
    {
      "id": "movie-slug",
      "title": "عنوان الفيلم",
      "url": "https://wecima.bar/...",
      "imageUrl": "https://...",
      "quality": "720p",
      "type": "movie"
    }
  ],
  "errors": []
}
```

## 🔄 نظام التحديث

بعد تشغيل الـ Scraper:

```bash
# 1️⃣ إضافة التغييرات
git add public/movies.json

# 2️⃣ عمل Commit
git commit -m "refactor: update movies data from wecima"

# 3️⃣ الـ Push
git push

# 4️⃣ Cloudflare تقوم بـ Build وتنشر تلقائياً! 🚀
```

## 🎯 كيف الموقع يستخدم البيانات

الملف `cinema-plus-review/src/lib/scraped-movies.ts` يقرأ الـ JSON ويوفر:

```typescript
// جلب كل الأفلام المحكية
const movies = await getScrapedMovies()

// البحث
const results = await searchScraped("query")

// مع fallback للـ Dummy Data
```

## ⚠️ ملاحظات مهمة

- **Delay بين الصفحات:** الـ scraper يضع تأخير 2 ثانية بين الصفحات لتجنب الحظر
- **User-Agent:** يستخدم متصفح عادي لتجنب الكشف
- **Retry Logic:** يحاول 3 مرات في حالة فشل الاتصال
- **Fallback:** إذا فشل الـ scraper، الموقع يستخدم Dummy Data

## 🛠️ Troubleshooting

### ❌ "Python غير موجود"
```bash
# تأكد من تثبيت Python
python --version

# أو جرب python3
python3 --version
```

### ❌ "SSL Certificate Error"
```bash
# قد تحتاج لتحديث الشهادات (macOS/Linux)
/Applications/Python\ 3.x/Install\ Certificates.command
```

### ❌ "Connection Timeout"
- تحقق من الاتصال بالإنترنت
- حاول مع صفحات أقل: `--pages 1`

## 📝 مثال كامل - سير العمل

```bash
# 1️⃣ تثبيت المتطلبات (المرة الأولى)
npm run scraper:py:install

# 2️⃣ تشغيل الـ Scraper (كل مرة تريد تحديث)
npm run scraper:py

# أو Windows:
scraper.bat

# 3️⃣ رفع البيانات
git add cinema-plus-review/public/movies.json
git commit -m "refactor: update movies"
git push
```

## 📅 جدول Cron (اختياري)

لتشغيل الـ scraper تلقائياً مثلاً كل يوم:

**Windows Task Scheduler:**
1. `Win + R` → `taskschd.msc`
2. Create Basic Task
3. Set Trigger: يومي في الساعة المطلوبة
4. Action: `scraper.bat`

**macOS/Linux Cron:**
```bash
# تشغيل يومياً في الساعة 2 صباحاً
0 2 * * * cd /path/to/project && python scraper-python/scraper.py
```

---

**تم البناء باستخدام:**
- 🐍 Python 3.8+
- 📦 requests + BeautifulSoup4
- 📅 datetime

**آخر تحديث:** 2026-04-18
