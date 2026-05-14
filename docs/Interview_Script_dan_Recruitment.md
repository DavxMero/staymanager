# Interview Script + Recruitment Strategy — StayManager (v2 Strategi B)

> **Strategi B**: reduced scope dari 4 narasumber → **1-2 hotel teman dengan multi-role per session**. Jaringan responden mayoritas non-perhotelan (mahasiswa, guru, karyawan) → wawancara tetap perlu staf hotel real untuk validasi domain operasional, tapi sample size dikecilkan agar realistic. UAT staf akan di-supplement dengan **5-7 mahasiswa IT/karyawan kantor** sebagai "system evaluator" (lihat `UAT_SUS_Questionnaire.md` Form 1B).

## Target Responden Final

| Metode | Jumlah | Profil | Bagian Skripsi |
|---|---|---|---|
| Wawancara mendalam | **2 hotel teman, 2-4 narasumber total** | Owner/Manager + Front Desk (multi-role OK) | Tabel 3.3 + Bab 3 metodologi |
| Form 1A UAT Staf Hotel | 3-5 | Staf hotel teman | Tabel 4.13 (primary) |
| Form 1B UAT System Evaluator | 5-7 | Mahasiswa IT / karyawan kantor | Tabel 4.13 (supplementary) |
| Form 2 UAT Tamu/Chatbot | 20+ | Mahasiswa / guru / karyawan umum | Tabel 4.14 |
| Form 3 SUS | semua (28-32) | Universal | Tabel 4.15 |

**Total**: ~30-35 responden riil. Akui di Bab Limitasi: *"Single-case study di [Nama Hotel] sebagai konteks primer untuk wawancara dan UAT staf real. UAT staf di-extend dengan evaluator non-hotel (mahasiswa IT, karyawan kantor) untuk validasi usability sesuai framework Nielsen + Schneiderman. Pemisahan ini karena keterbatasan jaringan industri perhotelan peneliti dan justified oleh framework usability yang general-purpose."*

---

# 🎤 A. Wawancara Hotel Teman (1-2 hotel, 2-4 narasumber)

## Setup & Prinsip

**Format**: Tatap muka di hotel (kalau dekat) ATAU video call (Google Meet/Zoom).
**Durasi per sesi**: 45-60 menit (lebih lama dari skenario lama karena multi-role).
**Dokumentasi**: Rekam audio (minta izin verbal di awal) → transkrip ke teks → pilih kutipan paling representatif untuk Tabel 3.3.

**Prinsip multi-role**: Hotel kecil/menengah sering ada **role overlap** (owner = manager + finance, atau resepsionis = housekeeping supervisor). Jangan paksakan struktur 4-peran terpisah. Wawancarai per orang, **lalu tanya semua perspektif yang dia pegang** dalam satu sesi.

## Persiapan Sebelum Wawancara

1. **Hubungi pemilik hotel** via WA/telepon 3-7 hari sebelum sesi:
   > "Halo Pak/Bu [Nama], saya [Anda] dari [kampus]. Saya sedang riset skripsi tentang sistem manajemen hotel berbasis web dengan AI chatbot. Boleh saya minta waktu sekitar 45-60 menit untuk wawancara Bapak/Ibu (dan 1-2 staf kalau memungkinkan) tentang operasional hotel? Data hanya untuk skripsi, identitas akan disamarkan. Kira-kira hari/jam apa yang cocok?"

2. **Konfirmasi 1 hari sebelumnya** + kirim:
   - Informed consent ringkas (1 halaman — bisa template gratis online)
   - Garis besar 6 pertanyaan (supaya narasumber bisa siapkan)
   - Link demo StayManager kalau mau coba dulu

3. **Bawa peralatan**:
   - HP/recorder (test rekaman dulu di rumah)
   - Notebook + pulpen (catat keyword sambil rekam)
   - Laptop (optional — untuk demo sambil wawancara)
   - Konsumsi kecil (snack/kopi) sebagai apresiasi

## Script Wawancara — 6 Pertanyaan Inti

### Pembukaan (3-5 menit)

