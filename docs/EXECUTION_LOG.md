# EXECUTION LOG — Revisi SUS Form 3 (StayManager)

**Target**: Google Form ID `1LSPiXl1-JbxMYzHDWgaIyWrjujJN_MMZw8NXsyHJjLg`
**Script**: `docs/revise_sus_form.gs`
**Master spec**: `docs/UAT_SUS_Questionnaire.md` (SECTION 1, SECTION 3)
**Status**: Script siap eksekusi. Belum dijalankan (perlu OAuth user di Apps Script editor).

---

## 1. Ringkasan 3 Perubahan

| Fix | Lokasi di Form | Sebelum (estimasi versi live) | Sesudah (target) |
|---|---|---|---|
| **A** | Section "Pengantar SUS" → `helpText` | Memuat disclosure polaritas ("pertanyaan ganjil bersifat positif", "pertanyaan genap bersifat negatif", "memperhitungkan polaritas") → bias responden | Instruksi first-impression sesuai Brooke (1996) — tidak menyebut polaritas item |
| **B** | Q2 (item title) | "Saya merasa sistem ini terlalu kompleks/rumit" *atau* "...terlalu kompleks" *atau* "...terlalu rumit" | "Saya merasa sistem ini terlalu rumit padahal seharusnya tidak" |
| **C** | Q9 (item title) | "Saya merasa percaya diri saat menggunakan sistem ini" *atau* "...percaya diri menggunakan sistem ini" | "Saya merasa sangat percaya diri menggunakan sistem ini" |

Wording target = identik dengan `UAT_SUS_Questionnaire.md` line 327-329 (intro), 345 (Q2), 352 (Q9). `.md` adalah source of truth.

---

## 2. Diff Detail

### Fix A — Pengantar SUS (helpText)

**Sebelum** (versi yang memuat polarity disclosure — sumber bias):
```
... pertanyaan ganjil bersifat positif, pertanyaan genap bersifat negatif,
sistem memperhitungkan polaritas saat skoring ...
```

**Sesudah** (`NEW_SUS_INTRO` di `.gs` line 31-37):
```
System Usability Scale (SUS) adalah instrumen evaluasi usability standar
industri (Brooke, 1996; tervalidasi ulang oleh Vlachogianni & Tselios, 2022).
10 pernyataan, skala 1-5 (1=Sangat Tidak Setuju, 5=Sangat Setuju).

Jawab spontan berdasarkan kesan keseluruhan Anda terhadap StayManager.
Tidak perlu menganalisis terlalu lama — kesan pertama justru yang paling
akurat. Jika ragu antara dua nilai, pilih nilai tengah (3). Jangan kosongkan
satu pun pernyataan.
```

### Fix B — Q2

**Sebelum (3 pattern yang ke-detect)**:
- `Saya merasa sistem ini terlalu kompleks/rumit`
- `Saya merasa sistem ini terlalu kompleks`
- `Saya merasa sistem ini terlalu rumit`

**Sesudah** (`NEW_Q2` di `.gs` line 39):
```
Saya merasa sistem ini terlalu rumit padahal seharusnya tidak
```

### Fix C — Q9

**Sebelum (2 pattern yang ke-detect)**:
- `Saya merasa percaya diri saat menggunakan sistem ini`
- `Saya merasa percaya diri menggunakan sistem ini`

**Sesudah** (`NEW_Q9` di `.gs` line 40):
```
Saya merasa sangat percaya diri menggunakan sistem ini
```

---

## 3. Langkah Eksekusi Apps Script (copy-paste friendly)

1. Buka Form di browser sebagai owner:
   ```
   https://docs.google.com/forms/d/1LSPiXl1-JbxMYzHDWgaIyWrjujJN_MMZw8NXsyHJjLg/edit
   ```

2. Klik **titik tiga (⋮)** kanan atas → **Script editor**. Apps Script tab kebuka.

3. Di file `Code.gs` (default), **select all → delete**, lalu **paste seluruh isi** `docs/revise_sus_form.gs` ke editor.

4. **Save**: `Ctrl+S` (Windows) atau `Cmd+S` (Mac). Nama project bebas.

