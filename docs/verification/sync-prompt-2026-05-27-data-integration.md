# Word Agent Sync Prompt — Phase 2 Data Integration
## Batch: REVISI-2026-05-27, LOKASI-11 s/d LOKASI-16

**Sumber:** `docs/Skripsi_StayManager_Fixed.md`
**Target:** `Skripsi_StayManager_Fixed.docx`
**Tanggal generate:** 2026-05-27

---

## INSTRUKSI WAJIB UNTUK WORD AGENT

DILARANG melakukan apapun di luar scope batch ini. JANGAN sentuh section yang tidak disebut. JANGAN merge dengan batch sebelumnya.

JANGAN modifikasi yellow highlight existing di section lain — hanya tambah/ganti pada section yang disebut di batch ini.

JANGAN paraphrase. SALIN PERSIS isi teks dari markdown source-of-truth.

JIKA ada ambiguity heading atau lokasi, STOP dan tanya. JANGAN auto-resolve.

---

## ATURAN YELLOW HIGHLIGHT — KRITIS

Pada markdown, dummy data dibungkus dengan `<span style="background:yellow">...</span>`.

**WAJIB:**
1. Setiap teks/angka yang dibungkus `<span style="background:yellow">...TEKS...</span>` → render TEKS dengan **YELLOW HIGHLIGHT** di Word doc.
2. `<span>` tag itu sendiri JANGAN dipertahankan di Word — hanya highlight propertynya.
3. Teks di LUAR tag tersebut → render NORMAL (tanpa highlight).
4. Yellow highlight = signal "MUST REPLACE BEFORE SUBMISSION". Tanda visual untuk user (Dava) bahwa data tersebut adalah dummy yang harus diganti dengan data riil.

**DILARANG:**
- DILARANG highlight teks yang tidak di-tag `<span style="background:yellow">`.
- DILARANG hilangkan highlight dari section lain.
- DILARANG ganti warna highlight (harus yellow, bukan warna lain).

---

## DAFTAR PERUBAHAN PER LOKASI

### LOKASI-11: Tabel 4.15 SUS + paragraf analisis Bab 4.3.2.10.3

**Markdown ref:** baris 2188-2200 di `Skripsi_StayManager_Fixed.md`
**Word location:** Bab 4.3.2.10.3 "Evaluasi Usability dengan System Usability Scale (SUS)" — Tabel 4.15 + paragraf analisis di bawahnya
**Action:** GANTI seluruh Tabel 4.15 (3 baris data) dan paragraf placeholder dengan konten baru
**Yellow cells:** Semua sel data Tabel 4.15 (3 baris × 5 kolom = 15 sel) + 8 frasa di paragraf analisis

### LOKASI-12: Tabel 4.13 UAT Staf + paragraf analisis + 5 Faktor Manusia (Bab 4.3.1.1)

**Markdown ref:**
- Tabel 4.13 + analisis: baris 2147-2164
- Faktor 1 Learnability: baris 1874-1878
- Faktor 2 Efficiency: baris 1884-1888
- Faktor 3 Memorability: baris 1894-1898
- Faktor 4 Error Rate: baris 1904-1908
- Faktor 5 Satisfaction: baris 1914-1918

**Word location:**
- Tabel 4.13: Bab 4.3.2.10.1
- Faktor 1-5 Staf: Bab 4.3.1.1 (masing-masing sub-section)

**Action:** GANTI placeholder dummy. Untuk Tabel 4.13 — sel data sudah dummy sebelumnya, tambahkan yellow highlight pada SEMUA sel data + isi sel "Rata-rata Keseluruhan". Untuk 5 Faktor — isi "Hasil:" placeholder dengan distribusi dummy.

**Yellow cells:**
- Tabel 4.13: 8 baris × 7 sel data (STS, TS, N, S, SS, Total, Rata-rata) = 56 sel + 1 sel "Rata-rata Keseluruhan" + 7 frasa di paragraf
- Faktor 1-5: 5 distribusi × 3 yellow span = 15 yellow spans

### LOKASI-13: Tabel 4.14 UAT Tamu + paragraf analisis + 5 Faktor Manusia (Bab 4.3.1.2)

**Markdown ref:**
- Tabel 4.14 + analisis: baris 2167-2183
- Faktor 1-5 Tamu: baris 1916-1942

**Word location:**
- Tabel 4.14: Bab 4.3.2.10.2
- Faktor 1-5 Tamu: Bab 4.3.1.2

**Action:** Sama seperti LOKASI-12, untuk versi tamu (n=20).

**Yellow cells:**
- Tabel 4.14: 8 baris × 7 sel data = 56 sel + 1 sel "Rata-rata Keseluruhan" + 9 frasa di paragraf
- Faktor 1-5 Tamu: 15+ yellow spans

