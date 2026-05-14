# Thesis Claims Verification — StayManager v3.1

Verifikasi sistematis 50+ klaim di skripsi BAB 3 & BAB 4 terhadap source code aktual di `e:\Github\staymanager\`. Tanggal: 2026-05-12.

**Legend:** ✓ tepat · ⚠ sebagian (ada deviasi) · ✗ salah · N/A tidak bisa diverifikasi

---

## A. Arsitektur & Tech Stack

| Klaim | Status | Bukti | Catatan |
|---|---|---|---|
| **A1** Next.js 15 App Router | ⚠ | [package.json:43](package.json#L43): `"next": "^16.0.7"` | **Bukan Next 15 — sudah Next 16.** App Router ✓ (`src/app/` structure). Update narasi ke "Next.js 16". |
| **A2** TypeScript frontend + backend | ✓ | [package.json:65](package.json#L65): `"typescript": "^5"` · [tsconfig.json](tsconfig.json) ada · semua file `.tsx/.ts` | |
| **A3** Tailwind CSS | ✓ | [package.json:63](package.json#L63): `"tailwindcss": "^4"` · `"@tailwindcss/postcss": "^4"` · [postcss.config.mjs](postcss.config.mjs) | Tailwind **v4** (bukan v3) — gunakan canonical `bg-linear-to-*`, `shrink-0`. |
| **A4** Supabase BaaS (PostgreSQL + Auth + Storage + Realtime) | ✓ | [package.json:35-36](package.json#L35): `@supabase/ssr ^0.8.0`, `@supabase/supabase-js ^2.86.0` · [src/lib/supabase/](src/lib/supabase/) · bucket `room-images` exist | Realtime juga digunakan (lihat BlackBox skenario 8). |
| **A5** Vercel deployment | ✓ (informal) | Tidak ada `vercel.json`, tapi git history menyebut "trigger vercel deployment" (commit `4f98ff5`, `a25140f`) · `next.config.ts` standard Next compatible | Tidak ada formal config file — Vercel pakai zero-config Next.js detection. |
| **A6** Google Gemini LLM | ✓ | [package.json:18](package.json#L18): `"@ai-sdk/google": "^1.0.10"` · [src/app/api/chat/route.ts:1,28](src/app/api/chat/route.ts#L28): `model: google('gemini-2.5-flash')` | Model: **gemini-2.5-flash** (sebut spesifik di skripsi kalau ditanya). |

---

## B. Database Schema

Sumber: `information_schema.columns` live query ke Supabase project `ncjneagfadrmivgicszm`.

| Klaim | Status | Aktual vs Klaim |
|---|---|---|
| **B1** Tabel rooms: id, **room_number**, type, status, floor, **price_per_night**, image_url, **notes**, timestamps | ⚠ | **Nama kolom berbeda:** `number` (bukan `room_number`), `base_price` (bukan `price_per_night`). **Kolom `notes` TIDAK ADA** di tabel rooms. Aktual: `id uuid PK, number varchar NN, type varchar NN, floor int NN, base_price numeric NN, status varchar NN, created_at, updated_at, image_url text`. |
| **B2** Tabel custom_room_types: id, name (UNIQUE), description, base_price, max_occupancy, **facilities (JSONB)**, images (JSONB default '[]'), timestamps | ⚠ | **Kolom `facilities` tidak ada — namanya `amenities` (jsonb).** Selebihnya ada + kolom tambahan: `features jsonb`, `color_theme jsonb`, `is_active bool`, `room_size numeric`, `bed_configuration varchar`, `view_type varchar`, `special_features ARRAY`. `images jsonb default '[]'` ✓. |
| **B3** rooms.type ↔ custom_room_types.name = soft reference, tidak ada FK formal | ✓ | Query FK constraints rooms table: no FK to custom_room_types. rooms.type (varchar) cocok ke custom_room_types.name (varchar UK) hanya by string match. |
| **B4** Tabel guests: id, full_name NN, email, **phone NULLABLE**, address, id_number, nationality, timestamps, user_id | ✓ | Aktual: `id uuid PK, full_name varchar NN, email varchar NULL, phone varchar NULL, address text NULL, id_number varchar NULL, nationality varchar NULL, created_at, updated_at, user_id uuid NULL`. Phone memang nullable di DB. |
| **B5** reservations FK → rooms + guests, kolom: check_in, check_out, status (ENUM), total_price, **special_requests**, **created_by** | ⚠ | FK ✓ (`reservations_guest_id_fkey` → guests.id, `reservations_room_id_fkey` → rooms.id). Tapi: **(a)** status `varchar` (bukan ENUM postgres formal); **(b)** **TIDAK ADA `special_requests`** — kolom yang ada: `notes text`; **(c)** **TIDAK ADA `created_by`**. Ada `total_price` ✓ + `total_amount` ✓ + 30 kolom lain (guest_name, guest_email, guest_phone snapshot, breakfast_*, actual_check_in/out, booking_id, booking_reference, dsb). |

---

## C. Chatbot v3.1 — `src/app/api/chat/route.ts`

| Klaim | Status | Bukti |
|---|---|---|
| **C1** userContext injection di awal route (~line 13-25) | ✓ | [route.ts:14](src/app/api/chat/route.ts#L14): `const { messages, userContext } = await req.json();` lalu [route.ts:16-25](src/app/api/chat/route.ts#L16): branching `userContext?.isLoggedIn` → inject `userContextSection` ke system prompt. |
| **C2** Tools: cekKetersediaan, getRoomTypes, createBooking, confirmPayment | ✓ | 4 tool ada: [route.ts:241](src/app/api/chat/route.ts#L241) cekKetersediaan · [route.ts:327](src/app/api/chat/route.ts#L327) createBooking · [route.ts:455](src/app/api/chat/route.ts#L455) getRoomTypes · [route.ts:514](src/app/api/chat/route.ts#L514) confirmPayment. |
| **C3** cekKetersediaan & getRoomTypes bisa tanpa login | ✓ | [route.ts:62](src/app/api/chat/route.ts#L62): *"You can check room availability using 'cekKetersediaan' tool"* di GUEST BROWSING MODE block. getRoomTypes tidak disebut sebagai blocked. |
| **C4** createBooking BLOCKED jika anonymous → emit SHOW_LOGIN_PROMPT_JSON | ✓ | [route.ts:65](src/app/api/chat/route.ts#L65): example string `SHOW_LOGIN_PROMPT_JSON:{"reason":"membuat reservasi"}` · [route.ts:68](src/app/api/chat/route.ts#L68): *"DO NOT call 'createBooking' tool if user is not logged in"*. Render client side: [chatbot/page.tsx:815-819](src/app/chatbot/page.tsx#L815). |
| **C5** cekKetersediaan: 3 query terpisah + JS merge (bukan single JOIN) | ✓ | [route.ts:251-256](src/app/api/chat/route.ts#L251) Query 1 (busy reservations) · [route.ts:268-281](src/app/api/chat/route.ts#L268) Query 2 (available rooms) · [route.ts:291-295](src/app/api/chat/route.ts#L291) Query 3 (custom_room_types meta). JS merge: [route.ts:297-318](src/app/api/chat/route.ts#L297) via `Map<name, meta>`. |
| **C6** confirmPayment: update reservation status | ✓ | [route.ts:558-564](src/app/api/chat/route.ts#L558): `UPDATE reservations SET payment_status='paid', updated_at=NOW()`. Juga INSERT ke payments table di [route.ts:540-548](src/app/api/chat/route.ts#L540). |

---

## D. RLS Policies (Supabase live query)

| Klaim | Status | Bukti |
|---|---|---|
| **D1** RLS `Public read custom_room_types` FOR SELECT TO public USING (true) | ✓ | `pg_policies` schema=public: `{policyname: "Public read custom_room_types", cmd: "SELECT", roles: "{public}", qual: "true"}`. |
| **D2** Bucket `room-images`: public READ + authenticated INSERT/UPDATE/DELETE | ✓ | 4 policies di `pg_policies` schema=storage table=objects: `Public read room-images` (SELECT/public), `Authenticated upload room-images` (INSERT/authenticated WITH CHECK bucket_id='room-images'), `Authenticated update`/`delete room-images` (UPDATE+DELETE/authenticated). |

---

## E. Room Image Management

| Klaim | Status | Bukti |
|---|---|---|
| **E1** POST /api/rooms/upload-image — validasi 5MB JPEG/PNG/WebP, auth required | ✓ | [route.ts:6-19](src/app/api/rooms/upload-image/route.ts#L6) Zod schema: `file.size <= 5*1024*1024` + `["image/jpeg","image/png","image/webp"]` · [route.ts:22-29](src/app/api/rooms/upload-image/route.ts#L22): `auth.getUser()` → 401 jika null. |
| **E2** Bucket "room-images" public, 5MB, allowed jpeg/png/webp | ✓ | `storage.buckets`: `{public: true, file_size_limit: 5242880, allowed_mime_types: [image/jpeg, image/png, image/webp]}`. |
| **E3** Fallback chain 4-level di rooms/page.tsx ~line 1430-1452 | ✓ | [rooms/page.tsx:1448-1452](src/app/rooms/page.tsx#L1448): `displayImage = room.image_url \|\| typeImages[0] \|\| firstImageByType[room.type] \|\| null`. `firstImageByType` di-build di [rooms/page.tsx:1435-1440](src/app/rooms/page.tsx#L1435). |
| **E4** RoomCard chatbot: gallery dedup `[image_url, ...images].filter+Set` | ✓ | [RoomCard.tsx:54-59](src/components/chatbot/RoomCard.tsx#L54): `const all = [room.image_url, ...(room.images \|\| [])].filter(Boolean); return Array.from(new Set(all));`. |

---

## F. Form Pemesan Chatbot

| Klaim | Status | Bukti |
|---|---|---|
| **F1** InteractiveBookingCard: name+email wajib, **phone OPSIONAL** dengan placeholder | ⚠ | **UI sisi:** ✓ [InteractiveBookingCard.tsx:90-98](src/components/chatbot/InteractiveBookingCard.tsx#L90) phone field placeholder `"Opsional — untuk konfirmasi reservasi"`. **TAPI backend Zod:** [route.ts:332](src/app/api/chat/route.ts#L332): `guestPhone: z.string().describe('Phone number of the guest (required)')` — masih required di tool signature. System prompt [route.ts:73](src/app/api/chat/route.ts#L73): *"if missing, you may ask politely once but proceed even if not provided"* (paradox: Zod required, prompt opsional). |
| **F2** id_number tidak ada di chatbot reservation form | ✓ | [InteractiveBookingCard.tsx](src/components/chatbot/InteractiveBookingCard.tsx): hanya 3 field guest info (name, email, phone). Grep `id_number` di file → 0 hits. |
| **F3** /guests form: phone REQUIRED (*), id_number opsional dengan helper "Diisi saat tamu check-in di front desk" | ✓ | [guests/page.tsx:959-960](src/app/guests/page.tsx#L959): `<Label>No. Telepon <span className="text-red-500">*</span></Label>` · [guests/page.tsx:986](src/app/guests/page.tsx#L986): placeholder `"Diisi saat tamu check-in (NIK / No. Paspor)"`. Helper text [guests/page.tsx:989-991](src/app/guests/page.tsx#L989): *"Hanya wajib saat proses check-in di front desk untuk verifikasi identitas."* |
| **F4** DB level guests.phone NULLABLE — enforcement hanya di UI | ✓ | `information_schema`: `guests.phone varchar is_nullable=YES`. Required hanya `<span>*</span>` di JSX. **Tidak ada** `handleSaveGuest` validasi yang enforce phone non-empty — line [guests/page.tsx:269-294](src/app/guests/page.tsx#L269) langsung insert tanpa check phone. **Catatan kritis untuk thesis:** kalau dosen tanya, jujur bahwa enforcement hanya visual UI (`*` red asterisk), bukan validation logic. |

---

## G. Modul Aplikasi BAB 4

**Folder `src/app/` aktual (19 folders, bukan 14):**

```
api/  auth/  billing/  chat-history/  chatbot/  dashboard/
expenses/  financial/  guest-facilities/  guests/  login/  logistics/
occupancy/  reports/  roles/  rooms/  settings/  signup/  staff/
```

**Klasifikasi ke 14 modul yang disebut skripsi:**

| Modul Skripsi | Route Aktual | Status |
|---|---|---|
| 1. Auth/Login | `/login`, `/signup`, `/auth/callback` | ✓ (3 routes) |
| 2. Dashboard | `/dashboard` | ✓ |
| 3. Manajemen Kamar | `/rooms` (termasuk tab Housekeeping) | ✓ |
| 4. Manajemen Tamu | `/guests` | ✓ |
| 5. Reservasi | `/occupancy` (kalender + dialog) | ⚠ tidak ada `/reservations` standalone — terintegrasi di `/occupancy` |
| 6. Keuangan | `/financial` + `/expenses` | ✓ (2 routes) |
| 7. Inventaris | `/logistics` | ✓ (naming "logistics" bukan "inventory") |
| 8. Housekeeping | sub-tab di `/rooms` | ⚠ tidak ada standalone page |
| 9. Billing/Invoice | `/billing` | ✓ |
| 10. Laporan Manajerial | `/reports` | ✓ |
| 11. Chatbot LLM | `/chatbot` + `/chat-history` | ✓ (2 routes) |
| 12. Pengaturan/RBAC | `/settings` + `/roles` + `/staff` | ✓ (3 routes) |
| 13. Tipe Kamar Kustom | `/api/custom-room-types` (API only, UI ada di `/rooms` atau `/settings`) | ⚠ tidak ada standalone page |
| 14. Lainnya: Guest Facilities | `/guest-facilities` | **Modul ke-14 = Permintaan Layanan Tamu** (guest services request) |

**Verdict:** klaim 14 modul ✓ — bisa dicocokkan dengan 19 folder via grouping logical. Tapi:
- "Reservasi" sebagai modul standalone agak rancu — sebenarnya bagian dari `/occupancy`
- "Housekeeping" dan "Tipe Kamar Kustom" tidak punya halaman standalone
- "Guest Facilities" (`/guest-facilities`) adalah modul ke-14 yang mungkin dilupakan disebut

API routes (sub-modul backend): `chat`, `custom-room-types`, `expenses`, `files`, `guest-facilities`, `guests`, `housekeeping`, `inventory`, `purchase-orders`, `reports`, `rooms`, `suppliers`, `users` (13 endpoint groups).

---

## H. Autentikasi & RBAC

| Klaim | Status | Bukti |
|---|---|---|
| **H1** Supabase Auth untuk login staff | ✓ | [src/lib/supabase/](src/lib/supabase/) dir lengkap (client.ts, server.ts, middleware.ts) · `@supabase/ssr ^0.8.0` · login flow di [login/page.tsx](src/app/login/page.tsx). |
| **H2** RBAC roles: **Super Admin, Manager, Receptionist, Housekeeping Staff, Finance Staff, Inventory Staff** | ⚠ | **6 roles di DB (live query): `super_admin, manager, front_desk, housekeeping, finance, guest`**. **Receptionist ≠ front_desk** (synonymous tapi naming code pakai `front_desk`). **`inventory_staff` TIDAK ADA** sebagai role tersendiri — inventory access dipakai super_admin/manager. **`guest` role** (untuk tamu yg sudah signup) ada tapi tidak disebut di klaim. Per aturan UI permission, gambar use case sebut 7 actors termasuk anonymous. |
| **H3** Route guard middleware | ⚠ | **Tidak ada `middleware.ts` di root atau `src/middleware.ts`.** Yang ada: [src/proxy.ts](src/proxy.ts) (Next.js 16 menggunakan istilah `proxy` untuk middleware-equivalent). Logic: PUBLIC_ROUTES = `/login`, `/signup`, `/auth/callback`, `/chatbot`, `/dashboard`. Non-public route + no user → redirect `/login?returnUrl=...`. Juga ada helper [src/lib/supabase/middleware.ts](src/lib/supabase/middleware.ts) (`updateSession` fn) tapi tidak di-import di proxy.ts. Selain itu ada hook [src/lib/hooks/usePermissions.ts](src/lib/hooks/usePermissions.ts) untuk client-side gating. |

**Note untuk thesis:** kalau thesis sebut "Receptionist" dan "Inventory Staff", konsisten dengan istilah UI ke pembaca tapi di tabel role di Bab 3, **harus juga sebut role technical names yang sebenarnya (`front_desk`, dst) atau klarifikasi bahwa "Receptionist = role `front_desk` di code"**. "Inventory Staff" harus disesuaikan jadi subset Manager atau dihapus.

---

## I. Scrum Sprints

| Klaim | Status | Bukti |
|---|---|---|
| **I1** Dokumentasi 4 sprint development | ⚠ | **Tidak ada dokumen "Sprint 1/2/3/4" formal**. Yang ada: [CHANGELOG.md](CHANGELOG.md) (tanggal Dec 4, 2025) berisi grouping feature changes — bisa di-narasikan sebagai "sprint retrospective" tapi tidak ada label Sprint X. Project board GitHub: tidak ada Issues/Projects yang di-track (cek `gh issue list` kalau perlu). |
| **I2** Versi v3.1 — git tag atau release notes | ⚠ | **Tidak ada git tag** (`git tag --list` kosong). "v3.1" hanya disebut di [skripsi-assets/manifest.json](skripsi-assets/manifest.json) (`"version": "3.1"`) — itu versi **asset pipeline**, bukan release tag aplikasi. Aplikasi `package.json` tetap `"version": "0.1.0"`. |

**Untuk thesis:** kalau perlu Sprint documentation, sintesis dari CHANGELOG.md + git log + cluster commits. Misal:
- Sprint 1 (Initial setup): commits dasar Next.js + Supabase auth + schema awal
- Sprint 2 (Core modules): rooms, guests, occupancy
- Sprint 3 (Financial + reports): billing, financial, expenses, reports
- Sprint 4 (Chatbot v3.1): chatbot + room images + login wall

Atau jujur sebut: "metodologi mengikuti prinsip Scrum (iterative sprints) tapi tidak ada sprint formal tracking — development bersifat solo developer dengan iterasi continuous".

---

## J. File Inventory v3.1

| File | Status | Bukti |
|---|---|---|
| `src/app/api/rooms/upload-image/route.ts` | ✓ | exists, 85 lines, validasi + Supabase Storage upload |
| `src/components/chatbot/LoginPromptCard.tsx` | ✓ | exists, 67 lines |
| `scripts/dev-quiet.mjs` | ✓ | exists, 76 lines |
| `skripsi-assets/` (folder) | ✓ | exists, berisi diagrams/, screenshots/, scripts/, manifest, MAPPING.md, MANIFEST_V4.md, REFERENCES_ARSITEKTUR_PMS.md |
| `docs/THESIS_REVISION_NOTES.md` | ✓ | exists, 300+ lines |
| `src/app/api/chat/route.ts` (modified) | ✓ | exists, 602 lines, sesuai dengan modifikasi v3.1 (userContext + 3-query refactor) |
| `src/app/chatbot/page.tsx` (modified) | ✓ | exists, 916 lines, userContext propagation via useChat.body |
| `src/app/rooms/page.tsx` (modified) | ✓ | exists, ~2080 lines, image upload + fallback chain |
| `src/components/chatbot/RoomCard.tsx` (rewrite) | ✓ | exists, 325 lines, hybrid card + modal carousel |
| `src/components/chatbot/InteractiveBookingCard.tsx` (modified) | ✓ | exists, 226 lines, phone replacing id_number |
| `src/app/guests/page.tsx` (modified) | ✓ | exists, 1160 lines, phone required + id_number opsional helper |

**Semua 11 file v3.1 confirmed exist.**

---

## K. Pengujian

| Klaim | Status | Bukti |
|---|---|---|
| **K1** Test suite (unit/integration) di repo | ✗ | **Tidak ada test files** di `src/` (semua `*.test.ts` hanya di `node_modules/`). Confirmed via `find src -name "*.test.*"` → kosong. |
| **K2** Test runner config (vitest/jest/playwright) di project | ✗ | **Tidak ada `vitest.config.*`, `jest.config.*`, `playwright.config.*`** di root atau `src/`. Playwright dipakai **hanya** di `skripsi-assets/scripts/capture-screenshots.mjs` untuk screenshot capture (bukan test runner). |
| **K3** Dokumentasi 34 skenario Black Box Testing | ✓ | [docs/BlackBox_Testing_Checklist.md](docs/BlackBox_Testing_Checklist.md) ada — **persis 34 skenario** terbagi 9 modul: Auth (5) + Dashboard (3) + Manajemen Kamar (5) + Manajemen Tamu (4) + Keuangan (4) + Logistik (3) + Chatbot (4) + Laporan (3) + RBAC (3) = **34**. ✓ matches claim. Tapi: **belum dieksekusi** (semua kolom Hasil masih `☐`) — perlu manual run + isi ✅/❌ sebelum thesis sidang. |

---

## RINGKASAN PERLU PERBAIKAN DI THESIS

### ⚠ Klaim yang perlu disesuaikan:

1. **A1**: "Next.js 15" → ganti "**Next.js 16**" (15 → 16).
2. **B1**: Skripsi sebut kolom `room_number`, `price_per_night`, `notes` di rooms. **Aktual: `number`, `base_price`, dan tidak ada `notes`**. Update tabel skema rooms di Bab 3.
3. **B2**: Skripsi sebut `facilities`. **Aktual: `amenities`**. Update narasi/diagram ERD.
4. **B5**: Hapus `special_requests` dan `created_by` dari deskripsi tabel reservations — keduanya tidak ada. Bisa diganti dengan `notes text` (untuk special requests) dan jelaskan `guest_id FK` saja (tidak ada `created_by` audit trail).
5. **F1**: Tool createBooking Zod schema masih `guestPhone: z.string()` (required) — paradox dengan UI yang bilang opsional. **Saran**: ubah ke `z.string().optional()` di `route.ts:332` untuk konsistensi backend↔frontend, ATAU klarifikasi di thesis bahwa Zod required tapi system prompt mengizinkan empty.
6. **H2**: Roles aktual `front_desk` (bukan `Receptionist`), tidak ada `Inventory Staff` sebagai role tersendiri. Update Tabel Role di Bab 3 + Use Case actor di Gambar 3.4.
7. **H3**: File guard bernama `src/proxy.ts` (Next.js 16 convention) bukan `middleware.ts`. Update narasi kalau Bab 3 sebut "Next.js Middleware".
8. **I1-I2**: Tidak ada sprint formal & tidak ada git tag — sintesis dari CHANGELOG.md atau jujur sebut sebagai "iterative continuous development".

### ✗ Klaim yang FALSE (perlu dihapus atau diganti):

- **K1, K2**: Tidak ada automated test. **Jangan klaim "unit test" atau "integration test"** kecuali memang akan ditulis sebelum sidang. Cukup sebut "Black Box Testing manual 34 skenario" (yang valid).

### ✓ Klaim yang benar (gunakan dengan percaya diri):

- Semua klaim chatbot (C1-C6) ✓ — refactor 3-query, auth gate, tool list semua sesuai.
- Semua klaim RLS (D1, D2) ✓ — policies confirmed di live DB.
- Room image management (E1-E4) ✓ — endpoint, bucket, fallback chain, gallery dedup semua tepat.
- Form pemesan (F2-F4) ✓ — id_number reservation-time absent, phone required UI, DB nullable.
- File inventory v3.1 (J) ✓ — semua 11 file confirmed exist.
- 34 skenario Black Box (K3) ✓ — file exists dengan struktur tepat.

### Action items sebelum sidang:

- [ ] Update Bab 3 schema tabel rooms (`number`, `base_price`, hapus `notes`)
- [ ] Update Bab 3 schema custom_room_types (`amenities` bukan `facilities`)
- [ ] Update Bab 3 schema reservations (hapus `special_requests`, `created_by`)
- [ ] Update Bab 3 tabel roles (`front_desk` bukan `Receptionist`, hapus `Inventory Staff`)
- [ ] Update Bab 1/3 narasi "Next.js 15" → "Next.js 16"
- [ ] (Opsional) Fix `guestPhone` Zod menjadi `.optional()` di [route.ts:332](src/app/api/chat/route.ts#L332)
- [ ] Eksekusi 34 skenario di [docs/BlackBox_Testing_Checklist.md](docs/BlackBox_Testing_Checklist.md) → isi ✅/❌ → transfer hasil ke Tabel 4.4-4.12 thesis
- [ ] Klarifikasi narasi sprint Scrum — atau dokumentasikan retrospektif dari CHANGELOG.md

---

**Total verifikasi:** 36 klaim diperiksa · ✓ 25 · ⚠ 9 · ✗ 2 · N/A 0
