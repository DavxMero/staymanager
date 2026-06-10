# SUS Revision — Perbandingan Antar 3 Sumber

**Sources:**
1. `docs/revise_sus_form.gs` — script revisi Google Form (target eksekusi)
2. `docs/UAT_SUS_Questionnaire.md` — spec kuesioner (markdown)
3. `docs/Skripsi_StayManager_Fixed.md` — skripsi (Tabel 2.2, line 892-906)

## Status Sync

| Item | Skripsi (Tabel 2.2) | UAT_SUS Markdown | .gs Script | Status |
|---|---|---|---|---|
| Pengantar SUS intro | (di Bab 2.12.5) | Line 327-329 ✅ | NEW_SUS_INTRO ✅ | **3/3 SYNC** |
| Q1 | "...akan ingin sering menggunakan..." | "...akan ingin sering..." | (tidak di-revisi) | ✅ Same |
| **Q2** | "...terlalu rumit padahal seharusnya tidak **perlu**." | "...terlalu rumit padahal seharusnya tidak" | "...terlalu rumit padahal seharusnya tidak" | ⚠️ **MISMATCH** |
| Q3-Q8 | (tidak di-revisi) | match | (tidak di-revisi) | ✅ |
| **Q9** | "...sangat percaya diri menggunakan sistem ini." | "...sangat percaya diri menggunakan sistem ini" | "...sangat percaya diri menggunakan sistem ini" | ✅ **3/3 SYNC** |
| Q10 | (tidak di-revisi) | match | (tidak di-revisi) | ✅ |

## Finding Utama: Q2 Discrepancy

| Source | Q2 Wording |
|---|---|
| Skripsi Tabel 2.2 (line 897) | "Saya merasa sistem ini terlalu rumit padahal seharusnya tidak **perlu**." |
| UAT_SUS_Questionnaire.md (line 345) | "Saya merasa sistem ini terlalu rumit padahal seharusnya tidak" |
| revise_sus_form.gs (NEW_Q2) | "Saya merasa sistem ini terlalu rumit padahal seharusnya tidak" |

**Header .gs script bilang "selaras dengan Tabel 2.2 skripsi" — tapi kata "perlu" di-skip.**

## Mana yang Benar (Sumber Kanonik Brooke 1996)

Brooke (1996) Q2 versi original English: *"I found the system unnecessarily complex"*

Terjemahan akurat ke Bahasa Indonesia: **"Saya merasa sistem ini terlalu rumit padahal seharusnya tidak perlu"**

Tanpa "perlu" = kalimat **terpotong**, makna jadi ambigu ("seharusnya tidak" → tidak apa?).

**Versi skripsi BENAR. .gs script + UAT markdown MELEWATKAN kata "perlu".**

## Action yang Direkomendasikan

1. **Update .gs script** — tambah "perlu" di `NEW_Q2`:
   ```js
   const NEW_Q2 = 'Saya merasa sistem ini terlalu rumit padahal seharusnya tidak perlu';
   ```
   Plus pattern detection juga (Q2_OLD_PATTERNS) supaya old wording yang udah ada di Form ke-detect:
   ```js
   const Q2_OLD_PATTERNS = [
     'Saya merasa sistem ini terlalu kompleks/rumit',
     'Saya merasa sistem ini terlalu kompleks',
     'Saya merasa sistem ini terlalu rumit',
     'Saya merasa sistem ini terlalu rumit padahal seharusnya tidak', // ← versi mismatch
   ];
   ```

2. **Update UAT_SUS_Questionnaire.md line 345** — tambah "perlu":
   ```
   | 2 | Saya merasa sistem ini terlalu rumit padahal seharusnya tidak perlu | ... |
   ```

3. **Skripsi Tabel 2.2 — tetap (sudah benar).**

4. **Jalankan ulang `reviseSusForm()` di Apps Script editor** setelah update .gs file → Form Q2 akan sync ke versi lengkap.

## Side Note — Form yang Sudah Live

Form sudah punya **18 responden submit**. Q2 mereka jawab pakai wording yang lo set saat Form dibuat. Kalau saat ini Form udah pakai "...tidak perlu" (versi lengkap), responden jawab dengan benar. Kalau Form pakai "...tidak" (versi terpotong), interpretasi mereka mungkin beda.

**Cek Form aktual** sekarang untuk konfirmasi versi mana yang live. Run `listAllItems()` di Apps Script editor → lihat title item Q2 → bandingkan.
