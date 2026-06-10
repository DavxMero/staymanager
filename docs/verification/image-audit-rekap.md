# Audit & Rekap Gambar Skripsi — Sebelum Eksekusi

**Versi:** 2026-05-27
**Total placeholder:** 53 `[GAMBAR BELUM DIINPUT]`
**Tujuan:** Audit → Rekap → Update SEBELUM insert manual ke `.docx`

## Legenda Kategori Sumber

| Kategori | Arti | Owner | Cara Generate |
|---|---|---|---|
| **A** | Screenshot dari aplikasi yang berjalan | Playwright capture | Auto-capture deployed/local app |
| **B** | Diagram turunan source code / DB schema (HARUS match codebase) | Word Agent (generate mermaid, verifikasi vs source) | Mermaid syntax → render PNG |
| **C** | Pengetahuan umum / referensi internet (contoh diagram, ilustrasi konsep) | Researcher Agent | Cari referensi + generate/sitasi |

## Legenda Status

- ✅ DONE — file sudah ada di `docs/assets/images/`
- 🔧 GENERATE — perlu dibuat (mermaid/screenshot/research)
- ⏳ PENDING — nunggu prasyarat (mis. app fitur, data)

---

## REKAP LENGKAP 53 GAMBAR

### Bab 2 — Landasan Teori (4 gambar, semua Kategori C)

| Gambar | Caption | Kategori | Status | Catatan |
|---|---|---|---|---|
| 2.5 | Contoh Use Case Diagram | C | 🔧 | Diagram generik UML untuk ilustrasi teori — bukan sistem StayManager |
| 2.6 | Contoh Class Diagram | C | 🔧 | Generik |
| 2.7 | Contoh Activity Diagram | C | 🔧 | Generik |
| 2.8 | Contoh Sequence Diagram | C | 🔧 | Generik |

### Bab 3 — Metodologi & Perancangan (26 gambar)

| Gambar | Caption | Kategori | Status | Source-code yang harus match |
|---|---|---|---|---|
| 3.1 | Alur Pengembangan Scrum | C | 🔧 | Metodologi umum (Sprint cycle) |
| 3.2 | Kerangka Berpikir Penelitian | C | 🔧 | Konseptual — dari narasi skripsi |
| 3.3 | Flowchart Alur Aplikasi | B | 🔧 | Routing: /login → RBAC → 14 modul |
| 3.4 | Use Case Diagram Sistem | B | 🔧 | 6 roles (super_admin, manager, front_desk, housekeeping, finance, guest) + use case per modul |
| 3.5 | Class Diagram Sistem | B | 🔧 | Entity DB: users, roles, rooms, guests, reservations, payments, housekeeping_tasks, invoices, billing_items, expenses, inventory_items, Chat |
| 3.6 | SD — Login Staf | B | 🔧 | supabase.auth.signInWithPassword → user_roles → redirect |
| 3.7 | SD — Chatbot Cek Ketersediaan | B | 🔧 | tool `cekKetersediaan(checkIn, checkOut, tipeKamar?)` |
| 3.8 | SD — Chatbot Create Booking | B | 🔧 | tool `createBooking(...)` |
| 3.9 | SD — Chatbot Konfirmasi Pembayaran | B | 🔧 | tool `confirmPayment(bookingReference, ...)` |
| 3.10 | Arsitektur Integrasi LLM dengan PMS | B | 🔧 | Next.js → /api/chat → @ai-sdk/google → Gemini → function calling → Supabase |
| 3.11 | SD — Check-in Tamu | B | 🔧 | update reservation status + room status (occupied) |
| 3.12 | SD — Check-out Tamu | B | 🔧 | update reservation + room (cleaning) + auto-billing |
| 3.13 | SD — Manajemen Kamar | B | 🔧 | CRUD /rooms |
| 3.14 | SD — Manajemen Housekeeping | B | 🔧 | housekeeping_tasks (daily-maintenance, checkout-cleaning endpoints) |
| 3.15 | AD — Proses Login | B | 🔧 | Match flow login |
| 3.16 | AD — Registrasi Akun Staff | B | 🔧 | Admin create user + assign role |
| 3.17 | AD — Reservasi via Chatbot | B | 🔧 | Match chatbot booking flow (date → cek → pilih → login prompt → book → pay) |
| 3.18 | AD — Check-in Tamu | B | 🔧 | Match check-in flow |
| 3.19 | AD — Pengelolaan Housekeeping | B | 🔧 | Match housekeeping task flow |
| 3.20 | AD — Pencatatan Transaksi Keuangan | B | 🔧 | Match /financial flow |
| 3.21 | Rancangan Antarmuka Halaman Publik | A/B | 🔧 | Bisa reuse screenshot `/` atau Figma mockup |
| 3.22 | Rancangan Antarmuka Chatbot | A/B | 🔧 | Bisa reuse `gambar-4-22-bbt-chatbot.png` |
| 3.23 | Rancangan Antarmuka Login | A/B | 🔧 | Bisa reuse `gambar-4-16-bbt-login.png` |
| 3.24 | Rancangan Antarmuka Manajemen Kamar | A/B | 🔧 | Bisa reuse `gambar-4-18-bbt-rooms.png` |
| 3.25 | Rancangan Antarmuka Modul Keuangan | A/B | 🔧 | Bisa reuse `gambar-4-20-bbt-finance.png` |
| 3.26 | ERD StayManager | B | 🔧 | **WAJIB match Supabase schema** — 26 tabel, FK relationships. Kritis. |

