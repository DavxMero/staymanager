# Verifikasi Diagram Bab 3 terhadap Source Code

Dokumen ini memetakan setiap langkah/elemen pada tiga diagram ke lokasi nyata di
source code, agar dapat diverifikasi bahwa diagram 100% sinkron dengan implementasi.
Konstrain: tidak ada fitur yang dikarang; langkah yang tidak ditemukan di repo
ditandai eksplisit pada bagian akhir.

File sumber Mermaid: `docs/assets/diagrams-src/`
File PNG resolusi tinggi: `docs/assets/bab3/`

| Diagram | File .mmd | File PNG | Resolusi |
|---|---|---|---|
| Flowchart Peran Guest | `gambar-flowchart-guest.mmd` | `bab3/gambar-flowchart-guest.png` | 8292 × 16277 px |
| Flowchart Alur Aplikasi | `gambar-3-3-flowchart-aplikasi.mmd` | `bab3/gambar-3-3-flowchart-aplikasi.png` | 7361 × 8856 px |
| ERD (revisi Gambar 3.26) | `gambar-3-26-erd.mmd` | `bab3/gambar-3-26-erd.png` | 16124 × 5893 px |

---

## 1. Flowchart Peran Guest (Tamu) — Reservasi via Chatbot

Sumber utama: `src/app/api/chat/route.ts`, `src/app/chatbot/page.tsx`,
`src/components/chatbot/*`.

| # | Langkah pada flowchart | Bukti di kode |
|---|---|---|
| 1 | Tamu buka `/chatbot` tanpa wajib login | `/chatbot` masuk `PUBLIC_ROUTES` di `src/components/route-guard.tsx` |
| 2 | Banner mode tamu + tombol Login/Sign up | `src/app/chatbot/page.tsx` (header + auth buttons) |
| 3 | Tamu kirim pesan → `POST /api/chat` | `src/app/chatbot/page.tsx` (useChat → endpoint `/api/chat`) |
| 4 | **Decision:** API key Gemini terpasang? | `route.ts:14-17` (`GOOGLE_GENERATIVE_AI_API_KEY`) → 503 di `route.ts:44-52` |
| 5 | LLM Gemini 2.5-flash, `toolChoice:'auto'` | `route.ts:7-19, 112-115` |
| 6 | **Decision:** streaming berhasil? gagal → toast error | `route.ts:674-709` (`getErrorMessage`) + `parseChatbotError` di `chatbot/page.tsx` |
| 7 | **Decision:** intent ketersediaan? | `route.ts:100-102` (`availabilityKeywords`, `isAvailabilityIntent`) |
| 8 | Emit `SHOW_DATE_SELECTOR_JSON` → DateSelectionCard | system prompt `route.ts` + `src/components/chatbot/DateSelectionCard.tsx` |
| 9 | **Decision:** tanggal valid (check-in ≥ hari ini, check-out > check-in) | `DateSelectionCard.tsx` (disabled dates: check-in `< today`; check-out `< check-in+1`) |
| 10 | Tool `cekKetersediaan`: query overlap reservations, kecualikan kamar `maintenance`/`out_of_order` & yang sudah dipesan | `route.ts:282-371` (filter status `cancelled,no_show,checked-out,checked_out`; `lt('check_in', checkOut)`, `gt('check_out', checkIn)`) |
| 11 | **Decision:** ada kamar? Tidak → `status:'unavailable'`, sarankan tanggal lain | `route.ts:325-330` (pesan "Tidak ada kamar tersedia untuk tanggal tersebut.") |
| 12 | Ya → `ROOM_CARDS_JSON` → kartu kamar per tipe | `route.ts` (result.rooms) + `chatbot/page.tsx` (`extractRoomsFromToolInvocations`) + `RoomCard.tsx` |
| 13 | Tamu klik "Book" | `chatbot/page.tsx` `handleBookRoom()` |
| 14 | **Decision:** sudah login? Belum → `SHOW_LOGIN_PROMPT_JSON` | `chatbot/page.tsx` + `LoginPromptCard.tsx` |
| 15 | Sudah → `SHOW_GUEST_FORM_JSON` (auto-fill) | `InteractiveBookingCard.tsx` |
| 16 | Tool `createBooking` | `route.ts:373-503` |
| 17 | **Decision:** `verifiedUser` ada? Tidak → `AUTH_REQUIRED` | `route.ts:391` |
| 18 | Buat/temukan guest by email | `route.ts:409-437` (tabel `guests`) |
| 19 | INSERT `reservations` (`status='confirmed'`, `payment_status='pending'`) | `route.ts:439-469` |
| 20 | Emit `SHOW_PAYMENT_OPTIONS_JSON` (kode booking belum ditampilkan) | system prompt `route.ts` + `PaymentOptionsCard.tsx` |
| 21 | **Decision:** metode bayar? Bayar nanti → tetap `pending` | `PaymentOptionsCard.tsx` (Pay Now / Pay Later) |
| 22 | Bayar sekarang → transfer → tool `confirmPayment` | `route.ts:564-661` |
| 23 | **Decision:** email tamu = `guest_email`? (ownership) | `route.ts:591-600` |
| 24 | INSERT `payments` + UPDATE `payment_status='paid'` → tampilkan KODE BOOKING + e-receipt | `route.ts:605-641` |