### LOKASI-14: Tabel 3.3 Wawancara + ringkasan + 4 Kategori Kuesioner Bab 3.2.2

**Markdown ref:** baris 1066-1086

**Word location:** Bab 3.2.2 "Analisis Permasalahan dan Kebutuhan" — Tabel 3.3 + paragraf ringkasan wawancara + 4 paragraf Kategori 1-4 kuesioner + paragraf ringkasan triangulasi

**Action:** GANTI seluruh sel data Tabel 3.3 (4 narasumber × 6 pertanyaan = 24 sel) + paragraf ringkasan + 4 paragraf kategori + paragraf triangulasi gabungan.

**Yellow cells:**
- Tabel 3.3: 24 sel data
- Ringkasan wawancara: 2 frasa yellow span panjang
- 4 Kategori kuesioner: masing-masing 1 frasa yellow span panjang (4 total)
- Ringkasan triangulasi: 1 frasa yellow span

### LOKASI-15: Paragraf Penutup Bab 4.3.2 (BBT)

**Markdown ref:** baris 2140-2142

**Word location:** Bab 4.3.2 "Evaluasi Sistem" — paragraf penutup TEPAT setelah Bab 4.3.2.9 dan SEBELUM heading Bab 4.3.2.10

**Action:** GANTI paragraf placeholder dengan paragraf yang mention tingkat keberhasilan 97,22% + 1 minor finding (validasi nomor identitas internasional).

**Yellow phrases (3):** "sebanyak 35 skenario (97,22%)...", "Satu skenario yang teridentifikasi...", "97,22%"

### LOKASI-16: Bab 5.1 Simpulan — 3 poin

**Markdown ref:** baris 2206, 2208, 2210

**Word location:** Bab 5.1 "Simpulan" — list ordered poin 1, 2, 3

**Action:** GANTI placeholder `[hasil akan dilaporkan...]` dan `[skor akan diisi]` dengan angka aktual.

**Yellow phrases per poin:**
- Poin 1: 4 yellow spans (BBT 97,22%, UAT 4,36, Faktor 4,24, SUS 79,75 Grade B)
- Poin 2: 3 yellow spans (UAT 4,26, Faktor 4,24, SUS 82,38 Grade A)
- Poin 3: 2 yellow spans (BBT 97,22%, learnability 4,28)

---

## VERIFIKASI PASCA-SYNC

Setelah selesai sync, balik dengan format berikut ke Dava:

```
✅ Applied REVISI-2026-05-27 LOKASI-11 s/d LOKASI-16
📍 Touched sections:
   - Bab 3.2.2 (Tabel 3.3 + ringkasan + 4 kategori kuesioner)
   - Bab 4.3.1.1 (5 Faktor Staf — 5 hasil placeholder)
   - Bab 4.3.1.2 (5 Faktor Tamu — 5 hasil placeholder)
   - Bab 4.3.2 (paragraf penutup BBT)
   - Bab 4.3.2.10.1 (Tabel 4.13 + analisis)
   - Bab 4.3.2.10.2 (Tabel 4.14 + analisis)
   - Bab 4.3.2.10.3 (Tabel 4.15 SUS + analisis)
   - Bab 5.1 (Simpulan poin 1, 2, 3)
🟡 Yellow highlights added: <total count>
🟡 Yellow highlights remaining (total di seluruh dokumen): <count>
📄 Pages: <before> → <after>
⚠️  Ambiguity / blockers (kalau ada): <list>
```

---

## CHECKLIST UNTUK DAVA SEBELUM SUBMISSION

Setelah Word Agent sync selesai, sebelum submit:

- [ ] Buka `.docx` di Word, pastikan jumlah yellow highlight = jumlah dummy cell + dummy frasa (estimasi: ~150+ yellow markers)
- [ ] Ganti SEMUA yellow dengan data riil dari:
  - Google Form export (UAT staf 10 + UAT tamu 20 + SUS 30)
  - Transkrip wawancara 4 narasumber (compress ke 1-3 kalimat per sel)
  - Hasil eksekusi `bbt-playwright.spec.ts` (35/36 atau angka aktual)
- [ ] Setelah ganti, hapus yellow highlighting → render normal
- [ ] Pastikan TIDAK ada yellow tersisa di file final
- [ ] Cross-check page numbers di Daftar Tabel & Daftar Gambar — sesuaikan jika ada shift

---

## CARA SUBMIT KE WORD AGENT

Forward isi file ini (atau seluruh isinya) ke Word Agent via Dava sebagai forwarder. Word Agent tidak punya akses langsung ke filesystem markdown — semua content harus dipaste lengkap atau Dava sebagai jembatan baca markdown lalu apply ke Word doc via Office.js.
