# FINAL VERIFICATION — AlanRang Pro v39.43.1 INVOICE ROWS CONTINUOUS

## نتیجه نهایی
**PASS — FINAL LOCK PROMOTION VERIFIED**

- VersionCode: **401622**
- VersionName: **39.43.1-invoice-rows-v0000000000000001**
- Package: **ir.alanrang.pro**
- Schema: **3985 — unchanged**
- Parent build: **v39.43.0 FINAL LOCKED / 401621**

## Promotion integrity
- Candidate 2 APK -> Final APK: **BYTE-IDENTICAL PASS**
- Candidate 2 Source ZIP -> Final Source ZIP: **BYTE-IDENTICAL PASS**
- Rebuild during lock: **NO**
- Repack during lock: **NO**
- Re-sign during lock: **NO**

## Hashes
- Final APK SHA-256: **fcf0c5efadcbedc12482fcaf9fc04d65c81372c50b754c06f4e544bba1ad501f**
- Final Source ZIP SHA-256: **78c14f4d55c73f55c6d6b59b6abcb656a4fff9072054c6863c44952404dd2cb0**

## Candidate 2 verification carried into Final Lock
- ZIP integrity: **PASS**
- Duplicate entries: **0**
- STORED 4-byte alignment: **7/7 PASS**
- V1 / JAR signature: **PASS**
- V2 signature block: **PASS**
- V2 RSA/SHA-256 signature verification: **PASS**
- V2 APK content digest verification: **PASS**
- Official certificate SHA-256: **00558486c79eba56727f1f7debade477a5ff4dbd5cc1c7ced112baaf44aa09f4**
- Certificate continuity: **MATCH**
- Non-modified APK entry content vs parent: **BYTE-IDENTICAL**
- Private signing key inside source package: **NO**

## Real-device verification
**PASS — explicitly approved by user on 2026-09-06.**

Verified behavior: 10 invoice rows render continuously inside one invoice, without repeating the full invoice frame after row 5.
