# Template Paste Raw Data → Claude

Saat lo siap bring data riil, paste ke chat dengan SALAH SATU format di bawah (per komponen).

DILARANG paraphrase template. Paste apa adanya supaya parsing-nya deterministik.

---

## KOMPONEN 1 — SUS (30 Responden × 10 Pertanyaan)

Format inline (paling clean):

```
=== RAW DATA SUS ===
R01,staf,4,2,5,1,4,2,5,1,4,2
R02,staf,5,1,5,2,4,1,5,2,5,1
R03,staf,...
...
R10,staf,...
R11,tamu,5,2,5,1,5,2,5,1,5,2
...
R30,tamu,...
=== END ===
```

Kolom: `responden_id, kelompok (staf/tamu), Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10`

Alternatif: paste raw export Google Form CSV/TSV apa adanya, sebutkan kolom mana yang Q1-Q10.

---

## KOMPONEN 2 — UAT Staf (10 Responden × 8 Pertanyaan)

```
=== RAW DATA UAT STAF ===
R01,4,5,5,4,4,4,5,5
R02,5,4,5,5,4,4,5,5
...
R10,...
=== END ===
```

Kolom: `responden_id, Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8` (skala 1-5)

Pertanyaan Q1-Q8 sudah fix di Tabel 4.13 — JANGAN ganti.

---

## KOMPONEN 3 — UAT Tamu (20 Responden × 8 Pertanyaan)

```
=== RAW DATA UAT TAMU ===
R01,5,4,4,5,4,4,4,5
R02,...
...
R20,...
=== END ===
```

Pertanyaan Q1-Q8 sudah fix di Tabel 4.14 — JANGAN ganti.

---

## KOMPONEN 4 — 5 Faktor Manusia Terukur Staf (10 Responden × 5 Faktor)

```
=== RAW DATA 5 FAKTOR STAF ===
R01,4,5,4,3,5
R02,...
...
R10,...
=== END ===
```

Kolom: `responden_id, F1_Learnability, F2_Efficiency, F3_Memorability, F4_ErrorRate, F5_Satisfaction` (skala 1-5)

---

## KOMPONEN 5 — 5 Faktor Manusia Terukur Tamu (20 Responden × 5 Faktor)

```
=== RAW DATA 5 FAKTOR TAMU ===
R01,5,4,4,4,5
...
R20,...
=== END ===
```

---

## KOMPONEN 6 — Wawancara (4 Narasumber × 6 Pertanyaan)

Karena wawancara video + dokumentasi, lo transkrip dulu ke text. Paste per narasumber:

```
=== TRANSKRIP WAWANCARA — NARASUMBER 1 (Manajer Hotel) ===
[Nama: ___]
[Tanggal wawancara: ___]
[Durasi: ___]

Q1 (Sistem saat ini):
<isi jawaban verbatim atau ringkasan kasar>

Q2 (Kendala terbesar):
<...>

Q3 (Fitur dibutuhkan):
<...>

Q4 (Pengelolaan tamu/reservasi):
<...>

Q5 (Manajemen hak akses):
<...>

Q6 (Kebutuhan chatbot):
<...>
=== END NARASUMBER 1 ===
```

Ulangi untuk Narasumber 2-4 (Staf Front Desk, Supervisor Housekeeping, Staf Keuangan).

Gue akan compress masing-masing jawaban ke 1-3 kalimat untuk Tabel 3.3 + tulis paragraf ringkasan konsensus/divergensi.

DILARANG ringkas dulu sebelum paste — paste verbatim biar gue yang compress (faithful to source).

---

## KOMPONEN 7 — Hasil Eksekusi BBT 36 Skenario

Setelah lo jalankan `bbt-playwright.spec.ts` ATAU manual checklist:

```
=== HASIL BBT ===
S01: PASS
S02: PASS
S03: PASS
S04: FAIL — alasan: <singkat, mis: "validasi field tidak muncul">
S05: PASS
...
S36: PASS
=== END ===
```

Atau paste output JSON Playwright report (file `playwright-report/results.json`).

Untuk skenario yang gagal, sertakan: alasan singkat + apakah lo udah perbaiki di code-nya atau itu diterima sebagai limitation.

---

## SETELAH RAW DATA MASUK

Workflow yang gue jalankan:

1. Validasi data (jumlah responden, range skala, kolom lengkap)
2. Compute aggregate (distribusi STS/TS/N/S/SS, total, rata-rata, SUS score per responden + per kelompok)
3. Compare ke ambang Hair dkk. (2022) / grade Khan dkk. (2025) / Deshmukh dan Chalmeta (2024)
4. Tulis paragraf analisis riil (komparasi: tinggi/rendah, surprise findings, dll)
5. Edit `.md` source-of-truth — REMOVE yellow span, ganti dengan data riil
6. Generate sync prompt untuk Word Agent (template di `word-agent-replace-dummy-template.md`)
7. Lo forward prompt + `.md` updated ke Word Agent → Word Agent apply ke `.docx`
8. Audit pasca-sync (cek yellow yang harus sudah hilang)