### Bab 4 — Implementasi & Evaluasi (23 gambar, semua Kategori A)

| Gambar | Caption | Kategori | Status | Source |
|---|---|---|---|---|
| 4.1 | Tampilan Halaman Login | A | ✅* | reuse `gambar-4-16-bbt-login.png` |
| 4.2 | Dashboard + Landing Page | A | ✅* | reuse `gambar-4-17-bbt-dashboard.png` |
| 4.3 | Modul Manajemen Kamar | A | ✅* | reuse `gambar-4-18-bbt-rooms.png` |
| 4.4 | Modul Manajemen Tamu | A | ✅* | reuse `gambar-4-19-bbt-guests.png` |
| 4.5 | Modul Reservasi | A | 🔧 | capture `/occupancy` atau `/reservations` (belum) |
| 4.6 | Modul Keuangan | A | ✅* | reuse `gambar-4-20-bbt-finance.png` |
| 4.7 | Modul Inventaris | A | ✅* | reuse `gambar-4-21-bbt-inventory.png` |
| 4.8 | (cek TOC — Inventaris/lain) | A | 🔧 | verifikasi caption di skripsi |
| 4.9 | Antarmuka Chatbot LLM | A | ✅* | reuse `gambar-4-22-bbt-chatbot.png` |
| 4.11 | Bukti Faktor 1 Learnability | A | 🔧 | screenshot login + anotasi |
| 4.12 | Bukti Faktor 2 Efficiency | A | 🔧 | dashboard + anotasi aksi cepat |
| 4.13 | Bukti Faktor 3 Memorability | A | 🔧 | 2 modul side-by-side (konsistensi) |
| 4.14 | Bukti Faktor 4 Error Rate | A | 🔧 | form + error validation visible |
| 4.15 | Bukti Faktor 5 Satisfaction | A | 🔧 | dashboard komprehensif |
| 4.16 | Bukti BBT Login | A | ✅ | `gambar-4-16-bbt-login.png` |
| 4.17 | Bukti BBT Dashboard | A | ✅ | `gambar-4-17-bbt-dashboard.png` |
| 4.18 | Bukti BBT Manajemen Kamar | A | ✅ | `gambar-4-18-bbt-rooms.png` |
| 4.19 | Bukti BBT Manajemen Tamu | A | ✅ | `gambar-4-19-bbt-guests.png` |
| 4.20 | Bukti BBT Keuangan | A | ✅ | `gambar-4-20-bbt-finance.png` |
| 4.21 | Bukti BBT Logistik / Aturan 6 | A | ✅/🔧 | **KONFLIK NOMOR** — `gambar-4-21-bbt-inventory.png` vs "Aturan 6 Golden Rules". Perlu renumber. |
| 4.22 | Bukti BBT Chatbot / Aturan 7 | A | ✅/🔧 | **KONFLIK NOMOR** — perlu renumber |
| 4.23 | Bukti BBT Laporan / Aturan 8 | A | ✅/🔧 | **KONFLIK NOMOR** — perlu renumber |
| 4.24 | Bukti BBT Settings | A | ✅ | `gambar-4-24-bbt-settings.png` |

