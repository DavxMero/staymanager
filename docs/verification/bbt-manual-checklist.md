# BBT Manual Checklist — 36 Skenario StayManager

**Versi:** 2026-05-27
**Sumber:** Tabel 4.4-4.12 di `docs/Skripsi_StayManager_Fixed.md`
**Cara pakai:** Jalankan Playwright spec dulu (`docs/verification/bbt-playwright.spec.ts`). Kalau ada skenario yang gagal otomatis atau di-skip, run manual mengikuti checklist di bawah. Tandai PASS / FAIL / PARTIAL + capture screenshot bukti.

## Hasil Eksekusi

| Skenario | Module | Status Auto | Status Manual | Bukti | Catatan |
|---|---|---|---|---|---|
| 1 | Autentikasi | [ ] | [ ] | screenshot-01.png | |
| 2 | Autentikasi | [ ] | [ ] | | |
| 3 | Autentikasi | [ ] | [ ] | | |
| 4 | Autentikasi | [ ] | [ ] | | |
| 5 | Autentikasi | [ ] | [ ] | | |
| 6 | Autentikasi (OAuth) | SKIP | [ ] | screenshot-06.png | OAuth tidak bisa auto, manual wajib |
| 7 | Autentikasi (OAuth) | SKIP | [ ] | screenshot-07.png | OAuth tidak bisa auto, manual wajib |
| 8 | Dashboard | [ ] | [ ] | | |
| 9 | Dashboard | [ ] | [ ] | | |
| 10 | Dashboard | [ ] | [ ] | | Realtime sync via 2 tabs |
| 11 | Manajemen Kamar | [ ] | [ ] | | |
| 12 | Manajemen Kamar | [ ] | [ ] | | |
| 13 | Manajemen Kamar | [ ] | [ ] | | |
| 14 | Manajemen Kamar | [ ] | [ ] | | |
| 15 | Manajemen Kamar | [ ] | [ ] | | |
| 16 | Manajemen Tamu | [ ] | [ ] | | |
| 17 | Manajemen Tamu | [ ] | [ ] | | |
| 18 | Manajemen Tamu | [ ] | [ ] | | |
| 19 | Manajemen Tamu | [ ] | [ ] | | |
| 20 | Keuangan | [ ] | [ ] | | |
| 21 | Keuangan | [ ] | [ ] | | |
| 22 | Keuangan | [ ] | [ ] | | |
| 23 | Keuangan | [ ] | [ ] | | |
| 24 | Inventori | [ ] | [ ] | | |
| 25 | Inventori | [ ] | [ ] | | |
| 26 | Inventori | [ ] | [ ] | | |
| 27 | Chatbot | [ ] | [ ] | | |
| 28 | Chatbot | [ ] | [ ] | | Function calling cekKetersediaan |
| 29 | Chatbot | [ ] | [ ] | | End-to-end reservasi via chat |
| 30 | Chatbot | [ ] | [ ] | | Multi-turn context |
| 31 | Laporan | [ ] | [ ] | | |
| 32 | Laporan | [ ] | [ ] | | |
| 33 | Laporan | [ ] | [ ] | | Dialog print browser |
| 34 | Pengaturan/RBAC | [ ] | [ ] | | |
| 35 | Pengaturan/RBAC | [ ] | [ ] | | |
| 36 | Pengaturan/RBAC | [ ] | [ ] | | |

**Rangkuman:** Total skenario PASS / FAIL / PARTIAL akan diisi setelah eksekusi.

---

## Detail Skenario (mengikuti urutan Tabel 4.4 - 4.12)

### Modul Autentikasi (Tabel 4.4) — Skenario 1-7