> *"Selamat pagi/siang Bapak/Ibu. Terima kasih sudah meluangkan waktu. Saya [Nama] dari [Universitas/Kampus], sedang mengerjakan skripsi tentang **sistem manajemen hotel (Property Management System) berbasis web yang dilengkapi chatbot AI untuk membantu hotel kecil-menengah**.*
>
> *Saya akan tanya 6 pertanyaan utama, total sekitar 45 menit. Boleh saya rekam suaranya untuk akurasi catatan? Data hanya untuk skripsi, identitas Bapak/Ibu akan disamarkan (cukup pakai inisial).*
>
> *Sebelum mulai — Bapak/Ibu di hotel ini pegang peran apa saja? Karena di hotel kecil sering 1 orang pegang banyak peran, saya akan tanya dari beberapa sudut pandang sekaligus."*

**[CATAT peran yang dipegang → akan jadi probe customization di Q2]**

### Q1 — Sistem yang Sekarang Dipakai

> **Pertanyaan**: *"Sistem atau alat apa yang Bapak/Ibu pakai sekarang untuk mengelola operasional hotel? Misalnya untuk reservasi, status kamar, koordinasi staf, atau pencatatan keuangan."*
>
> **Probe (kejar detail)**:
> - Excel? Google Sheets? WhatsApp? Aplikasi PMS spesifik? Buku catatan manual?
> - Kombinasi alat berapa?
> - Siapa yang paling sering pakai alat tersebut?
> - Sudah berapa lama pakai cara ini?

### Q2 — Kendala Utama (Multi-Role Probe)

> **Pertanyaan**: *"Apa kendala terbesar yang dihadapi dengan sistem yang berjalan saat ini? Saya akan tanya dari beberapa sudut pandang berdasarkan peran yang Bapak/Ibu pegang."*
>
> **Probe per peran (gunakan yang relevan berdasarkan jawaban pembukaan)**:
>
> *Sebagai Manager/Owner*:
> > "Bagaimana visibility Bapak/Ibu ke data operasional secara realtime? Misalnya, kalau mau tahu berapa kamar kosong sekarang, gampang nggak?"
>
> *Sebagai Front Desk*:
> > "Berapa lama biasanya proses check-in tamu? Pernah double booking atau bentrok kamar? Bagaimana mencegahnya?"
>
> *Sebagai Housekeeping*:
> > "Bagaimana koordinasi tugas antar staf cleaning? Bagaimana tahu kamar mana yang harus dibersihkan duluan?"
>
> *Sebagai Finance/Keuangan*:
> > "Berapa lama waktu untuk rekap keuangan harian/bulanan? Pernah ada selisih atau invoice yang kelewat?"

### Q3 — Fitur yang Paling Dibutuhkan

> **Pertanyaan**: *"Kalau ada sistem digital baru yang Bapak/Ibu bisa pakai, fitur apa yang paling penting? Yang akan benar-benar membantu kerja sehari-hari."*
>
> **Probe**:
> - Prioritaskan 3 fitur teratas
> - Tanya kenapa dia rangking begitu
> - Tanya: kalau ada fitur X tapi tidak ada Y, dia pilih yang mana?

### Q4 — Pengelolaan Tamu / Reservasi

> **Pertanyaan**: *"Bagaimana proses reservasi dan pengelolaan data tamu sekarang? Tamu biasanya pesan lewat mana — telepon, WhatsApp, OTA seperti Traveloka, atau walk-in?"*
>
> **Probe**:
> - Persentase reservasi via channel apa (estimasi kasar)
> - Bagaimana data tamu disimpan? Buku tamu? Excel? Aplikasi?
> - Pernah ada masalah kehilangan data tamu? Tamu komplain karena data salah?

### Q5 — Akses Data Antar Departemen (RBAC)

> **Pertanyaan**: *"Apakah Bapak/Ibu merasa perlu pembatasan akses staf berdasarkan tugasnya? Misalnya, apakah front desk perlu lihat data keuangan? Atau housekeeping perlu lihat detail tamu seperti nomor kontak dan ID?"*
>
> **Probe**:
> - Kenapa perlu/tidak perlu
> - Apakah pernah ada masalah akses (staf lihat data yang tidak perlu, atau sebaliknya)?
> - Kalau ada sistem yang membatasi akses otomatis, apakah berguna?

