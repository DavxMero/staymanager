# PROMPT UNTUK WORD AGENT — SYNC BATCH REVISI-2026-05-27 LOKASI-11 s/d LOKASI-16

> Forward file ini + `docs/Skripsi_StayManager_Fixed.md` ke Word Agent. Word Agent harus baca `.md` sebagai source-of-truth dan apply ke `Skripsi_StayManager_Fixed.docx`.

---

## ROLE LO (Word Agent)

Lo adalah Word Agent dengan akses Office.js ke `Skripsi_StayManager_Fixed.docx`. Tugas lo: SYNC isi `.docx` agar IDENTIK dengan `.md` source-of-truth pada section yang disebut di batch ini.

---

## ATURAN WAJIB — DILARANG KERAS DILANGGAR

1. **DILARANG paraphrase, summarize, atau "improve" teks dari `.md`.** Salin PERSIS karakter per karakter.
2. **DILARANG sentuh section di luar daftar LOKASI-11 s/d LOKASI-16 di bawah.**
3. **DILARANG hapus atau ubah yellow highlight existing di section lain.**
4. **DILARANG resolve ambiguity sendiri.** Jika heading di `.docx` tidak persis match dengan di `.md`, STOP dan balik ke Dava dengan pertanyaan spesifik.
5. **DILARANG menambah catatan editorial, opini, atau saran di hasil report.** Report harus berisi fakta sync saja.
6. **DILARANG skip yellow highlight rules di bawah.** Setiap dummy yang gagal ter-highlight = bug kritis.

---

## ATURAN YELLOW HIGHLIGHT — KRITIS

Di `.md`, dummy data dibungkus pattern:

```
<span style="background:yellow">TEKS DUMMY</span>
```

**WAJIB:**
- Setiap teks/angka di dalam tag `<span style="background:yellow">...</span>` → render TEKS dengan **YELLOW HIGHLIGHT** di `.docx` (gunakan Word highlight color = yellow).
- Tag `<span>` itu sendiri JANGAN dipertahankan di `.docx` — hanya yellow highlight propertynya yang dipertahankan.
- Teks di LUAR tag → render NORMAL (tanpa highlight).

**DILARANG:**
- DILARANG highlight teks yang TIDAK dibungkus `<span style="background:yellow">` di `.md`.
- DILARANG ganti warna highlight (HARUS yellow, bukan green/red/orange).
- DILARANG hilangkan highlight existing dari section lain di `.docx`.

**Makna yellow highlight:** "MUST REPLACE BEFORE SUBMISSION" — tanda untuk Dava bahwa data tersebut adalah dummy yang harus diganti dengan data riil hasil penelitian.

---

## DAFTAR PERUBAHAN — 6 LOKASI

Cara cari konten di `.md`: setiap LOKASI dibungkus marker:

```
<!-- REVISI-2026-05-27 (LOKASI-XX) [GANTI] deskripsi singkat -->
... konten baru ...
<!-- /REVISI -->
```

Lo cari marker tersebut di `.md`, ambil konten di antara marker, terapkan ke section terkait di `.docx`.

---

### LOKASI-11 — Tabel 4.15 SUS + Paragraf Analisis Bab 4.3.2.10.3

- **Markdown ref:** cari `<!-- REVISI-2026-05-27 (LOKASI-11) [GANTI] Tabel 4.15 SUS`
- **Word location:** Bab 4.3.2.10.3 "Evaluasi Usability dengan System Usability Scale (SUS)" — Tabel 4.15 + paragraf TEPAT setelah Tabel 4.15 (yang dimulai dengan "Berdasarkan rekapitulasi pada Tabel 4.15...")
- **Action:** GANTI seluruh isi Tabel 4.15 (3 baris data: Staf Hotel, Tamu, Rata-rata Gabungan) dan REPLACE paragraf placeholder `[Analisis hasil evaluasi SUS akan ditambahkan...]` dengan paragraf baru
- **Estimasi yellow markers:** 15 sel tabel + 9 frasa di paragraf = 24 yellow highlights

---

### LOKASI-12 — Tabel 4.13 + 5 Faktor Staf (Bab 4.3.1.1 dan Bab 4.3.2.10.1)

- **Markdown ref:** cari `<!-- REVISI-2026-05-27 (LOKASI-12)` (ada 6 block — 1 untuk Tabel 4.13 + 5 untuk Faktor 1-5)
- **Word location:**
  - Tabel 4.13: Bab 4.3.2.10.1 "Evaluasi Kepuasan Staf Hotel (n=10)"
  - Faktor 1-5 Staf: Bab 4.3.1.1 "Lima Faktor Manusia Terukur (Staf Hotel)" — masing-masing sub-section "Faktor X — ..."
- **Action:**
  - Tabel 4.13: tambahkan yellow highlight pada SEMUA 56 sel data (8 baris × 7 kolom: STS, TS, N, S, SS, Total, Rata-rata) + isi sel "Rata-rata Keseluruhan" (4,36)
  - GANTI paragraf placeholder `[Analisis hasil kuesioner evaluasi staf...]` dengan paragraf baru
  - Untuk masing-masing Faktor 1-5: GANTI baris `Hasil: [akan diisi setelah analisis data UAT staf...]` dengan baris baru yang berisi distribusi dummy
- **Estimasi yellow markers:** 56 sel + 1 sel + 7 frasa paragraf + 15 yellow span di 5 Faktor = ~80 yellow highlights

---

### LOKASI-13 — Tabel 4.14 + 5 Faktor Tamu (Bab 4.3.1.2 dan Bab 4.3.2.10.2)

