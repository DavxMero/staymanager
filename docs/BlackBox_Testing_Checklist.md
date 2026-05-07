# Black Box Testing Checklist — StayManager

**Tujuan**: 34 skenario dari Bab 4.3 skripsi, dieksekusi langsung di aplikasi yang sudah running. Setelah selesai, transfer hasil ke Tabel 4.4–4.12 di skripsi.

**Cara pakai**:
1. Jalankan aplikasi: `pnpm dev` lalu buka `http://localhost:3000`
2. Login dengan akun staf (perlu setup akun + role di Supabase dulu kalau belum ada)
3. Eksekusi setiap skenario sesuai urutan
4. Tandai ✅ Berhasil / ❌ Gagal di kolom **Hasil**, screenshot kalau perlu untuk lampiran skripsi
5. Catat **Catatan Aktual** kalau hasil aktual berbeda dari ekspektasi

---

## 4.3.1 Modul Autentikasi (5 skenario)

| No | Skenario | Langkah | Ekspektasi | Hasil | Catatan |
|---|---|---|---|---|---|
| 1 | Login kredensial valid | Buka `/login`, input email+password staf valid, klik Masuk | Redirect ke `/dashboard` sesuai role | ☐ | |
| 2 | Login password salah | Input email valid + password salah | Pesan error muncul, tetap di `/login` | ☐ | |
| 3 | Login email tidak terdaftar | Input email yang tidak ada di DB | Pesan error "Pengguna tidak ditemukan" atau sejenis | ☐ | |
| 4 | Login field kosong | Klik Masuk tanpa isi field | Validasi form / browser-native required | ☐ | |
| 5 | Logout | Klik tombol Logout di sidebar | Session dihapus, redirect ke `/login` | ☐ | |

## 4.3.2 Modul Dashboard (3 skenario)

| No | Skenario | Langkah | Ekspektasi | Hasil | Catatan |
|---|---|---|---|---|---|
| 6 | Memuat data KPI | Akses `/dashboard` | Kartu KPI menampilkan data occupancy, reservasi, fasilitas, staf | ☐ | |
| 7 | Grafik tren | Lihat seksi chart di dashboard | Grafik render dengan data dari DB | ☐ | |
| 8 | Update KPI real-time | Buka 2 tab: Tab A `/dashboard`, Tab B `/rooms`. Di Tab B ubah status kamar. | Tab A KPI ter-update tanpa refresh (Supabase Realtime) | ☐ | |

## 4.3.3 Modul Manajemen Kamar (5 skenario)

| No | Skenario | Langkah | Ekspektasi | Hasil | Catatan |
|---|---|---|---|---|---|
| 9 | Tambah kamar | `/rooms` → "Add Room" → isi number 999, type, base_price, save | Row baru muncul di tabel | ☐ | |
| 10 | Tambah nomor duplikat | Coba tambah kamar dengan number yang sudah ada (misal 999 lagi) | Error message muncul, tidak tersimpan | ☐ | Verifikasi apakah constraint UNIQUE memang di-enforce |
| 11 | Edit tarif | Edit kamar 999 → ubah base_price | Tarif baru tersimpan, tabel ter-update | ☐ | |
| 12 | Ubah status | Ubah status kamar dari Available → Cleaning | Badge berubah, sinkronisasi ke /dashboard | ☐ | |
| 13 | Hapus kamar | Hapus kamar 999, konfirmasi dialog | Row hilang dari tabel | ☐ | Catat: hard delete, bukan soft delete |

## 4.3.4 Modul Manajemen Tamu (4 skenario)

| No | Skenario | Langkah | Ekspektasi | Hasil | Catatan |
|---|---|---|---|---|---|
| 14 | Tambah tamu | `/guests` → Add Guest → isi nama, email, phone | Tamu baru muncul di list | ☐ | |
| 15 | Cari tamu | Ketik kata kunci di search bar | List ter-filter real-time | ☐ | |
| 16 | Check-in | `/occupancy` → pilih reservasi confirmed → Check-in | Status reservasi → checked-in, kamar → occupied | ☐ | |
| 17 | Check-out | `/occupancy` → pilih reservasi checked-in → Checkout | Status → checked-out, kamar → cleaning, **invoice auto-generated** | ☐ | Verifikasi invoice muncul di `/billing` |

