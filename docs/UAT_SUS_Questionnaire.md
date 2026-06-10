# Kuesioner UAT + SUS — StayManager (v2 Strategi B)

> **Strategi B Hybrid**: 4 form pisah untuk akomodasi jaringan responden yang mayoritas non-perhotelan (mahasiswa, guru, karyawan kantor) + tetap valid akademik. Total target ~30-35 responden riil. Setiap **SECTION** di bawah = **section break di Google Form** (Form → Add section).

| Form | Target | Jumlah Responden | Bagian Skripsi |
|---|---|---|---|
| **Form 1A** Staf Hotel Real | Hotel teman (real industry) | 3-5 | Tabel 4.13 UAT Staf (primary) |
| **Form 1B** System Evaluator | Mahasiswa IT / karyawan kantor | 5-7 | Tabel 4.13 UAT Staf (supplementary) |
| **Form 2** Tamu / Chatbot Umum | Mahasiswa / guru / karyawan / umum | 20+ | Tabel 4.14 UAT Tamu |
| **Form 3** SUS Universal | Semua responden Form 1A+1B+2 | 28-32 | Bab 4 evaluasi standar industri |

Akui di **Bab Limitasi**: "UAT staf terbagi dua segmen — operasional (staf hotel mitra, n=3-5) untuk validasi domain hotel, dan evaluator usability (mahasiswa/karyawan, n=5-7) untuk validasi prinsip Nielsen + Shneiderman. Pemisahan ini karena keterbatasan jaringan industri perhotelan peneliti."

---

## 🔄 Urutan Administrasi (WAJIB — first impression untuk SUS)

SUS dirancang menangkap kesan spontan (Brooke, 1996). Urutan ini wajib diikuti untuk menjaga validitas skor:

1. **Eksplorasi sistem** (10–15 menit) — responden diberi URL demo + akun, mencoba modul utama tanpa diskusi.
2. **Form 3 SUS** (3 menit) — diisi SEGERA setelah eksplorasi, sebelum form lain. Spontan, jangan dianalisis lama.
3. **Form 1A / 1B / 2** (~20 menit) — Likert detail (Lima Faktor, 8 Aturan Emas, evaluasi modul) + kritik & saran setelah SUS selesai.

Urutan 2 → 3 mencegah priming-bias: jika responden mengisi Likert detail dulu, mereka sudah ter-prime oleh refleksi mendalam dan skor SUS tidak lagi mencerminkan kesan spontan. Pelanggaran urutan ini (mis. data wave-1 sebelum revisi) harus diakui eksplisit di BAB 5.3 Keterbatasan.

---

# 🏨 FORM 1A — UAT Staf Hotel Real

> **Target**: 3-5 staf hotel teman (Front Desk / Housekeeping / Owner / Manager / Finance)
> **Distribusi**: tatap muka di hotel, isi via tablet atau print, ~20 menit
> **Insentif**: bingkisan kecil / makan siang

## SECTION 1 — Identitas Responden

> *Saya akan menanyakan beberapa pertanyaan dasar tentang latar belakang Anda di industri perhotelan untuk konteks evaluasi.*

1. Nama (boleh inisial):  ___
2. Posisi/Departemen Anda saat ini:
   - ☐ Front Desk / Resepsionis
   - ☐ Housekeeping
   - ☐ Keuangan / Finance
   - ☐ Manager / Supervisor
   - ☐ Owner / General Manager
   - ☐ Lainnya: ___
3. Lama bekerja di industri perhotelan:
   - ☐ < 1 tahun
   - ☐ 1-3 tahun
   - ☐ 3-5 tahun
   - ☐ > 5 tahun
4. Hotel tempat bekerja (boleh disamarkan, mis. "Hotel bintang 3 area Jakarta Selatan"):  ___

## SECTION 2 — Pengalaman Sistem yang Sedang Dipakai

> *Bagian ini tentang sistem/alat yang Anda pakai sekarang untuk pekerjaan sehari-hari, BUKAN tentang StayManager. Jawaban Anda akan saya bandingkan dengan StayManager nanti.*

1. Sistem/alat yang Anda pakai sehari-hari untuk operasional hotel (boleh pilih lebih dari satu):
   - ☐ Microsoft Excel / Google Sheets
   - ☐ Aplikasi PMS spesifik (sebutkan: ___)
   - ☐ WhatsApp untuk koordinasi staf
   - ☐ Buku/catatan manual
   - ☐ Aplikasi accounting (mis. Accurate, Jurnal)
   - ☐ Lainnya: ___