\* = file sudah ada tapi caption/numbering perlu disesuaikan saat insert manual

---

## ⚠️ TEMUAN AUDIT — WAJIB RESOLVE SEBELUM EKSEKUSI

1. **Konflik penomoran Gambar 4.21-4.23:** Skripsi existing pakai 4.21-4.23 untuk "Bukti 8 Aturan Emas (Aturan 6, 7, 8)". Gue tadi pakai 4.21-4.24 untuk BBT screenshot. **Bentrok.** Perlu keputusan renumber — saran: BBT screenshot pindah ke 4.25-4.33, biarkan 4.21-4.23 untuk Golden Rules.

2. **Mockup Bab 3.21-3.25 vs Screenshot Bab 4:** Secara metodologi, "Rancangan Antarmuka" (Bab 3) idealnya mockup/wireframe PRA-implementasi, sedangkan Bab 4 screenshot hasil jadi. Kalau lo reuse screenshot Bab 4 untuk Bab 3, penguji bisa tanya "mana rancangan vs implementasi". Saran: Bab 3 pakai Figma wireframe sederhana ATAU kasih disclaimer "rancangan direpresentasikan oleh implementasi final".

3. **Gambar 4.5 Reservasi + 4.8:** belum ada capture — perlu Playwright tambahan.

4. **Bukti Faktor (4.11-4.15) + Golden Rules (4.21-4.23):** butuh screenshot ber-anotasi (panah/highlight), bukan raw capture. Perlu editing manual (Figma/Canva/Snipping Tool annotate).

---

## PROMPT UNTUK WORD AGENT — Generate Diagram Kategori B

> Forward ke Word Agent. Output: file mermaid `.mmd` per diagram, siap render via `mmdc`.

```
TUGAS: Generate mermaid diagram syntax untuk diagram Kategori B di skripsi StayManager.
Source-of-truth: codebase di e:/Github/staymanager + Supabase schema project ncjneagfadrmivgicszm.

ATURAN WAJIB:
1. Setiap diagram HARUS match implementasi aktual. JANGAN mengarang entity/flow/role yang tidak ada di code.
2. Verifikasi terhadap source sebelum generate:
   - ERD (3.26): query information_schema atau baca migration files. 26 tabel publik. Sertakan FK relationships aktual.
   - Use Case (3.4): 6 roles EKSAK: super_admin, manager, front_desk, housekeeping, finance, guest. Permissions dari tabel roles.
   - Class Diagram (3.5): entity dari tabel DB dengan kolom aktual (rooms=10 kolom, reservations=30 kolom, guests=10, payments=10, dst).
   - Sequence Diagram chatbot (3.7-3.9): tools EKSAK: cekKetersediaan, getRoomTypes, createBooking, confirmPayment (dari src/app/api/chat/route.ts).
   - Arsitektur LLM (3.10): Next.js 16 → /api/chat → @ai-sdk/google → Gemini 2.5 Flash → function calling → Supabase.
   - Activity/Sequence flows (3.11-3.20): baca handler aktual di src/app/api/ dan src/app/.
3. Kalau diagram di skripsi (markdown) menyebut flow/entity yang BEDA dengan code aktual → SESUAIKAN ke code, dan LAPOR perbedaannya ke Dava.
4. Output per diagram: blok ```mermaid ... ``` + 1 baris catatan "verified against: <file/tabel>".
5. JANGAN generate Kategori A (screenshot) atau Kategori C (contoh generik) — itu bukan tugas lo.

DELIVERABLE:
- File docs/assets/mermaid/gambar-3-XX.mmd untuk tiap diagram B
- Report ringkas: diagram mana yang isinya BERBEDA dari draft skripsi (kalau ada) + alasan penyesuaian
- Daftar diagram yang TIDAK bisa diverifikasi (butuh klarifikasi Dava)

DIAGRAM YANG DI-ASSIGN (Kategori B):
3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16, 3.17, 3.18, 3.19, 3.20, 3.26
```

---

