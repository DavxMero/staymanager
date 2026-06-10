# PLAYBOOK WORD AGENT — Phase 2 Data Integration End-to-End

> Forward file ini SEKALI ke Word Agent. Setelah itu Word Agent handle semua replace dummy → real data, compute aggregates, tulis paragraf analisis, dan apply ke `Skripsi_StayManager_Fixed.docx`.

---

## ROLE LO MULAI SEKARANG

Lo (Word Agent) sekarang OWN Phase 2 Data Integration untuk skripsi StayManager (Dava Romero & Moh. Rezki, Bina Nusantara, target sidang Juni 2026).

Tugas lo:

1. Terima raw data dari Dava (Google Form export, transkrip wawancara, hasil BBT)
2. Compute aggregate sesuai formula di section "COMPUTATION RULES"
3. Tulis paragraf analisis riil sesuai template di section "ANALYSIS WRITING RULES"
4. Replace dummy text ber-yellow di `.docx` dengan data riil
5. HAPUS yellow highlight dari text yang sudah di-replace
6. Update `Skripsi_StayManager_Fixed.md` source-of-truth juga (mirror perubahan di `.docx`)
7. Balik ke Dava dengan report ringkas

---

## STATE DOKUMEN SAAT INI (per 2026-05-27)

`Skripsi_StayManager_Fixed.docx` = 146 halaman, 32.510 kata, 325 paragraf ber-yellow.

Yellow highlight = DUMMY data yang HARUS diganti dengan data riil sebelum sidang. Scope dummy:

- **Bab 3.2.2** — Tabel 3.3 wawancara (24 sel) + ringkasan + 4 kategori kuesioner + triangulasi
- **Bab 4.3.1.1** — 5 Faktor Manusia Staf (5 distribusi)
- **Bab 4.3.1.2** — 5 Faktor Manusia Tamu (5 distribusi)
- **Bab 4.3.2** — paragraf penutup BBT (97,22% dummy)
- **Bab 4.3.2.10.1** — Tabel 4.13 UAT Staf (57 sel) + paragraf analisis
- **Bab 4.3.2.10.2** — Tabel 4.14 UAT Tamu (57 sel) + paragraf analisis
- **Bab 4.3.2.10.3** — Tabel 4.15 SUS (15 sel) + paragraf analisis
- **Bab 5.1** — Simpulan poin 1, 2, 3 (skor UAT/SUS/BBT)

Audit terakhir (2026-05-27): 0 orphan placeholder, 0 duplikasi konten, 57/57 + 57/57 + 15/15 sel ber-yellow. Baseline VERIFIED CLEAN.

---

## ATURAN WAJIB — DILARANG KERAS DILANGGAR

1. **DILARANG fabricate data.** Setiap angka final yang masuk ke skripsi WAJIB dari raw input Dava. Kalau Dava paste 25 responden bukan 30, lapor — JANGAN tambahin 5 fake.
2. **DILARANG paraphrase data verbatim Dava.** Untuk transkrip wawancara, lo BOLEH compress ke 1-3 kalimat tapi MAKNA harus identik. JANGAN tambah/ubah substansi.
3. **DILARANG biarkan yellow tersisa setelah replace.** Cell yang sudah di-replace dengan data riil = highlight color None.
4. **DILARANG sentuh section di luar scope dummy yang disebut di "STATE DOKUMEN SAAT INI".**
5. **DILARANG narate proses internal di output.** ("Let me check...", "Now I'll..."). Cuma report final.
6. **DILARANG resolve ambiguity sendiri.** Kalau raw data Dava ambigu (mis: kolom Q tidak jelas mana yang mana), STOP dan tanya.
7. **DILARANG apply partial batch.** Kalau 1 entry gagal, rollback semua entry batch itu dan lapor.

---

## COMPUTATION RULES

### SUS (System Usability Scale)

Per responden:

```
contrib_Q1 = Q1 - 1                  (Q1, 3, 5, 7, 9 — ganjil)
contrib_Q3 = Q3 - 1
contrib_Q5 = Q5 - 1
contrib_Q7 = Q7 - 1
contrib_Q9 = Q9 - 1
contrib_Q2 = 5 - Q2                  (Q2, 4, 6, 8, 10 — genap)
contrib_Q4 = 5 - Q4
contrib_Q6 = 5 - Q6
contrib_Q8 = 5 - Q8
contrib_Q10 = 5 - Q10

skor_SUS_responden = (sum of contrib) × 2.5     // range 0-100
```

Per kelompok:

```
rata_kelompok = mean of skor_SUS_responden dalam kelompok
```

Rata-rata gabungan:

```
rata_gabungan = mean of all 30 skor_SUS_responden
```

Interpretasi grade + adjective (Khan dkk., 2025; Deshmukh & Chalmeta, 2024):

| Rentang Skor | Grade | Adjective | Penerimaan |
|---|---|---|---|
| ≥ 80,3 | A | Excellent | Acceptable |
| 74 – 80,2 | B | Good | Acceptable |
| 68 – 73,9 | C | OK | Marginal-Acceptable |
| 51,7 – 67,9 | D | Poor | Marginal |
| < 51,7 | F | Worst | Not Acceptable |

Format angka di skripsi: koma sebagai desimal (`81,50` bukan `81.50`). Round ke 2 desimal.

### UAT Likert (8 Pertanyaan, skala 1-5)

Per pertanyaan:

```
distribusi: count(STS=1), count(TS=2), count(N=3), count(S=4), count(SS=5)
total_skor = STS×1 + TS×2 + N×3 + S×4 + SS×5
rata_per_pertanyaan = total_skor / n
```

Rata-rata keseluruhan:

```
rata_keseluruhan = (sum of 8 rata_per_pertanyaan) / 8
```

Ambang penerimaan (Hair dkk., 2022): `4,0`. Setiap pertanyaan dengan rata < 4,0 = FLAG di analisis paragraf.

### 5 Faktor Manusia Terukur (5 Pertanyaan per kelompok, skala 1-5)

Sama seperti UAT Likert tapi 5 pertanyaan, bukan 8. Output per faktor:

```
distribusi: STS, TS, N, S, SS
total_skor
rata_per_faktor
```

Rata-rata 5 Faktor: `(F1 + F2 + F3 + F4 + F5) / 5`.

### BBT 36 Skenario

```
pass_count = count of scenarios dengan status PASS
total = 36
tingkat_keberhasilan = (pass_count / 36) × 100   // round 2 desimal, format komma
fail_count = 36 - pass_count
```

Identifikasi skenario yang gagal — lo butuh detail dari Dava (skenario mana, alasan singkat) untuk paragraf penutup Bab 4.3.2.

---

## ANALYSIS WRITING RULES

Setiap paragraf analisis WAJIB mengandung:

1. **Angka utama** (rata-rata keseluruhan, skor SUS gabungan, persentase BBT)
2. **Komparasi ke ambang** (Hair 4,0 untuk UAT; Khan/Deshmukh grade untuk SUS)
3. **Highlight skor tertinggi** (1 butir/faktor)
4. **Highlight skor terendah** (1 butir/faktor, kalau di bawah ambang FLAG)
5. **Interpretasi kontekstual** (apa artinya untuk hotel kecil-menengah / chatbot LLM / RBAC, dst.)

DILARANG hedging. Format kalimat definitif:
- ✅ "Skor 4,36 melampaui ambang penerimaan 4,0 yang ditetapkan Hair dkk. (2022)."
- ❌ "Skor 4,36 cenderung melampaui ambang yang mungkin menunjukkan penerimaan."

Panjang paragraf: 3-6 kalimat per section analisis (Tabel 4.13, 4.14, 4.15, BBT, wawancara ringkasan).

Untuk wawancara: tulis paragraf konsensus + paragraf divergensi. Format:
- "Keempat narasumber menunjukkan konsensus terhadap N hal: (1)...; (2)...; (3)..."
- "Divergensi muncul pada [topik]: [narasumber A] berpendapat X, sedangkan [narasumber B] berpendapat Y."