2. Berapa lama biasanya proses check-in tamu di hotel Anda?
   - ☐ < 5 menit
   - ☐ 5-10 menit
   - ☐ 10-20 menit
   - ☐ > 20 menit
3. Kendala terbesar dengan sistem yang Anda pakai sekarang (jawab bebas):  ___

## SECTION 3 — Evaluasi StayManager: Antarmuka & Navigasi

> *Setelah Anda melihat demo StayManager (~10 menit eksplorasi), mohon nilai antarmuka sistem. Skala: 1=Sangat Tidak Setuju, 5=Sangat Setuju.*

| No | Pernyataan | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| 1 | Tampilan antarmuka StayManager bersih dan tidak membingungkan | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | Navigasi antar modul (Kamar, Tamu, Keuangan, dll) mudah dipahami | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | Label tombol dan menu jelas dalam Bahasa Indonesia | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4 | Sistem memberi feedback yang jelas saat saya melakukan aksi (mis. notifikasi sukses/error) | ☐ | ☐ | ☐ | ☐ | ☐ |

## SECTION 4 — Evaluasi StayManager: Fungsionalitas Operasional

> *Bagian ini fokus pada fitur-fitur yang relevan dengan pekerjaan operasional hotel Anda. Skala 1-5 seperti di atas.*

| No | Pernyataan | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| 1 | Modul Manajemen Kamar membantu mengelola status kamar (available/occupied/cleaning) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | Proses check-in tamu di sistem ini lebih cepat daripada cara yang dipakai sekarang | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | Modul Keuangan memudahkan pencatatan billing, deposit, dan pengeluaran | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4 | Generate invoice dan laporan keuangan otomatis menghemat waktu kerja | ☐ | ☐ | ☐ | ☐ | ☐ |
| 5 | Modul Housekeeping membantu koordinasi tugas antar staf cleaning | ☐ | ☐ | ☐ | ☐ | ☐ |

## SECTION 5 — Evaluasi StayManager: Chatbot AI untuk Tamu

> *StayManager menyediakan chatbot AI berbahasa Indonesia yang bisa melayani pertanyaan tamu 24/7 dan menerima reservasi via chat. Mohon evaluasi konsep ini.*

| No | Pernyataan | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| 1 | Konsep chatbot AI untuk reservasi tamu berguna untuk hotel kami | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | Chatbot dapat mengurangi beban kerja front desk dalam menjawab pertanyaan tamu | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | Tamu di hotel kami kemungkinan akan menggunakan fitur chatbot ini | ☐ | ☐ | ☐ | ☐ | ☐ |

## SECTION 6 — Kontrol Akses & Keamanan (RBAC)

> *StayManager menerapkan Role-Based Access Control dengan 6 peran: Super Admin, Manager, Front Desk, Housekeeping, Finance, Guest. Setiap peran punya akses berbeda ke modul-modul tertentu.*

| No | Pernyataan | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| 1 | Pembagian akses berdasarkan peran sesuai dengan struktur hotel kami | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | Sistem memberi akses yang tepat untuk peran saya (tidak terlalu sempit/luas) | ☐ | ☐ | ☐ | ☐ | ☐ |

## SECTION 7 — Kritik & Saran

> *Bagian ini opsional tapi sangat berharga. Jawab sesuai pengalaman Anda.*

1. Fitur StayManager yang paling membantu pekerjaan Anda:  ___
2. Fitur yang membingungkan atau perlu diperbaiki:  ___
3. Fitur tambahan yang Anda butuhkan tapi belum ada:  ___
4. Apakah Anda akan merekomendasikan sistem ini ke hotel lain? Mengapa?  ___

> **Pastikan Form 3 — SUS sudah Anda isi SEBELUM form ini** (untuk first impression sebelum refleksi mendalam). Jika belum, hentikan, isi Form 3 dulu (~3 menit), lalu kembali ke sini.

---

# 💻 FORM 1B — UAT System Evaluator (Non-Hotel)

> **Target**: 5-7 mahasiswa IT/Sistem Informasi atau karyawan kantor yang familiar aplikasi web
> **Distribusi**: WhatsApp + Google Form, sebelumnya brief responden bahwa mereka mengevaluasi **kemudahan penggunaan**, bukan operational fit hotel
> **Durasi**: ~25 menit (15 menit eksplorasi + 10 menit isi form)

