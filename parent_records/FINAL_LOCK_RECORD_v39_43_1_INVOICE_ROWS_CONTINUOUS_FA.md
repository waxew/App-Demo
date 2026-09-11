# FINAL LOCK RECORD — AlanRang Pro v39.43.1 INVOICE ROWS CONTINUOUS

## LOCK STATUS
**FINAL LOCKED — OFFICIAL BASELINE**

- Lock date: **2026-09-06**
- Version: **v39.43.1**
- VersionCode: **401622**
- VersionName: **39.43.1-invoice-rows-v0000000000000001**
- Package: **ir.alanrang.pro**
- Schema: **3985 — unchanged**

## Official immutable artifacts
- APK: `AlanRang_Pro_v39_43_1_INVOICE_ROWS_CONTINUOUS_FINAL_LOCKED.apk`
- APK SHA-256: **fcf0c5efadcbedc12482fcaf9fc04d65c81372c50b754c06f4e544bba1ad501f**
- Source ZIP: `AlanRang_v39_43_1_INVOICE_ROWS_CONTINUOUS_FINAL_LOCKED_SOURCE.zip`
- Source ZIP SHA-256: **78c14f4d55c73f55c6d6b59b6abcb656a4fff9072054c6863c44952404dd2cb0**

## Official lineage
- Immediate parent baseline: **v39.43.0 FINAL LOCKED / 401621**
- Parent APK SHA-256: **3bdc5386a5ea94239d62bcbf737e4684d6e3f9740cc563733ada27e2d9c4b408**
- Rejected v39.43.1 Candidate 1: **NOT LOCKED / NEVER VALID AS PARENT**
- Approved Candidate 2: promoted byte-for-byte to this Final Lock.

## Final change scope
Only the invoice item-row presentation flow was corrected so invoices with more than five rows continue within the same invoice document.

Protected and unchanged:
- invoice frame and visual identity,
- header/logo,
- signature and stamp,
- customer/payment information,
- accounting calculations and balances,
- invoice identifiers and stored business data,
- Schema 3985.

## Promotion rule
The user approved the exact signed Candidate 2 on a real Android device. Final Lock was created with **no rebuild, no repack, and no re-sign**. Candidate 2 and Final artifacts are byte-identical.

From this point onward this exact build is immutable. Future production work must start only from **v39.43.1 FINAL LOCKED / 401622**.