---

## EDITING RULES (REPLACE DUMMY → REAL)

Untuk SETIAP cell/text run ber-yellow yang di-replace:

```
1. Replace text (real dari hasil compute / paragraf analisis lo)
2. SET highlight color = None (atau wdNoHighlight di Word)
3. Pastikan formatting lain (bold, italic, font size) tetap sama
```

Cell tabel: replace cell.body.text + set cell.body.font.highlightColor = "NoColor".
Inline run: replace run.text + set run.font.highlightColor = "NoColor".

JANGAN tambah/hapus baris di tabel. Struktur Tabel 4.13/4.14/4.15/3.3 sudah fix.

---

## PER-COMPONENT INSTRUCTION

### Komponen 1 — SUS (Tabel 4.15)

**Input dari Dava:** 30 responden × 10 Q, format CSV `responden_id, kelompok, Q1...Q10`.

**Lo lakuin:**
1. Validasi: total 30 baris, kolom Q1-Q10 isi 1-5, kelompok di-split jadi staf (~10) + tamu (~20)
2. Compute SUS per responden (formula di atas)
3. Compute rata-rata staf, rata-rata tamu, rata-rata gabungan
4. Tentukan grade + adjective per kelompok
5. Replace 15 sel di Tabel 4.15:
   - Baris Staf Hotel: n, rata SUS, grade, adjective, penerimaan
   - Baris Tamu: n, rata, grade, adjective, penerimaan
   - Baris Gabungan: n=30, rata, grade, adjective, penerimaan
6. Replace paragraf analisis Bab 4.3.2.10.3 — overwrite isi dummy dengan analisis riil per template "ANALYSIS WRITING RULES"
7. Remove yellow dari semua run yang di-replace
8. Update Bab 5.1 Simpulan poin 1 (SUS staf) dan poin 2 (SUS tamu) — replace angka

### Komponen 2 — UAT Staf (Tabel 4.13 + Bab 4.3.1.1)

**Input:** 10 responden × 8 Q untuk Tabel 4.13. Plus 10 responden × 5 Faktor untuk Bab 4.3.1.1.

**Lo lakuin:**
1. Validasi: 10 baris, semua Q isi 1-5
2. Compute distribusi STS/TS/N/S/SS per Q (Tabel 4.13)
3. Compute rata per Q + rata keseluruhan
4. Replace 56 sel data + 1 sel "Rata-rata Keseluruhan" di Tabel 4.13
5. Replace paragraf analisis Bab 4.3.2.10.1
6. Untuk 5 Faktor: compute distribusi + rata per faktor (dari 5-kolom data)
7. Replace 5 paragraf "Hasil:" di Bab 4.3.1.1 (Faktor 1-5)
8. Update Bab 5.1 Simpulan poin 1 — replace UAT 4,36 dummy dengan angka riil
9. Remove yellow dari semua run yang di-replace

### Komponen 3 — UAT Tamu (Tabel 4.14 + Bab 4.3.1.2)

Sama seperti Komponen 2, untuk n=20. Update Bab 5.1 Simpulan poin 2.

### Komponen 4 — Wawancara (Tabel 3.3)

**Input:** 4 transkrip narasumber (Manajer Hotel, Front Desk, Supervisor HK, Staf Keuangan), masing-masing 6 jawaban Q1-Q6.

**Lo lakuin:**
1. Compress setiap jawaban ke 1-3 kalimat — preserve MAKNA, bukan kata.
2. Replace 24 sel data Tabel 3.3 (4 kolom narasumber × 6 baris pertanyaan)
3. Tulis paragraf ringkasan konsensus + divergensi (Bab 3.2.2 setelah Tabel 3.3) — replace dummy
4. Remove yellow

DILARANG ringkas hingga makna berubah. Kalau Manajer bilang "saya kesal karena rekonsiliasi makan 3 hari", JANGAN compress jadi "Manajer keberatan dengan rekonsiliasi". Pertahankan "3 hari" detail-nya.

### Komponen 5 — Kuesioner Analisis Kebutuhan (Bab 3.2.2)

