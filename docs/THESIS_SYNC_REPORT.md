# Laporan Sinkronisasi Skripsi ↔ Source Code (2026-06-13)

Source code berstatus FINAL. Semua ketidaksesuaian di bawah harus diperbaiki **di dokumen skripsi (Word)**, bukan di kode. Verifikasi dilakukan terhadap kode aktual di master (commit terbaru) + introspeksi Supabase live.

---

## A. WAJIB DIREVISI DI SKRIPSI (kode ≠ klaim skripsi)

### A1. Middleware `src/proxy.ts` SUDAH TIDAK ADA
- Lokasi di skripsi: Bab 2.8.1 (fitur Next.js → Middleware), Bab 2.9.3 (RBAC defense-in-depth lapisan 1), Bab 4.2.1.
- Fakta kode: `src/proxy.ts` dan `src/middleware.ts` tidak ada (dihapus saat audit karena tidak pernah aktif — Next.js tidak pernah memuatnya, file bernama proxy.ts bukan middleware.ts).
- Revisi: hilangkan narasi "Edge Middleware (src/proxy.ts)". Defense-in-depth aktual = **3 lapisan**: (1) komponen RouteGuard React (`src/components/route-guard.tsx`, membungkus RootLayout, ROUTE_PERMISSION_MAP + whitelist guest + runtime DB check /guest-facilities), (2) API route guards server-side (`getServerUserContext` + `hasPermission` di hampir semua route mutasi — verifikasi JWT Bearer atau cookie sesi, query `user_roles`), (3) RLS PostgreSQL sebagai authenticated-gate baseline.

### A2. Chatbot punya ENAM tools, bukan empat
- Lokasi: Abstrak tidak terdampak; Bab 2.3.4, 3.3.1.2 (peran Guest), 4.2.13, Tabel 3.5, Gambar 3.11–3.13.
- Fakta kode (`src/app/api/chat/route.ts`): `cekKetersediaan`, `createBooking`, `getRoomTypes`, `confirmPayment`, **`getMyBookings`** (daftar reservasi milik user login), **`cancelBooking`** (pembatalan dengan ownership check, guard status pending/confirmed, kolom audit `cancelled_at/cancelled_by/cancellation_reason`).
- Revisi: ubah "empat function tools" → "enam function tools" + tambah deskripsi 2 tool baru. Ini fitur plus (self-service cancel via chatbot) yang layak dibanggakan di Bab 4.

### A3. Alur Check-in TIDAK membuat tugas housekeeping
- Lokasi: Bab 3.3.2.1.3.5 (Sequence Check-in: "INSERT housekeeping_tasks (tipe checkout_cleaning, status scheduled)"), Gambar 3.15, Activity 3.22.
- Fakta kode: check-in hanya UPDATE reservations → `'checked-in'` + UPDATE rooms → `'occupied'`. Tidak ada INSERT housekeeping task.
- Revisi: hapus langkah INSERT housekeeping_tasks dari sequence/activity check-in.

