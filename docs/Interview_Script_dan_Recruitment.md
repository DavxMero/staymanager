# Interview Script + Recruitment Strategy — StayManager

**Strategi**: 1 hotel teman = case study primer. Hindari overhead cari banyak hotel.

**Target Responden** (mengakomodasi klaim skripsi original):
- 4 narasumber wawancara (1 hotel, 4 peran)
- 10 staf UAT (1 hotel + jaringan kontak hotel teman)
- 20 tamu UAT (mix: tamu real hotel teman + test users via WA broadcast)

**Total**: 30 responden riil sesuai claim asli skripsi. Akui di Bab Limitasi: "Penelitian menggunakan single-case study di [Nama Hotel] sebagai konteks utama."

---

## A. Wawancara 4 Narasumber (Tabel 3.3)

**Format**: Tatap muka di hotel (kalau dekat) ATAU video call 30-45 menit.
**Cara dokumentasi**: Rekam audio (minta izin) → transkrip ke teks → pilih kutipan paling representatif untuk Tabel 3.3.

### Persiapan sebelum wawancara
1. Minta izin tertulis ke pemilik hotel (informed consent ringkas)
2. Persiapan rekorder + notebook
3. Brief narasumber 1-2 hari sebelumnya: durasi, topik, tujuan akademik
4. Bawa laptop kalau mau demo aplikasi sambil wawancara (optional, lebih engaging)

### Script Wawancara — 6 Pertanyaan Inti (sesuai Tabel 3.3)

**Pembukaan** (3 menit):
> "Selamat pagi/siang Bapak/Ibu. Terima kasih sudah meluangkan waktu. Saya [Nama] dari Universitas Bina Nusantara, sedang riset Property Management System untuk hotel kecil-menengah. Ada 6 pertanyaan utama, total sekitar 30 menit. Boleh saya rekam suaranya untuk akurasi catatan? Data hanya untuk skripsi, identitas bisa diinisialkan."

**Q1 — Sistem yang sekarang dipakai**
> "Sistem atau alat apa yang Bapak/Ibu pakai sekarang untuk mengelola operasional hotel? Misalnya untuk reservasi, status kamar, koordinasi staf, atau pencatatan keuangan."
>
> *Probe*: Excel? WhatsApp? Aplikasi khusus? Buku catatan manual? Kombinasi?

**Q2 — Kendala utama**
> "Apa kendala terbesar yang dihadapi dengan sistem yang berjalan saat ini?"
>
> *Probe per peran*:
> - Manager: "Bagaimana visibility ke data operasional secara realtime?"
> - Front Desk: "Berapa lama biasanya proses check-in tamu? Pernah double booking?"
> - Housekeeping: "Bagaimana koordinasi tugas antar staf?"
> - Finance: "Berapa lama waktu rekap keuangan harian/bulanan? Pernah ada selisih?"

**Q3 — Fitur yang paling dibutuhkan**
> "Kalau ada sistem digital baru, fitur apa yang paling penting menurut Bapak/Ibu? Yang akan benar-benar membantu kerja sehari-hari."

**Q4 — Pengelolaan tamu/reservasi**
> "Bagaimana proses reservasi dan pengelolaan data tamu sekarang? Tamu biasanya pesan lewat mana — telepon, WhatsApp, OTA, walk-in?"

**Q5 — Akses data antar departemen (RBAC)**
> "Apakah perlu pembatasan akses staf berdasarkan tugasnya? Misalnya, apakah front desk perlu lihat data keuangan? Atau housekeeping perlu lihat detail tamu?"

**Q6 — Layanan chatbot untuk tamu**
> "Kalau ada chatbot AI yang bisa jawab pertanyaan tamu 24/7 dan terima reservasi via chat, menurut Bapak/Ibu seberapa berguna untuk hotel ini?"

**Penutup**:
> "Terima kasih sangat banyak. Apakah ada hal lain yang menurut Bapak/Ibu penting tapi belum saya tanyakan?"

### Mapping Peran → Narasumber Hotel Teman

Hotel kecil biasanya punya struktur fleksibel. Kalau hotel teman tidak punya posisi spesifik, gunakan padanan ini:

| Peran skripsi | Padanan di hotel kecil |
|---|---|
| Manajer Hotel | Owner / General Manager |
| Front Desk / Resepsionis | Receptionist / Front office staff |
| Supervisor Housekeeping | Senior housekeeping staff / Lead cleaner |
| Staf Keuangan | Bookkeeper / Owner sekaligus pegang keuangan |

Kalau pemilik hotel pegang 2 peran sekaligus (mis. owner + finance), tetap hitung 1 narasumber tapi tanya kedua sudut pandangnya. Catat di metodologi.

---

## B. UAT Staf — 10 Responden

**Strategi pengumpulan**:
1. **Hotel teman** (5-7 staf) — primary
2. **Jaringan teman** (3-5 staf) — minta hotel teman intro ke kenalan industri (hotel/villa lain)
3. Distribusi via Google Form link, broadcast di WhatsApp Group hotel teman

### Skenario yang dilakukan responden sebelum mengisi form