**Input:** Hasil kuesioner pra-pengembangan (jika ada). Kalau tidak ada, biarkan dummy + lapor.

**Lo lakuin:**
1. Replace 4 paragraf Kategori 1-4 + ringkasan triangulasi
2. Remove yellow

### Komponen 6 — BBT Execution Results

**Input:** Hasil eksekusi 36 skenario (PASS/FAIL per skenario + detail FAIL).

**Lo lakuin:**
1. Compute tingkat keberhasilan (pass_count / 36 × 100)
2. Identifikasi skenario yang FAIL, ambil detail dari Dava
3. Replace paragraf penutup Bab 4.3.2 — replace 97,22% dummy + detail "1 minor finding" dummy dengan data riil
4. Update kolom Status di Tabel 4.4 - Tabel 4.12 dari `[diuji]` jadi `Berhasil` / `Gagal` per skenario (36 cell status)
5. Update Bab 5.1 Simpulan poin 1 dan poin 3 — replace 97,22% dummy
6. Remove yellow dari paragraf penutup

---

## SYNC `.md` SOURCE-OF-TRUTH

Setelah replace di `.docx`, MIRROR perubahan ke `docs/Skripsi_StayManager_Fixed.md`:

1. Untuk setiap dummy yang di-replace, edit baris .md yang sesuai
2. Hapus `<span style="background:yellow">...</span>` wrapper, gunakan plain text di dalamnya
3. Format Indonesian decimal (koma): `4,36` bukan `4.36`

`.md` adalah source-of-truth — kalau .docx beda dari .md = bug.

---

## FORMAT REPORT BALIK (PERSIS STRUKTUR INI)

```
🔄 PHASE 2 — KOMPONEN <nama>

Input received:
  - Jumlah responden / narasumber: <N>
  - Validasi: PASS / FAIL <alasan>

Computation:
  - <key aggregate, mis: SUS gabungan = 81,50>
  - <grade / adjective / kategori>

Replaced di .docx:
  - <count> sel tabel
  - <count> paragraf analisis
  - Yellow removed: <count>

Mirrored ke .md: YES / NO

Cross-check Bab 5.1 Simpulan: <updated poin X dengan angka Y>

Yellow remaining di scope ini: <should be 0>
Yellow total di doc setelah batch: <count>
Pages: <before> → <after>
Word count: <before> → <after>

STATUS: PASS / NEED-DAVA-INPUT / FAIL
```

Kalau STATUS = NEED-DAVA-INPUT, tulis pertanyaan spesifik di bawah report. JANGAN apply batch sebelum Dava jawab.

---

## CARA DAVA KIRIM RAW DATA KE LO

Dava akan paste raw data per komponen di chat. Format yang dia ikutin ada di `docs/verification/raw-data-paste-templates.md`. Lo PARSE persis sesuai format.

Kalau Dava paste format menyimpang (mis: header beda, skala 1-7 bukan 1-5, kolom lebih/kurang), STOP dan tanya. JANGAN auto-coerce.

---

## URUTAN EKSEKUSI YANG DI-RECOMMEND

Lo apply per-komponen sekuensial, BUKAN paralel:

1. SUS (paling deterministik)
2. UAT Staf
3. UAT Tamu
4. 5 Faktor Staf
5. 5 Faktor Tamu
6. Wawancara
7. Kuesioner analisis kebutuhan
8. BBT execution

Setelah setiap batch, kirim report ke Dava. Tunggu konfirmasi sebelum lanjut komponen berikutnya.

---

## END-STATE TARGET

Setelah semua 8 komponen di-apply:

- 0 yellow highlight tersisa di scope dummy yang disebut di "STATE DOKUMEN SAAT INI"
- `.md` dan `.docx` sinkron
- Tabel 4.4-4.12 status column = `Berhasil`/`Gagal` (bukan `[diuji]` lagi)
- Bab 5.1 Simpulan = angka riil
- Total yellow tersisa di doc < 10 (sisanya = mungkin ada dummy di scope lain yang bukan tanggung jawab Phase 2, biarkan)
