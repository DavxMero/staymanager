# NOTES — Catatan Konsolidasi StayManager

> File ini merangkum semua dokumen kerja (working notes) yang dihapus saat cleanup 2026-06-10,
> plus catatan teknis penting. Versi lengkap setiap dokumen masih ada di git history
> (commit `ac1d7e9` "chore: snapshot docs, assets, verification artifacts before cleanup").

---

## Catatan Teknis Penting (operasional)

### Fix Realtime (2026-06-10) — AKAR MASALAH kalender tidak update
- Publication `supabase_realtime` di project `ncjneagfadrmivgicszm` **kosong (0 tabel)** sejak awal → semua subscription `postgres_changes` di `/occupancy` dan `/dashboard` tidak pernah menerima event.
- Fix: migration `supabase/migrations/20260610120000_enable_realtime_publication.sql` menambahkan `reservations`, `payments`, `rooms`, `guest_facility_requests` ke publication. Sudah di-apply ke project live dan terverifikasi (4 baris di `pg_publication_tables`).
- Jika menambah tabel baru yang perlu realtime: `alter publication supabase_realtime add table public.<nama_tabel>;`
- Terverifikasi end-to-end 2026-06-10: subscribe `postgres_changes` + no-op UPDATE pada `rooms` → event diterima <1 detik. Catatan: poller server butuh ±beberapa detik saat koneksi pertama (cold start) — tunggu ack `system: Subscribed to PostgreSQL` sebelum menganggap gagal.

### Middleware Next.js — sengaja tidak ada
- `src/middleware.ts` tidak pernah ada; `src/lib/supabase/middleware.ts` (`updateSession`) adalah dead code dan sudah dihapus.
- Refresh sesi auth berjalan via browser client (`@supabase/ssr` `createBrowserClient`, `autoRefreshToken: true`).
- Jika kelak butuh refresh sesi server-side, buat `src/middleware.ts` yang memanggil `updateSession` — ambil implementasinya dari git history.

### E2E test users
- Script `scripts/setup-e2e-test-users.mjs` (one-shot, sudah dihapus) pernah membuat user test di DB; user-nya sudah ada di Supabase Auth. Implementasi ada di git history bila perlu dibuat ulang.

### Tech debt yang disengaja (jangan kaget)
- `src/app/occupancy/page.tsx` ±3.500 baris, monolitik `'use client'` berisi CheckoutDialog/CheckinDialog/GuestHistoryDialog/CalendarBookingDialog inline. Sengaja TIDAK dipecah saat cleanup (risiko regresi menjelang sidang). Kandidat refactor setelah skripsi selesai.

---

## Skripsi & Dokumen Akademik (dihapus, dirangkum di sini)

### Skripsi_StayManager_Fixed.md (370KB — OUTDATED, versi final di Word)
- Draf tesis 5 bab (Pendahuluan, Tinjauan Pustaka, Metode, Hasil & Pembahasan, Kesimpulan), 2.210 baris.
- Bertanda revisi 2026-05-17/19 (LOKASI-1..10) yang menunjuk file implementasi untuk verifikasi klaim.
- Fakta kunci yang dicatat: 26 tabel publik Supabase (setelah drop `ai_messages`), 6 role RBAC, 14 modul aplikasi, chatbot Gemini 2.5 Flash, 34 skenario Black Box Testing.

### THESIS_CLAIMS_VERIFICATION.md (audit klaim 2026-05-12)
- 36 klaim Bab 3-4 diverifikasi terhadap kode + DB live: 25 tepat, 9 sebagian, 2 salah.
- Koreksi penting yang HARUS masuk versi Word: Next.js **16** (bukan 15); kolom rooms = `number`/`base_price` (bukan `room_number`/`price_per_night`); `custom_room_types.amenities` (bukan `facilities`); role `front_desk` (bukan "Receptionist"); tidak ada role "Inventory Staff"; **tidak ada automated test suite** (klaim harus dihapus).
- Klaim chatbot (4 tools, auth, marker JSON), RLS, room image management: semua terverifikasi benar.