### A4. Alur Check-out men-set kamar ke `cleaning`, BUKAN `available`
- Lokasi: Bab 3.3.2.1.3.6 (Sequence Check-out: "UPDATE rooms SET status=available") — bertentangan dengan Tabel 4.8 skenario 19 yang benar ("kamar berubah Cleaning").
- Fakta kode: checkout → rooms `status='cleaning'`; kamar menjadi `available` setelah staf menandai bersih (dialog Mark as Clean di /occupancy, atau penyelesaian task di /rooms).
- Revisi: perbaiki sequence 3.3.2.1.3.6: rooms SET status=**cleaning**; juga tidak ada "UPDATE housekeeping_tasks → pending" otomatis (pembuatan task checkout-cleaning dipicu manual via endpoint — konsisten dengan Limitasi #4).

### A5. Limitasi #5 (Bab 5.3) SUDAH USANG — antarmuka penyelesaian tugas housekeeping ADA
- Fakta kode: `src/app/rooms/page.tsx` tab Housekeeping punya: edit task dengan dropdown status Pending/In Progress/Completed/Cancelled, tombol mark-as-complete (set `completed` + `completed_at` + kamar otomatis `available`).
- Revisi: HAPUS poin limitasi #5, atau ganti dengan limitasi lain yang masih valid (mis. tidak ada notifikasi push mobile untuk staf housekeeping).

### A6. Settings TIDAK dibatasi role super_admin
- Lokasi: Tabel 3.3 no.14 ("Akses dibatasi pada role super_admin"), Bab 3.3.1.2.
- Fakta kode: `/settings` justru masuk GUEST_ALLOWED_ROUTES di RouteGuard (guest perlu akses tab profil); hanya tab Hotel/AI yang digate permission `settings`; subhalaman database/development/health/security tanpa cek role tambahan dan sebagian fiturnya simulasi.
- Revisi: ubah kalimat menjadi "Halaman Settings dapat diakses semua pengguna login untuk pengaturan profil; tab konfigurasi hotel dan AI dibatasi permission `settings` (super_admin/manager)".

### A7. Ejaan nilai ENUM status — pakai TANDA HUBUNG
- Fakta kode/DB: `checked-in`, `checked-out` (hyphen), `no_show` (underscore — satu-satunya), housekeeping `in-progress`.
- Revisi: semua `checked_in` / `checked_out` / `in_progress` di Bab 3–4 (sequence, activity, struktur tabel) diganti `checked-in` / `checked-out` / `in-progress`.

### A8. Query rooms pada cekKetersediaan
- Lokasi: Bab 3.3.2.1.3.2 ("SELECT * FROM rooms WHERE status='available'").
- Fakta kode: filternya `.not('status','in','("maintenance","out_of_order")')` — kamar occupied hari ini tetap bisa ditawarkan untuk tanggal depan; yang dikecualikan hanya maintenance/out_of_order + kamar yang overlap reservasi aktif.
- Revisi: perbaiki narasi query ke-2.

### A9. Klaim "Validasi form menggunakan schema Zod" (Bab 4.3.1.3 aturan #5) SALAH
- Fakta kode: Zod hanya dipakai untuk parameter function tools chatbot + validasi API upload. Seluruh form UI memakai useState + validasi manual (mis. cek `.trim()`, validasi inline di dialog konfirmasi booking).
- Revisi: selaraskan dengan Tabel 3.5 yang sudah benar ("useState manual + Zod khusus chatbot tools"). Ganti kalimat aturan #5 menjadi "Validasi form dilakukan secara real-time pada lapisan komponen (inline error di bawah field)".

### A10. payment_status ENUM punya 4 nilai
- Lokasi: Bab 3.3.2.3.2 ("pending, paid, partial").
- Fakta DB: `pending, partial, paid, refunded`.

### A11. Kutipan teks UI berbahasa Indonesia sudah usang — UI kini FULL ENGLISH
- Contoh di skripsi: tombol "Masuk", "Masuk dengan Google", "Tambah Kamar", "Pesan Sekarang", placeholder "Opsional — untuk konfirmasi reservasi", label "Lupa Password".
- Fakta UI sekarang: "Sign In", "Sign in with Google", "Add Room", placeholder "Optional — for reservation confirmation", dst. Chatbot tetap melayani percakapan Bahasa Indonesia (kemampuan AI), tapi chrome UI English.
- Revisi: sesuaikan semua kutipan label UI di Bab 3–4 dengan screenshot baru, atau hapus kutipan literal dan deskripsikan fungsinya saja.

### A12. Tabel `Chat` — PascalCase
- Nama tabel persis `Chat` (huruf C besar, singular). Pastikan skripsi konsisten (Bab 3.3.2.3.2 sudah benar; cek bagian lain).

### A13. Klaim "Setiap endpoint diproteksi middleware autentikasi" (Bab 2.5.2)
- Status sekarang (setelah hardening 2026-06-13): SEMUA route mutasi diproteksi `getServerUserContext` + `hasPermission` (guests, rooms, custom-room-types, expenses, inventory, purchase-orders, suppliers, users, reports/analytics, reports/export, housekeeping ×2, guest-facilities, rooms/upload-image, files/upload) — KECUALI `/api/chat` yang by-design menerima anonim untuk tool read-only (verifikasi sesi server-side dilakukan untuk tool transaksional). Server actions occupancy juga digate `canManageBookings`.
- Revisi: ubah "middleware" → "API route guards server-side"; tambahkan pengecualian /api/chat by-design.

## B. AKURAT — JANGAN DIUBAH (terverifikasi benar)

- Format `booking_reference`: BK + 6 digit timestamp + 6 karakter acak ✓ (booking_id internal: BK + 8 digit + 4 karakter; walk-in beda format: `BK-{8digit}-{4char}`).
- cekKetersediaan 3 query + penggabungan Map di lapisan aplikasi ✓.
- Ownership check confirmPayment (kini diperketat: email kosong = tolak) ✓.
- Anonymous: cekKetersediaan/getRoomTypes bebas; createBooking → AUTH_REQUIRED + SHOW_LOGIN_PROMPT_JSON ✓.
- /api/chat memakai service-role key (Limitasi #1 tetap valid) ✓. Tanpa rate limiting (Limitasi #2 valid) ✓.
- Pembayaran simulasi delay 2 detik di occupancy (Limitasi #3 valid) ✓.
- Checkout TIDAK auto-membuat task housekeeping (Limitasi #4 valid) ✓.
- Exclusion constraint `no_overlap_active_reservations` + penanganan error 23P01 di createBooking ✓ (createBooking kini juga re-check overlap + validasi tanggal sebelum INSERT — boleh ditambahkan ke Bab 4).
- rooms.type → custom_room_types.name FK ON UPDATE CASCADE ✓.
- Upload gambar: 5 MB, JPEG/PNG/WebP, bucket room-images, path roomId/timestamp.ext ✓.
- Google OAuth PKCE via signInWithOAuth + /auth/callback ✓.
- Versi tech stack di Tabel 3.5/4.3 ✓ semua cocok dengan package.json.
- Supabase Realtime: occupancy (reservations/payments/rooms) + dashboard (rooms/reservations/guest_facility_requests) ✓ — kini benar-benar berfungsi (publication diperbaiki 2026-06-10). Catatan: TIDAK ada subscription `housekeeping_tasks`; hindari klaim "koordinasi housekeeping real-time".

## C. FITUR BARU YANG BELUM DIDOKUMENTASIKAN (opsional, memperkuat Bab 4)

1. Cancel/restore booking oleh staf: tombol di /guests & /occupancy, API `/api/bookings/[id]/cancel|restore` dengan RBAC + kolom audit, undo toast.
2. Tool chatbot getMyBookings & cancelBooking (lihat A2).
3. Verifikasi data diri sebelum konfirmasi booking chatbot (modal "Verify Your Details": nama/telepon/email editable, validasi real-time, tombol "Use my account details") — bukti bagus untuk Aturan Emas #5.
4. Anti prompt-injection: input tamu dibungkus `<guest_message>` + blok system prompt khusus.
5. Late fee otomatis: reservasi overdue memicu insert `billing_items` kategori late_fee per hari.
6. Pilihan model AI di UI chatbot: Gemini 2.5 Flash / 2.5 Pro (maxSteps 3, maxDuration 60).
7. Toast sukses/gagal di semua aksi CRUD + spinner loading di tombol submit (bukti Aturan Emas #3 & #4).

---

## D. PEMETAAN GAMBAR ↔ SCREENSHOT BARU (docs/assets/screenshots/)

Capture: Playwright, Chrome 1280×800 @2x. Full-page untuk halaman modul (utuh atas–bawah); financial dipisah dua foto sesuai permintaan.

| Gambar skripsi | File screenshot |
|---|---|
| 3.25 Halaman Publik | gambar-3-25-halaman-publik.png (full) |
| 3.26 Chatbot LLM | gambar-3-26-chatbot.png |
| 3.27 Halaman Login | gambar-3-27-login.png |
| 3.28 Manajemen Kamar | gambar-3-28-manajemen-kamar.png (full) |
| 3.29 Modul Keuangan | gambar-3-29-modul-keuangan.png |
| 4.1 Login | gambar-4-1-login.png |
| 4.2 Dashboard & Landing | gambar-4-2-dashboard.png (full) |
| 4.3 Manajemen Kamar | gambar-4-3-manajemen-kamar.png (full) |
| 4.4 Manajemen Tamu | gambar-4-4-manajemen-tamu.png (full) |
| 4.5 Modul Reservasi | gambar-4-5-reservasi-occupancy.png (full) |
| 4.6 Modul Keuangan | gambar-4-6a-keuangan-ringkasan.png + gambar-4-6b-keuangan-riwayat-transaksi.png (tab Income History — dipisah agar tidak memanjang) |
| 4.7 Modul Inventaris | gambar-4-7-inventaris.png (full) |
| 4.8 Billing & Invoice | gambar-4-8-billing-invoice.png (full) |
| 4.9 Modul Laporan | gambar-4-9-laporan.png (full) |
| 4.10 Chatbot LLM | gambar-4-10-chatbot.png (dengan kartu kamar hasil cekKetersediaan) |
| 4.12 Learnability | gambar-4-12-learnability-login.png |
| 4.13 Efficiency | gambar-4-13-efficiency-dashboard.png |
| 4.14 Memorability | gambar-4-14-memorability-navigasi.png |
| 4.15 Error Rate (validasi real-time) | gambar-4-15-error-rate-validasi-form.png (modal Confirm Booking, error "Name must be at least 3 characters") |
| 4.16 Satisfaction | gambar-4-16-satisfaction-konfirmasi-reservasi.png (reservasi berhasil dibuat + Payment Options) |
| 4.17 Aturan 1 Konsistensi | gambar-4-17-aturan1-konsistensi.png |
| 4.18 Aturan 2 Shortcut | gambar-4-18-aturan2-shortcut.png |
| 4.19 Aturan 3 Feedback | gambar-4-19a-...-sebelum.png + gambar-4-19b-...-sesudah.png (hover sel kosong memunculkan tombol +) + gambar-4-19c-...-toast.png (toast sukses) |
| 4.20 Aturan 4 Closure | gambar-4-20-aturan4-closure-toast.png (toast "Room updated successfully") |
| 4.21 Aturan 5 Error Handling | gambar-4-21-aturan5-error-handling.png (login error informatif) |
| 4.22 Aturan 6 Pembatalan | gambar-4-22-aturan6-pembatalan-dialog.png (dialog konfirmasi Delete Room + Cancel) |
| 4.23 Aturan 7 Kendali Pengguna | gambar-4-23-aturan7-kendali-pengguna.png (filter laporan) |
| 4.24 Aturan 8 Beban Memori | gambar-4-24-aturan8-beban-memori.png (badge status + kalender) |

Bukan screenshot aplikasi (tidak di-capture): Gambar 2.1–2.6 (sumber paper), 3.1–3.24 & 3.30 (diagram olahan penulis, source `docs/assets/diagrams-src/`, render `docs/assets/images/`), 3.3–3.5 (website OPERA/Cloudbeds/Little Hotelier), 4.11 (chart olahan penulis), L.6.x (foto dokumentasi wawancara).

Regenerasi screenshot kapan saja: `pnpm dev` lalu `pnpm exec playwright test docs/verification/thesis-screenshot-capture.spec.ts --project=chromium`.
