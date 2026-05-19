# Audit Report — `Skripsi_Final.txt` vs StayManager (Code + Supabase)

**Tanggal audit awal**: 2026-05-07
**Sumber ground truth**:
- Codebase di `e:\Github\staymanager` (commit `e39feef`, branch `master`)
- Supabase project: `ncjneagfadrmivgicszm` ("StayManager", region ap-southeast-1, Postgres 17)

**Verifikasi method**: grep source code + `list_tables` + `execute_sql` ke information_schema.

---

## Status Eksekusi (per 2026-05-07)

| Bagian | Status | Catatan |
|---|---|---|
| A1 (HeroUI/Mantine/react-hook-form/auth-helpers) | ✅ Word agent applied | |
| A2 (lib/rbac.ts → usePermissions.ts) | ✅ Applied | |
| A3 (Next.js 14 → 16, pnpm version) | ✅ Applied | |
| A4 (soft-delete claim) | ✅ Removed | |
| B (Tabel 3.7 schema) | ⏳ Sebagian — 4 tabel tambahan pending paste | payments, roles, user_roles, ai_messages |
| C (Modul Housekeeping) | ✅ Applied | Confirmed: tab di /rooms, 4 task types |
| D (Data empiris) | ⏳ User pilih Level 3, eksekusi 2 minggu | Real data collection |
| E1 (Landing page) | ✅ Sudah konsisten di skripsi | |
| E2 (Auto-create invoice) | ✅ Verified accurate | createCheckoutInvoice di occupancy/page.tsx |
| E3 (Alasan pembatalan) | ✅ Removed via A4 | |

---

## Verifikasi Database Supabase (Production)

**Total tables di public schema**: 27

**Active core entities** (yang punya data atau actively referenced):
1. `rooms`, `custom_room_types` — domain kamar
2. `guests`, `reservations` — domain reservasi
3. `profiles`, `roles`, `user_roles`, `staff_members` — domain user/RBAC
4. `invoices`, `billing_items`, `deposits`, `payments`, `expenses` — domain finansial
5. `inventory_items`, `inventory_suppliers`, `inventory_transactions`, `inventory_purchase_orders`, `inventory_purchase_order_items` — domain logistik
6. `guest_facility_requests`, `guest_facility_items` — domain layanan tamu
7. `housekeeping_tasks` — domain housekeeping
8. `Chat`, `ai_messages` — riwayat chatbot (note: `Chat` capital C)
9. `hotel_settings` — branding/config

**Likely legacy/unused**:
- `service_items`, `room_service_requests`, `users` (custom users table, bukan auth.users)

---

## Klaim yang Sudah Dikoreksi

### Bab 2 (Tinjauan Referensi)
- 2.4.1: "8 entitas utama" → "lebih dari 20 tabel"
- 2.7.2 / 2.8.2: Hapus mention HeroUI
- 2.9.1: `@supabase/auth-helpers-nextjs` → `@supabase/ssr`
- 2.9.3: `lib/rbac.ts`, `hasAnyRole()` → `lib/hooks/usePermissions.ts`, `hasPermission/hasAnyPermission/hasAllPermissions`

### Bab 3 (Metode Penelitian)
- 3.1 Sprint 5: Next.js 14 → Next.js 16
- 3.6.2 Tabel 3.7: schema diperbaiki (booking_code → booking_reference, dst). 4 tabel tambahan pending paste (payments, roles, user_roles, ai_messages)

### Bab 4 (Hasil & Pembahasan)
- 4.1.2 Tabel 4.3: pnpm v10.23.0 → v10.33.0, hapus HeroUI/Mantine
- 4.2.7 Modul Housekeeping: Kanban → tabel task list, koreksi task types ke 4 yang sebenarnya, hapus klaim notifikasi real-time
- 4.3.2.3 Aturan 5: hapus react-hook-form claim
- 4.3.2.3 Aturan 6: hapus soft-delete + alasan pembatalan claim

---

## Pending — Real Data Collection (2 minggu)

User memilih Level 3 (full real, 30 responden) dengan strategi 1 hotel teman sebagai case study.