- **Markdown ref:** cari `<!-- REVISI-2026-05-27 (LOKASI-13)` (6 block)
- **Word location:**
  - Tabel 4.14: Bab 4.3.2.10.2 "Evaluasi Kepuasan Tamu dan Pengguna Chatbot (n=20)"
  - Faktor 1-5 Tamu: Bab 4.3.1.2 "Lima Faktor Manusia Terukur (Tamu dan Chatbot)"
- **Action:** Sama seperti LOKASI-12, untuk versi tamu (n=20)
- **Estimasi yellow markers:** ~90 yellow highlights

---

### LOKASI-14 — Tabel 3.3 Wawancara + Ringkasan + 4 Kategori Kuesioner Bab 3.2.2

- **Markdown ref:** cari `<!-- REVISI-2026-05-27 (LOKASI-14) [GANTI] Tabel 3.3 wawancara`
- **Word location:** Bab 3.2.2 "Analisis Permasalahan dan Kebutuhan" — section "Wawancara" (Tabel 3.3 + paragraf ringkasan setelahnya) DAN section "Kuesioner" (5 paragraf: intro + 4 kategori + ringkasan triangulasi)
- **Action:**
  - GANTI seluruh 24 sel data Tabel 3.3 (4 narasumber × 6 pertanyaan) dengan teks dummy
  - GANTI paragraf placeholder `[Ringkasan temuan wawancara akan ditulis...]` dengan paragraf ringkasan baru
  - GANTI placeholder `[Rekap hasil kuesioner akan ditambahkan...]` dan 4 baris kategori + `[Ringkasan analisis gabungan...]` dengan teks dummy
- **Estimasi yellow markers:** 24 sel tabel + 7 frasa paragraf = ~30 yellow highlights

---

### LOKASI-15 — Paragraf Penutup Bab 4.3.2 (BBT)

- **Markdown ref:** cari `<!-- REVISI-2026-05-27 (LOKASI-15) [GANTI] BBT paragraf penutup`
- **Word location:** Bab 4.3.2 "Evaluasi Sistem" — paragraf TEPAT setelah Bab 4.3.2.9 "Pengujian Modul Pengaturan dan RBAC" (Tabel 4.12) DAN SEBELUM heading Bab 4.3.2.10 "Evaluasi Kepuasan Pengguna (UAT dan SUS)"
- **Action:** GANTI paragraf placeholder dengan paragraf baru yang menyebutkan tingkat keberhasilan 97,22% (35 dari 36 skenario) + 1 minor finding (validasi nomor identitas internasional)
- **Estimasi yellow markers:** 3 frasa yellow span

---

### LOKASI-16 — Bab 5.1 Simpulan (3 Poin Ordered List)

- **Markdown ref:** cari `<!-- REVISI-2026-05-27 (LOKASI-16) [GANTI] Bab 5.1 Simpulan poin` (3 block — poin 1, 2, 3)
- **Word location:** Bab 5.1 "Simpulan" — ordered list poin 1, 2, 3
- **Action:** GANTI placeholder `[hasil akan dilaporkan setelah eksekusi pengujian]`, `[skor akan diisi]`, `[hasil akan dilengkapi setelah analisis data]` di masing-masing poin dengan angka aktual dummy
- **Estimasi yellow markers:** Poin 1 = 4 yellow, Poin 2 = 3 yellow, Poin 3 = 2 yellow = 9 yellow highlights

---

## TOTAL ESTIMASI YELLOW HIGHLIGHTS DI BATCH INI

~236 yellow highlights baru. Ini PENTING untuk verifikasi pasca-sync.

---

## FORMAT REPORT YANG WAJIB LO KIRIM BALIK

Setelah sync selesai, balik ke Dava dengan FORMAT PERSIS SEPERTI INI (DILARANG menambah kata-kata di luar struktur ini):

```
✅ Applied REVISI-2026-05-27 LOKASI-11 s/d LOKASI-16

📍 Touched sections:
   1. Bab 3.2.2 (Tabel 3.3 + ringkasan wawancara + 4 kategori kuesioner + ringkasan triangulasi)
   2. Bab 4.3.1.1 (5 Faktor Staf — 5 placeholder Hasil)
   3. Bab 4.3.1.2 (5 Faktor Tamu — 5 placeholder Hasil)
   4. Bab 4.3.2 (paragraf penutup BBT)
   5. Bab 4.3.2.10.1 (Tabel 4.13 + paragraf analisis)
   6. Bab 4.3.2.10.2 (Tabel 4.14 + paragraf analisis)
   7. Bab 4.3.2.10.3 (Tabel 4.15 SUS + paragraf analisis)
   8. Bab 5.1 (Simpulan poin 1, 2, 3)

🟡 Yellow highlights baru ditambahkan: <jumlah aktual>
🟡 Yellow highlights total di seluruh dokumen sekarang: <count>
📄 Pages: <before> → <after>
📊 Word count: <before> → <after>

⚠️  Ambiguity / blockers (kalau ada): <list ringkas; kalau tidak ada tulis "TIDAK ADA">
⚠️  Section yang tidak ketemu di .docx (kalau ada): <list>
```

---

## KALAU LO MENEMUKAN MASALAH

STOP IMMEDIATELY dan balik dengan:

```
❌ BLOCKED at LOKASI-XX
Reason: <masalah spesifik 1-2 kalimat>
Question for Dava: <pertanyaan spesifik supaya Dava bisa jawab cepat>
```

JANGAN coba auto-resolve. JANGAN apply partial sync. JANGAN skip section yang bermasalah dan lanjut ke next.