#### Skenario 1: Login dengan kredensial valid
- Akses `/login`
- Input email: `admin@hotel.com`, password: `Admin123!`
- Klik tombol "Masuk"
- **Expected:** Redirect ke `/dashboard` sesuai peran super_admin
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 2: Login dengan password salah
- Akses `/login`
- Input email valid, password salah (`wrongpass`)
- Klik "Masuk"
- **Expected:** Pesan error "Email atau password salah"
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 3: Login dengan email tidak terdaftar
- Akses `/login`
- Input email `unknown@test.com`, password apapun
- **Expected:** Pesan error "Pengguna tidak ditemukan"
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 4: Login dengan field kosong
- Akses `/login`
- Klik "Masuk" tanpa isi apapun
- **Expected:** Validasi form menampilkan "Field wajib diisi"
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 5: Logout dari sistem
- Login dulu, lalu klik tombol Logout di sidebar
- **Expected:** Sesi dihapus, redirect ke `/login`
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 6: Login Google OAuth — akun valid (MANUAL)
- Akses `/login`, klik "Masuk dengan Google"
- Pilih akun Google yang terdaftar sebagai staf
- **Expected:** OAuth callback berhasil, sesi dibuat, redirect ke dashboard
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 7: Login Google OAuth — akses dibatalkan (MANUAL)
- Akses `/login`, klik "Masuk dengan Google"
- Tutup popup Google sebelum login selesai
- **Expected:** Kembali ke `/login` tanpa perubahan sesi
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

### Modul Dashboard (Tabel 4.5) — Skenario 8-10

#### Skenario 8: Memuat data KPI real-time
- Login, akses `/dashboard`
- **Expected:** 4 kartu KPI terisi: occupancy, pendapatan, tamu aktif, tugas housekeeping
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 9: Menampilkan grafik tren pendapatan
- Akses `/dashboard`
- **Expected:** Grafik batang menampilkan data 7 hari terakhir
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 10: Update KPI saat data berubah (Realtime)
- Buka 2 tab: tab A di `/dashboard`, tab B di `/rooms`
- Di tab B, ubah status kamar dari Tersedia ke Occupied
- **Expected:** KPI occupancy di tab A ter-update tanpa reload
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

### Modul Manajemen Kamar (Tabel 4.6) — Skenario 11-15

#### Skenario 11: Menambah data kamar baru
- Akses `/rooms`, klik "Tambah Kamar"
- Input: No `TEST-101`, Tipe Deluxe, Kapasitas 2, Tarif 500000
- **Expected:** Kamar tersimpan, muncul di daftar
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 12: Menambah kamar dengan nomor duplikat
- Coba tambah kamar dengan nomor `TEST-101` yang sudah ada
- **Expected:** Error "Nomor kamar sudah terdaftar"
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 13: Mengubah tarif kamar
- Edit `TEST-101`, ubah tarif ke 550000
- **Expected:** Tarif terupdate
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 14: Mengubah status kamar
- Ubah status kamar 102 ke "Sedang Dibersihkan"
- **Expected:** Status + badge warna berubah, dashboard sinkron
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 15: Menghapus data kamar
- Hapus kamar 103, konfirmasi dialog
- **Expected:** Kamar hilang dari daftar
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

### Modul Manajemen Tamu (Tabel 4.7) — Skenario 16-19

#### Skenario 16: Menambah data tamu baru
- Akses `/guests`, klik "Tambah Tamu"
- Input: Nama Ahmad Fauzi, KTP 1234567890123456, Telp 08123456789
- **Expected:** Tersimpan, muncul di daftar
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 17: Mencari data tamu
- Di `/guests`, ketik "Ahmad" di kolom pencarian
- **Expected:** Hasil hanya tamu mengandung "Ahmad"
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 18: Proses check-in tamu
- Pilih Ahmad → reservasi aktif → konfirmasi check-in
- **Expected:** Status reservasi `Check-in`, kamar `Occupied`, waktu tercatat
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 19: Proses check-out tamu
- Pilih tamu yang check-in → konfirmasi check-out
- **Expected:** Reservasi `Check-out`, kamar `Cleaning`, billing auto-generate
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

### Modul Keuangan (Tabel 4.8) — Skenario 20-23

