# CANDIDATE 3 VERIFICATION — AlanRang Pro v39.43.2 NOTICE EXPORT + DATE FIX

## وضعیت
**CANDIDATE 3 — NOT FINAL LOCKED**

- Package: `ir.alanrang.pro`
- VersionCode: `401623` (same unfinalized v39.43.2 candidate line)
- VersionName: `39.43.2-notice-fix-v000000000000000001`
- Parent baseline: `v39.43.1 FINAL LOCKED / 401622`
- Parent APK SHA-256: `fcf0c5efadcbedc12482fcaf9fc04d65c81372c50b754c06f4e544bba1ad501f`
- Candidate 3 APK SHA-256: `1d2663bb49efee058c94dd21aa8d47240771a968615a55a70e0f4c0ebf918527`
- Schema: `3985 — unchanged`

## تغییرات این Candidate نسبت به Candidate 2
1. امضای اطلاعیه: فقط پیکسل‌های جوهر آبی منبع نگه داشته می‌شوند، سپس همان خط به سفید تبدیل می‌شود. هاله/پرشدگی سفید منبع حذف می‌شود؛ فایل امضای اصلی و فاکتورهای قدیمی دست‌نخورده‌اند.
2. ذخیره/ارسال اطلاعیه: مسیر خروجی از Canvas مستقیماً به Base64 JPEG و سپس Bridge بومی `saveDataV2` / `shareData` منتقل شد؛ مسیر Blob فقط fallback است.
3. تاریخ اطلاعیه: با لمس خود فیلد تاریخ یا دکمه تقویم، انتخابگر شمسی داخلی برنامه باز می‌شود. این تغییر فقط برای اطلاعیه مشتری است؛ تاریخ فاکتور فروش همچنان دستی باقی می‌ماند.
4. هدر، متن، نوع «تسویه حساب»، حساب مشتری، فاکتور، پرداخت، چک، Backup/Restore و Schema تغییر نکرده‌اند.

## کنترل ساخت
- APK ZIP integrity: `PASS`
- STORED alignment: `7/7 PASS`
- V1 / jarsigner: `PASS`
- V2 independent cryptographic verification: `PASS`
- Certificate SHA-256: `00558486c79eba56727f1f7debade477a5ff4dbd5cc1c7ced112baaf44aa09f4`
- JavaScript syntax check (notice script + product_v3982.js): `PASS`
- Non-signature APK payload changes vs Candidate 2: `assets/index.html, assets/product_v3982.js`
- Private signing key in Source ZIP: `NO`

## وضعیت انتشار
این فایل هنوز **Final Locked نیست** و فقط برای Update و تست واقعی روی دستگاه کاربر ساخته شده است.