### Q6 — Layanan Chatbot AI untuk Tamu

> **Pertanyaan**: *"Kalau ada chatbot AI yang bisa menjawab pertanyaan tamu 24/7 dalam Bahasa Indonesia dan bisa menerima reservasi via chat, menurut Bapak/Ibu seberapa berguna untuk hotel ini?"*
>
> **Probe**:
> - Tamu hotel ini biasanya tipe apa (umur, asal, frekuensi nginap)?
> - Mereka familiar dengan teknologi chatbot?
> - Apa yang paling sering ditanyakan tamu sebelum reservasi? (untuk validasi use-case chatbot)
> - Kalau ada chatbot, Bapak/Ibu lebih nyaman chatbot independen atau yang bisa diawasi staf?

### Penutup (3-5 menit)

> *"Terima kasih sangat banyak Bapak/Ibu. Sebelum saya tutup, apakah ada hal lain yang menurut Bapak/Ibu penting tapi belum saya tanyakan? Atau ada masukan untuk sistem yang akan saya bangun?*
>
> *Setelah ini saya akan punya 2 follow-up:*
> 1. *Kalau berkenan, kuesioner singkat untuk Bapak/Ibu dan beberapa staf — ~15 menit. Bisa via WA atau saya kirim link Google Form.*
> 2. *Kalau hotel ini berkenan jadi case study di skripsi (boleh disamarkan), saya akan kirim draft Bab 4 untuk dicek dulu sebelum dimasukkan ke naskah final.*
>
> *Apakah Bapak/Ibu bersedia? Sekali lagi terima kasih."*

---

## Mapping Peran → Narasumber Hotel Teman

Hotel kecil biasanya punya struktur fleksibel. Kalau hotel teman tidak punya posisi spesifik, gunakan padanan berikut:

| Peran skripsi | Padanan di hotel kecil | Catatan |
|---|---|---|
| Manajer Hotel | Owner / General Manager | Sering merangkap Finance |
| Front Desk / Resepsionis | Receptionist / Front office staff | Sering merangkap input data tamu |
| Supervisor Housekeeping | Senior housekeeping staff / Lead cleaner | Bisa juga owner kalau hotel sangat kecil |
| Staf Keuangan | Bookkeeper / Owner | Hotel kecil biasanya owner pegang sendiri |

**Aturan praktis**:
- 1 narasumber yang pegang 2-3 peran = **1 sesi panjang 45-60 menit**, dapatkan semua perspektif
- 2-4 narasumber dari 1 hotel = lebih bagus untuk variasi sudut pandang
- Kalau hanya 1 hotel teman → sesi multi-narasumber lebih kuat dari single narasumber
- **2 hotel teman** = ideal untuk komparasi cross-case (1 hotel kecil + 1 hotel sedang/villa kecil)

---

## Strategi Recruitment Hotel Teman

### Hotel Teman Tier 1 (paling reachable)

- **Kenalan langsung pemilik hotel**: keluarga, alumni SMA/kampus, teman kerja yang punya hotel keluarga
- **Hotel kecil/villa di lingkungan**: villa bisnis kecil, guest house, hostel — sama-sama PMS use case

### Hotel Teman Tier 2 (via intro)

- **Minta intro dari hotel teman Tier 1**: "Pak, ada kenalan pemilik hotel lain yang bisa saya wawancarai?"
- **Komunitas hospitality**: WA Group PHRI (Persatuan Hotel dan Restoran Indonesia) regional, asosiasi villa, dll. — minta dosen pembimbing kalau punya kontak

### Tier 3 (cold outreach — terakhir)

- DM Instagram hotel kecil/villa di area Anda — pendek, sopan, profesional
- Email ke info@hotel-namanya.com — sertakan informed consent + jangka waktu

**Ekspektasi realistic**: dari 10 hotel yang Anda hubungi, mungkin 1-2 yang bersedia. **Mulai outreach 2 minggu sebelum target wawancara**.

