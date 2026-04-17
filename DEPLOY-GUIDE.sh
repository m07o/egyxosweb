# ═══════════════════════════════════════════════════════════════
# egyxosweb - أوامر التثبيت والنشر الكاملة
# ═══════════════════════════════════════════════════════════════
# اتبع هذه الأوامر بالترتيب لإنشاء المشروع من الصفر ونشره
# ═══════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════
# الخطوة 0: المتطلبات الأساسية
# ═══════════════════════════════════════════════════════════════
# - Node.js 18+
# - حساب Supabase (مع مشروع PostgreSQL)
# - حساب Cloudflare (مع نطاق مخصص)
# - Wrangler CLI: npm install -g wrangler
# ═══════════════════════════════════════════════════════════════


# ═══════════════════════════════════════════════════════════════
# الخطوة 1: مسح الكاش والملفات القديمة
# ═══════════════════════════════════════════════════════════════
rm -rf node_modules
rm -rf .next
rm -rf .open-next
rm -rf .worker-next
rm -rf dist
rm -f bun.lock
rm -f package-lock.json
rm -f yarn.lock


# ═══════════════════════════════════════════════════════════════
# الخطوة 2: تثبيت الحزم
# ═══════════════════════════════════════════════════════════════
npm install


# ═══════════════════════════════════════════════════════════════
# الخطوة 3: إعداد قاعدة البيانات (Supabase PostgreSQL)
# ═══════════════════════════════════════════════════════════════
# قبل هذا: غيّر DATABASE_URL و DIRECT_URL في ملف .env
# إلى قيم Supabase الحقيقية

# توليد Prisma Client
npx prisma generate

# دفع الـ Schema إلى Supabase (ينشئ الجداول)
npx prisma db push

# إنشاء Migration (اختياري - للتتبع)
npx prisma migrate dev --name init

# زرع البيانات الأولية (admin/admin123)
npx prisma db seed


# ═══════════════════════════════════════════════════════════════
# الخطوة 4: إعداد السكرابر (Scraper Engine)
# ═══════════════════════════════════════════════════════════════
cd scraper-engine
npm install
npx prisma generate
cd ..

# اختبار السكرابر (صفحة واحدة)
npm run scraper:once

# تشغيل كامل (5 صفحات)
npm run scraper


# ═══════════════════════════════════════════════════════════════
# الخطوة 5: تسجيل الدخول في Cloudflare
# ═══════════════════════════════════════════════════════════════
# هذا يفتح المتصفح لتسجيل الدخول
npx wrangler login


# ═══════════════════════════════════════════════════════════════
# الخطوة 6: إعداد Secrets على Cloudflare
# ═══════════════════════════════════════════════════════════════
# لا تضع Secrets في ملف .env أو wrangler.jsonc
# استخدم هذه الأوامر:

npx wrangler secret put DATABASE_URL
# الصق قيمة الـ Connection Pooling URL من Supabase

npx wrangler secret put DIRECT_URL
# الصق قيمة الـ Direct URL من Supabase

npx wrangler secret put NEXTAUTH_SECRET
# الصق سلسلة عشوائية 64 حرف

npx wrangler secret put NEXTAUTH_URL
# https://egyxosweb.com


# ═══════════════════════════════════════════════════════════════
# الخطوة 7: Build مع OpenNext لـ Cloudflare
# ═══════════════════════════════════════════════════════════════
# هذا يحول Next.js build إلى Cloudflare Worker
npx @opennextjs/cloudflare build

# أو استخدم السكريبت:
npm run build:cf


# ═══════════════════════════════════════════════════════════════
# الخطوة 8: نشر على Cloudflare
# ═══════════════════════════════════════════════════════════════
npx wrangler deploy

# أو استخدم السكريبت:
npm run deploy


# ═══════════════════════════════════════════════════════════════
# الخطوة 9: التطوير المحلي مع Cloudflare
# ═══════════════════════════════════════════════════════════════
# يشغل المشروع محلياً مع Cloudflare Workers runtime
npx wrangler dev

# أو:
npm run dev


# ═══════════════════════════════════════════════════════════════
# أوامر مساعدة
# ═══════════════════════════════════════════════════════════════

# فتح Prisma Studio (واجهة إدارة قاعدة البيانات)
npx prisma studio

# عرض سجلات Cloudflare
npx wrangler tail

# عرض إحصائيات النشر
npx wrangler deployments list

# حذف نشر سابق
npx wrangler rollback

# ═══════════════════════════════════════════════════════════════
# حل المشاكل الشائعة
# ═══════════════════════════════════════════════════════════════

# إذا واجهت خطأ: WORKER_SELF_REFERENCE references Worker '...'
# تأكد أن اسم الـ Worker في wrangler.jsonc = 'egyxosweb'
# وأن service binding يشير لنفس الاسم

# إذا واجهت خطأ: Cannot find module '@prisma/client'
# npm install @prisma/client
# npx prisma generate

# إذا واجهت خطأ: P2021 - Table does not exist
# rm -rf .next && npx prisma db push --force-reset
# npx prisma db seed
