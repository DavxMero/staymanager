# Daftar Gambar yang Perlu Disediakan — Skripsi StayManager

**Versi:** 2026-05-27
**Total placeholder `[GAMBAR BELUM DIINPUT]`:** 53 di markdown source-of-truth
**Naming convention:** `gambar-X-NN.png` (X = Bab, NN = nomor urut dalam Bab)
**Folder target:** `docs/assets/images/` (atau struktur asset pipeline existing)

## Pembagian Tipe Gambar

| Tipe | Sumber | Tool Recommended | Estimasi |
|---|---|---|---|
| Diagram UML/Flowchart | Mermaid → render via Mermaid CLI atau draw.io | `npx @mermaid-js/mermaid-cli` | ~33 gambar |
| Screenshot Aplikasi | Playwright auto-screenshot di deployed app | `page.screenshot()` script | ~17 gambar |
| Illustrasi Konseptual | Stock/draw manual atau AI illustration | Canva, Figma | ~3 gambar |

---

## Bab 2 — Landasan Teori (Contoh Diagram, opsional)

| File | Caption | Lokasi Skripsi | Tipe | Sumber Suggested |
|---|---|---|---|---|
| `gambar-2-05.png` | Contoh Use Case Diagram | line 818 | Mermaid/draw | Generic UML example |
| `gambar-2-06.png` | Contoh Class Diagram | line 826 | Mermaid/draw | Generic UML example |
| `gambar-2-07.png` | Contoh Activity Diagram | line 835 | Mermaid/draw | Generic UML example |
| `gambar-2-08.png` | Contoh Sequence Diagram | line 843 | Mermaid/draw | Generic UML example |

## Bab 3 — Metodologi (Diagram Sistem)

