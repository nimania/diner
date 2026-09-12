# مدل داده

مرجع: [`schema.ts`](../hosted/db/schema.ts)، [`API`](../hosted/app/api/data/route.ts) و [`operations.ts`](../hosted/lib/operations.ts).

## جدول‌ها

| جدول | ستون‌ها و معنی |
|---|---|
| `restaurants` | `id` کلید اصلی؛ `owner` یکتا؛ `name`, `city`, `created` متنی و اجباری |
| `records` | `id` کلید اصلی؛ `restaurant_id` رابطه با مجموعه؛ `kind` نوع؛ `data` متن JSON؛ `created` زمان ثبت |
| `stock_lots` | `id` کلید؛ `restaurant_id` رابطه؛ `ingredient_id` شناسه نسخه ماده؛ `name`, `unit`؛ `initial`, `remaining` موجودی مقیاس‌شده؛ `total_cost` ریال؛ `supplier`, `location`, `created`؛ `expires` متن تاریخ یا null |
| `stock_moves` | `id` کلید؛ `restaurant_id` و `lot_id` رابطه؛ `quantity` مقدار مقیاس‌شده؛ `cost` ریال؛ `reason`, `created`؛ `applied` عدد صحیح با پیش‌فرض ۰ |

ایندکس‌ها: owner یکتا، records روی `(restaurant_id,kind)`، stock_lots و stock_moves روی restaurant_id. `ingredient_id` در stock_lots کلید خارجی تعریف‌شده در schema ندارد؛ برنامه وجود ماده و تعلق آن را بررسی می‌کند. برای باقی‌مانده غیرمنفی CHECK پایگاه وجود ندارد؛ این قاعده در مسیرهای نوشتن برنامه اعمال می‌شود. نوشتن مستقیم خارج از آن مسیرها مجاز فرض نشده است.

## واحدها

- همه پول‌ها عدد صحیح ریال؛ ورودی/نمایش کاربر تومان، ضریب ۱۰.
- واحد ماده: `g`، `ml`، `piece`. تبدیل چگالی یا کیلو/لیتر خودکار وجود ندارد.
- مقدار در recipe/ingredient عدد معمولی در واحد ماده است.
- `initial`, `remaining`, `stock_moves.quantity` و `sale.allocations.quantity` برابر مقدار × ۱۰۰۰ هستند. مثلاً ۲۱۰ گرم = ۲۱۰۰۰۰ واحد ذخیره.
- زمان رخداد ISO UTC؛ روز گزارش با منطقه Asia/Tehran؛ expires به‌صورت YYYY-MM-DD و بدون ساعت.

## JSON رکوردها

| kind | داده |
|---|---|
| `ingredient` | `catalogId` یا null، `name`, `unit`, `price`, `packQuantity`, `source`, `date` |
| `ingredient` ترکیبی | همان فیلدها با `components` شامل snapshot اجزا، `id` نسخه جزء و `percent`؛ مقدار بسته ۱۰۰۰ گرم |
| `ingredient` حاصل خرید | `packQuantity` مقدار کل خرید؛ `price` مبلغ کل؛ `purchasePackQuantity` مقدار هر بسته؛ source نام فروشنده |
| `recipe` | `name`, `servings`, `lines`, `food`, `sale`, `pack`, `remaining`, `margin`, `date` |
| `waste` | `name`, `quantity` متن آزاد با واحد، `cost`, `reason`, `date`؛ بدون کاهش stock |
| `sale` | `name`, `recipeId`, `count`, `channel`, `gross`, `discount`, `commission`, `delivery`, `deliveryReceived`, `pack`, `food`, `contribution`, `allocations`, `recipeSnapshot`, `applied`, `date`, `day` |

`recipe.lines` کپی اطلاعات ماده، شناسه نسخه ماده، quantity و yield است؛ اجزای مخلوط نیز در آن حفظ می‌شوند. `sale.recipeSnapshot` نسخه دستور با اصلاح مصرف مخصوص همان فروش است. `allocations` شامل lotId، name، unit، quantity، cost و unknownExpiry است.

هویت تطبیق ماده = `(catalogId یا نام نرمال‌شده) + unit`. نرمال‌سازی فاصله، نیم‌فاصله و خط تیره را حذف و ي/ك عربی را تبدیل می‌کند. این روش برند، درصد چربی، کیفیت یا تأمین‌کننده را تشخیص نمی‌دهد؛ مواد واقعاً متفاوت باید هویت‌های جدا داشته باشند.

## نمونه ساختاری (فرضی)

```json
{
  "kind": "ingredient",
  "data": {
    "catalogId": "milk",
    "name": "شیر",
    "unit": "ml",
    "packQuantity": 1000,
    "price": 550000,
    "source": "تستی — قیمت فرضی",
    "date": "2026-09-12T09:00:00.000Z"
  }
}
```

## محدوده و نسخه‌ها

فضای واقعی owner=userId دارد؛ فضای تستی owner=userId+`:demo`. داده seed شناسه‌های قطعی از محدوده تستی می‌سازد؛ این شناسه‌ها لزوماً UUID نیستند. درخواست کاربر شناسه ۳۶کاراکتری می‌فرستد؛ validator فعلی فقط طول و مجموعه کاراکتر hex و خط تیره را بررسی می‌کند، نه همه قواعد UUID.

مخلوط جدید catalogId جدید دارد؛ اصلاح با previousId همان catalogId را نگه می‌دارد و رکورد تازه ایجاد می‌کند. انواع recipe و ingredient عموماً append-only هستند؛ این به معنی audit کامل نیست. حذف، ابطال، اصلاح خرید یا بازگرداندن فروش رابط ندارد.

## خواندن و مهاجرت

GET حداکثر ۱۰۰۰ records و ۱۰۰۰ stock_moves آخر را می‌خواند؛ lots حد صریح ندارد. شمارنده نسخه‌ها با تعداد مواد یکتا یکسان نیست. این سقف بر گزارش روز و دسترسی به نسخه‌های قدیمی اثر می‌گذارد.

مهاجرت‌های اعمال‌شده `0000_lyrical_speed_demon.sql` و `0001_white_queen_noir.sql` را بازنویسی نکنید؛ schema و snapshot/journal باید همراه مهاجرت جدید تغییر کنند. داده seed داخل مهاجرت نیست و از مسیر احراز هویت‌شده وارد می‌شود.

## منوی عمومی

kind جدید `public_menu` در records ذخیره می‌شود؛ `data` شامل version=1، name، description و items است. هر item فقط name، price (ریال)، description و category دارد. لینک عمومی همین JSON محدود را به UTF-8/base64 در fragment صفحه menu.html قرار می‌دهد. خود لینک شناسه قابل ویرایش مرکزی یا دسترسی به records نیست. این تغییر migration نمی‌خواهد.