### Skripsi_Audit_Report.md (audit #1 2026-05-07, #2 2026-05-17)
- Audit #2: 8 koreksi wajib High-priority sebelum cetak; 6 klaim baru layak masuk Bab 4 (Stop/Regenerate, date-first booking, type-grouped cards, server-side auth gate, non-enumerable booking reference, amenities editor).
- Yang sudah benar (jangan ubah): Gemini 2.5 Flash, 4 chatbot tools, Supabase Realtime, auto-create invoice, 6 RBAC roles, multibahasa ID/EN, pay-now/pay-later.
- Insiden: folder docs terhapus 2026-05-07, dipulihkan dari git → pelajaran: commit segera.

### THESIS_REVISION_NOTES.md (ground-truth 2026-05-11)
- Chatbot anonymous vs authenticated: anonymous boleh READ (ketersediaan, fasilitas; RLS public read `custom_room_types`), WRITE (`createBooking`) wajib login → semua reservasi terikat akun terautentikasi.
- Paradox tercatat: `InteractiveBookingCard` menandai phone "Opsional" di UI, tapi Zod schema `createBooking` mewajibkannya.

### APP_SUMMARY.md (snapshot 2026-05-17)
- Ground-truth aplikasi: Next.js 16, React 19, TS 5, Tailwind 4, Supabase, Gemini 2.5 Flash (`@ai-sdk/google` 1.0.10).
- 18 API routes + 14 halaman dashboard; 4 chatbot tools (`cekKetersediaan`, `createBooking`, `getRoomTypes`, `confirmPayment`); 27→26 tabel setelah cleanup.
- Sejarah: multi-provider → Gemini-only (Groq/Llama dihapus); UI overhaul chatbot; drop tabel `ai_messages`.
- Pengganti yang lebih akurat & hidup: `docs/verification/repo-facts.json` (dipertahankan).

### Interview_Script_dan_Recruitment.md (data collection SELESAI)
- Strategi B: interview 45-60 menit, 2-4 narasumber dari 1-2 hotel kenalan; 6 pertanyaan inti (sistem saat ini, kendala per peran, fitur dibutuhkan, pengelolaan tamu/reservasi, dst).
- Target responden total ±30-35: interview 2-4 + Form 1A Staf (3-5) + Form 1B Evaluator (5-7) + Form 2 Tamu (20+) + Form 3 SUS (semua).
- Limitasi diakui: single-case study; evaluator non-hotel untuk validasi usability umum.

### Diagram_Database_Baru.md
- 4 diagram Mermaid (ERD 25 entity, Class Diagram 11 class, Flowchart auth→modul, Sequence chatbot booking) yang sudah aligned dengan DB pasca-cleanup. Source `.mmd` terbaru ada di `docs/assets/diagrams-src/` (dipertahankan).

### BlackBox_Testing_Checklist.md
- 34 skenario manual, 9 modul (Autentikasi 5, Dashboard 3, Kamar 5, Tamu 4, Keuangan 4, Logistik 3, Chatbot 4, Laporan 3, RBAC 3). Hasil ditransfer ke Tabel 4.4–4.12 skripsi. Versi terbaru checklist + hasil otomatis ada di `docs/verification/bbt-results.json` (dipertahankan).

### migration_plan.md & database_structure.md (planning docs, kadaluarsa)
- `migration_plan.md`: rencana migrasi template Gemini Chatbot → `/chatbot` + Supabase (AI SDK v3→v5, drop Drizzle/NextAuth) — sudah lama tereksekusi.
- `database_structure.md`: checklist planning tabel awal — bukan ground-truth; schema aktual lihat `repo-facts.json` / introspeksi live.

---

## SUS / Google Forms (data collection selesai)

### EXECUTION_LOG.md + SUS_revision_comparison.md
- Revisi Google Form SUS (Form ID `1LSPiXl1-JbxMYzHDWgaIyWrjujJN_MMZw8NXsyHJjLg`) untuk align Brooke 1996 / Tabel 2.2: pengantar helpText, wording Q2 ("...seharusnya tidak **perlu**" — kata "perlu" wajib ada), wording Q9.
- 18 responden wave-1 tetap ter-link karena revisi preserve item ID; script idempotent.