## SECTION 1 — Identitas Responden

> *Saya butuh tahu latar belakang Anda untuk konteks evaluasi. Tidak ada jawaban yang salah.*

1. Nama (boleh inisial):  ___
2. Status Anda saat ini:
   - ☐ Mahasiswa (jurusan: ___, semester: ___)
   - ☐ Karyawan (bidang: ___)
   - ☐ Freelancer / Wiraswasta
   - ☐ Lainnya: ___
3. Anda sering pakai aplikasi web (mis. dashboard, ERP, CRM, Notion, Trello)?
   - ☐ Setiap hari
   - ☐ Beberapa kali seminggu
   - ☐ Sesekali
   - ☐ Jarang
4. Apakah Anda familiar dengan istilah usability/UX?
   - ☐ Sangat familiar
   - ☐ Familiar sebatas pernah dengar
   - ☐ Belum familiar

## SECTION 2 — Konteks Eksperimen

> *Brief Anda akan saya beri URL demo StayManager + akun login. Tugas Anda: **eksplorasi minimal 10-15 menit**, coba semua menu utama (Dashboard, Kamar, Tamu, Reservasi, Keuangan, Chatbot). Jangan ragu mengklik tombol — sistem ini sandbox demo, tidak ada konsekuensi data nyata.*
>
> *Setelah eksplorasi, jawab pertanyaan berikut.*

1. Berapa lama Anda mengeksplorasi StayManager sebelum mengisi form ini?  ___ menit
2. Apakah Anda mencoba semua modul utama?
   - ☐ Ya, semua
   - ☐ Sebagian (sebutkan yang tidak dicoba: ___)
   - ☐ Hanya 1-2 modul
3. Apakah Anda mencoba chatbot di /chatbot?
   - ☐ Ya
   - ☐ Tidak

## SECTION 3 — Lima Faktor Manusia Terukur (Nielsen)

> *Lima dimensi standar usability menurut Nielsen (1993): Learnability, Efficiency, Memorability, Error Rate, Satisfaction. Skala 1-5.*

| No | Faktor | Pernyataan | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|---|
| 1 | Learnability | Saya bisa langsung memahami cara pakai sistem ini tanpa tutorial | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | Efficiency | Setelah saya tahu caranya, tugas bisa diselesaikan dengan cepat | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | Memorability | Kalau saya tinggalkan sistem ini lalu balik 1 minggu lagi, saya yakin masih ingat cara pakainya | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4 | Error Rate | Sistem jarang membiarkan saya membuat kesalahan; kalau salah, mudah dikoreksi | ☐ | ☐ | ☐ | ☐ | ☐ |
| 5 | Satisfaction | Secara keseluruhan saya nyaman menggunakan sistem ini | ☐ | ☐ | ☐ | ☐ | ☐ |

## SECTION 4 — Delapan Aturan Emas (Shneiderman)

> *Delapan prinsip desain antarmuka menurut Shneiderman (2018). Tetap skala 1-5.*

| No | Aturan | Pernyataan | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|---|
| 1 | Konsistensi Desain | Tampilan tombol, warna, font konsisten di semua halaman | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | Pintasan Navigasi | Tersedia sidebar/shortcut untuk akses cepat antar fitur | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | Umpan Balik Informatif | Setiap aksi saya direspons sistem dengan jelas (loading, sukses, error) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4 | Dialog Closure | Setiap pop-up/modal mudah ditutup, dan jelas kapan suatu task selesai | ☐ | ☐ | ☐ | ☐ | ☐ |
| 5 | Penanganan Kesalahan | Sistem mencegah kesalahan saya (mis. form validation) sebelum di-submit | ☐ | ☐ | ☐ | ☐ | ☐ |
| 6 | Pembatalan Aksi | Tersedia tombol Cancel/Kembali yang konsisten di setiap dialog | ☐ | ☐ | ☐ | ☐ | ☐ |
| 7 | Kendali Internal | Saya merasa "yang mengontrol" sistem, bukan sebaliknya | ☐ | ☐ | ☐ | ☐ | ☐ |
| 8 | Informasi Tampil Langsung | Data penting (KPI, status) terlihat di dashboard tanpa harus klik banyak | ☐ | ☐ | ☐ | ☐ | ☐ |

## SECTION 5 — Chatbot AI (Berperan sebagai Tamu)