---

# 📝 B. Pelaksanaan UAT Staf (Form 1A + 1B)

> Detail pertanyaan: lihat `UAT_SUS_Questionnaire.md` Form 1A (hotel real) dan Form 1B (system evaluator non-hotel).

## Form 1A — UAT Staf Hotel Real (3-5 responden)

**Strategi pengumpulan**:
1. **Hotel teman primary** — saat wawancara Bagian A selesai, lanjut Form 1A untuk narasumber yang sama (mereka SUDAH familiar konteks)
2. **Staf lain di hotel teman** — minta narasumber utama intro ke 2-3 staf lain (front desk lain, housekeeping)
3. **Brief sebelum isi form**: kasih 10 menit demo aplikasi, lalu kasih tablet/laptop untuk isi form

**Distribusi**:
- Print Google Form (jaga-jaga kalau internet hotel lambat) ATAU akses via tablet
- Berikan kompensasi: makan siang gratis, voucher OVO/Gopay 50rb, atau bingkisan kecil
- Target: 3-5 staf dari 1-2 hotel teman

## Form 1B — UAT System Evaluator (5-7 responden non-hotel)

**Strategi pengumpulan**:
1. **Teman kampus jurusan SI/Informatika** — paling cocok karena familiar evaluasi UX
2. **Karyawan kantor di bidang IT/business analyst** — alumni atau kenalan profesional
3. **Mahasiswa lain yang aktif pakai dashboard/CRM** — anak organisasi kampus, asisten dosen

**Distribusi**:
- WA personal (bukan broadcast group — terlalu impersonal): "Eh [Nama], aku lagi skripsi tentang sistem hotel berbasis web. Aku butuh kamu coba demo aplikasinya selama 15 menit terus isi kuesioner sekitar 10 menit. Bisa minta tolong? Nanti aku traktir kopi"
- Brief 10 menit awal: jelasin mereka bukan harus jadi staf hotel, tapi mengevaluasi **kemudahan penggunaan** sistem
- Kasih URL demo + akun + URL Google Form
- Follow up 2-3 hari kalau belum isi

---

# 🌐 C. Pelaksanaan UAT Tamu (Form 2) — 20+ Responden

> Detail pertanyaan: lihat `UAT_SUS_Questionnaire.md` Form 2.

**Strategi pengumpulan**:

### Channel 1: Broadcast WhatsApp Group
- WA Group teman kampus (jurusan apapun, bukan hanya IT)
- WA Group alumni SMA / SMP
- WA Group keluarga besar / arisan
- WA Group teman kantor (kalau Anda sudah kerja part-time)

**Template pesan WA**:
> *Halo teman-teman! 🙏*
>
> *Aku [Nama] lagi skripsi tentang aplikasi pesan hotel pakai chatbot AI Bahasa Indonesia. Aku butuh banget bantuan kalian untuk uji coba — cuma 15-20 menit, bisa dari HP:*
>
> *1. Buka [URL demo] — coba chatbot-nya, pesan kamar simulasi (cuma simulasi, nggak ada commitment beli)*
> *2. Isi Google Form ini: [URL form]*
>
> *Insentif: aku undi 3 pemenang Gopay 50rb dari semua responden 🎁*
>
> *Deadline: [tanggal]. Makasih banget! 🙏*

### Channel 2: Instagram Story / WA Status
- Posting recap singkat tugas + URL Bitly
- Re-share 2-3x dalam 2 minggu untuk reach orang yang berbeda

### Channel 3: Forum komunitas
- Forum kampus (kalau ada)
- Subreddit r/indonesia (kalau berani — tag riset)
- Twitter dengan tag #skripsi #mahasiswa

**Target**: 20-30 responden dalam 2 minggu. Realistic kalau Anda persisten dengan reminder.

**Tip insentif**: doorprize 3x Gopay 50rb = 150rb total = murah. Bisa juga voucher Shopee, atau e-book gratis (kalau Anda punya). Tanpa insentif response rate ~10%. Dengan insentif bisa ~30%.

---

