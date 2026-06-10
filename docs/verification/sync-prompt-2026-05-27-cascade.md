# Sync Prompt → Word Agent
**Date:** 2026-05-27
**Batch:** Cascade renumbering Tabel 4.5–4.12 + "34 skenario" → "36 skenario"
**Source-of-truth:** `docs/Skripsi_StayManager_Fixed.md` (already updated)
**Target:** `Skripsi_StayManager_Fixed.docx` (Word Agent applies via Office.js)

---

## CONTEXT FOR WORD AGENT

Markdown source-of-truth sudah di-update. Word doc HARUS di-sync supaya cross-source consistency tetap terjaga. Ada **3 batch perubahan** yang harus diterapkan:

1. **Item 1 (RETEST)**: Verify ulang LOKASI-9 paragraph (Bab 3.3.2.3.1) — laporanmu sebelumnya menyebutkan paragraf belum ada, tetapi mungkin sudah ter-apply. Konfirmasi status.
2. **Item 3 (CASCADE RENUMBER)**: Tabel 4.5–4.12 numbering sebelumnya bug (collision karena OAuth 6, 7 ditambah ke Tabel 4.4 tanpa cascade). Sekarang sudah di-fix di markdown — apply ke Word.
3. **Global string replace**: 9 occurrences "34 skenario" → "36 skenario" + 1 occurrence "34 test scenarios" → "36 test scenarios".

---

## ITEM 1 — LOKASI-9 RETEST (Bab 3.3.2.3.1)

**Action:** Cari di Word doc heading **"3.3.2.3.1 Skema Database dan Relasi"** (atau heading terdekat sebelum/sesudah ERD). Cek apakah paragraf berikut sudah ada:

> "Sistem StayManager mengimplementasikan mekanisme pencegahan double-booking pada lapisan database melalui PostgreSQL exclusion constraint bernama `no_overlap_active_reservations` yang memanfaatkan ekstensi `btree_gist`. Constraint ini menggunakan tipe data `daterange` dengan semantik half-open `[check_in, check_out)` untuk memvalidasi bahwa tidak ada dua reservasi aktif (status `confirmed`, `checked-in`, atau `pending`) pada `room_id` yang sama dengan rentang tanggal yang tumpang-tindih. Pendekatan defense-in-depth ini menjamin integritas data pada lapisan paling dasar, sehingga sekalipun terdapat bug pada lapisan aplikasi, double-booking tetap tidak mungkin tersimpan ke database."

**Jika SUDAH ADA:** Reply "LOKASI-9 confirmed present" — skip ke Item 2.
**Jika BELUM ADA:** Insert paragraf di atas sebagai paragraf baru di akhir subbab 3.3.2.3.1 (sebelum heading subbab berikutnya).

---

## ITEM 2 — CASCADE RENUMBER TABEL 4.5–4.12

**Konteks bug:** Tabel 4.4 (Modul Autentikasi) sebelumnya punya 5 skenario (1–5). Kemudian ditambah 2 skenario OAuth menjadi 7 (1–7). Tapi Tabel 4.5 ke bawah TIDAK ikut bergeser — numbering-nya masih mulai dari angka lama (6, 7, 8, ...) padahal seharusnya 8, 9, 10, .... Ini menyebabkan collision: ada "skenario 6" di Tabel 4.4 (OAuth) DAN "skenario 6" di Tabel 4.5 (Dashboard).

**Fix:** Cascade ulang semua Tabel 4.5–4.12 supaya numbering kontinu dari Tabel 4.4 (yang berakhir di 7).

### Tabel 4.5 — Modul Dashboard (3 rows)

| BEFORE | AFTER | Skenario (untuk pencocokan) |
|---|---|---|
| 6 | **8** | Memuat data KPI real-time |
| 7 | **9** | Menampilkan grafik tren pendapatan |
| 8 | **10** | Update KPI saat data berubah |

### Tabel 4.6 — Modul Manajemen Kamar (5 rows)

| BEFORE | AFTER | Skenario |
|---|---|---|
| 9 | **11** | Menambah data kamar baru |
| 10 | **12** | Menambah kamar dengan nomor duplikat |
| 11 | **13** | Mengubah tarif kamar |
| 12 | **14** | Mengubah status kamar |
| 13 | **15** | Menghapus data kamar |

### Tabel 4.7 — Modul Manajemen Tamu (4 rows)

| BEFORE | AFTER | Skenario |
|---|---|---|
| 14 | **16** | Menambah data tamu baru |
| 15 | **17** | Mencari data tamu |
| 16 | **18** | Proses check-in tamu |
| 17 | **19** | Proses check-out tamu |

### Tabel 4.8 — Modul Keuangan (4 rows)

