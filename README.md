# StayManager

**Property Management System (PMS)** untuk hotel/penginapan dengan **asisten chatbot berbasis LLM (Google Gemini)**. Dibangun dengan Next.js 16 + Supabase, dirancang multi-tenant-ready sehingga satu basis kode dapat di-deploy ulang untuk hotel mana pun cukup dengan menyiapkan instance Supabase + konfigurasi data masing-masing properti.

---

## Fitur Utama

| Modul | Deskripsi |
|-------|-----------|
| **Dashboard** | KPI okupansi, pendapatan, tugas, dan ringkasan operasional harian |
| **Manajemen Kamar** | Kamar, tipe kamar kustom (`custom_room_types`), status & tarif |
| **Okupansi & Reservasi** | Booking, check-in/check-out, kalender okupansi, pembatalan + audit |
| **Tamu** | Data tamu, riwayat menginap, permintaan fasilitas |
| **Housekeeping** | Tugas pembersihan kamar, room service |
| **Keuangan** | Invoice, item tagihan, pembayaran, deposit, pengeluaran, laporan |
| **Inventaris / Logistik** | Stok, supplier, purchase order, transaksi inventaris |
| **Staff & Roles** | Manajemen staf + role/permission berbasis data (lihat [Roles & Akses](#roles--akses)) |
| **Chatbot** | Asisten LLM untuk cek kamar, reservasi, dan bantuan operasional |
| **Settings** | Identitas & konfigurasi properti |

## Tech Stack

- **Framework:** Next.js 16 (App Router) · React 19 · TypeScript
- **Styling:** Tailwind CSS v4 · Radix UI · Framer Motion · Recharts
- **Backend / DB / Auth:** Supabase (Postgres + Auth + RLS + Realtime)
- **LLM:** Google Gemini via `@ai-sdk/google` + Vercel AI SDK (`ai`)
- **Package manager:** pnpm 10
- **Deploy:** Vercel (rekomendasi)

---

## Prasyarat

- Node.js 20+ dan **pnpm 10** (`corepack enable` lalu `corepack prepare pnpm@10.33.0 --activate`)
- Akun **Supabase** (project baru per hotel)
- **Google Gemini API key** — ambil di <https://ai.google.dev/apikey>

---

## Deploy untuk Hotel Baru

Ikuti langkah ini setiap kali menyiapkan instance untuk hotel/properti lain.

### 1. Clone & install

```bash
git clone https://github.com/DavxMero/staymanager.git
cd staymanager
pnpm install
```

### 2. Buat project Supabase baru

1. Buat project baru di <https://supabase.com/dashboard> (satu project = satu hotel).
2. Catat dari **Project Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (rahasia, server-only) → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Siapkan skema database

Provision skema penuh ke project Supabase yang baru, lalu terapkan migrasi inkremental yang ada di repo:

```bash
# Migrasi inkremental yang disertakan repo:
#   supabase/migrations/20260610090000_add_reservation_cancellation_audit.sql
#   supabase/migrations/20260610120000_enable_realtime_publication.sql

# Dengan Supabase CLI (rekomendasi):
supabase link --project-ref <PROJECT_REF>
supabase db push
```

> **Catatan:** repo hanya menyertakan migrasi inkremental. Skema dasar (tabel `profiles`, `roles`, `user_roles`, `rooms`, `reservations`, `guests`, `invoices`, `payments`, `housekeeping_tasks`, `inventory_*`, dst.) perlu disediakan terlebih dahulu di project Supabase. Lihat [Catatan Skema](#catatan-skema-database) di bawah.

### 4. Konfigurasi environment variables

Salin `.env.example` menjadi `.env.local` dan isi nilainya:

```bash
cp .env.example .env.local
```

```dotenv
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."          # RAHASIA — jangan commit / jangan expose ke client

# Google Gemini (chatbot)
# Multi-key: pisahkan dengan koma untuk round-robin load distribution
GOOGLE_GENERATIVE_AI_API_KEY="AIzaSy..."
```

### 5. Buat akun admin pertama

1. Jalankan aplikasi (langkah 6) dan daftar lewat halaman **/signup**, atau buat user di Supabase **Auth → Users**.
2. Di tabel `roles`, pastikan ada role dengan permission `*` (akses penuh).
3. Petakan user admin ke role tersebut lewat tabel `user_roles`.

Setelah login sebagai admin, sisa konfigurasi dilakukan dari UI (lihat bagian berikut).

### 6. Jalankan secara lokal

```bash
pnpm dev          # mode senyap (default, http://localhost:3000)
pnpm dev:turbo    # dengan Turbopack
pnpm build && pnpm start   # build produksi
```

---

## Konfigurasi Per-Hotel

Setelah skema & admin siap, sebagian besar penyesuaian dilakukan **lewat UI** (data, bukan kode):

- **Settings** — identitas properti (nama hotel, dll.)
- **Manajemen Kamar & Tipe Kamar** — daftar kamar nyata + tarif properti
- **Roles** — definisikan role & permission sesuai struktur staf hotel
- **Staff** — tambahkan staf dan tetapkan rolenya
- **Service Items / Fasilitas Tamu** — layanan & fasilitas yang ditawarkan
- **Inventaris** — supplier, item stok awal

Tidak perlu mengubah kode untuk hotel baru — cukup data di atas + environment variables.

---

## Deploy ke Produksi (Vercel)

1. Import repo ke Vercel.
2. Set environment variables yang sama seperti `.env.local` di **Project → Settings → Environment Variables**.
3. Build command `pnpm build`, output otomatis (Next.js).
4. Pastikan domain Supabase di-allow pada **Auth → URL Configuration** (Site URL + Redirect URLs) sesuai domain Vercel hotel tersebut.

Setiap hotel = satu project Vercel + satu project Supabase yang terpisah.

---

## Roles & Akses

Role bersifat **data-driven**, bukan hardcoded. Tabel `roles` menyimpan `name` + array `permissions`; tabel `user_roles` memetakan user ke role. Permission `*` berarti akses penuh (superadmin). Pengecekan dilakukan server-side via `src/lib/auth/server-permissions.ts` dan dilindungi RLS Supabase.

Artinya tiap hotel bebas mendefinisikan set role sendiri (mis. *Owner, Manager, Resepsionis, Housekeeping, Finance, Staff*) lewat modul **Roles** tanpa menyentuh kode.

---

## Chatbot (Gemini)

- Diatur di `src/app/api/chat/route.ts`.
- Model default **Gemini 2.5 Flash**; mendukung 2.5 Pro, 2.0 Flash, 2.0 Flash Lite.
- `GOOGLE_GENERATIVE_AI_API_KEY` boleh berisi **beberapa key dipisah koma** → round-robin untuk distribusi beban/rate-limit.

---

## Struktur Proyek

```
src/
  app/            # Routes (App Router): dashboard, rooms, occupancy, guests,
                  #   financial, reports, settings, roles, staff, chatbot, api/...
  lib/
    auth/         # server-permissions.ts — role & permission checks
    supabase/     # server.ts / client Supabase (SSR)
supabase/
  migrations/     # migrasi SQL inkremental
scripts/          # util dev
```

---

## Catatan Skema Database

Tabel inti meliputi: `profiles`, `roles`, `user_roles`, `staff_members`, `rooms`, `custom_room_types`,
`reservations`, `guests`, `payments`, `invoices`, `billing_items`, `deposits`, `expenses`,
`housekeeping_tasks`, `room_service_requests`, `guest_facility_requests`, `guest_facility_items`,
`service_items`, `inventory_items`, `inventory_suppliers`, `inventory_purchase_orders`,
`inventory_purchase_order_items`, `inventory_transactions`, dan tabel chat.

Aktifkan **RLS** pada semua tabel dan sesuaikan policy dengan model role di atas. Realtime publication diaktifkan lewat migrasi `20260610120000_enable_realtime_publication.sql`.

---

## Scripts

| Perintah | Fungsi |
|----------|--------|
| `pnpm dev` | Dev server (mode senyap) |
| `pnpm dev:turbo` | Dev server dengan Turbopack |
| `pnpm build` | Build produksi |
| `pnpm start` | Jalankan hasil build |
| `pnpm lint` | ESLint |
| `pnpm clean` | Hapus `.next` |
</content>
</invoke>