> *Anggap Anda adalah tamu hotel yang ingin memesan kamar. Coba interaksi chatbot di /chatbot — tanya ketersediaan, browsing tipe kamar, atau coba lanjut sampai tahap reservasi.*

| No | Pernyataan | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| 1 | Chatbot memahami pertanyaan saya dalam Bahasa Indonesia | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | Respons chatbot relevan dengan pertanyaan saya | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | Saya bisa menyelesaikan proses pemesanan kamar tanpa kebingungan | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4 | Waktu respons chatbot terasa cepat (< 3 detik per pesan) | ☐ | ☐ | ☐ | ☐ | ☐ |

## SECTION 6 — Kritik & Saran

> *Bagian terakhir, opsional tapi sangat berharga untuk perbaikan.*

1. 3 hal terbaik dari StayManager:  ___
2. 3 hal yang perlu diperbaiki:  ___
3. Sebagai pengguna umum (non-staf hotel), apakah Anda merasa sistem ini approachable atau intimidating?  ___

> **Pastikan Form 3 — SUS sudah Anda isi SEBELUM form ini** (untuk first impression sebelum refleksi mendalam). Jika belum, hentikan, isi Form 3 dulu (~3 menit), lalu kembali ke sini.

---

# 🤖 FORM 2 — UAT Tamu / Chatbot Umum

> **Target**: 20+ mahasiswa / guru / karyawan / umum (siapa saja yang berpotensi memesan hotel)
> **Distribusi**: WhatsApp broadcast + Google Form link
> **Insentif (opsional)**: doorprize Gopay 50rb untuk 3 responden random

## SECTION 1 — Identitas Responden

> *Pertanyaan dasar untuk demografi.*

1. Nama (inisial OK):  ___
2. Usia:
   - ☐ 17-24
   - ☐ 25-34
   - ☐ 35-44
   - ☐ 45+
3. Status:
   - ☐ Mahasiswa
   - ☐ Guru / Dosen
   - ☐ Karyawan (bidang: ___)
   - ☐ Wiraswasta
   - ☐ Lainnya: ___

## SECTION 2 — Pengalaman Memesan Hotel

> *Saya ingin tahu pengalaman Anda sebagai konsumen yang pernah atau mungkin memesan hotel.*

1. Frekuensi memesan hotel per tahun:
   - ☐ Belum pernah / jarang (< 1x)
   - ☐ 1-3 kali
   - ☐ 4-10 kali
   - ☐ > 10 kali
2. Aplikasi/cara yang biasa Anda pakai (boleh pilih lebih dari satu):
   - ☐ Traveloka
   - ☐ Booking.com
   - ☐ Agoda
   - ☐ Tiket.com
   - ☐ Langsung telepon hotel / WhatsApp
   - ☐ Walk-in
   - ☐ Belum pernah pesan hotel
3. Pernah pakai chatbot AI (di aplikasi apapun: e-commerce, banking, layanan publik) untuk berinteraksi?
   - ☐ Ya, sering
   - ☐ Ya, kadang-kadang
   - ☐ Belum pernah

## SECTION 3 — Ekspektasi Sebelum Coba StayManager

> *Sebelum Anda coba chatbot StayManager, sebutkan ekspektasi Anda.*

1. Menurut Anda, fitur ideal chatbot pemesanan hotel itu seperti apa?  ___
2. Hal yang paling Anda hindari saat pesan hotel online:  ___

## SECTION 4 — Eksperimen: Pesan Kamar via Chatbot StayManager

> *TUGAS Anda: kunjungi [URL /chatbot]. Coba reservasi kamar untuk tanggal apapun (simulasi saja — tidak ada commitment). Mulai dengan menanyakan ketersediaan, lanjut sampai langkah konfirmasi pemesanan. Setelah selesai, jawab pertanyaan berikut.*

1. Apakah Anda berhasil sampai tahap "konfirmasi pemesanan" tanpa stuck?
   - ☐ Ya, lancar
   - ☐ Sebagian (stuck di tahap tertentu)
   - ☐ Tidak berhasil
2. Berapa lama proses dari mulai sampai selesai?  ___ menit (estimasi)
3. Pada langkah mana Anda merasa paling lancar?  ___
4. Pada langkah mana Anda merasa bingung atau stuck? (boleh kosong jika tidak ada)  ___

## SECTION 5 — Evaluasi Chatbot (Skala Likert 1-5)