---

## 2. Flowchart Alur Aplikasi StayManager (Autentikasi, RBAC, Modul)

Sumber utama: `src/app/page.tsx`, `src/lib/supabase/middleware.ts`,
`src/components/route-guard.tsx`, `src/app/login/page.tsx`,
`src/app/auth/callback/route.ts`, `src/lib/hooks/usePermissions.ts`,
`src/components/app-sidebar.tsx`.

| # | Langkah pada flowchart | Bukti di kode |
|---|---|---|
| 1 | Akses `/` → redirect `/dashboard` | `src/app/page.tsx` |
| 2 | Middleware refresh sesi (`supabase.auth.getUser`) | `src/lib/supabase/middleware.ts` |
| 3 | **Decision:** RouteGuard terautentikasi? | `src/components/route-guard.tsx` |
| 4 | **Decision:** rute publik? (`/login`, `/signup`, `/auth/callback`, `/chatbot`) | `PUBLIC_ROUTES` di `route-guard.tsx` |
| 5 | Halaman `/login`; **Decision** metode: email/password atau Google OAuth | `src/app/login/page.tsx` (`signInWithPassword`, `signInWithOAuth`) |
| 6 | **Decision:** kredensial valid? tidak → error | `login/page.tsx` |
| 7 | Google OAuth → `/auth/callback` → `exchangeCodeForSession` → user baru di-assign role `guest` | `src/app/auth/callback/route.ts` |
| 8 | **Decision:** hanya role `guest`? Ya → `/chatbot`; Tidak → `/dashboard` | `login/page.tsx` (cek `user_roles`) |
| 9 | Sidebar filter menu by permission | `app-sidebar.tsx` + `usePermissions.ts` (`hasPermission`) |
| 10 | **Decision:** RouteGuard cek permission (`ROUTE_PERMISSION_MAP`) → punya permission / `*`? | `route-guard.tsx` (`/dashboard→dashboard`, `/rooms→rooms`, `/occupancy→occupancy`, `/guests→guests`, `/staff→staff`, `/financial→billing`, `/billing→billing`, `/logistics→operations`, `/reports→reports`) |
| 11 | Render modul (Dashboard, Occupancy, Rooms+Housekeeping, Guests, Financial+Billing, Logistics, Staff, Reports, Settings/Roles, Chatbot) | folder `src/app/*` (lihat tabel modul) |
| 12 | **Decision:** Logout? → `supabase.auth.signOut()` → `/login` | `app-sidebar.tsx` `handleLogout()` |

**Catatan RBAC (penting untuk akurasi skripsi):**
- Otorisasi rute **berbasis permission**, bukan hard-coded nama role. RouteGuard
  mencocokkan `ROUTE_PERMISSION_MAP[path]` dengan permission milik user.
- Nama role staf nyata berasal dari CHECK constraint `profiles.role`:
  `admin, manager, front-desk, housekeeping, maintenance, chef, waiter, cashier`.
- Role RBAC permission disimpan di tabel `roles` (kolom `permissions` JSONB) dan
  dipetakan ke user via `user_roles`. Permission `"*"` = akses penuh.
- Role `guest` (di tabel `roles`) → akses dibatasi ke `/chatbot`, `/settings`,
  `/dashboard` (`GUEST_ALLOWED` di `route-guard.tsx`).

---

## 3. ERD (Revisi Gambar 3.26) — 26 Tabel, 39 Foreign Key

Sumber: introspeksi langsung skema Supabase (project `ncjneagfadrmivgicszm`,
schema `public`) via MCP `list_tables` (verbose). Daftar berikut adalah ground truth.