| File | Caption | Lokasi | Tipe | Sumber Suggested |
|---|---|---|---|---|
| `gambar-3-01.png` | Alur Pengembangan Sistem Metodologi Scrum | line 984 | Mermaid flowchart | Diagram Scrum: Product Backlog → Sprint Planning → Sprint → Review |
| `gambar-3-02.png` | Kerangka Berpikir Penelitian | line 1025 | Mermaid flowchart | Input (masalah hotel) → Proses (pengembangan + pengujian) → Output (StayManager + evaluasi) |
| `gambar-3-03.png` | Flowchart Alur Aplikasi StayManager | line 1173 | Mermaid flowchart | Start → Login → RBAC routing → Modul → Logout |
| `gambar-3-04.png` | Use Case Diagram Sistem StayManager | line 1268 | Mermaid UML | 6 actor (super_admin, manager, front_desk, housekeeping, finance, guest) + use case per modul |
| `gambar-3-05.png` | Class Diagram Sistem StayManager | line 1276 | Mermaid UML | Entity utama: User, Room, Guest, Reservation, Payment, HousekeepingTask, InventoryItem, ChatSession |
| `gambar-3-06.png` | Sequence Diagram — Login Staf | line 1288 | Mermaid SD | Staf → LoginForm → SupabaseAuth → JWT → middleware → Dashboard |
| `gambar-3-07.png` | SD — Chatbot Cek Ketersediaan Kamar | line 1296 | Mermaid SD | Tamu → ChatUI → /api/chat → Gemini → tool cekKetersediaan → Supabase → response |
| `gambar-3-08.png` | SD — Chatbot Create Booking | line 1304 | Mermaid SD | Tamu → ChatUI → Gemini → tool buatReservasi → Supabase INSERT → konfirmasi |
| `gambar-3-09.png` | SD — Chatbot Konfirmasi Pembayaran | line 1312 | Mermaid SD | Tamu → ChatUI → tool konfirmasiPembayaran → update status reservasi |
| `gambar-3-10.png` | Arsitektur Integrasi LLM Chatbot dengan PMS | line 1316 | Mermaid architecture | Next.js frontend ↔ /api/chat ↔ Vercel AI SDK ↔ Google Gemini ↔ Supabase function calling |
| `gambar-3-11.png` | SD — Check-in Tamu | line 1324 | Mermaid SD | Front desk → GuestList → check-in form → update reservation + room status |
| `gambar-3-12.png` | SD — Check-out Tamu | line 1332 | Mermaid SD | Front desk → check-out trigger → update reservation + room (cleaning) + auto-billing |
| `gambar-3-13.png` | SD — Manajemen Kamar | line 1340 | Mermaid SD | Manager → /rooms → CRUD form → Supabase |
| `gambar-3-14.png` | SD — Manajemen Tugas Housekeeping | line 1348 | Mermaid SD | Supervisor HK → tasks list → assign staff → status update |
| `gambar-3-15.png` | Activity Diagram — Login | line 1360 | Mermaid activity | Mulai → input kredensial → validasi → [valid?] → dashboard / error |
| `gambar-3-16.png` | AD — Registrasi Akun Staff | line 1368 | Mermaid activity | Admin → form akun → validasi → INSERT → role assigned |
| `gambar-3-17.png` | AD — Reservasi via Chatbot | line 1376 | Mermaid activity | Tamu → chat → query → konfirmasi → INSERT reservation |
| `gambar-3-18.png` | AD — Check-in Tamu | line 1384 | Mermaid activity | Datang → verifikasi → assign kamar → update status |
| `gambar-3-19.png` | AD — Pengelolaan Tugas Housekeeping | line 1392 | Mermaid activity | Trigger (checkout/daily) → task created → staff assigned → completed |
| `gambar-3-20.png` | AD — Pencatatan Transaksi Keuangan | line 1400 | Mermaid activity | Pembayaran → input → validasi → INSERT transaction → update KPI |
| `gambar-3-21.png` | Rancangan Antarmuka Halaman Publik | line 1414 | Figma mockup / wireframe | Hero, daftar kamar, CTA chatbot |
| `gambar-3-22.png` | Rancangan Antarmuka Chatbot LLM | line 1420 | Figma mockup | Chat bubble, input box, quick reply buttons |
| `gambar-3-23.png` | Rancangan Antarmuka Halaman Login | line 1430 | Figma mockup | Form login + Google OAuth |
| `gambar-3-24.png` | Rancangan Antarmuka Manajemen Kamar | line 1438 | Figma mockup | Tabel kamar + status badges + filter |
| `gambar-3-25.png` | Rancangan Antarmuka Modul Keuangan | line 1446 | Figma mockup | Tabel transaksi + KPI cards + chart |
| `gambar-3-26.png` | ERD StayManager | line 1515 | Mermaid ER diagram | 14 entity utama + relationships (sudah ada definisi di Bab 3.3.2.3.1) |

## Bab 4 — Implementasi (Screenshot Aplikasi)

Semua screenshot di-capture dari deployed app (`https://staymanager.vercel.app` atau localhost).

| File | Caption | Lokasi | Halaman App | Catatan Capture |
|---|---|---|---|---|
| `gambar-4-01.png` | Tampilan Halaman Login | line 1704 | `/login` | Form login + tombol Google OAuth visible |
| `gambar-4-02.png` | Halaman Dashboard + Landing Page | line 1717 | `/` (publik) atau `/dashboard` | KPI cards + grafik tren |
| `gambar-4-03.png` | Modul Manajemen Kamar | line 1731 | `/rooms` | Tabel kamar dengan status badges berbagai warna |
| `gambar-4-04.png` | Modul Manajemen Tamu | line 1755 | `/guests` | Daftar tamu + tombol check-in/check-out |
| `gambar-4-05.png` | Modul Reservasi | line 1765 | `/reservations` | Kalender visual ketersediaan |
| `gambar-4-06.png` | Modul Keuangan | line 1779 | `/finance` | Tabel transaksi + filter periode |
| `gambar-4-07.png` | Modul Inventaris | line 1790 | `/inventory` | Daftar item + indikator stok rendah |

### Bukti 5 Faktor Manusia Terukur (Bab 4.3.1.1)