# 📊 D. Analisis Data Pasca-Pengumpulan

## Kuantitatif (Likert + SUS)

| Form | Cara hitung | Output |
|---|---|---|
| Form 1A/1B Likert | Rata-rata per item, lalu rata-rata seluruh item | 1 angka per item (0-5) + 1 angka agregat |
| Form 2 Likert | Sama | Sama |
| Form 3 SUS | Rumus SUS (lihat `UAT_SUS_Questionnaire.md` bagian SUS scoring) | Skor 0-100, target ≥ 68 |

## Kualitatif (open-ended)

1. **Coding tematik**: baca semua jawaban "kritik & saran", kelompokkan ke 3-5 tema utama
   - Contoh tema: "Kebutuhan multi-bahasa", "Mobile responsiveness", "Notifikasi push", dll
2. **Kutipan representatif**: pilih 1-2 kalimat per tema untuk dimasukkan ke Bab 4
3. **Triangulasi**: bandingkan apa yang muncul di wawancara vs kuesioner — kalau sama, kuat. Kalau beda, diskusikan kenapa.

## Wawancara

1. **Transkrip** semua rekaman ke teks (bisa pakai Whisper / Google Recorder otomatis, lalu edit manual)
2. **Coding kualitatif**: tandai kalimat-kalimat yang mengandung **6 tema** sesuai 6 pertanyaan inti
3. **Tabel 3.3 mapping**: pilih kutipan paling representatif per pertanyaan untuk dimasukkan ke Tabel 3.3
4. **Narasi**: buat ringkasan 2-3 paragraf per pertanyaan untuk Bab 3 sub-bab "Analisis Kebutuhan"

---

# ⏱️ Timeline Lengkap (Strategi B)

| Minggu | Aktivitas | Output |
|---|---|---|
| 1 | Setup Google Form (4 form), test internal 2-3 teman. Hubungi 1-2 hotel teman | Form siap distribusi |
| 1-2 | Wawancara hotel teman (1-2 sesi panjang). Rekam + transkrip kasar | Transcript siap kode |
| 1-2 | Form 1A: staf hotel teman isi langsung saat kunjungan | 3-5 respons |
| 2-3 | Form 1B: broadcast ke 5-7 mahasiswa IT/karyawan via WA personal | 5-7 respons |
| 2-3 | Form 2: broadcast luas ke jaringan + Insta story + reminder | 20+ respons |
| 3 | Tutup form, export ke Spreadsheet, mulai analisis kuantitatif | Tabel rata-rata |
| 3-4 | Coding kualitatif: kritik & saran + transkrip wawancara | Tema utama + kutipan |
| 4 | Tulis Bab 3 sub-bab Analisis Kebutuhan + Bab 4 Evaluasi | Draft Bab 3-4 |

---

# 🔒 Informed Consent Template (Wawancara)

Buat dokumen 1 halaman sebelum wawancara:

```
INFORMED CONSENT — Wawancara Penelitian Skripsi

Judul: Pengembangan Property Management System Berbasis Web dengan
Integrasi Chatbot AI untuk Hotel Kecil dan Menengah

Peneliti: [Nama lengkap] · [Email] · [Nomor HP]
Institusi: [Universitas] · [Program Studi]
Pembimbing: [Nama dosen pembimbing]

Saya, ___________________ (nama narasumber), menyatakan:
☐ Bersedia diwawancarai dalam rangka penelitian skripsi tersebut di atas.
☐ Bersedia rekaman audio digunakan untuk transkripsi penelitian.
☐ Identitas saya akan disamarkan (cukup pakai inisial atau pseudonym).
☐ Data hanya akan digunakan untuk skripsi dan tidak disebar di luar konteks akademik.
☐ Saya berhak menghentikan wawancara kapan saja tanpa konsekuensi.
☐ Saya berhak meminta data saya dihapus setelah penelitian selesai.

Tanggal: ___________
Tanda tangan narasumber: ___________
Tanda tangan peneliti: ___________
```

---

**End of Interview_Script_dan_Recruitment.md v2 (Strategi B)** · 2026-05-13