### File .gs (Apps Script, dihapus)
- `google_forms_script.gs` (v4.1): master pembuat kuesioner 3-branching (Staf / Evaluator / Tamu) → SUS.
- `inspect_form.gs`: inspeksi read-only form.
- `revise_sus_form.gs`: revisi v3 (3 fix teks).
- **`revise_sus_form_v2.gs` = VERSI FINAL** — handle GridItem (SUS grid ID 1917380744, Schneiderman grid ID 353947777), ada mode DRY-RUN.

---

## Aset Gambar & Pipeline

### ASSET_GUIDE.md + Asset_Generation_Guide.md + skripsi-assets/MANIFEST_V4.md
- Pipeline aset v4.1 (workspace `skripsi-assets/`, dihapus 2026-06-10): naming `gambar-X-NN.png`, render Mermaid 1950px scale 2 (300 DPI A4), theme neutral, background white.
- Status akhir: 56 gambar — Bab 1 (1), Bab 2 (6), Bab 3 (26, schema-aligned v4.1), Bab 4 (23 screenshot Playwright 1280x800 deviceScale 2).
- Cara re-render manual satu diagram: `mmdc -i input.mmd -o output.png -w 1950 --scale 2 -t neutral -b white` (atau mermaid.live).
- Output final yang dipertahankan: `docs/assets/images/` (36 PNG terkurasi, termasuk 9 `gambar-4-24..4-32-bbt-*.png` yang direferensikan skripsi) + source `docs/assets/diagrams-src/` (28 .mmd).

### image-audit-rekap.md + image-requirements.md (docs/verification)
- Audit 53 placeholder gambar skripsi: kategori A screenshot / B diagram dari kode / C referensi umum; temuan kritis: konflik renumbering, mockup vs screenshot, missing capture 4.5/4.8, perlunya anotasi faktor/golden rules.

---

## Verifikasi & Word-Agent (docs/verification, MD dihapus; JSON/PNG/spec dipertahankan)

- `bbt-results.json` (KEEP): hasil Playwright — 1 test passed, 2026-06-10, durasi 49 detik, Chromium, 1 worker.
- `repo-facts.json` (KEEP): fakta repo terverifikasi (dependencies, API chat tools, constraint DB termasuk EXCLUDE GiST anti-double-booking, 6 role RBAC, route map) — dipakai agent Word untuk cross-check skripsi.
- Screenshot bukti (KEEP): `ui-1..ui-5*.png` (alur cancel/restore), `chat-1/chat-2*.png` (chatbot bookings).
- MD yang dihapus: README (konvensi diff-report), bbt-manual-checklist (36 skenario versi 2026-05-27), sync-prompt-* dan word-agent-* (prompt kerja satu kali untuk sinkronisasi markdown→Word, fase data integration & replace dummy), raw-data-paste-templates, verifikasi-diagram-bab3.

---

## Cleanup 2026-06-10 — apa yang dihapus & kenapa

| Kategori | Dihapus | Alasan |
|---|---|---|
| Kode orphan | 5 komponen billing, `src/proxy.ts`, `src/lib/supabase/middleware.ts`, `edit_guest_facilities.js`, 2 script | Tidak pernah di-import/dipakai |
| MD docs | 14 file docs/ + 12 file verification/ → file ini | Working notes selesai |
| .gs | 4 Apps Script | One-off, form sudah final (v2) |
| Gambar | `.b64` intermediates, duplikat jpg/png bab3-bab4, `images-compact/`, png timestamped | Redundant, versi terkurasi ada di `images/` |
| `skripsi-assets/` | Seluruh workspace pipeline | Output final sudah di `docs/assets/`; REFERENCES_*.md dipindah ke `docs/` |
| `test-results/` | Output Playwright | Regenerable; masuk .gitignore |

Semua recoverable dari git history (commit snapshot `ac1d7e9` dan sebelumnya).