5. **Dry-run inspect dulu** — di dropdown function (toolbar atas), pilih `listAllItems`, klik ▶ **Run**.
   - Pertama kali akan minta authorize: klik **Review permissions** → pilih akun Google owner Form → **Advanced** → **Go to (project)** → **Allow**.
   - Buka **View → Logs** (atau `Ctrl+Enter`). Catat title item Q2 dan Q9 yang sekarang ada di Form. Pastikan match salah satu pattern di `Q2_OLD_PATTERNS` / `Q9_OLD_PATTERNS`.

6. Kalau title Q2/Q9 yang live **tidak ada di pattern list**, **STOP**. Tambah string title yang live ke array `Q2_OLD_PATTERNS` / `Q9_OLD_PATTERNS` di `.gs` (line 42-50), save ulang, baru lanjut step 7.

7. Di dropdown function, pilih `reviseSusForm`, klik ▶ **Run**.

8. Buka **View → Logs**. Verifikasi output:
   ```
   ============================================
     REVISI SUS FORM 3 — RINGKASAN
   ============================================
   Form:    [judul Form]
   Updated: 3 item
   Skipped: 0 item (sudah benar)
   ```
   Kalau `Updated: 0 Skipped: 0` → patternnya gak match (kembali ke step 5-6).

9. Refresh tab Form editor di browser. Verifikasi visual:
   - Section "Pengantar SUS" helpText sudah versi baru (tanpa polarity disclosure).
   - Q2 title sudah versi baru.
   - Q9 title sudah versi baru.

10. **Re-run `reviseSusForm` sekali lagi** (idempotency check). Harus return:
    ```
    Updated: 0 item
    Skipped: 3 item (sudah benar)
    ```

---

## 4. Verifikasi 18 Responden Data Tetap Utuh

Cara kerja `Form.getItems()` + `Item.setTitle()` di Google Apps Script: **mutate title TANPA mengubah item ID**. Response yang sudah tersimpan tetap ter-link ke item ID yang sama, jadi:

- Jawaban 18 responden Q2/Q9 **tidak hilang**.
- Title baru hanya berlaku untuk **submission setelah revisi** (wave-2).

### Step verifikasi:

1. Sebelum jalan script, **export response ke Sheets** sebagai backup:
   - Form editor → tab **Responses** → ikon Sheets (kanan atas) → "Create new spreadsheet" → save link sheet.
   - Atau: download sebagai CSV (titik tiga di tab Responses → "Download responses (.csv)").

2. Setelah jalankan `reviseSusForm`, refresh tab **Responses**. Cek:
   - Counter response masih **18**.
   - Buka beberapa response individual (klik "Individual" tab) → angka Q2/Q9 untuk responden lama masih ada.
   - Di Sheets backup, kolom Q2/Q9 untuk 18 row pertama tidak berubah.

3. Submit **1 test response** sebagai dummy. Cek:
   - Counter naik ke 19.
   - Header kolom Q2/Q9 di Sheets sekarang pakai **title baru**, tapi 18 row lama tetap ter-attach ke kolom yang sama (Google Forms merge by item ID di Sheets sync).

4. **Hapus test response** via Form Responses tab (kalau tidak mau ikut analisis).

---

## 5. Catatan untuk BAB 5.3 Keterbatasan — Wave-1 vs Wave-2

Draft paragraf (siap di-insert ke `docs/Skripsi_StayManager_Fixed.md` Bab 5.3):