## 4.3.5 Modul Keuangan (4 skenario)

| No | Skenario | Langkah | Ekspektasi | Hasil | Catatan |
|---|---|---|---|---|---|
| 18 | Catat pembayaran | `/financial` → tambah transaksi income | Tersimpan, total pendapatan ter-update | ☐ | |
| 19 | Catat pengeluaran | `/expenses` → tambah expense | Tersimpan di tabel `expenses` | ☐ | |
| 20 | Filter periode | Filter laporan per bulan tertentu | Hanya transaksi dalam periode yang muncul | ☐ | |
| 21 | Validasi nominal nol | Coba input transaksi dengan amount 0 | Validasi menolak, error message | ☐ | Verifikasi apakah validation memang ada |

## 4.3.6 Modul Logistik & Inventori (3 skenario)

| No | Skenario | Langkah | Ekspektasi | Hasil | Catatan |
|---|---|---|---|---|---|
| 22 | Tambah item | `/logistics` → Add Item → isi data | Item tersimpan di `inventory_items` | ☐ | |
| 23 | Update stok | Restok item, tambah quantity | `current_stock` bertambah, transaction tercatat | ☐ | Cek tabel `inventory_transactions` |
| 24 | Stok minimum | Kurangi stok di bawah `min_stock` | Indikator merah / warning muncul | ☐ | |

## 4.3.7 Modul Chatbot LLM (4 skenario)

| No | Skenario | Langkah | Ekspektasi | Hasil | Catatan |
|---|---|---|---|---|---|
| 25 | Tanya info hotel | `/chatbot` → "Apa fasilitas hotel ini?" | Chatbot jawab dari knowledge base | ☐ | |
| 26 | Cek ketersediaan | "Ada kamar tersedia 15-17 Juli?" | Tool `cekKetersediaan` ter-trigger, ROOM_CARDS_JSON muncul | ☐ | Test 2 tanggal: tersedia & full |
| 27 | Reservasi via chatbot | Lengkapi data tamu → pilih kamar → konfirmasi | Tool `createBooking` jalan, row baru di `reservations` | ☐ | Cek di Supabase tabel reservations |
| 28 | Multi-turn | Ajukan 3-4 pertanyaan lanjutan | Chatbot pertahankan konteks | ☐ | |

## 4.3.8 Modul Laporan (3 skenario)

| No | Skenario | Langkah | Ekspektasi | Hasil | Catatan |
|---|---|---|---|---|---|
| 29 | Laporan occupancy | `/reports` → pilih periode | Grafik & tabel occupancy render | ☐ | |
| 30 | Laporan pendapatan | Filter income per bulan | Total + breakdown muncul | ☐ | |
| 31 | Cetak laporan | Klik tombol Print/Export | Dialog print browser terbuka | ☐ | |

## 4.3.9 Modul Pengaturan & RBAC (3 skenario)

| No | Skenario | Langkah | Ekspektasi | Hasil | Catatan |
|---|---|---|---|---|---|
| 32 | Tambah staf | `/staff` (sebagai admin) → tambah user baru + assign role | User baru tersimpan di `profiles` + `user_roles` | ☐ | |
| 33 | Akses ditolak | Login sebagai role rendah, akses `/staff` | Redirect / pesan akses ditolak | ☐ | Verifikasi RLS + `usePermissions` |
| 34 | Ubah role | Admin ubah role user existing | Permissions user berubah, menu sidebar adjust | ☐ | |

---

## Total: 34 skenario

**Setelah selesai**, masukkan hasilnya ke Tabel 4.4–4.12 di skripsi. Untuk setiap "Berhasil"/"Gagal" yang berbeda dari ekspektasi awal, gunakan kalimat seperti:

> "Skenario X menunjukkan hasil sesuai ekspektasi dengan catatan: [detail]"

Atau kalau ada yang gagal:

> "Skenario X belum sepenuhnya berfungsi karena [alasan]. Perbaikan dilakukan pada [file/fix]."

**Tips agar penguji percaya**:
- Lampirkan screenshot 5–10 skenario kunci sebagai bukti (login, check-in, chatbot booking, dll)
- Cantumkan tanggal & waktu eksekusi testing
- Sebut spesifik browser & device yang dipakai (sudah ada di Tabel 4.1)