#### Skenario 20: Mencatat transaksi pembayaran
- Input: Nama Ahmad, Jumlah Rp1.000.000, Metode Transfer Bank
- **Expected:** Tersimpan, KPI dashboard ter-update
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 21: Mencatat pengeluaran operasional
- Input: Kategori Amenities, Jumlah 250000, Deskripsi Restok sabun
- **Expected:** Tersimpan, tampil di laporan keuangan
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 22: Filter laporan per periode
- Filter: 1-30 Juni 2025
- **Expected:** Hanya transaksi dalam periode yang muncul
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 23: Input transaksi dengan jumlah nol
- Input jumlah Rp0
- **Expected:** Error "Jumlah harus lebih dari 0"
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

### Modul Logistik dan Inventori (Tabel 4.9) — Skenario 24-26

#### Skenario 24: Menambah item inventaris baru
- Input: Nama Sabun Mandi, Kategori Amenities, Stok 100, Min 20, Satuan Pcs
- **Expected:** Tersimpan, muncul di daftar
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 25: Update stok item
- Tambah stok sabun 50 pcs (restok)
- **Expected:** Stok 100 → 150, riwayat tercatat
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 26: Peringatan stok minimum
- Kurangi stok sabun ke 18 (di bawah min 20)
- **Expected:** Indikator merah peringatan stok rendah
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

### Modul Chatbot LLM (Tabel 4.10) — Skenario 27-30

#### Skenario 27: Pertanyaan informasi hotel
- Di `/chatbot`, kirim "Apa fasilitas yang tersedia di hotel ini?"
- **Expected:** Chatbot menjawab dengan info fasilitas dari knowledge base
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 28: Cek ketersediaan kamar real-time
- Kirim "Ada kamar tersedia untuk tanggal 15-17 Juli?"
- **Expected:** Chatbot panggil function calling → kamar + harga
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 29: Proses reservasi via chatbot
- Kirim "Pesan kamar Deluxe untuk 2 orang 20-22 Juli, nama Budi Santoso"
- **Expected:** Chatbot pandu alur, entri masuk DB, kode booking diberikan
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 30: Percakapan multi-turn
- Kirim "Berapa harga Deluxe?" → tunggu jawaban → "Kalau Standard?"
- **Expected:** Jawaban kedua tetap dalam konteks harga kamar
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

### Modul Laporan (Tabel 4.11) — Skenario 31-33

#### Skenario 31: Generate laporan occupancy
- Pilih periode Juni 2025
- **Expected:** Tabel + grafik tingkat hunian harian
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 32: Generate laporan pendapatan
- Filter pendapatan Juni 2025
- **Expected:** Total + breakdown per kategori + perbandingan periode
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 33: Cetak laporan
- Klik tombol "Cetak"
- **Expected:** Dialog print browser terbuka, layout rapi
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

### Modul Pengaturan dan RBAC (Tabel 4.12) — Skenario 34-36

#### Skenario 34: Menambah pengguna staf baru
- Login sebagai super_admin
- Input: Nama Budi Santoso, Role Staff, Email budi@hotel.com
- **Expected:** Akun baru dengan permissions Staff
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 35: Akses ditolak sesuai role
- Login sebagai Staff (bukan super_admin)
- Akses `/settings/users`
- **Expected:** Pesan "Akses ditolak", redirect ke `/dashboard`
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

#### Skenario 36: Mengubah peran pengguna
- Login sebagai super_admin
- Ubah role Budi dari Staff → Manager
- **Expected:** Permissions Budi bertambah sesuai role Manager
- **Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

---

## Setelah Eksekusi Selesai

1. Update `docs/Skripsi_StayManager_Fixed.md` baris 2140 (paragraf penutup Bab 4.3.2):
   - Ganti angka `97,22%` dan `35 dari 36 skenario` dengan hasil aktual
   - Ganti `1 skenario partial-fail` dengan detail aktual jika beda
2. Update kolom Status di Tabel 4.4-4.12 dari `[diuji]` ke `Berhasil` / `Gagal` per skenario
3. Update Bab 5.1 Simpulan (baris 2206, 2210) dengan persentase aktual
4. Generate batch sync prompt untuk Word Agent — gunakan `sync-prompt-2026-05-27-data-integration.md` sebagai template
