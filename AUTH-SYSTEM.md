# نظام التسجيل والدخول الموحد

## 🎯 المميزات

- ✅ **صفحة رئيسية موحدة**: الجميع يروح `/` مباشرة
- ✅ **تسجيل موحد**: نفس الصفحة للمستخدمين والأدمن
- ✅ **دخول موحد**: نفس الصفحة مع اختيار النوع
- ✅ **Routing ذكي**: كل نوع يروح المكان الصحيح
- ✅ **حماية من Brute Force**: 5 محاولات فاشلة = حظر 15 دقيقة

## 🔄 رحلة المستخدم

### 1️⃣ الزائر العادي
```
يزور الموقع → يشوف الصفحة الرئيسية (/)
```

### 2️⃣ مستخدم عادي
```
/ → "تسجيل جديد" → /signup
  ↓ (اختيار "مستخدم عادي" + ملء البيانات)
  ↓ POST /api/auth/register
  ↓
/login → تسجيل الدخول
  ↓ (اختيار "مستخدم عادي" + البريد + كلمة السر)
  ↓ signIn('user-credentials')
  ↓
/profile ← صفحة الملف الشخصي
```

### 3️⃣ أدمن
```
/ → "تسجيل جديد" → /signup
  ↓ (اختيار "أدمن" + بيانات + كلمة الأدمن الرئيسية)
  ↓ POST /api/auth/admin-register
  ↓
/login → تسجيل الدخول
  ↓ (اختيار "أدمن" + اسم المستخدم + كلمة السر)
  ↓ signIn('admin-credentials')
  ↓
/dashboard ← لوحة التحكم
```

## 📋 الصفحات

| الصفحة | الرابط | الوصف |
|-------|--------|-------|
| الرئيسية | `/` | Landing page مع مميزات |
| التسجيل | `/signup` | تسجيل (مستخدم + أدمن) |
| الدخول | `/login` | دخول موحد مع toggle |
| الملف الشخصي | `/profile` | ملف المستخدم العادي |
| الداشبورد | `/dashboard` | لوحة تحكم الأدمن |

## 🔑 بيانات التسجيل

### مستخدم عادي 👤
- **البريد الإلكتروني**: أي بريد صحيح
- **الاسم**: اختياري
- **كلمة السر**: 6 أحرف على الأقل

### أدمن 🔐
- **اسم المستخدم**: اختياري (أي نص)
- **كلمة السر**: 6 أحرف على الأقل
- **كلمة الأدمن الرئيسية**: `admin-master-key-123` (من `.env`)

## 🚀 الخطوات الأولى

### 1. تشغيل الخادم
```bash
npm run dev
```

### 2. زيارة الموقع
```
http://localhost:3000
```

### 3. تسجيل مستخدم عادي
- اضغط "تسجيل جديد"
- اختر "مستخدم عادي"
- أدخل البريد + كلمة السر
- اضغط "إنشاء الحساب"
- ادخل من `/login` كـ "مستخدم عادي"

### 4. تسجيل أدمن
- اضغط "تسجيل جديد"
- اختر "أدمن"
- أدخل اسم المستخدم + كلمة السر
- أدخل كلمة الأدمن الرئيسية: `admin-master-key-123`
- اضغط "إنشاء الحساب"
- ادخل من `/login` كـ "أدمن"

## 🗄️ قاعدة البيانات

### جدول Users
```prisma
model User {
  id            String
  email         String @unique
  password      String (hashed)
  name          String?
  isBanned      Boolean
  createdAt     DateTime
}
```

### جدول Admins
```prisma
model Admin {
  id        String
  username  String @unique
  password  String (hashed)
  email     String?
  createdAt DateTime
}
```

## 🔐 الأمان

### تشفير
- ✅ كلمات المرور: bcryptjs
- ✅ الجلسات: JWT
- ✅ NEXTAUTH_SECRET: 32+ حرف

### Brute Force Protection
- 5 محاولات فاشلة
- حظر 15 دقيقة
- حفظ السجل في logs

## 📊 متغيرات البيئة المطلوبة

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="my-super-secret-key-123456789-at-least-32-chars"

# Admin Master Password
ADMIN_MASTER_PASSWORD="admin-master-key-123"
```

## ✨ الخصائص

- ✅ واجهة عربية كاملة
- ✅ Dark theme احترافي
- ✅ Toast notifications للأخطاء
- ✅ Responsive Design (موبايل + ديسك توب)
- ✅ تسجيل الأخطاء (console logs)
- ✅ Session Management (JWT)

## 🐛 Troubleshooting

### "خطأ في التسجيل"
- تأكد من أن `ADMIN_MASTER_PASSWORD` صحيح
- تحقق من `npm run db:push`

### "الجلسة منتهية"
- أعد تحميل الصفحة
- تسجيل الدخول مرة أخرى

### Brute Force Protection activated
- انتظر 15 دقيقة
- أو غير IP Address

## 📝 الملفات المهمة

```
src/app/
├── page.tsx                    ← الصفحة الرئيسية
├── signup/page.tsx             ← التسجيل الموحد
├── login/page.tsx              ← الدخول الموحد
├── profile/page.tsx            ← ملف المستخدم
├── dashboard/page.tsx          ← لوحة الأدمن
└── api/auth/
    ├── register/route.ts       ← API تسجيل مستخدم
    └── admin-register/route.ts ← API تسجيل أدمن

src/lib/
├── auth.ts                     ← Next-Auth config
└── db.ts                       ← Prisma client
```

## 🎓 مثال على الدخول

### مستخدم عادي مثال
```
اسم المستخدم: user@example.com
كلمة السر: password123
```

### أدمن مثال
```
اسم المستخدم: admin
كلمة السر: admin123
```

## 🔄 الخطوات التالية (اختيارية)

- [ ] إضافة تغيير كلمة المرور
- [ ] التحقق من البريد الإلكتروني
- [ ] OAuth (Google/GitHub)
- [ ] Two-Factor Authentication
- [ ] صورة الملف الشخصي