Kasih staf akses 30 menit untuk explore aplikasi, dengan task list:
1. Login dengan akun yang disediakan
2. Lihat dashboard
3. Tambah 1 kamar dummy
4. Tambah 1 reservasi dummy
5. Lakukan check-in pada reservasi tersebut
6. Buka modul billing / financial
7. Logout

Setelah itu mereka isi form (template di [`UAT_SUS_Questionnaire.md`](UAT_SUS_Questionnaire.md) FORM 1).

### Recruitment message (copy ke WhatsApp)

```
Halo [Nama],

Saya [Nama] sedang menyelesaikan skripsi tentang Property 
Management System untuk hotel. Saya butuh bantuan Bapak/Ibu 
untuk mencoba aplikasi yang saya kembangkan dan mengisi 
kuesioner singkat (8 pertanyaan, 5-7 menit).

Detail:
🔗 Link aplikasi: [https://staymanager.vercel.app/login]
🔑 Akun trial: [email] / [password]
📋 Form kuesioner: [link Google Form]

Total waktu yang dibutuhkan: 30-40 menit (eksplorasi 
aplikasi 30 menit + isi form 10 menit). Identitas akan 
dijaga rahasia, hanya dipakai untuk keperluan akademik.

Terima kasih banyak atas bantuannya 🙏
```

---

## C. UAT Tamu / Chatbot — 20 Responden

**Strategi pengumpulan**:
1. **Tamu real hotel teman** (5-10 orang) — minta hotel teman pasang stiker QR code di lobby/kamar yang link ke chatbot test
2. **Test users via WA broadcast** (10-15 orang) — broadcast ke teman/keluarga, minta coba booking dummy

### Brief untuk test user (sebelum mereka coba chatbot)

```
Halo, saya butuh bantuan singkat untuk skripsi tentang 
chatbot AI untuk reservasi hotel. 

Yang perlu dilakukan (10-15 menit total):
1. Buka link: [https://staymanager.vercel.app/chatbot]
2. Coba 3 hal:
   - Tanya info fasilitas hotel
   - Tanya ketersediaan kamar untuk tanggal X-Y (terserah)
   - Coba pesan kamar via chat (data tamu boleh palsu)
3. Isi form penilaian: [link Google Form]

Identitas Anda dirahasiakan. Terima kasih 🙏
```

### Tips agar UAT tamu kredibel

- **Pastikan setiap responden benar-benar interact dengan chatbot, jangan hanya isi form mentah**. Cara verifikasi: di Google Form tambahkan pertanyaan attention check seperti "Apa pertanyaan terakhir yang Anda tanyakan ke chatbot?"
- Kumpulkan timestamp pengisian → buktikan distribusi waktu yang masuk akal (bukan semua dalam 5 menit)
- Simpan log percakapan chatbot di tabel `ai_messages` Supabase sebagai bukti pendukung

---

## D. SUS — Tambah ke Form UAT yang Sama

10 pertanyaan SUS sudah ada di [`UAT_SUS_Questionnaire.md`](UAT_SUS_Questionnaire.md) FORM 3. Tinggal tambahkan ke FORM 1 (UAT Staf) sebagai bagian terakhir form. Skor SUS dihitung otomatis lewat formula di file itu.

**Target SUS**: ≥ 68 (kategori "Good"). Skor antara 51-68 masih OK tapi perlu narasi limitasi.

---

## E. Timeline Realistic — 2 Minggu

| Minggu | Aktivitas | Output |
|---|---|---|
| Minggu 1, hari 1-2 | Setup hotel teman: izin tertulis, demo aplikasi ke owner, deploy app ke production stable | Aplikasi live + akun trial siap |
| Minggu 1, hari 3-4 | Wawancara 4 narasumber (semua di hotel teman atau via call) | 4 transkrip, isi Tabel 3.3 |
| Minggu 1, hari 5-7 | Black Box Testing 34 skenario solo + screenshot bukti | Tabel 4.4-4.12 terisi |
| Minggu 2, hari 8-10 | UAT staf (broadcast + reminder), kumpulkan minimal 10 respons | Tabel 4.13 terisi |
| Minggu 2, hari 11-13 | UAT tamu (broadcast + reminder), kumpulkan minimal 20 respons | Tabel 4.14 terisi + skor SUS |
| Minggu 2, hari 14 | Analisis data, hitung rata-rata, narasi 4.7 dan Bab 5 | Skripsi siap untuk pembimbing |

---

## F. Yang Saya Butuhkan dari Kamu

Untuk eksekusi tahap selanjutnya, kasih saya info berikut:

1. **Nama hotel teman** (untuk dokumentasi case study) — boleh disamarkan kalau ada permintaan privacy
2. **Lokasi & jumlah kamar** (≤30 = small property, sesuai target StayManager)
3. **Estimasi jumlah staf** dari hotel itu (untuk planning UAT staf)
4. **Apakah hotel teman setuju** jadi case study (perlu informed consent)

Setelah itu saya bantu:
- Buat dokumen Informed Consent yang siap di-sign
- Buat Google Form lengkap (UAT staf + tamu + SUS) yang siap di-share
- Bikin landing page demo dengan akun trial pre-seeded
