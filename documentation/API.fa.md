# قرارداد API فعلی

مرجع: [`route.ts`](../hosted/app/api/data/route.ts). API داخلی برنامه است، نه API عمومی پایدار برای اتصال نرم‌افزار حسابداری. همه مسیرها هویت معتبر Sites می‌خواهند.

## درخواست مشترک

GET و POST روی `/api/data`؛ پارامتر `?demo=1` برای فضای تستی همان حساب. POST بدنه JSON و Origin دقیقاً برابر origin درخواست می‌خواهد. همه عملیات POST دارای `kind` و `id` هستند؛ رابط برای هر عملیات `crypto.randomUUID()` می‌سازد. همان id فقط برای retry همان عملیات استفاده شود.

JSON بیش از ۵۰٬۰۰۰ کاراکتر رد می‌شود؛ این محدودیت در کد طول رشته است، نه بایت. ورودی مبلغ به تومان است؛ پاسخ‌های ذخیره‌شده ریال هستند. پاسخ‌ها Cache-Control: no-store دارند. هیچ restaurant_id از بدنه، اختیار انتخاب مجموعه نمی‌دهد.

## GET

برای حساب بدون مجموعه: `{"restaurant":null,"records":[]}`. برای مجموعه موجود: restaurant، records (با data تبدیل‌شده از JSON)، lots و moves. رکوردها و moves هرکدام تا ۱۰۰۰ مورد؛ صفحه‌بندی موجود نیست. lots بدون سقف صریح است. restaurant شامل id، owner، name، city و created است؛ این مسیر عمومی نیست.

## عملیات POST

| kind | فیلدها علاوه بر id/kind | نتیجه |
|---|---|---|
| `restaurant` | name, city | ایجاد مجموعه واقعی؛ اگر موجود باشد no-op |
| `seed_demo` | بدون فیلد دیگر؛ فقط demo=1 | ایجاد نمونه‌ها در محدوده تستی حساب |
| `ingredient` | name, unit, packQuantity, price, source؛ catalogId اختیاری | نسخه قیمت ماده |
| `blend` | name, parts آرایه یا JSON string؛ previousId اختیاری | ingredient دارای components؛ اصلاح previousId catalogId را نگه می‌دارد |
| `recipe` | name, servings, sale, pack, lines | ذخیره snapshot رسپی و محاسبه هزینه |
| `purchase` | ingredientId, packQuantity, count, total, supplier, location, expires | lot و نسخه قیمت جدید؛ خرید ترکیب داخلی ممنوع |
| `stock_waste` | lotId, quantity, reason | کاهش موجودی و هزینه از همان lot |
| `waste` | name, quantity متن، cost, reason | دورریز مستقل بدون کاهش stock |
| `sale` | recipeId, count, channel, unitPrice, discount, commission, delivery, deliveryReceived, pack؛ usage0… اختیاری | مصرف اتمی و snapshot فروش امروز تهران |
| `public_menu` | name, description اختیاری، recipeIds به‌صورت JSON string؛ description:ID و category:ID اختیاری | منوی ذخیره‌شده شامل فقط نام، توضیح، دسته و قیمت عمومی |

parts هر جزء `{id,percent}` دارد. lines هر ردیف `{id,quantity,yield}` دارد. idهای وابسته باید متعلق به همان مجموعه باشند. expires رشته تاریخ معتبر YYYY-MM-DD یا خالی/null است. public_menu حداکثر ۳۰ دستور متفاوت می‌پذیرد؛ در این نسخه ویرایش لینک منتشرشده یا ابطال ندارد.

## نمونه‌ها (همه فرضی)

```json
{"id":"11111111-1111-4111-8111-111111111111","kind":"ingredient","catalogId":"milk","name":"شیر","unit":"ml","packQuantity":"1000","price":"55000","source":"قیمت تستی"}
```

در نمونه‌های بعدی شناسه واقعی رکوردی که از GET گرفته‌اید جایگزین `INGREDIENT_ID` و مانند آن شود؛ این نام‌ها مقدار اجرایی نیستند.