| File | Caption | Lokasi | Saran Capture |
|---|---|---|---|
| `gambar-4-11.png` | Bukti Faktor 1: Learnability — Antarmuka Login Intuitif | line 1876 | `/login` close-up dengan annotation panah/highlight |
| `gambar-4-12.png` | Bukti Faktor 2: Efficiency — Dashboard dengan Aksi Cepat | line 1884 | `/dashboard` dengan tombol aksi cepat visible (mis. Tambah Reservasi, Check-in) |
| `gambar-4-13.png` | Bukti Faktor 3: Memorability — Navigasi & Warna Konsisten | line 1892 | Side-by-side 2 modul untuk show konsistensi (mis. /rooms + /guests) |
| `gambar-4-14.png` | Bukti Faktor 4: Error Rate — Validasi Form Real-time | line 1900 | Form reservasi dengan error message visible (mis. tanggal invalid) |
| `gambar-4-15.png` | Bukti Faktor 5: Satisfaction — Dashboard Komprehensif | line 1908 | `/dashboard` full view dengan semua KPI + chart |

### Bukti 8 Aturan Emas (Bab 4.3.1.3)

| File | Caption | Lokasi | Saran Capture |
|---|---|---|---|
| `gambar-4-21.png` | Bukti Aturan 6: Pembatalan Aksi yang Mudah | line 2007 | Modal konfirmasi delete dengan tombol Batal + Konfirmasi |
| `gambar-4-22.png` | Bukti Aturan 7: Kendali Internal Pengguna | line 2015 | Halaman Settings (preferensi tampilan, filter custom) |
| `gambar-4-23.png` | Bukti Aturan 8: Informasi Tampil Langsung | line 2023 | `/rooms` dengan status badges + dropdown filter aktif |

---

## Saran Workflow

1. **Generate dulu yang mermaid-based** (Bab 2, Bab 3 — sekitar 30+ gambar): tulis sekali, render via `mmdc` CLI.
2. **Screenshot Bab 4** (~17 gambar): jalankan deployed app, login per role, capture per modul. Bisa di-automate via Playwright `page.screenshot()`.
3. **Mockup Bab 3.21-3.25** (5 gambar): kalau Figma file sudah ada, export PNG. Kalau belum, wireframe sederhana di draw.io cukup.

## Bab 4.3.2 — Bukti BBT (CAPTURED 2026-05-27)

Screenshot hasil eksekusi Playwright `bbt-screenshot-capture.spec.ts`. Disimpan di `docs/assets/images/`.

| File | Caption | Modul | Skenario |
|---|---|---|---|
| `gambar-4-16-bbt-login.png` | Bukti BBT — Halaman Login | Autentikasi | 1-5 |
| `gambar-4-17-bbt-dashboard.png` | Bukti BBT — Dashboard | Dashboard | 8-10 |
| `gambar-4-18-bbt-rooms.png` | Bukti BBT — Manajemen Kamar | Manajemen Kamar | 11-15 |
| `gambar-4-19-bbt-guests.png` | Bukti BBT — Manajemen Tamu | Manajemen Tamu | 16-19 |
| `gambar-4-20-bbt-finance.png` | Bukti BBT — Modul Keuangan | Keuangan/Financial | 20-23 |
| `gambar-4-21-bbt-inventory.png` | Bukti BBT — Logistik dan Inventaris | Logistik (`/logistics`) | 24-26 |
| `gambar-4-22-bbt-chatbot.png` | Bukti BBT — Chatbot LLM | Chatbot | 27-30 |
| `gambar-4-23-bbt-reports.png` | Bukti BBT — Laporan | Laporan | 31-33 |
| `gambar-4-24-bbt-settings.png` | Bukti BBT — Pengaturan dan RBAC | Settings | 34-36 |

**Cara reproduce:**
```powershell
node scripts/setup-e2e-test-users.mjs    # ensure test users ready
pnpm dev                                  # start dev server
pnpm exec playwright test docs/verification/bbt-screenshot-capture.spec.ts
```

## Setelah Semua Gambar Ada

- Replace setiap `**[GAMBAR BELUM DIINPUT — Gambar X.YY: caption]**` di markdown dengan `![](docs/assets/images/gambar-X-YY.png)`
- Verifikasi di Word doc: gambar harus terembed (bukan link), dengan caption di bawah, di-center
- Update Daftar Gambar di Bab depan kalau ada nomor halaman berubah