> *Berdasarkan eksperimen di Section 4, nilai aspek-aspek berikut. Skala 1=Sangat Tidak Setuju, 5=Sangat Setuju.*

| No | Pernyataan | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| 1 | Chatbot mudah dimulai dan diakses | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | Bahasa Indonesia chatbot natural dan mudah dipahami | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | Respons chatbot cepat (< 3 detik per pesan) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4 | Informasi yang diberikan (harga, ketersediaan, kebijakan) lengkap | ☐ | ☐ | ☐ | ☐ | ☐ |
| 5 | Proses dari tanya → cek ketersediaan → pemesanan terasa mulus | ☐ | ☐ | ☐ | ☐ | ☐ |
| 6 | Saya merasa nyaman tanpa harus bicara dengan manusia | ☐ | ☐ | ☐ | ☐ | ☐ |
| 7 | Saya akan menggunakan chatbot ini lagi untuk pemesanan berikutnya | ☐ | ☐ | ☐ | ☐ | ☐ |

## SECTION 6 — Perbandingan dengan Pengalaman Sebelumnya

> *Bandingkan dengan aplikasi pemesanan hotel yang biasa Anda pakai (Traveloka, Booking, dll).*

1. Dibanding aplikasi yang biasa Anda pakai, StayManager chatbot terasa:
   - ☐ Jauh lebih mudah
   - ☐ Sedikit lebih mudah
   - ☐ Sama saja
   - ☐ Sedikit lebih ribet
   - ☐ Jauh lebih ribet
2. Alasan jawaban di atas:  ___

## SECTION 7 — Kritik & Saran

> *Bagian terakhir.*

1. Hal terbaik dari chatbot StayManager:  ___
2. Hal yang masih bingung atau kurang menurut Anda:  ___
3. Saran perbaikan:  ___

> **Pastikan Form 3 — SUS sudah Anda isi SEBELUM form ini** (untuk first impression sebelum refleksi mendalam). Jika belum, hentikan, isi Form 3 dulu (~3 menit), lalu kembali ke sini.

---

# 📊 FORM 3 — SUS (System Usability Scale) Universal

> **Target**: SEMUA responden Form 1A + 1B + 2 (28-32 total)
> **Durasi**: ~3 menit (10 pertanyaan)
> **Tujuan**: dapat skor SUS standar industri (0-100), bandingkan dengan rata-rata 68

## SECTION 1 — Pengantar SUS

> *System Usability Scale (SUS) adalah instrumen evaluasi usability standar industri (Brooke, 1996; tervalidasi ulang oleh Vlachogianni & Tselios, 2022). 10 pernyataan, skala 1–5 (1=Sangat Tidak Setuju, 5=Sangat Setuju).*
>
> *Jawab spontan berdasarkan kesan keseluruhan Anda terhadap StayManager. Tidak perlu menganalisis terlalu lama — kesan pertama justru yang paling akurat. Jika ragu antara dua nilai, pilih nilai tengah (3). Jangan kosongkan satu pun pernyataan.*

## SECTION 2 — Identitas Singkat

> *Untuk korelasi dengan demographic responden.*

1. Form mana yang baru saja Anda isi sebelum SUS ini?
   - ☐ Form 1A — Staf Hotel
   - ☐ Form 1B — System Evaluator
   - ☐ Form 2 — Tamu / Chatbot

## SECTION 3 — 10 Item SUS (Terjemahan Indonesia Standar)

| No | Pernyataan | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| 1 | Saya pikir saya akan ingin sering menggunakan sistem ini | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | Saya merasa sistem ini terlalu rumit padahal seharusnya tidak | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | Saya pikir sistem ini mudah digunakan | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4 | Saya pikir saya akan butuh bantuan teknisi untuk menggunakan sistem ini | ☐ | ☐ | ☐ | ☐ | ☐ |
| 5 | Saya merasa berbagai fungsi di sistem ini terintegrasi dengan baik | ☐ | ☐ | ☐ | ☐ | ☐ |
| 6 | Saya merasa terlalu banyak inkonsistensi dalam sistem ini | ☐ | ☐ | ☐ | ☐ | ☐ |
| 7 | Saya pikir kebanyakan orang akan belajar sistem ini dengan cepat | ☐ | ☐ | ☐ | ☐ | ☐ |
| 8 | Saya merasa sistem ini sangat merepotkan untuk digunakan | ☐ | ☐ | ☐ | ☐ | ☐ |
| 9 | Saya merasa sangat percaya diri menggunakan sistem ini | ☐ | ☐ | ☐ | ☐ | ☐ |
| 10 | Saya perlu belajar banyak hal sebelum bisa menggunakan sistem ini | ☐ | ☐ | ☐ | ☐ | ☐ |