**Action plan**: lihat [`Interview_Script_dan_Recruitment.md`](Interview_Script_dan_Recruitment.md)

**File pendukung**:
- [`BlackBox_Testing_Checklist.md`](BlackBox_Testing_Checklist.md) — 34 skenario solo execution
- [`UAT_SUS_Questionnaire.md`](UAT_SUS_Questionnaire.md) — Google Forms templates
- [`Interview_Script_dan_Recruitment.md`](Interview_Script_dan_Recruitment.md) — wawancara + UAT recruitment

**Tabel yang dikosongkan sementara**:
- Tabel 3.3 (4 narasumber) — placeholder "[diisi setelah wawancara]"
- Tabel 4.4-4.12 (Black Box) — kolom Status placeholder
- Tabel 4.13-4.14 (UAT) — kolom angka placeholder
- Bab 4.7 + Bab 5.1 — narasi angka spesifik distrip jadi placeholder

---

## Klaim yang DIVERIFIKASI BENAR (jangan diubah)

Untuk referensi penguji / pembimbing:

1. **Gemini 2.5 Flash via @ai-sdk/google** — verified di [`src/app/api/chat/route.ts:17`](src/app/api/chat/route.ts#L17)
2. **4 chatbot tools** (cekKetersediaan, createBooking, getRoomTypes, confirmPayment) — verified di [`src/app/api/chat/route.ts:226-553`](src/app/api/chat/route.ts#L226-L553)
3. **Supabase Realtime** untuk occupancy & dashboard — verified di [`src/app/occupancy/page.tsx:2644`](src/app/occupancy/page.tsx#L2644) dan [`src/components/dashboard/DashboardClient.tsx:107`](src/components/dashboard/DashboardClient.tsx#L107)
4. **Auto-create invoice saat checkout** — verified di [`src/app/occupancy/page.tsx:149`](src/app/occupancy/page.tsx#L149) (`createCheckoutInvoice` di-trigger oleh `handleCheckout`)
5. **6 RBAC roles** (super_admin, manager, front_desk, housekeeping, finance, guest) — verified di tabel `roles` Supabase + logic [`src/lib/hooks/usePermissions.ts`](src/lib/hooks/usePermissions.ts)
6. **Tech stack**: Next.js 16, React 19, TypeScript 5, Tailwind 4, Supabase, shadcn/ui, Radix UI, Zod, Framer Motion, Sonner — verified di [`package.json`](package.json)
7. **Multibahasa ID/EN, pay-now/pay-later, ROOM_CARDS_JSON** — verified di chatbot system prompt

---

## Catatan Insiden

Saat audit pertama (2026-05-07), folder `docs/` tidak sengaja terhapus dari working tree (kemungkinan akibat operasi Word save/sync). File-file dipulihkan dari git index, tapi versi pertama audit report ini hilang. Versi sekarang adalah regenerated copy.

Pelajaran: commit audit report ke git segera setelah selesai supaya tidak hilang.

---

## Audit Pass #2 — 2026-05-17

**Sumber ground truth**:
- Codebase: working tree branch `master`, HEAD `5458862` + uncommitted 2026-05-16 chatbot UX overhaul (lihat `CHANGELOG.md` § "2026-05-16 — Chatbot UX overhaul & cleanup")
- File skripsi yang diaudit: `docs/Skripsi_StayManager_Fixed.md` (2210 baris)
- Supabase project: `ncjneagfadrmivgicszm` — `list_tables` 2026-05-17: **27 tabel public schema** (sama dengan audit #1)

### Ringkasan Status

| Bagian skripsi | Status | Catatan |
|---|---|---|
| 4.1.2 Tabel 4.3 Spesifikasi PL | ✅ Akurat | Next.js 16, pnpm 10.33.0, AI SDK 4 / @ai-sdk/google 1.0.10, Recharts 3.5.1, Framer Motion 12.23.25, date-fns 4.1.0, Lucide 0.555.0, Zod 3.23.8 — semua match `package.json` |
| 4.2.13 Modul Chatbot LLM | ✅ Akurat | 4 tools (`cekKetersediaan`, `getRoomTypes`, `createBooking`, `confirmPayment`), Gemini 2.5 Flash, marker JSON UI, streaming via AI SDK — verified di `src/app/api/chat/route.ts` |
| 4.2.4 Modul Manajemen Kamar | ✅ Akurat | Multi-image carousel + `rooms.images jsonb` + Supabase Storage bucket `room-images` + fallback chain 4-tingkat |
| 4.2.7 Modul Housekeeping | ✅ Akurat | Tab di `/rooms` (bukan halaman terpisah), 4 task types |
| 3.3.2.3 Database — jumlah tabel | ✅ **FIXED 2026-05-17** | Tetap "26 tabel" — sempat naik ke 27 saat audit (Chat + ai_messages keduanya ada), lalu DB cleanup men-drop `ai_messages` kembali ke 26 |
| 3.3.2.3 Tabel 3.7 — `ai_chats` + `ai_messages` | ✅ **FIXED 2026-05-17** (Opsi A) | Skripsi diupdate: Tabel 3.7 row `ai_chats` → row `Chat` (uuid PK, user_id FK auth.users, messages JSONB, created_at). Row `ai_messages` dihapus. Narasi di-rewrite jadi single-table JSONB `Chat`. Core entities count 16 → 15 |
| 3.3.2.3 narasi `pos_transactions`, `pos_transaction_items` | ✅ **FIXED 2026-05-17** | Dihapus dari sub-domain (c) Finance di paragraf §3.3.2.3.1. Sub-domain (b) Hotel Operations dilengkapi `staff_members` |
| 3.3.2.3 `service_items`, `room_service_requests` | ⚠️ Legacy/unused | Ada di Supabase (0 rows) tapi tidak di-reference di kode aplikasi. Skripsi tidak menyebutkan — boleh diabaikan |
| 2.3.3 Google Gemini API | ✅ Akurat | Single-provider Gemini sejak 2026-05-16 overhaul (Groq + Llama removed). Skripsi sudah konsisten menulis Gemini saja |
| 2.9.3 RBAC | ✅ Akurat | 5 role staff (super_admin/manager/front_desk/housekeeping/finance) + `guest` = 6 total. Pakai `usePermissions` hook |
| 4.2.6 Modul Reservasi — overlap detection | ✅ Akurat | Overlap detection di app-layer (`cekKetersediaan` tool), bukan DB constraint — sesuai kode |

### Klaim BARU yang Perlu Ditambahkan / Dipertimbangkan untuk Skripsi

Berdasarkan 2026-05-16 chatbot UX overhaul, beberapa fitur baru yang **belum tercermin di skripsi** tapi worth menambahkan ke Bab 4 (atau Bab 5.2 Saran kalau di-frame sebagai future work):

1. ✅ **APPLIED 2026-05-17** **Stop & Regenerate buttons** pada chatbot (`useChat.stop()` + `useChat.reload()`) — ditambahkan di §4.2.13
2. ✅ **APPLIED 2026-05-17** **Date-first booking flow** dengan shadcn `Calendar` + `Popover` (menggantikan native date input) — ditambahkan di §4.2.13
3. ✅ **APPLIED 2026-05-17** **Type-grouped room cards** — agregasi per tipe kamar dengan count "X kamar tersedia" — ditambahkan di §4.2.13
4. ✅ **APPLIED 2026-05-17** **Server-side auth verification + booking ownership check** di `/api/chat` — guest_email match `verifiedUser.email` — ditambahkan di §4.2.13
5. ✅ **APPLIED 2026-05-17** **Non-enumerable booking reference**: `BK<6-digit-time><6-char-random>` — ditambahkan di §4.2.13
6. ✅ **APPLIED 2026-05-17** **Room amenities & bed configuration editor + room detail viewer modal** di /rooms — ditambahkan di §4.2.4

### Koreksi Wajib (High-priority)

Sebelum cetak skripsi final:

1. ✅ **APPLIED** **§3.3.2.3.1** (line 1401): tetap "26 tabel" (sempat diubah ke 27, lalu DB cleanup 2026-05-17 men-drop `ai_messages` sehingga count kembali 26 — angka asli skripsi kebetulan benar setelah alignment)
2. ✅ **APPLIED** **§3.3.2.3.1 sub-domain (c) Finance** (line 1401): `pos_transactions` & `pos_transaction_items` dihapus. Sub-domain (b) Hotel Operations dilengkapi `staff_members` (yang sebelumnya hilang). Sub-domain (e) Guest Services & AI: `ai_chats` → `Chat`.
3. ✅ **APPLIED — Opsi A+ (full alignment)** **§3.3.2.3.2 Tabel 3.7 + narasi**:
   - Tabel 3.7 row `ai_chats` (line 1421) diganti dengan row `Chat` schema actual (uuid PK, user_id FK auth.users, messages JSONB, created_at)
   - Tabel 3.7 row `ai_messages` (line 1429) dihapus → total core entities turun dari 16 ke 15
   - Narasi "Tabel ai_chats dan ai_messages" (line 1451) di-rewrite jadi "Tabel Chat" (single-table JSONB)
   - Narasi "Tabel ai_messages" (line 1463) dihapus
   - Line 1409: "16 entitas" → "15 entitas"
4. ⏭️ **TIDAK PERLU** **§5.3 Keterbatasan Penelitian** (line 1986–1990): Explore pass mengonfirmasi tidak ada klaim "rate-limit handling" / "multi-key API" / "model selector" / "Llama" / "Groq" / "QuotaCountdown" / "round-robin" di file skripsi. Aman.

### Klaim DIVERIFIKASI BENAR (baru — tambahan ke list audit #1)

12. **Single-provider Gemini 2.5 Flash** (post 2026-05-16) — verified di `src/app/api/chat/route.ts:7-20` (`GEMINI_MODELS` registry, `resolveModel()` function)
13. **Server-side session auth di /api/chat** — verified di `route.ts:62-84` (`createServerSupabase().auth.getUser()`, override `userContext.isLoggedIn`)
14. **4 chatbot tools tetap sama** (`cekKetersediaan`, `getRoomTypes`, `createBooking`, `confirmPayment`) — verified di `route.ts:114-119`
15. **Multi-image gallery di rooms** (`rooms.images jsonb`, fallback chain 4-tingkat, bucket `room-images`) — verified di working tree `src/app/rooms/page.tsx`
16. **shadcn Calendar + Popover date picker** di chatbot — verified di working tree `src/components/chatbot/DateSelectionCard.tsx` (diff 117 baris)

### Yang Tidak Berubah dari Audit #1

Item 1–11 di section "Klaim yang DIVERIFIKASI BENAR" (audit #1) tetap valid:
- Supabase Realtime untuk occupancy & dashboard
- Auto-create invoice saat checkout (`createCheckoutInvoice` di `occupancy/page.tsx:149`)
- 6 RBAC roles
- Tech stack Next.js 16, React 19, TS 5, Tailwind 4
- Multibahasa ID/EN, pay-now/pay-later, marker JSON

---

*Audit pass #2 selesai 2026-05-17. Highlights: 3 koreksi wajib di Bab 3 schema (semua APPLIED), plus 6 fitur baru di-mention di Bab 4 (§4.2.4 & §4.2.13, semua APPLIED), plus DB+code alignment cleanup (drop `ai_messages` + delete dead utility) untuk konsistensi tiga layer.*

---

## Cleanup Alignment 2026-05-17

Setelah audit pass #2, ditemukan inconsistency tiga layer (DB + backend + frontend) seputar chat persistence. Cleanup di-apply untuk align semuanya ke desain produksi nyata.

### Findings (sebelum cleanup)

Repo punya **dua desain bersamaan** sejak commit pertama (`a6b5c0f`, 2025-12-04):

| Layer | Desain A (produksi nyata) | Desain B (broken/abandoned) |
|---|---|---|
| Table | `Chat` (capital C, JSONB messages array, 6 rows) | `ai_chats` (tidak pernah dibuat) + `ai_messages` (0 rows) |
| Backend | — (langsung di komponen) | `src/lib/ai-chat-utils.ts` (saveChat, saveMessages, getChatHistory) |
| Endpoint | — | `/api/chat/history/route.ts` (orphan, tidak ada caller) |
| Frontend | `src/app/chatbot/page.tsx` (5 references) | — (utility tidak diimport) |
| Status | AKTIF | DEAD (kalau dipanggil pasti error 500 karena `ai_chats` ghost) |

### Cleanup applied

**Backend & frontend** (commit working tree 2026-05-17):
- ❌ DELETED `src/lib/ai-chat-utils.ts`
- ❌ DELETED `src/app/api/chat/history/route.ts` (+ folder kosong)
- ✅ `src/app/chatbot/page.tsx` tidak berubah (sudah benar sejak awal)
- ✅ Verifikasi: grep `ai_chats|ai_messages|ai-chat-utils` di seluruh `src/` → 0 hits

**Database** (migration `drop_unused_ai_messages` 2026-05-17):
```sql
DROP TABLE IF EXISTS public.ai_messages;
```
- 0 rows hilang (table sudah kosong)
- 0 FK incoming (tidak ada table lain depend)
- Total tabel public schema: 27 → **26**

**Skripsi alignment**:
- LOKASI-1: count `27` → `26` (kembali ke angka asli pre-audit, sekarang akurat)
- LOKASI-3/4/5/6 narrative tetap (sudah aligned ke `Chat` single-table)

### Rasionale

Dipilih cleanup-to-Chat (bukan migrate-to-ai_chats) karena:
1. **Risk minimal**: tidak ada data migration; production tidak ter-disrupt
2. **Less code change**: hanya delete dead code, tidak rewrite logic
3. **Match Vercel AI SDK convention**: `useChat` hook natural di-pair dengan JSONB messages array (load utuh per sesi)
4. **Skripsi sudah aligned**: narasi LOKASI-3/5 sudah pakai `Chat`, tidak perlu re-revise

Tradeoff: nama `Chat` (capital C, singular) tidak conventional untuk PostgreSQL (butuh double-quoting). Bisa di-rename ke `chats` (lowercase plural) di masa depan, tapi di luar skop UAT preparation saat ini.

---

## Audit Pass #2 — Eksekusi Edit (2026-05-17)

Semua koreksi wajib + tambahan fitur baru telah di-apply ke `docs/Skripsi_StayManager_Fixed.md`. Ringkasan perubahan:

**Bab 3 (Schema database):**
- `§3.3.2.3.1` (line 1401): "26 tabel" → "27 tabel"; `pos_transactions` & `pos_transaction_items` dihapus; `staff_members` ditambah di sub-domain (b); `ai_chats` → `Chat` di sub-domain (e)
- `§3.3.2.3.2` (line 1409): "16 entitas" → "15 entitas"
- Tabel 3.7 (line 1421): row `ai_chats` di-replace dengan row `Chat`
- Tabel 3.7 (line 1429): row `ai_messages` dihapus
- Narasi "Tabel ai_chats dan ai_messages" (line 1450-1452) di-rewrite jadi "Tabel Chat" (single-table JSONB)
- Narasi "Tabel ai_messages" (line 1463-1464) dihapus

**Bab 4 (Fitur baru):**
- `§4.2.4` Manajemen Kamar: tambah paragraf editor amenitas & konfigurasi tempat tidur + room detail viewer modal
- `§4.2.13` Modul Chatbot LLM: tambah deskripsi shadcn Calendar+Popover date-first flow, RoomCard type-grouped, tombol Stop & Regenerate, server-side auth + booking ownership check, format booking_reference non-prediktif

**Verifikasi pasca-edit yang disarankan**:
1. Baca ulang §3.3.2.3 + Tabel 3.7 di file Word/PDF skripsi untuk pastikan format tabel rapi
2. Pastikan ERD (Gambar 3.26, line 1403) tidak perlu diregenerate — kalau sudah merepresentasikan two-table ai_chats/ai_messages, perlu redraw ke single-table Chat
3. Cek di Bab 4 apakah ada Gambar baru yang perlu diambil untuk: amenities editor, room detail modal, Stop/Regenerate button, shadcn Calendar picker