### 26 Tabel (public)
1. `profiles` 2. `users` 3. `roles` 4. `user_roles` 5. `guests` 6. `rooms`
7. `custom_room_types` 8. `reservations` 9. `payments` 10. `billing_items`
11. `invoices` 12. `deposits` 13. `expenses` 14. `housekeeping_tasks`
15. `staff_members` 16. `inventory_items` 17. `inventory_suppliers`
18. `inventory_purchase_orders` 19. `inventory_purchase_order_items`
20. `inventory_transactions` 21. `Chat` 22. `hotel_settings`
23. `guest_facility_requests` 24. `guest_facility_items` 25. `service_items`
26. `room_service_requests`

(Entitas `auth_users` digambar sebagai referensi ke `auth.users` Supabase; ia
bukan tabel `public` tetapi menjadi target banyak FK.)

### 39 Foreign Key (relasi)
1. `profiles.user_id → auth.users.id`
2. `users.id → auth.users.id` (sinkron 1:1)
3. `Chat.user_id → auth.users.id`
4. `guests.user_id → auth.users.id`
5. `user_roles.user_id → auth.users.id`
6. `user_roles.assigned_by → auth.users.id`
7. `user_roles.role_id → roles.id`
8. `expenses.approved_by → auth.users.id`
9. `inventory_purchase_orders.created_by → auth.users.id`
10. `inventory_transactions.created_by → auth.users.id`
11. `room_service_requests.created_by_user_id → auth.users.id`
12. `invoices.created_by → profiles.id`
13. `deposits.collected_by → profiles.id`
14. `deposits.refunded_by → profiles.id`
15. `rooms.type → custom_room_types.name`
16. `reservations.guest_id → guests.id`
17. `reservations.room_id → rooms.id`
18. `payments.reservation_id → reservations.id`
19. `billing_items.guest_id → guests.id`
20. `billing_items.room_id → rooms.id`
21. `billing_items.reservation_id → reservations.id`
22. `invoices.guest_id → guests.id`
23. `invoices.reservation_id → reservations.id`
24. `deposits.reservation_id → reservations.id`
25. `housekeeping_tasks.room_id → rooms.id`
26. `housekeeping_tasks.staff_id → staff_members.id`
27. `guest_facility_requests.guest_id → guests.id`
28. `guest_facility_requests.room_id → rooms.id`
29. `guest_facility_requests.reservation_id → reservations.id`
30. `guest_facility_items.request_id → guest_facility_requests.id`
31. `guest_facility_items.service_item_id → service_items.id`
32. `room_service_requests.guest_id → guests.id`
33. `room_service_requests.room_id → rooms.id`
34. `room_service_requests.staff_id → staff_members.id`
35. `room_service_requests.service_item_id → service_items.id`
36. `inventory_purchase_orders.supplier_id → inventory_suppliers.id`
37. `inventory_purchase_order_items.po_id → inventory_purchase_orders.id`
38. `inventory_purchase_order_items.item_id → inventory_items.id`
39. `inventory_transactions.item_id → inventory_items.id`

`hotel_settings` berdiri sendiri (tidak punya FK ke/atau dari tabel lain).

### Koreksi yang dilakukan pada ERD lama (drift terhadap skema nyata)
- `hotel_settings`: dulu digambar `key/value`; kolom nyata = `brand_name`, `brand_logo_url`.
- `inventory_transactions`: `qty_change` → kolom nyata `quantity` (+ `transaction_type`).
- `inventory_items`: `stock` → kolom nyata `current_stock`, `min_stock`, `unit_cost`.
- `invoices`: `total` → `total_amount` (+ `invoice_number`, `status`).
- `billing_items`: `amount` → `unit_price`, `total_price` (+ `item_name`, `status`).
- `rooms.number`: `text` → `varchar` (+ `floor`).
- `users`: ditambah `full_name`.

---

## Ditandai eksplisit: TIDAK ditemukan di repo / penyimpangan
- **Halaman landing publik hotel** tersendiri **tidak ada**; `/chatbot` berperan
  sebagai antarmuka publik hotel.
- **Modul "Reservasi" tersendiri tidak ada** sebagai route; pembuatan reservasi
  tersebar di `/chatbot` (tool `createBooking`), serta dikelola di `/occupancy`
  dan `/guests`.
- **Validasi kapasitas (`max_occupancy`) tidak diterapkan** saat booking
  (`max_occupancy` hanya ditampilkan, tidak divalidasi).
- **Tidak ada fallback keyword → render kartu** pada kode saat ini; kegagalan LLM
  hanya memunculkan pesan error (toast). (Catatan: pernah ada di histori commit
  era Groq/Llama, tetapi kode aktif sekarang memakai Google Gemini.)
- **Tidak ada validasi tanggal di sisi server** sebelum booking; pembatasan
  tanggal hanya di frontend (DateSelectionCard).
- **Tidak ada integrasi payment gateway**; pembayaran dicatat manual (transfer bank).