> **Keterbatasan Instrumen SUS — Revisi Mid-Collection.**
> Pengumpulan data SUS dilakukan dalam dua gelombang. Gelombang pertama
> (wave-1, n=18) menggunakan versi awal Form 3 yang memuat (a) disclosure
> polaritas item pada section header dan (b) terjemahan Q2/Q9 yang belum
> sepenuhnya selaras dengan terjemahan SUS kanonik (Brooke, 1996;
> Vlachogianni & Tselios, 2022). Setelah audit instrumen pada tanggal
> [TANGGAL EKSEKUSI SCRIPT], tiga revisi diaplikasikan melalui Google
> Apps Script tanpa mengubah item ID — sehingga 18 respons wave-1 tetap
> ter-link ke item yang sama secara struktural. Gelombang kedua (wave-2)
> menggunakan versi revisi. Dampak metodologis: skor SUS wave-1 berpotensi
> sedikit tertarik ke arah jawaban yang dipersepsikan "konsisten dengan
> polaritas" karena disclosure tersebut, sebagaimana risiko bias yang
> dibahas Lewis (2018). Penelitian ini memitigasi dampak dengan dua cara:
> (1) skor SUS wave-1 dan wave-2 dilaporkan terpisah pada Tabel 4.X
> sebelum di-pool, dan (2) Cronbach's α dihitung pada gabungan
> wave-1+wave-2 untuk memverifikasi konsistensi internal tetap di ambang
> ≥0,70. Apabila gap rerata wave-1 vs wave-2 > 5 poin SUS, hanya wave-2
> yang dipakai untuk pelaporan akhir.

**Action untuk Dava setelah eksekusi script**:
- Ganti `[TANGGAL EKSEKUSI SCRIPT]` dengan tanggal real (format: `DD Bulan YYYY`).
- Tambah Tabel 4.X untuk break-down wave-1 (n=18) vs wave-2 (n=?) sebelum pool.
- Hitung Cronbach's α pakai jsmaths / SPSS / Excel.

---

## 6. Hasil Verifikasi Pre-Eksekusi

| Item | Status | Catatan |
|---|---|---|
| `FORM_ID` terisi benar | ✅ | `1LSPiXl1-JbxMYzHDWgaIyWrjujJN_MMZw8NXsyHJjLg` (line 29) |
| Function `reviseSusForm()` ada | ✅ | Line 57-135 |
| Function `listAllItems()` ada | ✅ | Line 137-162 |
| Fix A — `NEW_SUS_INTRO` match `.md` line 327-329 | ✅ | Verbatim (kecuali em-dash di `.md` jadi hyphen di `.gs` — Apps Script string OK) |
| Fix B — `NEW_Q2` match `.md` line 345 | ✅ | `"Saya merasa sistem ini terlalu rumit padahal seharusnya tidak"` |
| Fix C — `NEW_Q9` match `.md` line 352 | ✅ | `"Saya merasa sangat percaya diri menggunakan sistem ini"` |
| Pakai `setTitle()` (preserve item ID) | ✅ | Line 94, 102 — bukan `deleteItem` / `addTextItem` |
| Idempotent — skip kalau sudah benar | ✅ | Guard di line 88-89, 97-98, 105-106 |
| Syntax JavaScript valid | ✅ | Pure ES5 (Apps Script V8 runtime), no missing brace, no typo |
| Logger pakai `Logger.log()` (bukan `console.log`) | ✅ | Apps Script standard |
| `FormApp.ItemType.SECTION_HEADER` + `PAGE_BREAK` keduanya di-handle | ✅ | Line 68-91 — guard kedua tipe |

**Tidak ada file `.gs` lain yang di-touch.** `.md` tidak di-edit (sudah selaras dengan `.gs`).

---

## 7. Catatan Konflik dengan Skripsi Tabel 2.2

Skripsi `Skripsi_StayManager_Fixed.md` Tabel 2.2 line 897 menyebut Q2 sebagai:
> "Saya merasa sistem ini terlalu rumit padahal seharusnya tidak **perlu**."

`.md` master spec dan `.gs` script tanpa kata "perlu". Karena instruksi user **`.md` adalah source of truth**, `.gs` tetap pakai versi `.md`. Tabel 2.2 di skripsi adalah referensi teori (Brooke 1996) — bukan instrumen yang dideploy. Diskrepansi ini diakui di Bab 5.3 sebagai pilihan terjemahan operasional, bukan error.

Bila pembimbing minta align ke versi "...tidak perlu", ubah di **3 tempat sekaligus**:
1. `docs/UAT_SUS_Questionnaire.md` line 345
2. `docs/revise_sus_form.gs` line 39 (`NEW_Q2`)
3. Tambah string lama `"Saya merasa sistem ini terlalu rumit padahal seharusnya tidak"` ke `Q2_OLD_PATTERNS` agar revisi ulang ke-detect

Lalu re-run `reviseSusForm()`.
