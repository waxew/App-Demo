# AlanRang Pro v39.43.1 — INVOICE ROWS CONTINUOUS — CANDIDATE SOURCE

این بسته از آخرین baseline قفل‌شده `v39.43.0 / 401621` ساخته شده و هنوز **Final Locked نیست**.

## نسخه
- Package: `ir.alanrang.pro`
- VersionCode: `401622`
- VersionName: `39.43.1-invoice-rows-v0000000000000001`
- Parent: `v39.43.0 FINAL LOCKED / 401621`
- Schema: بدون تغییر

## محدوده تغییر
فقط Renderer اقلام فاکتور اصلاح شده است:
- ردیف‌های بیشتر از ظرفیت سابق ۵ ردیف دیگر به صفحه/فاکتور دوم منتقل نمی‌شوند.
- جدول به صورت پیوسته در همان سند ادامه پیدا می‌کند.
- بخش پایین فاکتور به اندازه لازم پایین منتقل می‌شود.
- هدر، قاب، اطلاعات مشتری، جمع‌ها، مانده حساب، مهر و امضا و منطق حسابداری تغییر ماهوی نکرده‌اند.

## امنیت داده
هیچ migration یا تغییر Schema در این Candidate انجام نشده است.

## امضا
APK Candidate با کلید رسمی AlanRang و همان certificate رسمی امضا شده است.
Private signing key داخل این Source ZIP وجود ندارد.

## وضعیت
CANDIDATE — نیازمند نصب Update روی دستگاه واقعی، تست فاکتورهای 1 تا 10+ ردیف و تأیید صریح کاربر پیش از Final Lock.
