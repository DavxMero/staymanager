# StayManager — App Summary

> **Last sync**: 2026-05-15 (commit `6122274`)
> **Tujuan dokumen**: snapshot lengkap fitur, arsitektur, dan tech stack agar penulisan skripsi tetap aligned dengan kode terbaru. Pakai dokumen ini sebagai *ground truth* saat merevisi bab Implementasi, Pengujian, dan Lampiran.

---

## 1. Identitas Aplikasi

| Atribut | Nilai |
|---|---|
| **Nama** | StayManager |
| **Versi** | 0.1.0 |
| **Jenis** | Property Management System (PMS) untuk hotel kecil-menengah, terintegrasi dengan chatbot AI berbahasa Indonesia |
| **Domain** | Manajemen reservasi, occupancy, billing, housekeeping, dan pelayanan tamu via concierge AI 24/7 |
| **Bahasa UI** | Bahasa Indonesia (default) + multilingual response di chatbot |
| **Repository** | https://github.com/DavxMero/staymanager |
| **Branch utama** | `master` |

---

## 2. Tech Stack

### Frontend
- **Framework**: Next.js `16.0.7` (App Router, React Server Components + Client Components)
- **UI Library**: React `19.2.0` + React DOM `19.2.0`
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"`) + `tw-animate-css`
- **Component System**: shadcn/ui (Radix UI primitives: dialog, dropdown, popover, select, tabs, tooltip, dll)
- **Iconography**: `lucide-react` `0.555.0`
- **Animation**: `framer-motion` `12.23.25`
- **Toast**: `sonner` `2.0.7`
- **Theme**: `next-themes` `0.4.6` (light/dark mode)
- **Charts**: `recharts` `3.5.1` (revenue, occupancy, room type pie)
- **Markdown**: `react-markdown` `10.1.0` (untuk render balasan chatbot)
- **Form/Validation**: `zod` `3.23.8` + native React state (tidak pakai react-hook-form di sebagian besar form)
- **Date utility**: `date-fns` `4.1.0` + `react-day-picker` `9.9.0`

### Backend / Data Layer
- **Database & Auth**: Supabase (Postgres 15)
  - Project ID: `ncjneagfadrmivgicszm`
  - `@supabase/supabase-js` `2.86.0`
  - `@supabase/ssr` `0.8.0` (untuk Server Components + cookie-based session)
- **API Routes**: Next.js Route Handlers (`src/app/api/**/route.ts`) — Node.js runtime
- **Storage**: Supabase Storage (untuk foto kamar, brand logo)

### AI / LLM (Multi-provider)
- **AI SDK**: Vercel AI SDK `ai@4.0.38` (`useChat` hook + `streamText`)
- **Provider 1**: `@ai-sdk/google` `1.0.10` — Gemini 2.5 Flash (gratis, 20 req/menit, 1500 req/hari)
- **Provider 2**: `@ai-sdk/groq` `1.2.9` — Llama 3.3 70B Versatile & Llama 3.1 8B Instant (gratis, 30 req/menit, 1000–14400 req/hari)
- **Default model**: Llama 3.3 70B (Groq) — dipilih karena rate-limit lebih longgar & latency lebih rendah
- **Model selector**: dropdown di header `/chatbot`, pilihan persistent di `localStorage` (`staymanager:chatbot:model`)

---

