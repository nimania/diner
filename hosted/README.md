# داینر — برنامه آنلاین

مسیر اصلی برنامه React/TypeScript/Vinext با D1 و هویت درگاه Sites. [مستندات کامل](../documentation/README.md) · [راهنمای اجرا](../documentation/DEVELOPMENT.fa.md) · [API](../documentation/API.fa.md).

قابلیت‌ها: ۱۳۷ ماده و ملزومات، ۳۶ الگوی دستور، ترکیب درصدی گوشت، خرید و انقضا، دورریز، فروش با مصرف اتمی، گزارش روز تهران، فضای تستی جدا و ساخت منوی عمومی نسخه ثابت.

```bash
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
node tests/operations.test.mjs
pnpm build
```

Node >=22.13 و pnpm مطابق packageManager لازم است. clone به‌تنهایی احراز هویت مستقل یا اتصال به DB آنلاین نمی‌دهد. D1 روی زیرساخت Sites است؛ در GitHub ذخیره نمی‌شود. سایت فعلاً owner-private است. صفحه عمومی منو روی GitHub Pages فقط داده عمومی داخل لینک را می‌خواند و به DB خصوصی متصل نمی‌شود.

قیمت تستی مرجع بازار نیست. contribution سود خالص نیست. سقف ۱۰۰۰ رکورد گزارش، نبود اصلاح/ابطال و نبود اتصال مستقیم اسنپ و قیمت آنلاین را در [محدودیت‌ها](../documentation/TESTING.fa.md) ببینید. راهنماهای قدیمی درباره متصل‌نبودن فروش دیگر برای این نسخه معتبر نیستند.