## PROMPT UNTUK RESEARCHER AGENT — Gambar Kategori C

> Forward ke Researcher Agent. Untuk diagram contoh/ilustrasi dari pengetahuan umum + referensi.

```
TUGAS: Sediakan gambar/diagram Kategori C untuk skripsi StayManager — yaitu contoh diagram teoretis dan ilustrasi konsep yang BUKAN dari source code sistem, melainkan dari pengetahuan umum / referensi akademik.

ATURAN:
1. Untuk "contoh diagram" (Bab 2.5-2.8): buat diagram generik sederhana yang BENAR secara notasi UML standar (bukan spesifik StayManager). Sertakan sumber/sitasi referensi yang valid (≥2021 untuk methodological, foundational boleh older — cek aturan sitasi skripsi).
2. Untuk ilustrasi metodologi (3.1 Scrum, 3.2 Kerangka Berpikir): 
   - 3.1 Scrum: diagram siklus Sprint standar (Product Backlog → Sprint Planning → Sprint → Daily → Review → Retrospective). Sitasi sumber Scrum (mis. Schwaber & Sutherland Scrum Guide, atau paper Scrum ≥2021).
   - 3.2 Kerangka Berpikir: diagram alur penelitian Input→Proses→Output BERDASARKAN narasi Bab 3.1.1 skripsi (Researcher baca konten skripsi dulu).
3. Setiap gambar: sertakan (a) deskripsi visual, (b) tool saran (draw.io/mermaid/Canva), (c) sumber referensi + sitasi format APA.
4. JANGAN ambil gambar ber-hak cipta tanpa atribusi. Prefer: bikin sendiri dari notasi standar, atau gunakan sumber open/CC dengan sitasi.

DIAGRAM YANG DI-ASSIGN (Kategori C):
2.5 (contoh Use Case), 2.6 (contoh Class), 2.7 (contoh Activity), 2.8 (contoh Sequence), 3.1 (Alur Scrum), 3.2 (Kerangka Berpikir)

DELIVERABLE:
- Per gambar: deskripsi + mermaid/draw.io source ATAU URL referensi + sitasi APA
- Daftar sitasi yang perlu masuk ke REFERENSI skripsi
```

---

## WORKFLOW EKSEKUSI (Setelah Audit Disetujui Dava)

```
[FASE 1 — RESOLVE TEMUAN]
  ├─ Keputusan renumber Gambar 4.21-4.24 (BBT vs Golden Rules)
  ├─ Keputusan mockup Bab 3.21-3.25 (Figma vs reuse screenshot + disclaimer)
  └─ Konfirmasi caption Gambar 4.8

[FASE 2 — GENERATE]
  ├─ Word Agent → mermaid Kategori B (19 diagram)
  ├─ Researcher Agent → Kategori C (6 diagram)
  ├─ Playwright → Kategori A sisanya (4.5, 4.8, 4.11-4.15, 4.21-4.23 anotasi)
  └─ Render semua mermaid → PNG via mmdc

[FASE 3 — REKAP]
  └─ Semua 53 file ada di docs/assets/images/ dengan naming gambar-X-NN.png

[FASE 4 — INSERT MANUAL (Dava)]
  ├─ Buka .docx, cari tiap placeholder [GAMBAR BELUM DIINPUT — Gambar X.Y: ...]
  ├─ Insert > Picture > pilih file → center → caption di bawah
  └─ Hapus teks placeholder

[FASE 5 — VERIFIKASI]
  ├─ Cross-check Daftar Gambar (nomor halaman)
  ├─ Pastikan semua placeholder terganti
  └─ Tidak ada gambar broken/low-res
```

---

## RINGKASAN STATUS SEKARANG

| Kategori | Total | DONE | Perlu Generate |
|---|---|---|---|
| A (screenshot) | 23 | 9 (BBT) + 5 (reuse) = 14 | 9 (reservasi, faktor anotasi, golden rules) |
| B (source-code diagram) | 19 | 0 | 19 (Word Agent mermaid) |
| C (referensi umum) | 6 | 0 | 6 (Researcher agent) |
| **TOTAL** | **48 unik** | **14** | **34** |

(Catatan: 53 placeholder, beberapa overlap nomor — setelah renumber jadi ~48 unik)
