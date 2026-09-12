# داینر — نسخه آنلاین خصوصی
ورود با ChatGPT، ثبت یک مجموعه برای هر حساب، مواد با قیمت بسته و منبع، رسپی‌های دارای snapshot قیمت و ثبت ضایعات.
ذخیره در D1 و کنترل دسترسی هر درخواست بر اساس هویت معتبر پلتفرم است. هیچ کاربر نمایشی یا کلید API در کد وجود ندارد.
این نسخه فعلاً owner-private است. ورود عمومی، دعوت کارکنان، نقش مدیر کل، اتصال دیجی‌کالا، فایل حسابداری و دیگر ماژول‌ها آماده نیستند.
پیش‌نمایش نقش‌ها در https://nimania.github.io/diner/ مستقل و همچنان نمایشی است.

## توسعه
Node 22.13+ و pnpm مطابق packageManager. نصب: pnpm install --frozen-lockfile
ساخت: pnpm build
مهاجرت: pnpm db:generate
این برنامه به احراز هویت dispatch و D1 در Sites متکی است؛ سرور مستقل بدون این مرز اعتماد قابل انتشار نیست.
قیمت‌ها در ریال صحیح ذخیره و به تومان نمایش داده می‌شوند. هزینه هر پرس پس از اعمال بازده محاسبه می‌شود.
سوابق ثبت‌شده قابل‌ویرایش نیستند؛ ثبت جدید یک نسخه تازه است. عملیات با شناسه درخواست از ثبت تکراری ناشی از تلاش مجدد جلوگیری می‌کند.

## کتابخانه تصویری
۱۳۷ ماده و ملزومات دسته‌بندی‌شده با نماد تصویری، جست‌وجو، ثبت سه‌مرحله‌ای و ۳۶ رسپی پیشنهادی. اندازه بسته پیشنهادی است؛ قیمت ساختگی وارد نمی‌شود. تطبیق الگو با مواد ذخیره‌شده بر اساس شناسه کتابخانه یا نام دقیق و واحد یکسان انجام می‌شود. مواد ناموجود باید پیش از استفاده از الگو ثبت شوند. افزودن ماده، موجودی انبار ایجاد نمی‌کند.

## خرید و انبار
ثبت مرحله‌ای خرید با مقدار، مبلغ کل، فروشنده، محل نگهداری و تاریخ روی بسته (یا نامشخص). تاریخ ورودی میلادی و نمایش فارسی است. هر خرید موجودی جدا دارد؛ دورریز با قیمت همان خرید محاسبه و به‌صورت اتمی از موجودی کم می‌شود. تکرار درخواست موجودی را دوباره کم نمی‌کند و تجاوز از موجودی یا مجموعه دیگر ممنوع است. قیمت خرید یک نسخه جدید برای رسپی‌های آینده ایجاد می‌کند. فروش و مصرف آشپزخانه، اصلاح موجودی و تاریخ پس از بازکردن بسته هنوز متصل نیستند. کتابخانه قابل گسترش است و ادعای پوشش تمام غذاها ندارد.

## Sales, blends and demo workspace
Authenticated demo scope uses a separate restaurant owner suffix and seeds fictional prices, 8 materials, 2 meat blends, 3 recipes, purchase lots and 3 sales on first opening. Real records remain separate. Internal meat blends require 100% total and store immutable component price snapshots. Sales expand blends to raw components and allocate nonexpired stock by nearest expiry, then unknown dates. Date-unknown lots require operator review. Guarded D1 batches atomically save sales and consume all lots or neither; request IDs prevent retries consuming twice. Daily Tehran-date reporting includes discount, packaging, commission, paid and received delivery fees and waste. Remaining contribution excludes overhead, not net profit. Each sale can override recipe quantities. External Snapp integration, recurring courier salaries, automatic Excel imports and opening-life expiry are not implemented.
Validation: node tests/operations.test.mjs; sales SQL batches also checked with SQLite for atomic rollback, retry and shortages.
