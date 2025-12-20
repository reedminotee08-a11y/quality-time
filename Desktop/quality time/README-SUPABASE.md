# إعداد Supabase لمتجر الساعات الفاخرة "Quality Time"

## نظرة عامة
هذا الدليل يشرح كيفية إعداد Supabase من الصفر لمتجر الساعات الفاخرة.

## الخطوات المطلوبة

### 1. إنشاء حساب Supabase
1. اذهب إلى [https://supabase.com](https://supabase.com)
2. انقر على "Sign Up" وإنشاء حساب جديد
3. قم بتأكيد بريدك الإلكتروني

### 2. إنشاء مشروع جديد
1. بعد تسجيل الدخول، انقر على "New Project"
2. اختر منظمتك أو أنشئ منظمة جديدة
3. أدخل اسم المشروع: `quality-time-store`
4. اختر قاعدة البيانات: PostgreSQL
5. اختر المنطقة الأقرب لعملائك (مثل: UAE)
6. إنشاء كلمة مرور قاعدة البيانات
7. انقر على "Create new project"

### 3. الحصول على مفاتيح API
1. اذهب إلى Settings > API
2. ستجد:
   - **Project URL**: رابط مشروعك
   - **anon public**: المفتاح العام
   - **service_role**: المفتاح الخاص (لا تستخدمه في الواجهة الأمامية)

### 4. إعداد متغيرات البيئة
1. انسخ ملف `.env.example` إلى `.env`
2. أضف القيم من Supabase:

```bash
# .env file
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 5. إنشاء جداول قاعدة البيانات
1. اذهب إلى SQL Editor في لوحة تحكم Supabase
2. انسخ محتوى `database/supabase-schema.sql`
3. الصق الكود في المحرر
4. انقر على "Run" لتنفيذ الكود

### 6. إعداد المصادقة (Authentication)
1. اذهب إلى Authentication > Settings
2. في "Site URL"، أضف: `http://localhost:5173`
3. في "Redirect URLs"، أضف:
   - `http://localhost:5173`
   - `http://localhost:5173/**`
4. فتح التسجيل بالبريد الإلكتروني (مفعل افتراضياً)

### 7. إعداد Storage للصور
1. اذهب إلى Storage
2. أنشئ bucket جديد باسم `products`
3. اذهب إلى Settings للـ bucket
4. في "Public Access"، اختر "Public"
5. أضف Policy جديدة:
   ```sql
   CREATE POLICY "Public Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'products');
   ```

### 8. إنشاء مستخدم مسؤول
1. اذهب إلى Authentication > Users
2. انقر على "Add user"
3. أدخل بريد المسؤول وكلمة مرور
4. بعد الإنشاء، اذهب إلى SQL Editor
5. نفذ هذا الاستعلام لجعل المستخدم مسؤولاً:
   ```sql
   UPDATE user_profiles 
   SET role = 'admin' 
   WHERE id = 'user-uuid-here';
   ```

### 9. إدخال بيانات أولية
الـ schema يحتوي بالفعل على بيانات أولية:
- فئات المنتجات
- ماركات الساعات الفاخرة
- إعدادات الموقع الأساسية

### 10. اختبار الاتصال
1. شغل التطبيق: `npm run dev`
2. تحقق من الاتصال بقاعدة البيانات في المتصفح
3. جرب تسجيل الدخول وإنشاء حساب

## هيكل قاعدة البيانات

### الجداول الرئيسية
- **products**: معلومات المنتجات
- **categories**: فئات المنتجات
- **brands**: ماركات الساعات
- **user_profiles**: ملفات المستخدمين
- **orders**: طلبات العملاء
- **order_items**: تفاصيل الطلبات
- **cart**: سلة التسوق
- **reviews**: تقييمات المنتجات
- **wishlist**: قائمة الرغبات
- **settings**: إعدادات الموقع

### السياسات الأمنية (RLS)
- المنتجات: قراءة للجميع، تعديل للمسؤولين فقط
- الطلبات: المستخدمون يرون طلباتهم فقط، المسؤولون يرون الكل
- الملفات الشخصية: كل مستخدم يرى ملفه فقط
- التقييمات: التقييمات المعتمدة للجميع

## الملفات المعدلة

### الخدمات
- `services/SupabaseService.ts`: خدمة للتعامل مع Supabase
- `services/ProductService.ts`: خدمة المنتجات (تم تحديثها)

### الهوكات
- `hooks/useSupabase.ts`: هوك للمصادقة
- `hooks/useProducts.ts`: هوك للمنتجات (تم تحديثه)

### قاعدة البيانات
- `database/supabase-schema.sql`: schema كامل لقاعدة البيانات

### الإعدادات
- `supabaseClient.ts`: تم تحديثه لاستخدام متغيرات البيئة
- `.env.example`: قالب لملف البيئة

## استكشاف الأخطاء

### مشاكل شائعة
1. **CORS Error**: تأكد من إضافة رابط التطبيق في إعدادات Supabase
2. **Permission Denied**: تحقق من سياسات RLS
3. **Storage Access**: تأكد من إعدادات الـ Storage Policies

### الأوامر المفيدة
```sql
-- التحقق من الجداول
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- التحقق من المستخدمين
SELECT * FROM auth.users;

-- التحقق من السياسات
SELECT * FROM pg_policies;
```

## النشر

### للبيئة الإنتاجية
1. أنشئ مشروع Supabase جديد للإنتاج
2. انسخ قاعدة البيانات من التطوير إلى الإنتاج
3. حدث متغيرات البيئة
4. أضف نطاق موقعك في إعدادات Supabase

### النسخ الاحتياطي
1. استخدم Supabase Dashboard للنسخ الاحتياطي التلقائي
2. أو استخدم pg_dump للنسخ الاحتياطي اليدوي

## الدعم
- [وثائق Supabase](https://supabase.com/docs)
- [دليل React](https://supabase.com/docs/guides/with-react)
- [مجتمع Supabase](https://github.com/supabase/supabase/discussions)