```json
{"id":"22222222-2222-4222-8222-222222222222","kind":"blend","name":"مخلوط ۷۰/۳۰","parts":[{"id":"BEEF_ID","percent":70},{"id":"LAMB_ID","percent":30}]}
```

```json
{"id":"33333333-3333-4333-8333-333333333333","kind":"purchase","ingredientId":"INGREDIENT_ID","packQuantity":1000,"count":2,"total":110000,"supplier":"فروشنده تستی","location":"یخچال","expires":"2026-12-01"}
```

```json
{"id":"44444444-4444-4444-8444-444444444444","kind":"sale","recipeId":"RECIPE_ID","count":2,"channel":"اسنپ","unitPrice":230000,"discount":10000,"commission":40000,"delivery":25000,"deliveryReceived":10000,"pack":16000}
```

## اعتبارسنجی کلیدی

| داده | محدوده فعلی |
|---|---|
| متن عمومی label | غیرخالی، حداکثر ۲۰۰ کاراکتر |
| واحد | g / ml / piece |
| قیمت ورودی money | ۰ تا ۱ میلیارد تومان؛ دقت حداکثر یک ریال |
| مقدار بسته/کل lot | ۰٫۰۰۱ تا ۱۰ میلیون واحد |
| تعداد بسته | صحیح، ۱ تا ۱۰۰٬۰۰۰؛ سقف مقدار کل نیز اعمال می‌شود |
| مقدار انبار | حداکثر سه رقم اعشار در واحد ماده |
| ردیف‌های رسپی | ۱ تا ۶۰؛ مقدار هر ردیف ۰٫۰۰۱ تا ۱ میلیون |
| بازده | ۰٫۰۱ تا ۱۰۰ درصد |
| خروجی رسپی | ۰٫۰۰۱ تا ۱۰٬۰۰۰ پرس |
| تعداد فروش | صحیح، ۱ تا ۱۰٬۰۰۰ |
| تخصیص خریدهای فروش | حداکثر ۲۵ |
| کانال | حضوری / بیرون‌بر / اسنپ |

## پاسخ و خطا

موفقیت معمولاً `{ "ok": true }` با ۲۰۰ یا ۲۰۱ است؛ برای داده تازه GET بزنید. خطا `{ "error": "متن فارسی یا پیام مسیر عملیات" }` دارد.

- ۴۰۱: ورود لازم است.
- ۴۰۳: Origin نامعتبر یا غایب.
- ۴۱۳: متن درخواست زیاد است.
- ۴۰۰: داده نامعتبر، عملیات ناشناخته، کسری یا تغییر هم‌زمان موجودی؛ بعضی خطاهای زیرساخت نوشتن نیز فعلاً با این کد برمی‌گردند.
- ۵۰۳: دریافت داده ممکن نشده است.

طرح JSON Schema/OpenAPI رسمی، کلید API، سهمیه درخواست و خطاهای استاندارد ماشینی هنوز وجود ندارند. قرارداد retry ذخیره‌شده payload متفاوت با id یکسان را تشخیص نمی‌دهد؛ کلاینت موظف است آن id را بازاستفاده نکند.

## افزوده: ابطال ثبت اشتباه فروش

POST با `kind=void_sale`، id تازه، saleId، reason و `notPrepared="yes"`. فقط برای غذایی که تولید نشده است. همه تخصیص‌ها در یک batch به lot اصلی برمی‌گردند؛ sale با voided/voidReason/voidedAt/voidEventId علامت می‌خورد و رکورد sale_void با applied و دلیل ذخیره می‌شود. تکرار ابطال همان فروش no-op است. مرجوعی فیزیکی و برگشت پرداخت پشتیبانی نمی‌شود. گزارش روز اصلی با کنارگذاشتن فروش باطل‌شده اصلاح می‌شود؛ سابقه حفظ می‌شود.