## 3. Arsitektur Folder

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # 19 API routes (REST + chat streaming)
│   │   ├── chat/route.ts         # POST /api/chat — multi-model LLM streaming
│   │   ├── chat/history/route.ts # Chat history persistence
│   │   ├── reports/analytics/    # GET — agregat revenue, occupancy, KPI
│   │   ├── reports/export/       # PDF/CSV export
│   │   ├── rooms/                # Room CRUD + upload image
│   │   ├── guests/, expenses/, suppliers/, purchase-orders/
│   │   ├── housekeeping/checkout-cleaning, daily-maintenance
│   │   └── users/, custom-room-types/, inventory/, guest-facilities/
│   ├── (auth pages)
│   │   ├── login/page.tsx        # Email/password + Google OAuth
│   │   ├── signup/page.tsx
│   │   └── auth/callback/route.ts # OAuth code exchange + default role assignment
│   ├── (dashboard pages)
│   │   ├── page.tsx              # Landing page (public)
│   │   ├── dashboard/page.tsx    # KPI overview, role-aware
│   │   ├── chatbot/page.tsx      # AI Concierge — multi-model chat
│   │   ├── occupancy/page.tsx    # Kalender room + housekeeping assign
│   │   ├── rooms/page.tsx        # Room CRUD + housekeeping tasks
│   │   ├── guests/page.tsx       # Guest profile + booking history
│   │   ├── reports/page.tsx      # Analytics dashboard
│   │   ├── financial/page.tsx    # Cash flow + expenses + CSV/PDF export
│   │   ├── billing/page.tsx      # Pending invoices list
│   │   ├── billing/[id]/page.tsx # Invoice detail + payment
│   │   ├── expenses/page.tsx     # Expense CRUD
│   │   ├── staff/page.tsx        # User management (HR)
│   │   ├── roles/page.tsx        # RBAC role assignment
│   │   ├── logistics/page.tsx    # Supplier + purchase order + inventory
│   │   ├── guest-facilities/     # Facility booking (gym, pool, dll)
│   │   ├── chat-history/         # Chat history viewer (admin)
│   │   └── settings/             # Profile + database + security + dev tools
│   └── layout.tsx                # Root layout (Sidebar + ThemeProvider + Toaster)
├── components/
│   ├── app-sidebar.tsx           # Main navigation sidebar (role-aware)
│   ├── chatbot/                  # Chatbot widgets (RoomCard, DateSelector, PaymentOptions, dll)
│   ├── ui/                       # shadcn primitives
│   └── route-guard.tsx           # Permission-based route protection
├── lib/
│   ├── supabase/client.ts        # Browser-side Supabase client (SSR-aware)
│   ├── supabase/middleware.ts    # Session refresh middleware helper
│   ├── supabaseClient.ts         # Service-role admin client (server-only)
│   ├── hooks/usePermissions.ts   # RBAC permission helper
│   ├── hooks/useBranding.ts      # White-label brand config
│   └── report-export.ts          # CSV + browser print-to-PDF helpers
└── types/index.ts                # Shared TypeScript types (Room, Reservation, dll)
```

---

## 4. Fitur Utama

### 4.1 PMS Modules

| Modul | Halaman | Fungsi inti |
|---|---|---|
| **Dashboard** | `/dashboard` | KPI overview (revenue, occupancy, today's check-in/out) — role-aware |
| **Occupancy** | `/occupancy` | Kalender kamar visual; filter status; assign housekeeping via 🧹 icon → Dialog dropdown staff |
| **Rooms** | `/rooms` | Room CRUD + status (available/occupied/maintenance/dirty); upload foto; housekeeping task assign |
| **Guests** | `/guests` | Guest profile + current/past booking; payment status badge; **"Data Kamar Tidak Lengkap"** warning untuk orphan reservations |
| **Reservations** | (di /chatbot via tools + /occupancy view) | Booking creation: status enum `confirmed/checked-in/overdue/checked-out/cancelled` |
| **Reports** | `/reports` | Analytics: revenue trend (Area), room type revenue (Pie), check-in/out timeline, occupancy rate, ADR, RevPAR. Export ke CSV/PDF |
| **Financial** | `/financial` | Cash flow + expenses + CSV/PDF export via DropdownMenu |
| **Billing** | `/billing`, `/billing/[id]` | Invoice list + detail + payment recording |
| **Expenses** | `/expenses` | Expense CRUD untuk operational cost |
| **Logistics** | `/logistics` | Supplier + Purchase Order + Inventory management |
| **Staff** | `/staff` | User management (HR view) |
| **Roles** | `/roles` | RBAC — assign roles ke user |
| **Guest Facilities** | `/guest-facilities` | Booking fasilitas tambahan (gym, pool, dll) |
| **Chat History** | `/chat-history` | Admin viewer untuk percakapan chatbot |
| **Settings** | `/settings/*` | Profile, Database management, Security audit, Health check, Development tools |

### 4.2 AI Chatbot (`/chatbot`)

**Capabilities:**
- Real-time room availability check (`cekKetersediaan` tool — query Supabase + enrich dengan `custom_room_types` metadata)
- Get all room types (`getRoomTypes` tool — untuk inquiry umum tanpa tanggal)
- Create reservation (`createBooking` tool — auto-create guest record kalau belum ada, generate `booking_reference` rahasia)
- Payment confirmation (`confirmPayment` tool — insert ke `payments` table + update reservation status; booking reference baru di-reveal SETELAH payment confirmed)

**UI Components (rendered dari marker JSON di response):**
- `ROOM_CARDS_JSON` → `<RoomCard>` grid dengan foto + amenities + price
- `SHOW_GUEST_FORM_JSON` → `<InteractiveBookingCard>` (pre-fill dari profile)
- `SHOW_DATE_SELECTOR_JSON` → `<DateSelectionCard>` (date picker + adults/children)
- `SHOW_PAYMENT_OPTIONS_JSON` → `<PaymentOptionsCard>` (bank transfer / credit card / e-wallet)
- `SHOW_LOGIN_PROMPT_JSON` → `<LoginPromptCard>` (untuk guest mode trying to book)

**Mode operasi:**
1. **Guest browsing** (not logged in): Q&A umum + availability check ✅, booking ❌ (akan dapat `SHOW_LOGIN_PROMPT_JSON`)
2. **Logged-in user**: Full booking flow dengan auto-prefill nama/email dari profile

**Multi-model selector** (dropdown header):
- Llama 3.3 70B (Groq) — default, recommended
- Llama 3.1 8B Instant (Groq) — fastest, paling banyak quota/hari
- Gemini 2.5 Flash — backup

**Error UX:**
- Toast dengan live countdown untuk rate-limit error (parse "Please retry in X.Xs")
- Rate-limit hold: textarea + Send button auto-disabled selama cooldown + banner amber
- Friendly Indonesian messages (api key missing, timeout, network, dll)

---

## 5. Database Schema (Supabase Postgres)

### 5.1 Roles (6 role)
`super_admin`, `manager`, `front_desk`, `housekeeping`, `finance`, `guest`

Disimpan di tabel `roles` (name, display_name, description) + junction `user_roles (user_id, role_id)`.

### 5.2 Tabel Utama

| Tabel | Kolom kunci | Catatan |
|---|---|---|
| `auth.users` | id, email, user_metadata | Supabase Auth — OAuth Google + email/password |
| `profiles` | id, full_name, role, department | Mirror `auth.users` (join via user_id) |
| `roles`, `user_roles` | – | RBAC mapping |
| `rooms` | id (uuid), number, type, floor, base_price, status enum, image_url | Status: `available/occupied/maintenance/dirty` |
| `custom_room_types` | name, images[], amenities[], max_occupancy, room_size, bed_configuration, description | Enrich room dengan metadata (join by `type` name, no FK) |
| `reservations` | id, room_id (FK), guest_id (FK), guest_name/email/phone, check_in, check_out, status, payment_status, total_amount, room_rate, booking_reference | Status enum: `confirmed/checked-in/overdue/checked-out/cancelled` |
| `guests` | id (uuid), full_name, email, phone, id_number | Auto-created saat booking via chatbot kalau email belum ada |
| `payments` | id, reservation_id, amount, payment_method, payment_date, transaction_id | Insert via `confirmPayment` tool |
| `invoices` | id, reservation_id, total_amount, status, created_at | Source of truth untuk total revenue di `/reports` |
| `billing_items` | id, reservation_id, item_name, amount | Additional charges per booking |
| `housekeeping_tasks` | room_id, assigned_to, status, task_type, title, completed_at | Diisi dari 🧹 icon di `/occupancy` |
| `expenses` | id, amount, category, date, description | Operational cost |
| `Chat` | id, user_id, messages (jsonb) | Chat history per user, auto-saved on every message |
| `suppliers`, `purchase_orders`, `inventory_items` | – | Logistics module |
| `room_service_requests`, `guest_facilities`, `guest_facility_bookings` | – | Guest services |

### 5.3 RLS (Row Level Security)
- Tabel sensitif (`payments`, `expenses`, `Chat`) di-protect dengan RLS policy by role
- `auth.uid()` digunakan untuk membatasi akses guest hanya ke data mereka sendiri

---

## 6. Authentication & Authorization Flow

```
User → /login
  ├─ Email/Password → supabase.auth.signInWithPassword
  └─ Google OAuth → signInWithOAuth → /auth/callback
                                          ├─ exchangeCodeForSession
                                          ├─ Cek user_roles → assign 'guest' kalau baru
                                          └─ Redirect ke /chatbot

Setiap request → middleware (src/lib/supabase/middleware.ts)
  └─ Refresh session via cookies

Setiap halaman → <RouteGuard> wrapper
  └─ usePermissions() → check role-based permission
  └─ Redirect ke /login kalau tidak punya akses

Error path:
  /auth/callback gagal → redirect ke /login?error=auth_failed
  /login membaca ?error= via useEffect → tampil Alert merah + Toast (mapping pesan ke Bahasa Indonesia)
```

---

## 7. Recent Updates (Mei 2026 — UAT Preparation)

Berikut adalah perubahan signifikan yang dilakukan menjelang UAT publik. Bisa dijadikan referensi untuk bab "Implementasi & Pengujian" atau "Iterasi Pengembangan" di skripsi.

### Commit `f13794f` — Skripsi Assets v4.1
Asset pipeline lengkap (33 diagram Mermaid + 23 Playwright screenshot + verified citations) untuk lampiran skripsi.

### Commit `88867c2` (snapshot pre-UAT)
Snapshot kondisi sebelum revisi UAT.

### Commit `8763b75` — Chatbot reliability & UX overhaul
- **Multi-model architecture**: dropdown selector untuk Gemini, Llama 3.3 70B (Groq), Llama 3.1 8B Instant (Groq). Persistence via `localStorage`.
- **Server-side**: `resolveModel()` factory dengan env-var validation per provider; `maxRetries: 0` + `maxSteps: 3` untuk hemat quota Gemini free tier
- **Error UX**: `parseChatbotError()` mapping ke pesan Bahasa Indonesia + live countdown component (`QuotaCountdown`)
- **Rate-limit hold**: textarea + Send button disabled selama cooldown + amber banner
- **Auth state fix**: `authChecked` gate untuk hindari flash "Login/Sign Up" pada user yang sudah login (race condition antara `getUser()` async dan first paint)
- **Login error UI**: baca `?error=auth_failed` dari URL → render Alert + Toast → cleanup URL via `history.replaceState`
- **Bug #12**: badge "Data Kamar Tidak Lengkap" di `/guests` untuk reservasi orphan (room_id NULL atau room sudah dihapus)
- **Env cleanup**: `.env.local` dipangkas dari 55 → 9 baris

### Commit `28988af` — Sidebar UX
Hapus loading spinner di sidebar (113 baris). Shell sidebar (logo + footer) render instant; nav items populate in-place setelah permissions resolved.

### Commit `6122274` — UI fit-to-screen
CSS `zoom` responsive dengan `clamp(0.8, 100vw/1600, 1)` di breakpoint `>=768px`. UI scale ke 0.85 di 1366px, 0.9 di 1440px, 1.0 di 1600px+. Mobile (`<768px`) tidak terpengaruh.

---

## 8. Deployment

| Aspek | Konfigurasi |
|---|---|
| **Platform** | Vercel (recommended; Next.js native) |
| **Runtime** | Node.js (untuk API routes); Edge tidak dipakai |
| **Env vars required** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `GROQ_API_KEY` |
| **Build command** | `pnpm build` |
| **Dev command** | `pnpm dev` (Turbopack) |
| **Package manager** | pnpm `10.33.0` (lock di `pnpm-lock.yaml`) |

---

## 9. Known Limitations & Future Work

### Limitations
1. **Gemini free tier**: 20 req/menit — dimitigasi dengan model selector ke Groq sebagai default
2. **Orphan reservations**: 12 record legacy dengan `room_id = NULL` masih ada di DB (semua sudah `checked-out`). Sudah ditangani via UI badge, schema NOT NULL belum diterapkan
3. **Edit Reservation UI**: belum ada — `/guests` Edit dialog hanya bisa edit profile (name/email/phone/id_number)
4. **Mobile UX**: tested di tablet/desktop; mobile <768px belum dioptimasi penuh
5. **Tailwind v4 migration warnings**: beberapa class lama (`bg-gradient-to-r`, `flex-shrink-0`) belum dimigrasi ke canonical (`bg-linear-to-r`, `shrink-0`) — tidak blocking, masih backward-compatible

### Future Work (rekomendasi untuk bab "Saran Pengembangan")
1. Edit Reservation form di `/guests` atau `/occupancy`
2. Multi-property support (currently single-hotel)
3. Email notifications (booking confirmation, payment receipt)
4. Mobile-first redesign untuk staff yang pakai HP
5. Audit log untuk perubahan data sensitif (payments, expenses, reservations)
6. Backup strategy untuk Supabase data
7. Schema hardening: `ALTER TABLE reservations ALTER COLUMN room_id SET NOT NULL` setelah backfill data legacy

---

## 10. Testing Strategy

### Manual / UAT
- **Black box testing checklist**: `docs/BlackBox_Testing_Checklist.md`
- **UAT survey (SUS questionnaire)**: `docs/UAT_SUS_Questionnaire.md`
- **Interview script**: `docs/Interview_Script_dan_Recruitment.md`
- **Demo accounts** (di `skripsi-assets/.env`):
  - Manager: `demo.manager@hotel-asni.com` / `DemoManager2026!`
  - Guest: `demo.guest@hotel-asni.com` / `DemoGuest2026!`

### Automated (belum diimplementasi sebagai bagian skripsi)
- Tidak ada unit test / integration test framework yang aktif
- Type safety dijaga via TypeScript strict mode (`tsc --noEmit` digunakan sebagai gate sebelum commit)

---

## 11. Referensi Cepat

| Kebutuhan | File / Resource |
|---|---|
| Schema database | `docs/database_structure.md` + `docs/Diagram_Database_Baru.md` |
| Migration log | `docs/migration_plan.md` |
| Skripsi draft | `docs/Skripsi_StayManager40_complete.md` |
| Thesis audit | `docs/Skripsi_Audit_Report.md` |
| Thesis revision notes | `docs/THESIS_REVISION_NOTES.md` |
| Thesis claims verification | `docs/THESIS_CLAIMS_VERIFICATION.md` |
| Asset guide | `docs/ASSET_GUIDE.md` |

---

*Dokumen ini di-generate setelah commit `6122274`. Untuk update otomatis, sinkronkan dengan `git log --oneline -20` dan inspeksi `package.json` + `src/app/**`.*