## SECTION 4 — Penutup

> *Terima kasih banyak atas waktu dan masukan Anda. Hasil evaluasi ini akan digunakan dalam skripsi saya untuk penelitian sistem PMS berbasis web + AI chatbot. Identitas akan dijaga kerahasiaannya.*

---

# 📈 Cara Hitung Skor SUS

Untuk **setiap responden**:

1. **Item ganjil (positif)**: skor = jawaban − 1
   - Q1 jawab 4 → skor = 3
   - Q3 jawab 5 → skor = 4
   - dst. untuk Q5, Q7, Q9
2. **Item genap (negatif)**: skor = 5 − jawaban
   - Q2 jawab 2 → skor = 3
   - Q4 jawab 1 → skor = 4
   - dst. untuk Q6, Q8, Q10
3. **Total individu** = (jumlah 10 skor) × 2.5 → hasil 0-100

Untuk **agregat penelitian**:

- Hitung rata-rata SUS score dari seluruh responden
- Interpretasi (skala normatif Bangor dkk., 2008 — sebagaimana divalidasi ulang oleh Khan dkk., 2025 dan Deshmukh & Chalmeta, 2024; konsisten dengan Tabel 2.3 skripsi):

| Rentang Skor | Grade | Adjective Rating | Tingkat Penerimaan |
|---|---|---|---|
| > 80,3 | A | Excellent | Acceptable |
| 68,0 – 80,3 | B | Good | Acceptable |
| 51,7 – 67,9 | C | OK | Marginal |
| 25,0 – 51,6 | D | Poor | Not Acceptable |
| < 25,0 | F | Awful | Not Acceptable |

**Target StayManager**: skor SUS ≥ 68,0 (Grade B, Acceptable). Target stretch: ≥ 80,3 (Grade A, Excellent).

---

# 🗓️ Timeline Pengumpulan Data (Strategi B)

| Minggu | Aktivitas |
|---|---|
| 1 | Setup 4 Google Form (Form 1A, 1B, 2, 3 SUS). Test internal dengan 2-3 teman dulu. |
| 1-2 | Hubungi 1-2 hotel teman → schedule wawancara (lihat `Interview_Script_dan_Recruitment.md`) → responden eksplorasi sistem → **Form 3 SUS dulu (3 menit)** → lalu Form 1A |
| 1-2 | Broadcast Form 1B ke 5-7 mahasiswa IT/karyawan: brief eksplorasi 10–15 menit → **Form 3 SUS dulu** → Form 1B |
| 2-3 | Broadcast Form 2 luas via WA Group teman kuliah/kantor/alumni: link eksplorasi+chatbot → **Form 3 SUS dulu** → Form 2 |
| 3 | Tutup form, export Google Form ke Spreadsheet |
| 3-4 | Analisis: rata-rata Likert per item, hitung SUS, kompilasi kritik & saran |
| 4 | Isi Tabel 4.13 (Staf), 4.14 (Tamu), 4.15 (SUS) di Bab 4 skripsi |

---

# 🎯 Mapping Form → Bagian Skripsi

| Bagian Skripsi | Sumber Data | Format Output |
|---|---|---|
| Tabel 4.13 UAT Staf | Form 1A + 1B agregat | Tabel rata-rata Likert per item |
| Tabel 4.14 UAT Tamu | Form 2 agregat | Tabel rata-rata Likert per item |
| Tabel 4.15 SUS Score | Form 3 (semua) | Skor SUS individu + rata-rata agregat |
| Subbab Kritik & Saran | Form 1A/1B/2 SECTION akhir (open-ended) | Tematik coding → 3-5 tema utama |
| Subbab Wawancara | Interview transcripts | Lihat `Interview_Script_dan_Recruitment.md` |
| Bab Limitasi | — | Pernyataan eksplisit: "UAT staf hybrid (3-5 hotel real + 5-7 evaluator) karena keterbatasan jaringan industri perhotelan" |

---

**End of UAT_SUS_Questionnaire.md v2 (Strategi B)** · 2026-05-13