| BEFORE | AFTER | Skenario |
|---|---|---|
| 18 | **20** | Mencatat transaksi pembayaran |
| 19 | **21** | Mencatat pengeluaran operasional |
| 20 | **22** | Filter laporan per periode |
| 21 | **23** | Input transaksi dengan jumlah nol |

### Tabel 4.9 — Modul Logistik dan Inventori (3 rows)

| BEFORE | AFTER | Skenario |
|---|---|---|
| 22 | **24** | Menambah item inventaris baru |
| 23 | **25** | Update stok item |
| 24 | **26** | Peringatan stok minimum |

### Tabel 4.10 — Modul Chatbot LLM (4 rows)

| BEFORE | AFTER | Skenario |
|---|---|---|
| 25 | **27** | Pertanyaan informasi hotel |
| 26 | **28** | Cek ketersediaan kamar real-time |
| 27 | **29** | Proses reservasi via chatbot |
| 28 | **30** | Percakapan multi-turn |

### Tabel 4.11 — Modul Laporan (3 rows)

| BEFORE | AFTER | Skenario |
|---|---|---|
| 29 | **31** | Generate laporan occupancy |
| 30 | **32** | Generate laporan pendapatan |
| 31 | **33** | Cetak laporan |

### Tabel 4.12 — Modul Pengaturan dan RBAC (3 rows)

| BEFORE | AFTER | Skenario |
|---|---|---|
| 32 | **34** | Menambah pengguna staf baru |
| 33 | **35** | Akses ditolak sesuai role |
| 34 | **36** | Mengubah peran pengguna |

**Total verification:** Tabel 4.4 (7) + 4.5 (3) + 4.6 (5) + 4.7 (4) + 4.8 (4) + 4.9 (3) + 4.10 (4) + 4.11 (3) + 4.12 (3) = **36 skenario** ✓

---

## ITEM 3 — GLOBAL STRING REPLACEMENTS

Cari & ganti **kasus-sensitif**, **whole-phrase match**:

| # | Find | Replace | Lokasi (untuk konteks pencarian) |
|---|---|---|---|
| 1 | `34 test scenarios` | `36 test scenarios` | Abstract (EN) — 1 occurrence |
| 2 | `34 skenario` | `36 skenario` | Abstrak (ID) — 1 occurrence |
| 3 | `34 skenario` | `36 skenario` | Bab 3.1.1 (kelompok pengujian) — 1 occurrence |
| 4 | `34 skenario` | `36 skenario` | Bab 3.1 Sprint 12 (tabel sprint) — 1 occurrence |
| 5 | `34 skenario` | `36 skenario` | Bab 3.4.2 Metode Pengujian Sistem (alpha testing) — 1 occurrence |
| 6 | `34 skenario` | `36 skenario` | Bab 4.3 (intro Evaluasi) — 1 occurrence |
| 7 | `34 skenario` | `36 skenario` | Bab 4.3.2 (setelah Tabel 4.12) — 1 occurrence |
| 8 | `34 skenario` | `36 skenario` | Bab 5.1 Simpulan poin 1 — 1 occurrence |
| 9 | `34 skenario` | `36 skenario` | Bab 5.1 Simpulan poin 3 — 1 occurrence |

**Catatan:** Word Agent boleh pakai Find & Replace global untuk "34 skenario" (8 occurrences sekaligus) dan terpisah untuk "34 test scenarios" (1 occurrence di Abstract EN). Tidak ada konflik karena substring "34" lain (kalau ada) tidak akan match phrase utuhnya.

---

## VERIFICATION CHECKLIST (Word Agent — reply dengan ini)

- [ ] Item 1: LOKASI-9 paragraph status — `PRESENT` / `INSERTED`
- [ ] Item 2: Tabel 4.5 rows = 8, 9, 10 ✓/✗
- [ ] Item 2: Tabel 4.6 rows = 11, 12, 13, 14, 15 ✓/✗
- [ ] Item 2: Tabel 4.7 rows = 16, 17, 18, 19 ✓/✗
- [ ] Item 2: Tabel 4.8 rows = 20, 21, 22, 23 ✓/✗
- [ ] Item 2: Tabel 4.9 rows = 24, 25, 26 ✓/✗
- [ ] Item 2: Tabel 4.10 rows = 27, 28, 29, 30 ✓/✗
- [ ] Item 2: Tabel 4.11 rows = 31, 32, 33 ✓/✗
- [ ] Item 2: Tabel 4.12 rows = 34, 35, 36 ✓/✗
- [ ] Item 3: 0 occurrence "34 skenario" tersisa
- [ ] Item 3: 0 occurrence "34 test scenarios" tersisa
- [ ] Item 3: 8 occurrence "36 skenario" present
- [ ] Item 3: 1 occurrence "36 test scenarios" present

**Done condition:** Semua checklist ✓. Reply ke user dengan ringkasan status + diff report (kalau ada masalah).
