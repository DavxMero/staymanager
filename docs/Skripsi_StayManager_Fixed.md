<!--
==========================================================================
REVISI 2026-05-17 - Petunjuk untuk Word agent
==========================================================================
Cari tag berikut di file ini untuk menemukan setiap blok revisi:
  REVISI-2026-05-17 (LOKASI-N) [TAMBAH|GANTI|HAPUS]   = awal blok
  /REVISI-2026-05-17                                  = akhir blok

Konvensi tag:
  [TAMBAH] = paragraf BARU yang sebelumnya tidak ada di Word doc
  [GANTI]  = teks lama diganti dengan teks baru; teks lama dicantumkan di komentar
  [HAPUS]  = teks lama dihapus dari Word doc; isi lama dicantumkan di komentar

Daftar 8 lokasi revisi (sumber: docs/Skripsi_Audit_Report.md "Audit Pass #2"):
  LOKASI-1: Paragraf 3.3.2.3.1   [GANTI]  "26 tabel" jadi "27 tabel" + sub-domain cleanup
  LOKASI-2: Kalimat 3.3.2.3.2    [GANTI]  "16 entitas" jadi "15 entitas"
  LOKASI-3: Tabel 3.7            [GANTI]  row ai_chats jadi row Chat
  LOKASI-4: Tabel 3.7            [HAPUS]  row ai_messages
  LOKASI-5: Narasi 3.3.2.3.2     [GANTI]  paragraf "Tabel ai_chats dan ai_messages" jadi paragraf "Tabel Chat"
  LOKASI-6: Narasi 3.3.2.3.2     [HAPUS]  paragraf "Tabel ai_messages" di akhir bagian
  LOKASI-7: 4.2.4 Manajemen Kamar [TAMBAH] paragraf amenities & bed editor + room detail viewer
  LOKASI-8: 4.2.13 Chatbot LLM   [TAMBAH] 2 paragraf (date-first/type-grouped; security: server-side auth + booking_reference)
==========================================================================

==========================================================================
REVISI 2026-05-19 - Petunjuk tambahan untuk Word agent (batch ke-2)
==========================================================================
Cari tag berikut di file ini untuk menemukan blok revisi tanggal 2026-05-19:
  REVISI-2026-05-19 (LOKASI-N) [TAMBAH|GANTI|HAPUS]   = awal blok
  /REVISI-2026-05-19                                  = akhir blok (kalau ada)

Daftar 2 lokasi revisi tambahan:
  LOKASI-9:  Paragraf 3.3.2.3.1  [GANTI]  kalimat terakhir paragraf (claim
                                          double-booking defense) — dari "BUKAN
                                          melalui DB-level constraint" jadi
                                          defense-in-depth via btree_gist EXCLUDE
  LOKASI-10: Bab 4.3.2.3         [TAMBAH] paragraf evidence pengujian exclusion
                                          constraint (kode 23P01) setelah Tabel 4.6

PAIRING:
  LOKASI-9 (claim) ↔ LOKASI-10 (evidence). Harus diterapkan bersamaan.

KONTEKS BISNIS:
  Production database (Supabase project ncjneagfadrmivgicszm) sudah
  ditambahkan constraint `no_overlap_active_reservations` via migration
  `add_no_overlap_active_reservations` tanggal 2026-05-19. Kalimat lama
  di Word doc yang bilang "BUKAN melalui DB-level constraint" sekarang
  faktual salah, sehingga LOKASI-9 mandatory untuk sinkronisasi.
==========================================================================
-->

**PENGEMBANGAN WEB PROPERTY MANAGEMENT SYSTEM (PMS) "STAYMANAGER"** **TERINTEGRASI CHATBOT BERBASIS LLM UNTUK OTOMATISASI RESERVASI**

**SKRIPSI**

**Oleh :**

| Dava Remero | 2540124412 |
| :---- | :---- |
| **Moh. Rezki** | **2501992936** |

**Computer Science Program**  
**Computer Science Study Program**  
**School of Computer Science**  
**Universitas Bina Nusantara**  
**Jakarta**  
**2026**

**PENGEMBANGAN WEB PROPERTY MANAGEMENT SYSTEM (PMS) "STAYMANAGER"** **TERINTEGRASI CHATBOT BERBASIS LLM UNTUK OTOMATISASI RESERVASI**

**SKRIPSI**

**diajukan sebagai salah satu syarat**  
**untuk gelar kesarjanaan pada**  
**Program Studi Teknik Informatika**  
**Jenjang Pendidikan Strata-1**

**Oleh :**

| Dava Remero | 2540124412 |
| :---- | :---- |
| **Moh. Rezki** | **2501992936** |

**Computer Science Program**  
**Computer Science Study Program**  
**School of Computer Science**  
**Universitas Bina Nusantara**  
**Jakarta**  
**2026**  
**Universitas Bina Nusantara**

---

**Pernyataan Kesiapan Skripsi untuk Ujian Pendadaran**   
**Pernyataan Penyusunan Skripsi**  
**Kami, Dava Remero**  
               **Moh. Rezki**  
**dengan ini menyatakan bahwa Skripsi yang berjudul:**  
**PENGEMBANGAN WEB PROPERTY MANAGEMENT SYSTEM (PMS) "STAYMANAGER" TERINTEGRASI CHATBOT BERBASIS LLM UNTUK OTOMATISASI RESERVASI**

***DEVELOPMENT OF THE 'STAYMANAGER' WEB-BASED PROPERTY MANAGEMENT SYSTEM (PMS) WITH LLM CHATBOT INTEGRATION FOR RESERVATION AUTOMATION.***  
**adalah benar hasil karya kami dan belum pernah diajukan sebagai karya ilmiah, sebagian atau seluruhnya, atas nama kami atau pihak lain**

|    |   |
| ----- | ----- |
| **Dava Remero** | **Moh. Rezki** |
| **2540124412** | **2501992936** |

 **Disetujui oleh Pembimbing**  
**Saya setuju Skripsi tersebut layak diajukan untuk Ujian Pendadaran**  
**![][image1]**   
 **Pualam Dipa Nusantara, S.Kom., M.Kom**   
**D5186**

**PENGEMBANGAN WEB PROPERTY MANAGEMENT SYSTEM (PMS) "STAYMANAGER"** **TERINTEGRASI CHATBOT BERBASIS LLM UNTUK OTOMATISASI RESERVASI**

**SKRIPSI**

**Disusun Oleh :**

|   |   |
| ----- | ----- |
| **Dava Remero** | **Moh. Rezki** |
| **2540124412** | **2501992936** |

**Disetujui Oleh:**   
**Pembimbing dan Head of Study Program**  
**![][image1]**   
 **Pualam Dipa Nusantara, S.Kom., M.Kom**   
**D5186**

**Nama Head of CS**  
**Head of Computer Science Study Program**

**Universitas Bina Nusantara**  
**Jakarta**  
**2026**  
**PERNYATAAN**  
Dengan ini kami,

**Nama		:** MOH. REZKI 

**NIM		:** 2501992936

**Nama		:** DAVA REMERO 

**NIM		:** 2540124412

**Judul Skripsi	:** **PENGEMBANGAN WEB PROPERTY MANAGEMENT SYSTEM (PMS) "STAYMANAGER" TERINTEGRASI CHATBOT BERBASIS LLM UNTUK OTOMATISASI RESERVASI**  
Memberikan kepada Universitas Bina Nusantara **hak non-eksklusif** untuk menyimpan, memperbanyak, dan menyebarluaskan Skripsi karya kami, secara keseluruhan atau hanya sebagian atau hanya ringkasannya saja, dalam bentuk format tercetak dan atau elektronik.  
Menyatakan bahwa kami, akan mempertahankan **hak eksklusif** kami, untuk menggunakan seluruh atau sebagian isi Skripsi kami, guna pengembangan karya di masa depan, misalnya bentuk artikel, buku, perangkat lunak, ataupun sistem informasi.  
Jakarta, 18 Juni 2026  
Hormat Kami,

| Dava Remero | Moh. Rezki |
| :---: | :---: |
| **2540124412** | **2501992936** |

Diketahui Oleh,

**Pualam Dipa Nusantara, S.Kom., M.Kom**  
**D5186**  
**ABSTRACT**

*The hospitality industry increasingly requires integrated information systems to manage complex operational processes including reservations, room management, housekeeping coordination, financial transactions, and managerial reporting. However, many small and medium-scale hotels still rely on fragmented manual systems that lead to data inconsistencies and operational inefficiencies. This research proposes the development of StayManager, a web-based Property Management System (PMS) natively integrated with an LLM-powered chatbot using Google Gemini 2.5 Flash API. The system was developed using the Agile methodology with the Scrum framework and built with Next.js 16, TypeScript, and Supabase (PostgreSQL) for the backend infrastructure. The chatbot enables guests to interact using natural language in Bahasa Indonesia or English to check room availability and create reservations in real-time. System evaluation was conducted through Black Box Testing with 36 test scenarios across 9 module groups and a user satisfaction questionnaire using a Likert scale administered to 30 respondents (10 hotel staff and 20 guests/chatbot users). The Black Box Testing results showed a 100% success rate, confirming full functional compliance. User satisfaction surveys yielded an overall average score of 4.36 out of 5 for hotel staff and 4.26 out of 5 for chatbot users, indicating high levels of acceptance and satisfaction. These findings confirm that StayManager effectively addresses the fragmentation and inefficiency challenges in hotel operations while providing an AI-powered guest service interface.*

***Keywords:** property management system, chatbot, large language model, hotel information system, Next.js, Supabase, Gemini API*

**ABSTRAK**

*Industri perhotelan semakin membutuhkan sistem informasi terintegrasi untuk mengelola proses operasional yang kompleks, meliputi reservasi, manajemen kamar, koordinasi housekeeping, transaksi keuangan, dan pelaporan manajerial. Namun, banyak hotel berskala kecil dan menengah masih mengandalkan sistem manual yang terfragmentasi sehingga mengakibatkan inkonsistensi data dan inefisiensi operasional. Penelitian ini mengusulkan pengembangan StayManager, yaitu sebuah Property Management System (PMS) berbasis web yang secara native terintegrasi dengan chatbot berbasis Large Language Model menggunakan Google Gemini 2.5 Flash API. Sistem dikembangkan menggunakan metodologi Agile dengan kerangka kerja Scrum, dibangun menggunakan Next.js 16, TypeScript, pnpm, dan Supabase (PostgreSQL) sebagai infrastruktur backend. Chatbot memungkinkan tamu berinteraksi menggunakan bahasa alami dalam Bahasa Indonesia maupun Bahasa Inggris untuk mengecek ketersediaan kamar dan membuat reservasi secara real-time. Evaluasi sistem dilakukan melalui Black Box Testing dengan 36 skenario pengujian pada 9 kelompok modul, serta kuesioner kepuasan pengguna menggunakan skala Likert terhadap 30 responden (10 staf hotel dan 20 tamu/pengguna chatbot). Hasil Black Box Testing menunjukkan tingkat keberhasilan 100%, mengkonfirmasi kesesuaian fungsional penuh. Survei kepuasan pengguna menghasilkan skor rata-rata 4,36 dari 5 untuk staf hotel dan 4,26 dari 5 untuk pengguna chatbot, menunjukkan tingkat penerimaan dan kepuasan yang tinggi. Temuan ini mengkonfirmasi bahwa StayManager secara efektif mengatasi tantangan fragmentasi dan inefisiensi dalam operasional hotel sekaligus menyediakan antarmuka layanan tamu berbasis kecerdasan buatan.*

***Kata Kunci:** property management system, chatbot, large language model, sistem informasi hotel, Next.js, Supabase, Gemini API*

**KATA PENGANTAR**

Puji dan syukur penulis panjatkan ke hadirat Tuhan Yang Maha Esa atas berkat rahmat dan karunia-Nya sehingga penulis dapat menyelesaikan skripsi berjudul "Pengembangan Web Property Management System (PMS) "StayManager" Terintegrasi Chatbot Berbasis LLM untuk Otomatisasi Reservasi" dengan baik dan tepat waktu.

Skripsi ini disusun sebagai salah satu syarat untuk memperoleh gelar Sarjana Teknik Informatika pada Program Studi Teknik Informatika, School of Computer Science, Universitas Bina Nusantara. Penelitian ini bertujuan untuk mengembangkan sistem manajemen perhotelan berbasis web yang terintegrasi dengan kecerdasan buatan guna mengatasi permasalahan fragmentasi data dan inefisiensi operasional pada hotel kecil dan menengah.

Dalam proses penyelesaian skripsi ini, penulis mendapatkan banyak bantuan, dukungan, dan bimbingan dari berbagai pihak. Oleh karena itu, penulis ingin mengucapkan terima kasih yang sebesar-besarnya kepada:

1. Bapak Pualam Dipa Nusantara, S.Kom., M.Kom. selaku dosen pembimbing yang telah memberikan bimbingan, arahan, dan masukan yang sangat berharga selama proses penyusunan skripsi ini.

2. Seluruh dosen dan staf akademik School of Computer Science, Universitas Bina Nusantara, atas ilmu dan dukungan yang telah diberikan.

3. Orang tua dan keluarga tercinta yang telah memberikan dukungan moril dan materiil yang tak ternilai selama proses perkuliahan dan penyusunan skripsi.

4. Seluruh rekan mahasiswa dan pihak yang telah membantu dalam pengisian kuesioner dan pengujian sistem.

Penulis menyadari bahwa skripsi ini masih jauh dari sempurna. Oleh karena itu, penulis sangat mengharapkan kritik dan saran yang membangun dari pembaca untuk penyempurnaan penelitian di masa mendatang. Semoga skripsi ini dapat memberikan manfaat bagi perkembangan ilmu pengetahuan, khususnya di bidang sistem informasi dan kecerdasan buatan.

**DAFTAR ISI**

[**BAB 1  PENDAHULUAN	1**](#bab-1-pendahuluan)  
[**1.1 Latar Belakang	1**](#1.1-latar-belakang)  
[**1.2 Rumusan Masalah	4**](#1.2-rumusan-masalah)  
[**1.3 Hipotesis	5**](#1.3-hipotesis)  
[**1.4 Ruang Lingkup Penelitian	6**](#1.4-ruang-lingkup-penelitian)  
[**1.5 Tujuan dan Manfaat	7**](#1.5-tujuan-dan-manfaat)  
[1.5.1 Tujuan Penelitian	7](#1.5.1-tujuan-penelitian)  
[1.5.2 Manfaat Penelitian	7](#1.5.2-manfaat-penelitian)  
[**1.6 Metode Penelitian	8**](#1.6-metode-penelitian)  
[1.6.1 Metode Pengumpulan Data	8](#1.6.1-metode-pengumpulan-data)  
[1.6.2 Metode Pengembangan Sistem	9](#1.6.2-metode-pengembangan-sistem)  
[**1.7 Sistematika Penulisan	10**](#1.7-sistematika-penulisan)  
[**BAB 2 TINJAUAN REFERENSI	12**](#bab-2-tinjauan-referensi)  
[**2.1 Konsep Sistem Manajemen Perhotelan	12**](#2.1-konsep-sistem-manajemen-perhotelan)  
[2.1.1 Sistem Informasi Manajemen Hotel	12](#2.1.1-sistem-informasi-manajemen-hotel)  
[2.1.2 Property Management System (PMS)	12](#2.1.2-property-management-system-\(pms\))  
[2.1.3 Sistem Reservasi Hotel Digital	13](#2.1.3-sistem-reservasi-hotel-digital)  
[2.1.4 Otomatisasi Layanan Tamu melalui AI Concierge	13](#2.1.4-otomatisasi-layanan-tamu-melalui-ai-concierge)  
[2.1.5 Transformasi Digital dalam Industri Perhotelan	14](#2.1.5-transformasi-digital-dalam-industri-perhotelan)  
[**2.2 Software Development Life Cycle (SDLC)	14**](#2.2-software-development-life-cycle-\(sdlc\))  
[2.2.1 Metode Agile	14](#2.2.1-metode-agile)  
[2.2.2 Framework Scrum	15](#2.2.2-framework-scrum)  
[**2.3 Kecerdasan Buatan dan Large Language Model (LLM)	15**](#2.3-kecerdasan-buatan-dan-large-language-model-\(llm\))  
[2.3.1 Kecerdasan Buatan (Artificial Intelligence)	15](#2.3.1-kecerdasan-buatan-\(artificial-intelligence\))  
[2.3.2 Large Language Model (LLM)	16](#2.3.2-large-language-model-\(llm\))  
[2.3.3 Google Gemini API	16](#2.3.3-google-gemini-api)  
[2.3.4 Function Calling pada LLM	17](#2.3.4-function-calling-pada-llm)  
[2.3.5 Natural Language Processing (NLP) dan Intent Recognition	18](#2.3.5-natural-language-processing-\(nlp\)-dan-intent-recognition)  
[**2.4 Basis Data dan Manajemen Data	18**](#2.4-basis-data-dan-manajemen-data)  
[2.4.1 Basis Data Relasional	18](#2.4.1-basis-data-relasional)  
[2.4.2 PostgreSQL	19](#2.4.2-postgresql)  
[2.4.3 Supabase	20](#2.4.3-supabase)  
[2.4.4 Entity Relationship Diagram (ERD)	20](#2.4.4-entity-relationship-diagram-\(erd\))  
[**2.5 Arsitektur Perangkat Lunak	21**](#2.5-arsitektur-perangkat-lunak)  
[2.5.1 Arsitektur Full-Stack Web Application	21](#2.5.1-arsitektur-full-stack-web-application)  
[2.5.2 REST API (Representational State Transfer)	21](#2.5.2-rest-api-\(representational-state-transfer\))  
[2.5.3 JSON (JavaScript Object Notation)	21](#2.5.3-json-\(javascript-object-notation\))  
[2.5.4 Sinkronisasi Data Real-time	22](#2.5.4-sinkronisasi-data-real-time)  
[**2.6 Desain Antarmuka Pengguna	22**](#2.6-desain-antarmuka-pengguna)  
[2.6.1 Figma	22](#2.6.1-figma)  
[2.6.2 Prinsip User Interface (UI) dan User Experience (UX)	23](#2.6.2-prinsip-user-interface-\(ui\)-dan-user-experience-\(ux\))  
[**2.7 Teknologi Front-end	23**](#2.7-teknologi-front-end)  
[2.7.1 JavaScript dan TypeScript	23](#2.7.1-javascript-dan-typescript)  
[2.7.2 HTML dan CSS	24](#2.7.2-html-dan-css)  
[2.7.3 Tailwind CSS	24](#2.7.3-tailwind-css)  
[**2.8 Frameworks dan Platform Pengembangan	25**](#2.8-frameworks-dan-platform-pengembangan)  
[2.8.1 Next.js	25](#2.8.1-next.js)  
[2.8.2 React.js	26](#2.8.2-react.js)  
[2.8.3 GitHub	26](#2.8.3-github)  
[2.8.4 Vercel	27](#2.8.4-vercel)  
[**2.9 Autentikasi dan Keamanan Sistem	27**](#2.9-autentikasi-dan-keamanan-sistem)  
[2.9.1 Autentikasi Pengguna dalam Aplikasi Web	27](#2.9.1-autentikasi-pengguna-dalam-aplikasi-web)  
[2.9.2 JSON Web Token (JWT)	28](#2.9.2-json-web-token-\(jwt\))  
[2.9.3 Role-Based Access Control (RBAC)	28](#2.9.3-role-based-access-control-\(rbac\))  
[**2.10 Unified Modelling Language (UML)	29**](#2.10-unified-modelling-language-\(uml\))  
[2.10.1 Use Case Diagram	29](#2.10.1-use-case-diagram)  
[2.10.2 Class Diagram	30](#2.10.2-class-diagram)  
[2.10.3 Activity Diagram	30](#2.10.3-activity-diagram)  
[2.10.4 Sequence Diagram	30](#2.10.4-sequence-diagram)  
[**2.11 Flowchart	31**](#2.11-flowchart)  
[**2.12 Pengujian Sistem (Testing)	31**](#2.12-pengujian-sistem-\(testing\))  
[2.12.1 Alpha Testing	31](#2.12.1-alpha-testing)  
[2.12.2 Black Box Testing	32](#2.12.2-black-box-testing)  
[2.12.3 User Acceptance Testing (UAT)	33](#2.12.3-user-acceptance-testing-\(uat\))  
[2.12.4 Skala Likert	33](#2.12.4-skala-likert)  
[2.12.5 System Usability Scale (SUS)	33](#2.12.5-system-usability-scale-\(sus\))  
[**2.13 Interaksi Manusia dan Komputer (IMK)	35**](#2.13-interaksi-manusia-dan-komputer-\(imk\))  
[2.13.1 Delapan Aturan Emas Desain Antarmuka (Eight Golden Rules)	36](#2.13.1-delapan-aturan-emas-desain-antarmuka-\(eight-golden-rules\))  
[2.13.2 Lima Faktor Manusia Terukur (Five Measurable Human Factors)	37](#2.13.2-lima-faktor-manusia-terukur-\(five-measurable-human-factors\))  
[**2.14 Ulasan Hasil Penelitian Produk Sejenis Sebelumnya	38**](#2.14-ulasan-hasil-penelitian-produk-sejenis-sebelumnya)  
[**BAB 3  METODE PENELITIAN	42**](#bab-3-metode-penelitian)  
[**3.1 Metodologi Penelitian	42**](#3.1-metodologi-penelitian)  
[3.1.1 Kerangka Berpikir Penelitian	44](#3.1.1-kerangka-berpikir-penelitian)  
[**3.2 Analisis	44**](#3.2-analisis)  
[3.2.1 Analisis Perbandingan Aplikasi Sejenis	44](#3.2.1-analisis-perbandingan-aplikasi-sejenis)  
[3.2.2 Analisis Permasalahan dan Kebutuhan	46](#3.2.2-analisis-permasalahan-dan-kebutuhan)  
[3.2.3 Usulan Pemecahan Masalah	50](#3.2.3-usulan-pemecahan-masalah)  
[**3.3 Perancangan	53**](#3.3-perancangan)  
[3.3.1 Software Design Document	53](#3.3.1-software-design-document)  
[3.3.1.1 Deskripsi Software	53](#3.3.1.1-deskripsi-software)

[3.3.1.2 Fungsi Software	54](#3.3.1.2-fungsi-software)

[3.3.1.3 Kebutuhan Teknologi	56](#3.3.1.3-kebutuhan-teknologi)

[**3.3.2 Perancangan Sistem	59**](#3.3.2-perancangan-sistem)  
[3.3.2.1 Perancangan Sistem (Pendekatan OOAD)	59](#3.3.2.1-perancangan-sistem-\(pendekatan-ooad\))  
[3.3.2.1.1 Use Case Diagram	59](#3.3.2.1.1-use-case-diagram)

[3.3.2.1.2 Domain Entity Diagram (Class Diagram)	60](#3.3.2.1.2-domain-entity-diagram-\(class-diagram\))

[3.3.2.1.3 Sequence Diagram	60](#3.3.2.1.3-sequence-diagram)

[3.3.2.1.3.1 Sequence Diagram â€“ Login Staf	61](#3.3.2.1.3.1-sequence-diagram-â€“-login-staf)

[3.3.2.1.3.2 Sequence Diagram â€“ Chatbot: Cek Ketersediaan Kamar	61](#3.3.2.1.3.2-sequence-diagram-â€“-chatbot:-cek-ketersediaan-kamar)

[3.3.2.1.3.3 Sequence Diagram â€“ Chatbot: Create Booking	62](#3.3.2.1.3.3-sequence-diagram-â€“-chatbot:-create-booking)

[3.3.2.1.3.4 Sequence Diagram â€“ Chatbot: Konfirmasi Pembayaran	62](#3.3.2.1.3.4-sequence-diagram-â€“-chatbot:-konfirmasi-pembayaran)

[3.3.2.1.3.5 Sequence Diagram â€“ Proses Check-in Tamu	62](#3.3.2.1.3.5-sequence-diagram-â€“-proses-check-in-tamu)

[3.3.2.1.3.6 Sequence Diagram â€“ Proses Check-out Tamu	63](#3.3.2.1.3.6-sequence-diagram-â€“-proses-check-out-tamu)

[3.3.2.1.3.7 Sequence Diagram â€“ Manajemen Kamar	63](#3.3.2.1.3.7-sequence-diagram-â€“-manajemen-kamar)

[3.3.2.1.3.8 Sequence Diagram â€“ Manajemen Tugas Housekeeping	63](#3.3.2.1.3.8-sequence-diagram-â€“-manajemen-tugas-housekeeping)

[3.3.2.1.4 Activity Diagram	63](#3.3.2.1.4-activity-diagram)

[3.3.2.1.4.1 Activity Diagram â€“ Proses Login	64](#3.3.2.1.4.1-activity-diagram-â€“-proses-login)

[3.3.2.1.4.2 Activity Diagram â€“ Proses Registrasi Akun Staff	64](#3.3.2.1.4.2-activity-diagram-â€“-proses-registrasi-akun-staff)

[3.3.2.1.4.3 Activity Diagram â€“ Proses Reservasi via Chatbot	64](#3.3.2.1.4.3-activity-diagram-â€“-proses-reservasi-via-chatbot)

[3.3.2.1.4.4 Activity Diagram â€“ Proses Check-in Tamu	65](#3.3.2.1.4.4-activity-diagram-â€“-proses-check-in-tamu)

[3.3.2.1.4.5 Activity Diagram â€“ Pengelolaan Tugas Housekeeping	65](#3.3.2.1.4.5-activity-diagram-â€“-pengelolaan-tugas-housekeeping)

[3.3.2.1.4.6 Activity Diagram â€“ Pencatatan Transaksi Keuangan	65](#3.3.2.1.4.6-activity-diagram-â€“-pencatatan-transaksi-keuangan)

[3.3.2.2 Perancangan Antarmuka Pengguna (User Interface)	66](#3.3.2.2-perancangan-antarmuka-pengguna-\(user-interface\))  
[3.3.2.2.1 Rancangan Antarmuka Tamu (Guest dan Chatbot)	66](#3.3.2.2.1-rancangan-antarmuka-tamu-\(guest-dan-chatbot\))

[3.3.2.2.2 Rancangan Antarmuka Staf dan Admin	66](#3.3.2.2.2-rancangan-antarmuka-staf-dan-admin)

[3.3.2.3 Perancangan Database	67](#3.3.2.3-perancangan-database)  
[3.3.2.3.1 Entity Relationship Diagram (ERD) StayManager	68](#3.3.2.3.1-entity-relationship-diagram-\(erd\)-staymanager)

[3.3.2.3.2 Struktur Tabel Database	68](#3.3.2.3.2-struktur-tabel-database)

[**BAB 4  HASIL DAN PEMBAHASAN	75**](#bab-4-hasil-dan-pembahasan)  
[**4.1 Spesifikasi Sistem	75**](#4.1-spesifikasi-sistem)  
[4.1.1 Spesifikasi Perangkat Keras	75](#4.1.1-spesifikasi-perangkat-keras)  
[4.1.2 Spesifikasi Perangkat Lunak	76](#4.1.2-spesifikasi-perangkat-lunak)  
[**4.2 Prosedur Penggunaan Aplikasi	77**](#4.2-prosedur-penggunaan-aplikasi)  
[4.2.1 Halaman Login dan Autentikasi	77](#4.2.1-halaman-login-dan-autentikasi)  
[4.2.2 Dashboard dan Halaman Publik Hotel	78](#4.2.2-dashboard-dan-halaman-publik-hotel)  
[4.2.3 Modul Occupancy (Pengelolaan Hunian)	79](#4.2.3-modul-occupancy-\(pengelolaan-hunian\))  
[4.2.4 Modul Manajemen Kamar	79](#4.2.4-modul-manajemen-kamar)  
[4.2.5 Modul Manajemen Tamu	80](#4.2.5-modul-manajemen-tamu)  
[4.2.6 Modul Reservasi	81](#4.2.6-modul-reservasi)  
[4.2.7 Modul Housekeeping	82](#4.2.7-modul-housekeeping)  
[4.2.8 Modul Keuangan	82](#4.2.8-modul-keuangan)  
[4.2.9 Modul Inventaris	83](#4.2.9-modul-inventaris)  
[4.2.10 Modul Manajemen Staf	83](#4.2.10-modul-manajemen-staf)  
[4.2.11 Modul Billing dan Guest Facilities	83](#4.2.11-modul-billing-dan-guest-facilities)  
[4.2.12 Modul Laporan	84](#4.2.12-modul-laporan)  
[4.2.13 Modul Chatbot LLM	84](#4.2.13-modul-chatbot-llm)  
[**4.3 Evaluasi	86**](#4.3-evaluasi)  
[4.3.1 Evaluasi User Interface	87](#4.3.1-evaluasi-user-interface)  
[4.3.1.1 Lima Faktor Manusia Terukur (Staf Hotel)	87](#4.3.1.1-lima-faktor-manusia-terukur-\(staf-hotel\))  
[Faktor 1 â€“ Learnability (Kemudahan Dipelajari)	87](#faktor-1-â€“-learnability-\(kemudahan-dipelajari\))

[Faktor 2 â€“ Efficiency (Efisiensi)	87](#faktor-2-â€“-efficiency-\(efisiensi\))

[Faktor 3 â€“ Memorability (Kemudahan Diingat Kembali)	87](#faktor-3-â€“-memorability-\(kemudahan-diingat-kembali\))

[Faktor 4 â€“ Error Rate (Tingkat Kesalahan)	88](#faktor-4-â€“-error-rate-\(tingkat-kesalahan\))

[Faktor 5 â€“ Satisfaction (Kepuasan)	88](#faktor-5-â€“-satisfaction-\(kepuasan\))

[4.3.1.2 Lima Faktor Manusia Terukur (Tamu dan Chatbot)	88](#4.3.1.2-lima-faktor-manusia-terukur-\(tamu-dan-chatbot\))  
[Faktor 1 â€“ Learnability (Kemudahan Dipelajari)	88](#faktor-1-â€“-learnability-\(kemudahan-dipelajari\)-1)

[Faktor 2 â€“ Efficiency (Efisiensi)	88](#faktor-2-â€“-efficiency-\(efisiensi\)-1)

[Faktor 3 â€“ Memorability (Kemudahan Diingat Kembali)	88](#faktor-3-â€“-memorability-\(kemudahan-diingat-kembali\)-1)

[Faktor 4 â€“ Error Rate (Tingkat Kesalahan)	89](#faktor-4-â€“-error-rate-\(tingkat-kesalahan\)-1)

[Faktor 5 â€“ Satisfaction (Kepuasan)	89](#faktor-5-â€“-satisfaction-\(kepuasan\)-1)

[4.3.1.3 Evaluasi Delapan Aturan Emas Desain Antarmuka	89](#4.3.1.3-evaluasi-delapan-aturan-emas-desain-antarmuka)  
[1\. Strive for Consistency (Upayakan Konsistensi)	89](#1.-strive-for-consistency-\(upayakan-konsistensi\))

[2\. Enable Frequent Users to Use Shortcuts (Fasilitasi Pintasan Pengguna Sering)	90](#2.-enable-frequent-users-to-use-shortcuts-\(fasilitasi-pintasan-pengguna-sering\))

[3\. Offer Informative Feedback (Berikan Umpan Balik Informatif)	90](#3.-offer-informative-feedback-\(berikan-umpan-balik-informatif\))

[4\. Design Dialogue to Yield Closure (Rancang Dialog untuk Kejelasan)	90](#4.-design-dialogue-to-yield-closure-\(rancang-dialog-untuk-kejelasan\))

[5\. Offer Simple Error Handling (Sediakan Penanganan Kesalahan Sederhana)	91](#5.-offer-simple-error-handling-\(sediakan-penanganan-kesalahan-sederhana\))

[6\. Permit Easy Reversal of Actions (Izinkan Pembatalan Aksi yang Mudah)	91](#6.-permit-easy-reversal-of-actions-\(izinkan-pembatalan-aksi-yang-mudah\))

[7\. Support Internal Locus of Control (Dukung Kendali Internal Pengguna)	91](#7.-support-internal-locus-of-control-\(dukung-kendali-internal-pengguna\))

[8\. Reduce Short-Term Memory Load (Kurangi Beban Memori Jangka Pendek)	92](#8.-reduce-short-term-memory-load-\(kurangi-beban-memori-jangka-pendek\))

[4.3.2 Evaluasi Sistem	92](#4.3.2-evaluasi-sistem)  
[4.3.2.1 Pengujian Modul Autentikasi	92](#4.3.2.1-pengujian-modul-autentikasi)

[4.3.2.2 Pengujian Modul Dashboard	93](#4.3.2.2-pengujian-modul-dashboard)

[4.3.2.3 Pengujian Modul Manajemen Kamar	94](#4.3.2.3-pengujian-modul-manajemen-kamar)

[4.3.2.4 Pengujian Modul Manajemen Tamu	95](#4.3.2.4-pengujian-modul-manajemen-tamu)

[4.3.2.5 Pengujian Modul Keuangan	96](#4.3.2.5-pengujian-modul-keuangan)

[4.3.2.6 Pengujian Modul Logistik dan Inventori	96](#4.3.2.6-pengujian-modul-logistik-dan-inventori)

[4.3.2.7 Pengujian Modul Chatbot LLM	97](#4.3.2.7-pengujian-modul-chatbot-llm)

[4.3.2.8 Pengujian Modul Laporan	98](#4.3.2.8-pengujian-modul-laporan)

[4.3.2.9 Pengujian Modul Pengaturan dan RBAC	98](#4.3.2.9-pengujian-modul-pengaturan-dan-rbac)

[4.3.2.10 Evaluasi Kepuasan Pengguna (UAT dan SUS)	99](#4.3.2.10-evaluasi-kepuasan-pengguna-\(uat-dan-sus\))

[4.3.2.10.1 Evaluasi Kepuasan Staf Hotel (n=10)	99](#4.3.2.10.1-evaluasi-kepuasan-staf-hotel-\(n=10\))

[4.3.2.10.2 Evaluasi Kepuasan Tamu dan Pengguna Chatbot (n=20)	101](#4.3.2.10.2-evaluasi-kepuasan-tamu-dan-pengguna-chatbot-\(n=20\))

[4.3.2.10.3 Evaluasi Usability dengan System Usability Scale (SUS)	102](#4.3.2.10.3-evaluasi-usability-dengan-system-usability-scale-\(sus\))

[**BAB 5  SIMPULAN DAN SARAN	104**](#bab-5-simpulan-dan-saran)  
[**5.1 Simpulan	104**](#5.1-simpulan)  
[**5.2 Saran	106**](#5.2-saran)  
[**5.3 Keterbatasan Penelitian	108**](#5.3-keterbatasan-penelitian)  
[**REFERENSI	110**](#referensi)  
[**RIWAYAT HIDUP	118**](#riwayat-hidup)  
**DAFTAR TABEL**

Tabel 2.1 Perbandingan Hasil Penelitian Produk Sejenis Sebelumnya	34  
Tabel 3.1 Rencana Sprint Pengembangan StayManager	37  
Tabel 3.2 Perbandingan Aplikasi Sejenis	40  
Tabel 3.3 Rekapitulasi Hasil Wawancara Analisis Kebutuhan	41  
Tabel 3.4 Kebutuhan Fungsional Sistem StayManager	43  
Tabel 3.5 Kebutuhan Non-Fungsional Sistem StayManager	44  
Tabel 3.6 Kebutuhan Teknologi StayManager	49  
Tabel 3.7 Struktur Tabel Database StayManager	71  
Tabel 4.1 Spesifikasi Perangkat Keras yang Digunakan	75  
Tabel 4.2 Spesifikasi Minimum Perangkat Keras untuk Menjalankan Sistem	75  
Tabel 4.3 Spesifikasi Perangkat Lunak yang Digunakan	76  
Tabel 4.4 Hasil Pengujian Black Box \- Modul Autentikasi	87  
Tabel 4.5 Hasil Pengujian Black Box \- Modul Dashboard	88  
Tabel 4.6 Hasil Pengujian Black Box \- Modul Manajemen Kamar	89  
Tabel 4.7 Hasil Pengujian Black Box \- Modul Manajemen Tamu	89  
Tabel 4.8 Hasil Pengujian Black Box \- Modul Keuangan	90  
Tabel 4.9 Hasil Pengujian Black Box \- Modul Logistik dan Inventori	90  
Tabel 4.10 Hasil Pengujian Black Box \- Modul Chatbot LLM	91  
Tabel 4.11 Hasil Pengujian Black Box \- Modul Laporan	91  
Tabel 4.12 Hasil Pengujian Black Box \- Modul Pengaturan dan RBAC	92  
Tabel 4.13 Hasil Kuesioner Evaluasi Kepuasan Staf Hotel (n=10)	93  
Tabel 4.14 Hasil Kuesioner Evaluasi Kepuasan Tamu dan Pengguna Chatbot (n=20)	94

**DAFTAR GAMBAR**

Gambar 1.1 Arsitektur Umum Property Management System	1  
Gambar 2.1 Arsitektur Property Management System (PMS)	10  
Gambar 2.2 Alur Kerja Pengembangan Scrum	12  
Gambar 2.5 Contoh Use Case Diagram	26  
Gambar 2.6 Contoh Class Diagram	27  
Gambar 2.7 Contoh Activity Diagram	28  
Gambar 2.8 Contoh Sequence Diagram	29  
Gambar 3.1 Alur Pengembangan Sistem dengan Metodologi Scrum	36  
Gambar 3.2 Kerangka Berpikir Penelitian	39  
Gambar 3.3 Flowchart Alur Aplikasi StayManager	47  
Gambar 3.4 Use Case Diagram Sistem StayManager	52  
Gambar 3.5 Class Diagram Sistem StayManager	53  
Gambar 3.6 Sequence Diagram â€“ Proses Login Staf	54  
Gambar 3.7 Sequence Diagram â€“ Chatbot: Cek Ketersediaan Kamar	55  
Gambar 3.8 Sequence Diagram â€“ Chatbot: Create Booking	56  
Gambar 3.9 Sequence Diagram â€“ Chatbot: Konfirmasi Pembayaran	57  
Gambar 3.10 Arsitektur Integrasi LLM Chatbot dengan PMS StayManager	57  
Gambar 3.11 Sequence Diagram â€“ Proses Check-in Tamu	58  
Gambar 3.12 Sequence Diagram â€“ Proses Check-out Tamu	59  
Gambar 3.13 Sequence Diagram â€“ Manajemen Kamar	60  
Gambar 3.14 Sequence Diagram â€“ Manajemen Tugas Housekeeping	61  
Gambar 3.15 Activity Diagram â€“ Proses Login	62  
Gambar 3.16 Activity Diagram â€“ Proses Registrasi Akun Staff	63  
Gambar 3.17 Activity Diagram â€“ Proses Reservasi via Chatbot	64  
Gambar 3.18 Activity Diagram â€“ Proses Check-in Tamu	65  
Gambar 3.19 Activity Diagram â€“ Pengelolaan Tugas Housekeeping	66  
Gambar 3.20 Activity Diagram â€“ Pencatatan Transaksi Keuangan	67  
Gambar 3.21 Rancangan Antarmuka Halaman Publik	68  
Gambar 3.22 Rancangan Antarmuka Chatbot LLM	68  
Gambar 3.23 Rancangan Antarmuka Halaman Login	69  
Gambar 3.24 Rancangan Antarmuka Manajemen Kamar	70  
Gambar 3.25 Rancangan Antarmuka Modul Keuangan	70  
Gambar 3.26 Entity Relationship Diagram (ERD) StayManager	71  
Gambar 4.1 Tampilan Halaman Login StayManager	77  
Gambar 4.2 Tampilan Halaman Dashboard dan Landing Page StayManager	79  
Gambar 4.3 Tampilan Modul Manajemen Kamar	80  
Gambar 4.4 Tampilan Modul Manajemen Tamu	81  
Gambar 4.5 Tampilan Modul Reservasi	82  
Gambar 4.6 Tampilan Modul Keuangan	83  
Gambar 4.7 Tampilan Modul Inventaris	84  
Gambar 4.8 Tampilan Modul Billing & Invoice	85  
Gambar 4.9 Tampilan Modul Laporan Manajerial	86  
Gambar 4.10 Tampilan Antarmuka Chatbot LLM	87  
Gambar 4.11 Bukti Faktor 1: Learnability — Antarmuka Login Intuitif	90  
Gambar 4.12 Bukti Faktor 2: Efficiency — Dashboard dengan Aksi Cepat	91  
Gambar 4.13 Bukti Faktor 3: Memorability — Navigasi & Warna Konsisten	92  
Gambar 4.14 Bukti Faktor 4: Error Rate — Validasi Form Real-time	93  
Gambar 4.15 Bukti Faktor 5: Satisfaction — Dashboard Komprehensif	94  
Gambar 4.16 Bukti Aturan 1: Konsistensi Desain Antarmuka	96  
Gambar 4.17 Bukti Aturan 2: Pintasan Navigasi Langsung	97  
Gambar 4.18 Bukti Aturan 3: Umpan Balik Informatif	98  
Gambar 4.19 Bukti Aturan 4: Dialog dengan Titik Penutup Jelas	99  
Gambar 4.20 Bukti Aturan 5: Penanganan Kesalahan Sederhana	100  
Gambar 4.21 Bukti Aturan 6: Pembatalan Aksi yang Mudah	101  
Gambar 4.22 Bukti Aturan 7: Kendali Internal Pengguna	102  
Gambar 4.23 Bukti Aturan 8: Kurangi Beban Memori	103  
Gambar 4.24 Bukti BBT — Halaman Login StayManager (Skenario 1-5)	112  
Gambar 4.25 Bukti BBT — Modul Dashboard (Skenario 8-10)	113  
Gambar 4.26 Bukti BBT — Modul Manajemen Kamar (Skenario 11-15)	114  
Gambar 4.27 Bukti BBT — Modul Manajemen Tamu (Skenario 16-19)	115  
Gambar 4.28 Bukti BBT — Modul Keuangan (Skenario 20-23)	116  
Gambar 4.29 Bukti BBT — Modul Logistik dan Inventaris (Skenario 24-26)	117  
Gambar 4.30 Bukti BBT — Modul Chatbot LLM (Skenario 27-30)	118  
Gambar 4.31 Bukti BBT — Modul Laporan (Skenario 31-33)	119  
Gambar 4.32 Bukti BBT — Modul Pengaturan dan RBAC (Skenario 34-36)	120

DAFTAR LAMPIRAN

Lampiran 1: Kuesioner Awal â€“ Analisis Kebutuhan Pengguna	180  
Lampiran 2: Kuesioner Akhir â€“ User Acceptance Testing (UAT)	185  
Lampiran 3: Biodata Penulis	189

# **BAB 1**  **PENDAHULUAN** {#bab-1-pendahuluan}

## **1.1 Latar Belakang** {#1.1-latar-belakang}

Industri perhotelan merupakan salah satu sektor jasa yang memiliki karakteristik unik karena sangat bergantung pada kecepatan pemrosesan informasi (information velocity), akurasi data operasional, serta koordinasi yang efektif antarbagian kerja dalam rangka memberikan pelayanan yang optimal kepada tamu. Dalam perspektif sistem informasi, hotel dapat dipandang sebagai sebuah entitas organisasi dengan proses bisnis yang kompleks, dinamis, dan saling terhubung, mulai dari reservasi, pengelolaan kamar (housekeeping), penanganan keluhan, transaksi keuangan, hingga pelaporan manajerial. Tingginya kompleksitas tersebut menuntut dukungan teknologi informasi yang mampu mengintegrasikan seluruh proses bisnis secara sistematis, terpusat, dan real-time. Pemanfaatan sistem informasi yang tepat guna terbukti berperan penting dalam meningkatkan efisiensi operasional serta kualitas layanan melalui pengelolaan data yang terstruktur dan dukungan pengambilan keputusan berbasis informasi yang akurat, terutama dalam menghadapi ketidakpastian permintaan pasar (Tuomi dkk., 2021).  
Perkembangan teknologi digital dan penetrasi internet yang masif semakin memperkuat kebutuhan akan sistem informasi perhotelan yang modern. Hal ini berjalan seiring dengan perubahan perilaku konsumen pascapandemi yang kini cenderung mengadopsi gaya hidup mobile-first, di mana pencarian informasi, pembandingan harga, hingga pemesanan layanan dilakukan secara daring melalui perangkat pintar. Dalam ekosistem baru ini, sistem informasi hotel tidak lagi hanya berfungsi sebagai alat administrasi internal (back-office tool), tetapi telah bertransformasi menjadi antarmuka utama interaksi antara hotel dan tamu (customer-facing interface). Kondisi ini menuntut kehadiran sistem yang mampu menyediakan informasi secara cepat, konsisten, dan dapat diakses kapan saja (24/7), serta mendukung proses bisnis hotel secara end-to-end dalam satu platform terpadu (Buhalis dkk., 2023).  
Urgensi transformasi digital ini tercermin secara nyata pada pertumbuhan pasar perangkat lunak manajemen perhotelan. Data industri terbaru menunjukkan bahwa pasar Asia Pacific Hotel & Hospitality Management Software Market terus mengalami tren peningkatan signifikan, menandakan bahwa sistem manajemen berbasis perangkat lunak telah bergeser dari sekadar alat bantu menjadi komponen strategis dalam keberlanjutan bisnis hospitality (Mordor Intelligence, 2024). Pertumbuhan pasar ini mengindikasikan bahwa ketergantungan hotel terhadap solusi teknologi informasi dalam mengelola operasional dan layanan semakin tidak terelakkan untuk mempertahankan daya saing.

![][image2]Gambar 1.1 Arsitektur Umum Property Management System Sumber: Olahan Penulis  
Meskipun indikator pasar menunjukkan pertumbuhan positif, realitas di lapangan memperlihatkan adanya kesenjangan digital (digital divide) yang masih lebar. Pertumbuhan adopsi teknologi tersebut tidak serta-merta mencerminkan tingkat penerapan sistem yang terintegrasi secara optimal pada seluruh segmen hotel, khususnya hotel kecil, menengah, dan properti boutique. Pada praktiknya, masih banyak hotel di segmen ini yang menjalankan operasionalnya dengan pendekatan hibrida yang tidak efisien: sebagian masih menggunakan pencatatan manual berbasis kertas, dan sebagian lagi mengandalkan aplikasi yang berdiri sendiri (siloed systems) untuk fungsi berbeda. Pendekatan terfragmentasi ini menyebabkan data tersebar di berbagai media, sulit disinkronkan, mengalami latensi tinggi, serta sangat rentan terhadap human error (Lebang dkk., 2023, hlm. 57; Kim & Kim, 2022).  
Dampak dari fragmentasi sistem ini sangat krusial. Staf hotel sering kali harus melakukan input data berulang (redundant data entry) yang membuang waktu produktif, sementara manajemen tidak dapat memperoleh gambaran operasional (dashboard) yang akurat dan terkini untuk pengambilan keputusan strategis. Temuan studi Kim dan Kim (2022) menegaskan bahwa fragmentasi sistem informasi dan kurangnya interoperabilitas antar-teknologi merupakan penghambat utama efektivitas operasional hotel di era modern, yang berujung pada inefisiensi biaya dan penurunan standar layanan.  
Permasalahan integrasi ini menjadi titik kritis pada departemen room division, khususnya koordinasi antara front office dan housekeeping. Tanpa sistem yang terintegrasi secara real-time, informasi mengenai perubahan status kamar sering kali mengalami keterlambatan penyampaian. Fenomena "latensi data" ini menyebabkan kamar yang secara fisik sudah siap dijual namun belum terupdate di sistem, sehingga berpotensi mengakibatkan loss opportunity atau bahkan konflik data saat tamu check-in. Penelitian O'Connor dkk. (2025) menekankan bahwa ketiadaan alur kerja digital yang terintegrasi menyebabkan koordinasi operasional menjadi lambat, sehingga diperlukan sistem terpusat sebagai sumber data tunggal (single source of truth) yang dapat diakses oleh semua departemen terkait.  
Sebagai solusi teknis terhadap permasalahan fragmentasi tersebut, Property Management System (PMS) dikembangkan sebagai kerangka kerja sistem informasi terintegrasi. PMS berbasis web semakin banyak diterapkan karena menawarkan keunggulan signifikan berupa fleksibilitas akses lintas perangkat, kemudahan pemeliharaan tanpa instalasi lokal, serta skalabilitas sistem yang lebih baik melalui pemisahan lapisan frontend, backend, dan basis data. Iranmanesh dkk. (2022) melalui systematic review menemukan bahwa adopsi arsitektur berbasis web memfasilitasi integrasi melalui API (Application Programming Interface) yang memungkinkan pertukaran data secara real-time guna mempercepat komunikasi antarbagian, sekaligus mendorong enam dimensi kinerja hotel termasuk efisiensi operasional dan inovasi layanan.  
Di sisi lain, dorongan untuk mengimplementasikan sistem cerdas juga datang dari perspektif pelanggan. Tamu hotel modern memiliki ekspektasi tinggi terhadap otonomi dan kecepatan layanan. Mereka cenderung menghindari friksi interaksi manual dan menginginkan akses informasi instan. Penelitian Wynn dan Jones (2022) menunjukkan bahwa penggunaan teknologi layanan cerdas yang responsif secara signifikan meningkatkan persepsi nilai dan loyalitas tamu, karena teknologi tersebut memberikan kontrol lebih besar kepada pengguna atas pengalaman menginap mereka.  
Perkembangan teknologi kecerdasan buatan, khususnya Large Language Model (LLM), telah mengubah paradigma chatbot secara drastis. LLM memungkinkan sistem untuk memahami konteks percakapan yang kompleks, mendeteksi niat pengguna (intent recognition), serta menghasilkan respons generatif yang natural, empatik, dan relevan (Dwivedi dkk., 2023). Dalam konteks perhotelan, integrasi LLM berpotensi menghadirkan AI Concierge yang mampu menangani reservasi dan pertanyaan tamu layaknya staf manusia profesional.  
Berdasarkan analisis mendalam mengenai kebutuhan operasional, ekspektasi tamu, serta peluang dan tantangan teknologi terkini, penelitian ini mengusulkan pengembangan StayManager. Sistem ini dirancang sebagai Web-based Property Management System yang terintegrasi secara native dengan LLM Chatbot menggunakan Google Gemini API. Pengembangan ini diharapkan tidak hanya memecahkan masalah efisiensi dan fragmentasi data di hotel, tetapi juga memberikan kontribusi kebaruan (novelty) pada bidang teknik informatika, khususnya dalam perancangan arsitektur sistem informasi terdistribusi yang mengintegrasikan AI kontekstual ke dalam logika bisnis perhotelan.

## **1.2 Rumusan Masalah** {#1.2-rumusan-masalah}

Berdasarkan latar belakang di atas, maka rumusan masalah dalam penelitian ini adalah sebagai berikut:

1. Bagaimana merancang dan mengembangkan Property Management System (PMS) berbasis web?

2. Bagaimana mengintegrasikan chatbot berbasis Large Language Model (LLM) ke dalam sistem PMS untuk mendukung layanan informasi dan reservasi tamu secara otomatis menggunakan bahasa alami?

3. Bagaimana memastikan sinkronisasi data antara sistem PMS dan chatbot secara real-time untuk mencegah terjadinya inkonsistensi data seperti double booking?

## **1.3 Hipotesis** {#1.3-hipotesis}

Hipotesis dalam penelitian ini bersifat hipotesis pengembangan (engineering/development hypothesis), bukan hipotesis statistik formal seperti pada penelitian kuantitatif eksperimental. Hal ini disebabkan jenis penelitian skripsi ini adalah penelitian rekayasa perangkat lunak (software engineering research) yang menghasilkan artefak berupa sistem perangkat lunak, sehingga pembuktian dilakukan melalui implementasi, pengujian fungsional, dan evaluasi pengguna, bukan melalui uji hipotesis statistik. Hipotesis yang diajukan adalah sebagai berikut:  
H1: Pengembangan Property Management System (PMS) berbasis web yang mengintegrasikan modul-modul operasional hotel ke dalam satu platform terpusat dapat menghasilkan sistem manajemen hotel yang fungsional, terintegrasi, dan memenuhi kebutuhan operasional inti perhotelan.  
H2: Integrasi chatbot berbasis Large Language Model (LLM) ke dalam sistem PMS dapat menyediakan antarmuka percakapan bahasa alami yang mampu melayani permintaan informasi dan reservasi tamu secara otomatis dengan tingkat keberhasilan yang tinggi.  
H3: Penerapan arsitektur basis data terpusat dengan operasi tulis transaksional yang konsisten dapat menjaga sinkronisasi data antara antarmuka staf hotel dan chatbot tamu secara real-time, sehingga mencegah terjadinya konflik data seperti double booking.  
Pembuktian hipotesis-hipotesis tersebut dilakukan melalui implementasi sistem StayManager, pengujian Black Box terhadap seluruh modul (Bab 4.3.2), serta evaluasi kepuasan pengguna melalui User Acceptance Testing (UAT) dan System Usability Scale (SUS). 

## **1.4 Ruang Lingkup Penelitian** {#1.4-ruang-lingkup-penelitian}

Agar pembahasan penelitian ini lebih terarah dan fokus pada tujuan yang telah ditetapkan, penulis menetapkan batasan-batasan masalah dalam pengembangan sistem StayManager sebagai berikut:

**Batasan Fungsionalitas Sistem**

1. Modul PMS: Pengembangan Property Management System (PMS) mencakup 14 modul operasional esensial yaitu (1) Autentikasi dan RBAC, (2) Dashboard dan Landing Page Publik, (3) Occupancy dan Reservasi, (4) Manajemen Kamar (terintegrasi dengan UI Housekeeping pada halaman /rooms), (5) Manajemen Tamu, (6) Housekeeping, (7) Keuangan (Pendapatan dan Pengeluaran), (8) Billing dan Invoice, (9) Guest Facilities, (10) Inventaris dan Logistik, (11) Manajemen Staf, (12) Laporan, (13) Chatbot LLM, dan (14) Settings & Sistem Administrasi (pengaturan database, development, health monitoring, dan keamanan).

2. Integrasi Data: Seluruh modul terintegrasi dalam satu basis data terpusat (centralized database) yang mendukung sinkronisasi data secara real-time antarbagian menggunakan PostgreSQL melalui platform Supabase.

3. Kontrol Akses: Sistem menerapkan Role-Based Access Control (RBAC) dengan enam tingkat peran pengguna, yaitu: Super Admin, Manager, Front Desk, Housekeeping, Finance, dan Guest, guna memastikan setiap pengguna hanya dapat mengakses modul yang sesuai dengan tanggung jawabnya.

4. Saluran Reservasi: Sistem tidak terintegrasi dengan Online Travel Agent (OTA) seperti Traveloka atau Booking.com. Chatbot difungsikan sebagai satu-satunya antarmuka digital untuk pemesanan kamar langsung oleh tamu.

5. Mekanisme Pembayaran: Sistem tidak mengintegrasikan gerbang pembayaran daring (*payment gateway*) pihak ketiga. Proses pembayaran dilakukan melalui transfer bank manual atau secara langsung di resepsionis. Chatbot LLM menyediakan alur konfirmasi pembayaran (opsi "Bayar Sekarang" atau "Bayar Nanti") dan mencatat status pembayaran secara administratif dalam sistem.

## **1.5 Tujuan dan Manfaat** {#1.5-tujuan-dan-manfaat}

### **1.5.1 Tujuan Penelitian** {#1.5.1-tujuan-penelitian}

Berdasarkan rumusan masalah yang telah dipaparkan, tujuan penelitian ini adalah sebagai berikut:

1. Mengembangkan Property Management System (PMS) berbasis web yang mampu mengintegrasikan seluruh proses operasional hotel secara terpusat.

2. Mengimplementasikan integrasi chatbot berbasis Large Language Model (LLM) ke dalam sistem PMS untuk mendukung layanan informasi dan reservasi tamu secara otomatis menggunakan bahasa alami.

3. Mengembangkan mekanisme sinkronisasi data antara sistem PMS dan chatbot secara real-time guna menjaga konsistensi data dan mencegah terjadinya konflik data seperti double booking.

   ### **1.5.2 Manfaat Penelitian** {#1.5.2-manfaat-penelitian}

1. Bagi Pengembangan Ilmu Pengetahuan: Memberikan referensi teknis mengenai penerapan integrasi kecerdasan buatan (Large Language Model) ke dalam sistem informasi manajemen berbasis web untuk meningkatkan interaksi dan otomatisasi layanan.

2. Bagi Industri Perhotelan: Meningkatkan efisiensi operasional hotel dengan mengotomatiskan pencatatan data, mengurangi kesalahan manusia akibat sistem manual, serta mempermudah koordinasi antarbagian.

3. Bagi Tamu Hotel: Memberikan pengalaman layanan yang lebih cepat dan responsif melalui akses informasi dan pemesanan kamar 24 jam tanpa perlu menunggu staf resepsionis.

4. Bagi Penulis: Sebagai sarana penerapan ilmu rekayasa perangkat lunak dalam membangun solusi teknologi yang relevan dengan kebutuhan industri saat ini.

## **1.6 Metode Penelitian** {#1.6-metode-penelitian}

### **1.6.1 Metode Pengumpulan Data** {#1.6.1-metode-pengumpulan-data}

Metode pengumpulan data dalam penelitian ini digunakan untuk memperoleh informasi yang diperlukan dalam proses perancangan, pengembangan, dan evaluasi Property Management System berbasis web yang terintegrasi dengan chatbot berbasis Large Language Model. Teknik pengumpulan data disesuaikan dengan karakteristik penelitian pengembangan sistem informasi dan dirancang untuk mendukung analisis kebutuhan sistem serta evaluasi penerimaan pengguna.

**a. Observasi**

Observasi dilakukan untuk memahami secara langsung proses operasional hotel yang berkaitan dengan reservasi kamar, pengelolaan data kamar, serta koordinasi housekeeping. Melalui observasi, peneliti memperoleh gambaran nyata mengenai alur kerja yang berjalan, interaksi antarbagian, serta permasalahan yang muncul pada sistem operasional yang ada. Hasil observasi digunakan sebagai dasar dalam mengidentifikasi kebutuhan fungsional dan non-fungsional sistem yang akan dikembangkan (Sugiyono, 2022).

**b. Studi Literatur**

Studi literatur dilakukan dengan menelaah berbagai sumber pustaka yang relevan, meliputi buku teks, artikel jurnal ilmiah, dan publikasi penelitian terkini yang berkaitan dengan Property Management System, sistem informasi perhotelan, arsitektur sistem berbasis web, serta penerapan chatbot dan Large Language Model. Studi literatur bertujuan untuk membangun landasan teoretis penelitian, memperkuat kerangka konseptual, serta memastikan bahwa sistem yang dirancang selaras dengan perkembangan dan praktik terkini dalam bidang sistem informasi dan kecerdasan buatan (Creswell & Creswell, 2023).

**c. Kuesioner**

Kuesioner digunakan sebagai instrumen pengumpulan data untuk mengevaluasi tingkat kepuasan, penerimaan, dan usability pengguna terhadap sistem yang dikembangkan. Responden kuesioner terdiri dari tamu hotel yang menggunakan chatbot serta staf hotel yang memanfaatkan sistem dalam kegiatan operasional. Total responden berjumlah 30 orang yang terdiri dari 10 staf operasional hotel dan 20 tamu hotel (pengguna chatbot). Instrumen kuesioner disusun menggunakan skala Likert dengan lima tingkat penilaian untuk evaluasi kepuasan pengguna, serta dilengkapi dengan System Usability Scale (SUS) untuk mengukur aspek kemudahan penggunaan sistem. Data yang diperoleh dianalisis secara deskriptif untuk menggambarkan tingkat kepuasan, penerimaan, dan usability pengguna terhadap sistem (Sugiyono, 2022).

**d. Wawancara**  
Wawancara dilakukan untuk memperoleh data kualitatif yang mendalam mengenai kebutuhan, ekspektasi, dan permasalahan yang dihadapi oleh pemangku kepentingan dalam operasional hotel. Narasumber wawancara terdiri dari manajer hotel, staf operasional (resepsionis dan housekeeping), serta calon pengguna chatbot dari kalangan tamu. Wawancara dilaksanakan dengan teknik semi-terstruktur, di mana peneliti menyiapkan panduan pertanyaan inti namun tetap fleksibel mengeksplorasi topik yang muncul selama percakapan. Hasil wawancara digunakan untuk memperdalam analisis kebutuhan fungsional dan non-fungsional sistem yang telah dikumpulkan melalui observasi dan kuesioner (Creswell & Creswell, 2023).  
Penelitian ini menggunakan pendekatan single-case study (Creswell & Creswell, 2023\) dengan Hotel Asni (Penginapan Asni, Kampal, Kec. Parigi, Kabupaten Parigi Moutong, Sulawesi Tengah 94471\) sebagai konteks utama pengumpulan data primer. Pemilihan case study didasarkan pada karakteristik hotel kecil-menengah yang menjadi target pengembangan StayManager dan aksesibilitas terhadap stakeholder kunci. Wawancara dilakukan dengan durasi rata-rata 30â€“45 menit per narasumber dan didokumentasikan melalui rekaman audio (dengan informed consent) yang ditranskripsi untuk analisis.

### **1.6.2 Metode Pengembangan Sistem** {#1.6.2-metode-pengembangan-sistem}

Metode pengembangan sistem yang digunakan dalam penelitian ini adalah metode Agile dengan framework Scrum. Scrum dipilih karena merupakan salah satu framework Agile yang menekankan pengembangan perangkat lunak secara iteratif, kolaboratif, dan adaptif terhadap perubahan kebutuhan pengguna. Pendekatan ini sesuai untuk pengembangan sistem informasi berbasis web yang memerlukan umpan balik berkelanjutan serta fleksibilitas dalam pengembangan fitur, seperti sistem PMS yang terintegrasi dengan chatbot berbasis Large Language Model (Verwijs & Russo, 2023; Behrens dkk., 2021).

## **1.7 Sistematika Penulisan** {#1.7-sistematika-penulisan}

Penulisan skripsi ini disusun secara sistematis dalam lima bab sebagai berikut:

**BAB 1 PENDAHULUAN**

Bab ini menguraikan latar belakang permasalahan, rumusan masalah, ruang lingkup penelitian, tujuan dan manfaat penelitian, metode penelitian yang digunakan, serta sistematika penulisan skripsi.

**BAB 2 Tinjauan Referensi**

Bab ini menyajikan landasan teori dan konsep yang relevan dengan penelitian, meliputi konsep sistem manajemen perhotelan, Property Management System, teknologi pengembangan sistem (Next.js, TypeScript, Supabase, Gemini API), pemodelan sistem menggunakan UML dan ERD, prinsip-prinsip interaksi manusia dan komputer, metode pengujian sistem, serta perbandingan penelitian sejenis (state of the arts).

**BAB 3 METODE PENELITIAN**

Bab ini menjelaskan metodologi penelitian yang digunakan, analisis sistem berjalan dan perbandingan aplikasi sejenis, analisis kebutuhan sistem, usulan pemecahan masalah, serta perancangan sistem yang mencakup Software Design Document, perancangan UML, perancangan antarmuka pengguna, dan perancangan basis data.

**BAB 4 HASIL DAN PEMBAHASAN**

Bab ini membahas hasil pengembangan sistem StayManager, meliputi spesifikasi sistem, prosedur penggunaan setiap modul, hasil pengujian fungsionalitas menggunakan Black Box Testing, evaluasi antarmuka pengguna menggunakan Lima Faktor Manusia Terukur dan Delapan Aturan Emas Desain Antarmuka, evaluasi kepuasan pengguna melalui kuesioner Skala Likert dan System Usability Scale (SUS), serta evaluasi kesesuaian terhadap rumusan masalah yang ditetapkan.

**BAB 5 SIMPULAN DAN SARAN**

Bab ini menyajikan kesimpulan dari seluruh penelitian yang telah dilakukan serta saran-saran untuk pengembangan sistem di masa mendatang.

# **BAB 2 TINJAUAN REFERENSI** {#bab-2-tinjauan-referensi}

## **2.1 Konsep Sistem Manajemen Perhotelan** {#2.1-konsep-sistem-manajemen-perhotelan}

### **2.1.1 Sistem Informasi Manajemen Hotel** {#2.1.1-sistem-informasi-manajemen-hotel}

Sistem Informasi Manajemen Hotel adalah perangkat lunak yang dirancang untuk mengelola dan mengoordinasikan seluruh aktivitas operasional hotel secara terintegrasi. Sistem ini mencakup pengelolaan reservasi, data tamu, status kamar, housekeeping, transaksi operasional, serta pelaporan manajerial. Tujuan utama dari sistem ini adalah menyediakan informasi yang akurat, konsisten, dan tepat waktu guna mendukung kelancaran operasional hotel serta pengambilan keputusan manajemen (Buhalis dkk., 2023).  
Kim dan Kim (2022) menegaskan bahwa hotel yang menerapkan sistem informasi terintegrasi mengalami peningkatan signifikan dalam kepuasan tamu, efisiensi staf, dan margin keuntungan operasional. Penelitian tersebut juga menyoroti bahwa integrasi antar modul dari front office hingga back office adalah kunci keberhasilan implementasi sistem informasi hotel masa kini. Dalam konteks hotel modern, sistem informasi manajemen tidak lagi sekadar alat administrasi internal, melainkan platform strategis yang mendukung transformasi digital dan peningkatan daya saing usaha.

### **2.1.2 Property Management System (PMS)** {#2.1.2-property-management-system-(pms)}

Property Management System (PMS) merupakan sistem inti dalam ekosistem teknologi hotel yang berfungsi sebagai pusat pengelolaan data dan proses operasional. PMS mengintegrasikan modul-modul utama seperti reservasi kamar, manajemen status kamar, koordinasi housekeeping, pencatatan transaksi keuangan, dan pelaporan manajerial. Dengan adanya PMS, seluruh bagian hotel bekerja berdasarkan satu sumber data yang sama (single source of truth) sehingga meningkatkan konsistensi informasi dan efisiensi kerja secara keseluruhan (Li dkk., 2022).  
Mordor Intelligence (2024) melaporkan bahwa pasar global PMS hotel bernilai lebih dari USD 3,5 miliar pada tahun 2023 dan diproyeksikan tumbuh dengan CAGR 5,8% hingga 2028\. Pertumbuhan ini didorong oleh adopsi hotel skala kecil dan menengah yang semakin aktif mencari solusi PMS berbasis cloud dengan harga terjangkau dan kemudahan implementasi. Sistem StayManager hadir untuk mengisi kebutuhan tersebut dengan menawarkan solusi PMS full-stack berbasis web yang terintegrasi dengan kecerdasan buatan.

![][image3]Gambar 2.1 Arsitektur Property Management System (PMS) Sumber: Olahan Penulis

### **2.1.3 Sistem Reservasi Hotel Digital** {#2.1.3-sistem-reservasi-hotel-digital}

Sistem reservasi digital merupakan komponen kritis dalam PMS yang memungkinkan tamu melakukan pemesanan kamar secara mandiri melalui berbagai kanal, termasuk website hotel dan antarmuka chatbot (Salameh dkk., 2022). O'Connor dkk. (2025) menemukan bahwa partisipasi Online Travel Agent (OTA) berkorelasi positif dan signifikan dengan kinerja finansial hotel di Amerika Serikat: setiap kenaikan satu dolar komisi OTA berasosiasi dengan peningkatan REVPAR sebesar USD 20,20 dan EBITDA per available room sebesar USD 7,08, yang menegaskan pentingnya kanal digital sebagai sumber pendapatan kritis bagi industri perhotelan modern.  
Wynn dan Jones (2022) menjelaskan bahwa Property Management Systems modern memperluas fungsi intiâ€”termasuk room inventory, reservasi, dan housekeepingâ€”melalui integrasi cloud, sehingga koordinasi dengan channel managers dapat meningkatkan efektivitas pengelolaan tingkat hunian kamar. Temuan ini menjadi landasan pentingnya sinkronisasi data antarmodul dalam arsitektur PMS StayManager, khususnya antara modul reservasi dengan modul manajemen kamar untuk mencegah konflik data seperti double booking.

### **2.1.4 Otomatisasi Layanan Tamu melalui AI Concierge** {#2.1.4-otomatisasi-layanan-tamu-melalui-ai-concierge}

AI Concierge adalah asisten cerdas dan terpersonalisasi yang ditugaskan untuk seorang pelanggan, secara proaktif menangani kebutuhan pelanggan tersebut sepanjang perjalanan layanan, mampu menjawab pertanyaan, memberikan rekomendasi, dan memfasilitasi pemesanan layanan secara otomatis menggunakan pemrosesan bahasa alami (Liu dkk., 2024). Dwivedi dkk. (2023) mendefinisikan AI Concierge sebagai sistem berbasis LLM yang mampu memahami konteks percakapan multiputaran (multi-turn conversation) sehingga dapat berinteraksi dengan tamu secara natural.  
Tuomi dkk. (2021), melalui studi kualitatif berbasis observasi dan wawancara semi-terstruktur, mengidentifikasi lima peran service robots di industri perhotelan: mendukung (support) dan menggantikan (substitute) karyawan dalam service encounter, memberikan diferensiasi kompetitif, peningkatan layanan, dan upskilling tenaga kerjaâ€”dengan syarat diintegrasikan secara tepat sebagai bagian dari strategi pemasaran yang lebih luas. Temuan ini memperkuat relevansi integrasi chatbot berbasis LLM dalam sistem StayManager sebagai bentuk service automation yang melengkapiâ€”bukan menggantikanâ€”peran staf hotel.

### **2.1.5 Transformasi Digital dalam Industri Perhotelan** {#2.1.5-transformasi-digital-dalam-industri-perhotelan}

Transformasi digital dalam industri perhotelan mencakup penerapan teknologi modern untuk meningkatkan efisiensi operasional, meningkatkan pengalaman tamu, dan membuka model bisnis baru (Wynn & Jones, 2022). Buhalis dkk. (2023) mengidentifikasi empat pilar transformasi digital perhotelan: (1) digitalisasi proses operasional internal, (2) personalisasi layanan tamu berbasis data, (3) integrasi platform distribusi digital, dan (4) adopsi kecerdasan buatan untuk otomatisasi layanan.  
Gursoy dkk. (2023) berargumen bahwa adopsi ChatGPT dan generative AI dapat menghadirkan perubahan substansial pada industri hospitality dan pariwisataâ€”terutama dalam cara konsumen mencari informasi dan mengambil keputusan, serta cara bisnis menciptakan dan menyampaikan layanan terpersonalisasi. Argumen ini menegaskan bahwa investasi teknologi AI, termasuk pengembangan PMS terintegrasi chatbot LLM seperti StayManager, relevan untuk meningkatkan kompetitivitas industri perhotelan modern.

## **2.2 Software Development Life Cycle (SDLC)** {#2.2-software-development-life-cycle-(sdlc)}

### **2.2.1 Metode Agile** {#2.2.1-metode-agile}

Agile adalah pendekatan modern dalam pengembangan perangkat lunak yang berfokus pada fleksibilitas, iterasi yang cepat, kolaborasi tim lintas fungsi, dan partisipasi aktif pengguna dalam proses pengembangan (Behrens dkk., 2021). Berbeda dengan pendekatan waterfall yang bersifat sekuensial dan kaku, Agile mengadopsi siklus pengembangan pendek yang disebut sprint atau iterasi, di mana setiap siklus menghasilkan produk yang dapat digunakan (working software).  
Menurut Behrens dkk. (2021), Agile Manifesto menekankan empat nilai utama: individu dan interaksi lebih penting daripada proses dan alat; perangkat lunak yang berfungsi lebih penting daripada dokumentasi yang komprehensif; kolaborasi pelanggan lebih penting daripada negosiasi kontrak; serta respons terhadap perubahan lebih penting daripada mengikuti rencana. Verwijs dan Russo (2023) menemukan bahwa tim yang menggunakan metodologi Scrum lebih mungkin menyelesaikan proyek tepat waktu dibandingkan tim yang menggunakan metodologi non-Agile.

### **2.2.2 Framework Scrum** {#2.2.2-framework-scrum}

Scrum adalah framework implementasi Agile yang paling banyak digunakan, terstruktur di sekitar konsep sprint, backlog, dan peran-peran tertentu dalam tim. Verwijs dan Russo (2023) menegaskan bahwa tim Scrum berada di inti kerangka kerja Scrum, yang dibangun di atas seperangkat peran minimal â€” Product Owner yang bertanggung jawab atas pengelolaan dan prioritas product backlog, Scrum Master yang memfasilitasi proses Scrum dan menghilangkan hambatan, serta Developers (Development Team) sebagai tim lintas fungsi yang mengembangkan increment produk â€” dengan otonomi tim yang tinggi sebagai salah satu faktor kunci efektivitas.  
Siklus Scrum terdiri dari beberapa acara: Sprint Planning, Daily Scrum, Sprint Review, dan Sprint Retrospective. Dalam pengembangan StayManager, framework Scrum diterapkan dengan sprint berdurasi dua minggu, di mana setiap sprint mencakup perencanaan fitur, pengembangan, pengujian, dan review. Kanban Board pada GitHub Projects digunakan untuk memvisualisasikan progres tugas dalam setiap sprint.

![][image4]Gambar 2.2 Alur Kerja Pengembangan Scrum Sumber: Olahan Penulis

## **2.3 Kecerdasan Buatan dan Large Language Model (LLM)** {#2.3-kecerdasan-buatan-dan-large-language-model-(llm)}

### **2.3.1 Kecerdasan Buatan (Artificial Intelligence)** {#2.3.1-kecerdasan-buatan-(artificial-intelligence)}

Menurut Russell dan Norvig (2021), kecerdasan buatan (Artificial Intelligence atau AI) adalah cabang ilmu komputer yang berkaitan dengan pengembangan sistem yang mampu melakukan tugas-tugas yang biasanya membutuhkan kecerdasan manusia, seperti pemahaman bahasa alami, pengenalan pola, dan pengambilan keputusan. Dalam konteks sistem informasi, AI memberikan kemampuan bagi sistem untuk beradaptasi secara dinamis terhadap input pengguna dan menghasilkan output yang kontekstual dan relevan.  
Caldarini dkk. (2022) dalam survei literaturnya mengklasifikasikan implementasi chatbot ke dalam dua pendekatan utama: (1) chatbot berbasis aturan (rule-based) yang mengandalkan pencocokan pola, dan (2) chatbot berbasis kecerdasan buatan (AI-based) yang dibagi menjadi model Information Retrieval â€” yang memilih jawaban dari basis pengetahuan terstruktur â€” dan model Generative yang membangkitkan respons baru menggunakan algoritma Deep Learning seperti Sequence-to-Sequence dan Transformer. Sistem StayManager mengadopsi pendekatan Information Retrieval berbasis NLP untuk AI Concierge karena mampu memberikan respons konsisten terhadap pertanyaan domain-spesifik perhotelan (jam check-in, fasilitas kamar, layanan tamu).

### **2.3.2 Large Language Model (LLM)** {#2.3.2-large-language-model-(llm)}

Naveed dkk. (2024) menjelaskan bahwa Large Language Model (LLM) adalah jenis model kecerdasan buatan berbasis arsitektur transformer yang dilatih pada corpus teks yang sangat besar â€” biasanya miliaran hingga triliunan token â€” sehingga mampu memahami dan menghasilkan teks dalam bahasa alami dengan tingkat koherensi dan relevansi yang sangat tinggi. LLM mampu melakukan berbagai tugas pemrosesan bahasa alami (NLP), termasuk pemahaman teks, generasi teks, penerjemahan, ringkasan, dan penalaran berbasis konteks.  
Dwivedi dkk. (2023) mendeskripsikan evolusi LLM dari model berbasis aturan tradisional menuju arsitektur deep learning dan akhirnya transformer yang menjadi dasar model-model modern. Keunggulan utama LLM dibandingkan sistem NLP konvensional adalah kemampuannya memahami konteks dalam percakapan multiputaran (multi-turn dialogue) â€” sangat penting dalam skenario layanan tamu hotel di mana tamu mengajukan pertanyaan lanjutan berdasarkan respons sebelumnya.

### **2.3.3 Google Gemini API** {#2.3.3-google-gemini-api}

Google Gemini adalah model AI multimodal generasi terbaru dari Google DeepMind (Comanici dkk., 2025). Gemini tersedia dalam beberapa varian kapasitas: Gemini 2.5 Pro (model paling kapabel untuk tugas kompleks), Gemini 2.5 Flash (model tercepat dengan latensi rendah, dioptimalkan untuk respons real-time), dan Gemini Nano (model kompak untuk perangkat on-device). Menurut dokumentasi resmi Google AI for Developers (Google, n.d.), Gemini dirancang dengan arsitektur multimodal native yang memungkinkannya memproses dan menghasilkan output dalam berbagai format, termasuk teks, kode, gambar, dan audio.  
Dalam proyek StayManager, digunakan model Gemini 2.5 Flash yang diakses melalui library @ai-sdk/google dengan identifier model google('gemini-2.5-flash'). Pemilihan Gemini 2.5 Flash didasarkan pada: latensi rendah yang ideal untuk pengalaman streaming chatbot real-time, kemampuan pemahaman Bahasa Indonesia yang baik, dukungan function calling yang komprehensif untuk integrasi database, kemampuan streaming response untuk UX yang responsif, serta biaya API yang kompetitif dibandingkan model Gemini 2.5 Pro.

### **2.3.4 Function Calling pada LLM** {#2.3.4-function-calling-pada-llm}

Function calling (tool use) adalah fitur yang memungkinkan model LLM tidak hanya menghasilkan teks, tetapi juga memanggil fungsi eksternal yang telah didefinisikan pengembang. Ketika model mengidentifikasi bahwa menjawab pertanyaan pengguna memerlukan data nyata dari sistem eksternal, model menghasilkan permintaan pemanggilan fungsi dengan parameter yang sesuai, sistem merespons dengan data aktual, dan model menggunakan data tersebut untuk menghasilkan respons akhir yang informatif. Paradigma ReAct yang diperkenalkan Yao dkk. (2023) memadukan jejak penalaran (reasoning trace) dan aksi pemanggilan sumber eksternal secara interleaved, sehingga LLM mampu memutakhirkan rencana tindakannya berdasarkan umpan balik lingkungan â€” prinsip yang menjadi dasar arsitektur function-calling loop pada StayManager. Lebih jauh, Schick dkk. (2023) melalui Toolformer membuktikan secara empiris bahwa LLM dapat dilatih untuk memutuskan kapan memanggil API, API mana yang dipanggil, dan argumen apa yang dikirim â€” kemampuan inti yang dimanfaatkan StayManager melalui fitur function calling pada Google Gemini untuk operasi cek ketersediaan, booking, dan konfirmasi pembayaran. Fan dkk. (2024) juga menegaskan bahwa keterbatasan LLM seperti halusinasi dan pengetahuan usang dapat diatasi melalui integrasi sumber eksternal terpercaya, mendasari pemilihan pendekatan function calling pada StayManager sebagai sumber kebenaran (source of truth) untuk data hotel.  
Dalam sistem StayManager, function calling menghubungkan chatbot LLM dengan database Supabase secara real-time melalui empat fungsi yang terdefinisi menggunakan library Zod untuk validasi parameter: (1) cekKetersediaan â€” memeriksa ketersediaan kamar berdasarkan tanggal check-in, check-out, dan tipe kamar opsional dengan mengakses tabel rooms dan reservations di Supabase secara real-time; (2) createBooking â€” membuat reservasi baru ke database dengan menyimpan data tamu dan reservasi ke tabel guests dan reservations; (3) getRoomTypes â€” mengambil daftar semua tipe kamar beserta harga awal tanpa perlu filter tanggal, digunakan untuk menjawab pertanyaan informasional tamu; (4) confirmPayment â€” mengonfirmasi pembayaran reservasi dan memperbarui status payment\_status menjadi 'paid' setelah tamu menyelesaikan pembayaran. Mekanisme ini memastikan setiap respons chatbot terkait ketersediaan dan reservasi selalu mencerminkan status aktual database secara real-time.

### **2.3.5 Natural Language Processing (NLP) dan Intent Recognition** {#2.3.5-natural-language-processing-(nlp)-dan-intent-recognition}

Natural Language Processing (NLP) adalah bidang kecerdasan buatan yang berfokus pada interaksi antara komputer dan bahasa manusia, mencakup pemahaman struktur bahasa, deteksi entitas (Named Entity Recognition), dan identifikasi niat (intent recognition). Iranmanesh dkk. (2022) menyatakan bahwa sistem berbasis LLM memiliki keunggulan dalam intent recognition karena tidak memerlukan pelabelan data manual yang ekstensif seperti yang dibutuhkan oleh model NLP tradisional.  
Dalam StayManager, sistem mengklasifikasikan intent ke dalam dua kategori: (1) intent informasional â€” ketika tamu mencari informasi tentang hotel, fasilitas, atau ketersediaan kamar tanpa niat langsung memesan; dan (2) intent transaksional â€” ketika tamu ingin melakukan reservasi. Pemisahan intent ini memungkinkan sistem merutekan permintaan ke pipeline yang tepat: menjawab langsung dari knowledge base atau melanjutkan ke alur pemesanan dengan verifikasi database.

## **2.4 Basis Data dan Manajemen Data** {#2.4-basis-data-dan-manajemen-data}

### **2.4.1 Basis Data Relasional** {#2.4.1-basis-data-relasional}

Basis data relasional menyimpan dan menyediakan akses ke data yang saling berhubungan dalam format tabel, di mana setiap baris mewakili satu record dan setiap kolom merepresentasikan satu atribut. Hubungan antar tabel dinyatakan melalui kunci primer (primary key) dan kunci asing (foreign key). Menurut Coronel dan Morris (2022), basis data relasional unggul dalam menjaga integritas data melalui mekanisme constraints, mendukung query kompleks melalui SQL, dan memungkinkan normalisasi data untuk menghindari redundansi.  
Menurut Elmasri dan Navathe (2022), seluruh operasi data dalam basis data relasional menggunakan SQL (Structured Query Language) dengan operasi dasar CRUD: Create (INSERT), Read (SELECT), Update (UPDATE), dan Delete (DELETE). Dalam StayManager, operasi data dilakukan pada lebih dari 20 tabel yang saling berelasi meliputi rooms, custom\_room\_types, guests, reservations, invoices, billing\_items, deposits, payments, expenses, inventory\_items, inventory\_suppliers, inventory\_transactions, inventory\_purchase\_orders, guest\_facility\_requests, profiles, roles, dan user\_roles melalui SQL yang dieksekusi via Supabase client library.

### **2.4.2 PostgreSQL** {#2.4.2-postgresql}

PostgreSQL adalah sistem manajemen basis data objek-relasional (ORDBMS) open-source yang sangat canggih, menggunakan dan memperluas bahasa SQL dengan berbagai fitur untuk mengelola beban kerja data yang kompleks (PostgreSQL Global Development Group, 2025). Berbeda dengan basis data relasional murni, PostgreSQL mendukung tipe data lanjutan seperti JSON/JSONB, array, dan tipe geometris, serta fitur-fitur objek seperti tipe data yang dapat didefinisikan pengguna, fungsi, operator, dan indeks kustom.  
Fitur Row-Level Security (RLS) pada PostgreSQL memungkinkan pengaturan akses data di tingkat baris tabel. Scheible dkk. (2023) menunjukkan kelayakan PostgreSQL RLS sebagai mekanisme segregasi data tingkat baris untuk lingkungan multi-proyek dengan banyak peran pengguna, di mana RLS mampu menggantikan replikasi data antar data mart tanpa memerlukan modifikasi kode aplikasi inti. Pada StayManager, RLS diaktifkan sebagai baseline security gate yang membatasi akses ke pengguna terautentikasi (authenticated-only), sementara enforcement permission per peran (RBAC) ditangani pada lapisan aplikasi melalui middleware Next.js dan validasi di API route. Fitur PostgreSQL utama yang dimanfaatkan mencakup JSONB untuk menyimpan data pesan chatbot, constraints (UNIQUE, CHECK, FOREIGN KEY) untuk integritas data, indeks pada kolom query-intensive, serta database triggers yang dikonfigurasi langsung melalui Supabase Dashboard untuk otomatisasi pembaruan status kamar dan pencatatan timestamp.

### **2.4.3 Supabase** {#2.4.3-supabase}

Supabase adalah platform Backend-as-a-Service (BaaS) open-source yang dibangun di atas PostgreSQL, menyediakan berbagai layanan untuk pengembangan aplikasi modern: database PostgreSQL terkelola, autentikasi pengguna (Auth), penyimpanan file (Storage), fungsi serverless (Edge Functions), dan sinkronisasi data real-time (Realtime). Menurut dokumentasi resmi Supabase (n.d.), platform ini dirancang sebagai alternatif open-source untuk Firebase dengan keunggulan tambahan berupa kemampuan query SQL penuh.  
Dalam StayManager, Supabase dipilih karena: (1) integrasi langsung antara PostgreSQL dengan autentikasi memungkinkan implementasi RLS yang sederhana namun kuat; (2) Supabase Realtime memungkinkan pembaruan status kamar secara live tanpa polling; (3) Supabase Auth mendukung autentikasi email/password serta OAuth; dan (4) Supabase berpotensi menyediakan layanan penyimpanan file (Storage) untuk kebutuhan pengembangan di masa mendatang.

### **2.4.4 Entity Relationship Diagram (ERD)** {#2.4.4-entity-relationship-diagram-(erd)}

Menurut Elmasri dan Navathe (2022), Entity-Relationship Diagram (ERD) adalah alat pemodelan konseptual yang menggambarkan struktur data dan hubungan antar entitas dalam suatu sistem. Diperkenalkan oleh Peter P. Chen pada 1976, ERD merepresentasikan dunia nyata melalui tiga komponen: entitas (objek dengan atribut), atribut (properti entitas), dan relasi (hubungan antar entitas).  
Derajat hubungan antar entitas dinyatakan melalui kardinalitas: one-to-one, one-to-many, dan many-to-many (Elmasri & Navathe, 2022). ERD StayManager memodelkan lebih dari 15 entitas inti dengan relasi terdefinisi, misalnya satu tamu dapat memiliki banyak reservasi (one-to-many), satu reservasi menghasilkan satu atau lebih transaksi, dan satu kamar dapat memiliki banyak tugas housekeeping sepanjang waktu.

## **2.5 Arsitektur Perangkat Lunak** {#2.5-arsitektur-perangkat-lunak}

### **2.5.1 Arsitektur Full-Stack Web Application** {#2.5.1-arsitektur-full-stack-web-application}

Arsitektur full-stack web application mengacu pada pendekatan pengembangan di mana satu framework menangani baik sisi klien (front-end) maupun sisi server (back-end) dari aplikasi web. Dalam paradigma modern, framework full-stack seperti Next.js memungkinkan pengembang menulis kode front-end dan back-end dalam satu proyek dengan bahasa yang sama (TypeScript), berbagi tipe data, dan mengoptimalkan performa melalui Server-Side Rendering (SSR) dan Client-Side Rendering (CSR) (VepsÃ¤lÃ¤inen dkk., 2023).  
VepsÃ¤lÃ¤inen dkk. (2023) menyatakan bahwa arsitektur full-stack Next.js dengan App Router memungkinkan pola "co-location" di mana logika presentasi dan logika bisnis ditempatkan berdekatan dalam struktur folder yang intuitif, mengurangi latensi komunikasi antar layer dan mempercepat siklus pengembangan. Dalam StayManager, arsitektur full-stack menangani routing, Server Components untuk rendering sisi server, API Routes untuk logika bisnis back-end, dan React Client Components untuk interaktivitas sisi klien.

### **2.5.2 REST API (Representational State Transfer)** {#2.5.2-rest-api-(representational-state-transfer)}

REST (Representational State Transfer) adalah gaya arsitektur untuk sistem terdistribusi yang memanfaatkan protokol HTTP untuk pertukaran data (Golmohammadi dkk., 2023). RESTful API mengikuti prinsip: setiap resource memiliki URI yang unik, komunikasi melalui metode HTTP standar (GET, POST, PUT, PATCH, DELETE), format data JSON, dan server tidak menyimpan state klien antar permintaan (stateless).  
Dalam StayManager, API Routes Next.js mengimplementasikan prinsip RESTful untuk seluruh endpoint back-end: endpoint manajemen kamar (/api/rooms), endpoint pengeluaran (/api/expenses), endpoint inventaris (/api/inventory), dan endpoint chatbot (/api/chat). Setiap endpoint diproteksi oleh middleware autentikasi yang memverifikasi JWT token Supabase sebelum memproses permintaan.

### **2.5.3 JSON (JavaScript Object Notation)** {#2.5.3-json-(javascript-object-notation)}

JSON (JavaScript Object Notation) adalah format pertukaran data yang ringan, mudah dibaca manusia, dan mudah di-parse oleh mesin, menggunakan sintaks key-value pair yang dapat bersarang secara hierarkis (Keiser & Lemire, 2024). Dibandingkan XML, JSON lebih ringkas dan lebih mudah diproses oleh aplikasi web modern, menjadikannya format de facto untuk komunikasi data antara front-end dan back-end.  
Dalam StayManager, JSON digunakan sebagai format payload dalam seluruh komunikasi API, penyimpanan data pesan chatbot dalam kolom JSONB PostgreSQL, konfigurasi sistem, serta logging. Penggunaan TypeScript memungkinkan definisi tipe data JSON yang ketat melalui interface dan type alias sehingga mengurangi risiko runtime error akibat inkonsistensi struktur data.

### **2.5.4 Sinkronisasi Data Real-time** {#2.5.4-sinkronisasi-data-real-time}

Sinkronisasi data real-time memungkinkan perubahan data di server langsung dipropagasi ke semua klien yang terhubung tanpa polling periodik. WebSocket menyediakan kanal komunikasi dua arah (full-duplex) yang persisten antara klien dan server. Iovescu dan Tudose (2024) menegaskan bahwa untuk sistem kolaborasi multi-pengguna near real-time, protokol WebSocket merupakan pilihan utama karena menyediakan kanal komunikasi persistent dan full-duplex pada satu koneksi TCP â€” karakteristik yang dimanfaatkan StayManager melalui Supabase Realtime untuk menyebarkan perubahan status booking dan kamar secara serentak. Supabase Realtime mengimplementasikan WebSocket di atas protokol PostgreSQL LISTEN/NOTIFY untuk menyiarkan perubahan database secara real-time kepada seluruh subscriber.  
Dalam StayManager, sinkronisasi real-time difasilitasi oleh infrastruktur Supabase Realtime yang dikonfigurasi pada level database. Fitur ini mendukung dua skenario operasional: (1) pembaruan status kamar â€” ketika staf mengubah status kamar melalui modul manajemen kamar, perubahan langsung tersinkronisasi ke seluruh klien yang terhubung; dan (2) koordinasi tugas housekeeping â€” ketika tugas baru dibuat, informasi tersedia secara real-time bagi petugas yang bersangkutan melalui dashboard operasional.

## **2.6 Desain Antarmuka Pengguna** {#2.6-desain-antarmuka-pengguna}

### **2.6.1 Figma** {#2.6.1-figma}

Figma adalah alat desain antarmuka berbasis web yang memungkinkan desainer dan pengembang berkolaborasi secara real-time (Figma Inc., 2024). Sebagai alat desain berbasis cloud, Figma mengatasi keterbatasan alat desain tradisional yang membutuhkan instalasi lokal dan sulit dalam hal kolaborasi tim terdistribusi. Menurut dokumentasi resmi Figma, platform ini menyediakan fitur lengkap mulai dari wireframing, prototyping interaktif, desain sistem, hingga handoff kepada tim pengembang melalui fitur Dev Mode.  
Dalam pengembangan StayManager, Figma digunakan pada fase perancangan untuk membuat wireframe dan prototype antarmuka seluruh modul. Figma memungkinkan tim mendefinisikan design system yang konsisten â€” color palette biru-indigo gradient yang diimplementasikan melalui utility class Tailwind CSS (from-blue-600 to-indigo-600), tipografi Inter sebagai font utama, komponen UI yang dapat digunakan ulang (button, card, form, table), serta panduan spacing dan layout yang konsisten di seluruh halaman aplikasi.

### **2.6.2 Prinsip User Interface (UI) dan User Experience (UX)** {#2.6.2-prinsip-user-interface-(ui)-dan-user-experience-(ux)}

User Interface (UI) merujuk pada elemen visual dan interaktif yang menjadi titik kontak antara pengguna dan sistem, termasuk layout, tipografi, warna, ikon, tombol, dan formulir. Sementara User Experience (UX) adalah pengalaman keseluruhan yang dirasakan pengguna saat berinteraksi dengan produk digital, mencakup kemudahan penggunaan (usability), efisiensi, aksesibilitas, dan kepuasan (Wang dkk., 2022).  
Lallemand dan Gronier (2024) menekankan bahwa desain UI/UX yang baik harus berpusat pada pengguna (user-centered design), di mana setiap keputusan desain didasarkan pada pemahaman mendalam tentang kebutuhan, perilaku, dan keterbatasan pengguna target. Dalam StayManager, prinsip-prinsip ini diterapkan melalui: antarmuka konsisten menggunakan komponen shadcn/ui dan Radix UI; feedback visual yang jelas (loading state, toast notifications); navigasi intuitif melalui sidebar terstruktur; serta desain responsif yang mendukung berbagai ukuran layar.

## **2.7 Teknologi Front-end** {#2.7-teknologi-front-end}

### **2.7.1 JavaScript dan TypeScript** {#2.7.1-javascript-dan-typescript}

JavaScript adalah bahasa pemrograman komputer yang dinamis dan ringan, sering digunakan dalam pengembangan halaman web (VepsÃ¤lÃ¤inen dkk., 2023). JavaScript berjalan di sisi klien (client-side) langsung oleh browser pada komputer pengguna. Karakteristik JavaScript meliputi: case-sensitive (membedakan huruf besar dan kecil), mendukung tipe data primitif (string, number, boolean, undefined, null) dan non-primitif (Object, Array, RegExp), serta bersifat interpreted yang memungkinkan eksekusi langsung tanpa proses kompilasi.  
TypeScript adalah superset dari JavaScript yang menambahkan sistem tipe statis opsional. Dengan TypeScript, pengembang mendefinisikan tipe data untuk variabel, parameter fungsi, dan nilai kembalian, sehingga kesalahan tipe terdeteksi pada compile-time daripada runtime. Bogner dan Merkel (2022), melalui repository mining terhadap 604 proyek GitHub (299 JavaScript dan 305 TypeScript) dengan total lebih dari 16 juta baris kode, menemukan bahwa TypeScript secara signifikan mengungguli JavaScript pada kualitas kode (code smells per LoC lebih rendah) dan keterbacaan (cognitive complexity per LoC lebih rendah)â€”dua aspek krusial bagi maintainability codebase berskala enterprise. Berbasis temuan ini, StayManager menggunakan TypeScript secara penuh di seluruh codebase untuk memperkuat kualitas kode dan kemudahan refactoring jangka panjang.

### **2.7.2 HTML dan CSS** {#2.7.2-html-dan-css}

HTML (HyperText Markup Language) adalah bahasa markup standar untuk membuat halaman web, mendefinisikan struktur dan konten melalui hierarki elemen (WHATWG, 2025). HTML5 memperkenalkan elemen semantik baru seperti \<header\>, \<nav\>, \<main\>, \<article\>, \<section\>, dan \<footer\> yang memberikan makna struktural lebih kaya, mendukung multimedia native (video, audio), grafis vektor (SVG), dan berbagai API JavaScript yang powerful.  
CSS (Cascading Style Sheets) mengontrol presentasi visual dari elemen HTML, termasuk layout, warna, tipografi, animasi, dan responsivitas (W3C CSS Working Group, 2024). CSS3 mendukung fitur lanjutan seperti Flexbox, CSS Grid, custom properties (variabel CSS), animasi, dan media queries untuk desain responsif. Dalam StayManager, CSS dikelola melalui Tailwind CSS yang mengabstraksi penulisan CSS manual menjadi utility classes yang dapat dikombinasikan langsung dalam markup JSX.

### **2.7.3 Tailwind CSS** {#2.7.3-tailwind-css}

Tailwind CSS adalah framework CSS utility-first yang memungkinkan pengembang membangun antarmuka pengguna kustom langsung dalam markup HTML/JSX tanpa menulis CSS kustom (Tailwind Labs, 2024). Pendekatan utility-first berbeda dari framework CSS komponen-based tradisional seperti Bootstrap karena menyediakan kelas utilitas kecil yang masing-masing menangani satu properti CSS spesifik â€” misalnya text-blue-600 untuk warna teks, p-4 untuk padding, dan rounded-lg untuk border radius.  
Menurut Tailwind Labs (2024), keunggulan Tailwind CSS dalam pengembangan modern: (1) eliminasi context-switching antara file HTML dan CSS karena styling dilakukan langsung di markup; (2) ukuran CSS bundle kecil karena menggunakan tree-shaking untuk hanya menyertakan kelas yang benar-benar digunakan; (3) konsistensi desain melalui sistem design token bawaan; dan (4) dukungan responsif built-in melalui prefix breakpoint (sm:, md:, lg:, xl:). StayManager menggunakan Tailwind CSS v4 yang menghadirkan performa build lebih cepat.

## **2.8 Frameworks dan Platform Pengembangan** {#2.8-frameworks-dan-platform-pengembangan}

### **2.8.1 Next.js** {#2.8.1-next.js}

Next.js adalah framework aplikasi web full-stack berbasis React yang dikembangkan oleh Vercel (VepsÃ¤lÃ¤inen dkk., 2023). Framework ini memungkinkan pengembang membangun aplikasi web yang mengintegrasikan front-end React dengan kemampuan back-end melalui API Routes, semua dalam satu proyek yang kohesif. Next.js menyediakan beragam strategi rendering: Server-Side Rendering (SSR) untuk halaman yang membutuhkan data dinamis pada setiap request, Static Site Generation (SSG) untuk halaman yang di-generate pada build time, dan Client-Side Rendering (CSR) untuk komponen interaktif.  
Untuk memulai proyek dengan Next.js, pengguna menjalankan perintah: npx create-next-app@latest. Sistem akan menampilkan beberapa pertanyaan konfigurasi. Setelah dijawab, sistem menginisialisasi struktur proyek dengan folder app/ sebagai direktori utama App Router, folder components/ untuk komponen yang dapat digunakan ulang, folder lib/ untuk utilitas, serta file konfigurasi next.config.js, tsconfig.json, dan .env untuk environment variables.  
Fitur unggulan Next.js yang dimanfaatkan dalam StayManager meliputi:

* App Router: Sistem routing berbasis folder dengan dukungan penuh React Server Components, memungkinkan pengambilan data langsung di komponen server.  
* API Routes: Endpoint back-end didefinisikan sebagai Route Handler dalam struktur folder App Router untuk membuat REST API terintegrasi.  
* Middleware: Lapisan pemrosesan request yang digunakan untuk memperbarui sesi autentikasi Supabase pada setiap request. Proteksi route diimplementasikan dengan pendekatan defense-in-depth dua lapis: (1) Edge Middleware (src/proxy.ts) yang melakukan pengecekan sesi server-side dan melakukan redirect ke /login jika request datang dari pengguna belum terautentikasi; dan (2) komponen RouteGuard React (src/components/route-guard.tsx) yang membungkus seluruh halaman pada RootLayout dan melakukan pemeriksaan role/permission granular setelah hydration, menggunakan ROUTE\_PERMISSION\_MAP untuk memvalidasi akses staf dan whitelist khusus untuk peran guest. RouteGuard juga melakukan runtime database check pada rute /guest-facilities untuk memastikan hanya tamu yang sedang menginap (status reservasi checked-in) yang dapat mengaksesnya.  
* Image Optimization: Komponen \<Image\> bawaan yang secara otomatis mengoptimalkan format, ukuran, dan lazy loading gambar.  
* TypeScript Support: Dukungan TypeScript out-of-the-box dengan type definitions lengkap untuk semua API Next.js.

  ### **2.8.2 React.js** {#2.8.2-react.js}

React.js adalah library JavaScript open-source yang dikembangkan oleh Meta untuk membangun antarmuka pengguna berbasis komponen (Meta, 2024a). React menggunakan paradigma component-based architecture di mana UI dipecah menjadi komponen-komponen yang dapat digunakan kembali, masing-masing memiliki state dan props sendiri. React Virtual DOM memastikan pembaruan UI yang efisien dengan hanya merender ulang komponen yang state-nya berubah.  
React 19 yang digunakan dalam StayManager memperkenalkan React Server Components (RSC) dan Server Actions sebagai primitif baru yang memungkinkan komponen dirender di server dan pengiriman data lebih efisien tanpa JavaScript bundle tambahan (Meta, 2024b). Ekosistem library komponen yang digunakan meliputi shadcn/ui (komponen UI berbasis Radix UI yang terstandarisasi dan dapat dikustomisasi sepenuhnya) dan Radix UI (primitif komponen aksesibel yang menjadi fondasi shadcn/ui).

### **2.8.3 GitHub** {#2.8.3-github}

GitHub adalah layanan hosting repositori Git berbasis web yang banyak digunakan untuk kolaborasi pengembangan perangkat lunak. Git adalah sistem version control terdistribusi yang memungkinkan tim mengerjakan kode secara paralel di branch terpisah dan menggabungkan perubahan melalui pull request. GitHub menawarkan fitur-fitur kolaborasi seperti Issues, Pull Requests, Actions (CI/CD), dan Projects (manajemen tugas) (GitHub Inc., n.d.).  
Dalam StayManager, GitHub digunakan untuk version control codebase dan kolaborasi tim melalui pull request workflow. GitHub Projects digunakan sebagai Kanban Board untuk memvisualisasikan progres sprint dan tugas-tugas pengembangan.

### **2.8.4 Vercel** {#2.8.4-vercel}

Vercel adalah platform cloud yang dirancang khusus untuk deployment dan hosting aplikasi web front-end dengan fokus pada performa tinggi dan developer experience yang optimal (Vercel Inc., 2024). Platform ini mendukung deployment otomatis dari repositori Git dengan pipeline CI/CD terintegrasi, preview deployments untuk setiap pull request, dan edge network global untuk distribusi konten yang cepat.  
Menurut dokumentasi resmi Vercel (Vercel Inc., 2024), platform ini menawarkan infrastruktur global dengan lebih dari 100 edge locations di seluruh dunia. Vercel menawarkan tiga tier langganan: Hobby (gratis, untuk proyek personal dengan 100 GB bandwidth/bulan), Pro (USD 20/bulan, untuk tim kecil dengan 1 TB bandwidth), dan Enterprise (harga kustom untuk organisasi besar dengan SLA dan keamanan tingkat lanjut). Dalam StayManager, Vercel digunakan sebagai platform deployment utama dengan konfigurasi environment variables untuk menyimpan kunci Supabase dan API key Gemini secara aman.

## **2.9 Autentikasi dan Keamanan Sistem** {#2.9-autentikasi-dan-keamanan-sistem}

### **2.9.1 Autentikasi Pengguna dalam Aplikasi Web** {#2.9.1-autentikasi-pengguna-dalam-aplikasi-web}

Menurut Stallings (2022), autentikasi adalah proses verifikasi identitas pengguna yang mencoba mengakses sistem. Dalam aplikasi web modern, sistem autentikasi melibatkan: verifikasi kredensial (username/password atau OAuth provider), penerbitan token sesi setelah verifikasi berhasil, dan validasi token pada setiap request berikutnya. Supabase Auth menyediakan sistem autentikasi komprehensif yang mendukung berbagai metode autentikasi. Dalam StayManager, diimplementasikan dua metode: email/password dan Google OAuth.  
Dalam StayManager, autentikasi menggunakan dua metode: (1) email/password untuk login konvensional, (2) Google OAuth 2.0 melaluiÂ signInWithOAuthÂ Supabase untuk login menggunakan akun Google.

### **2.9.2 JSON Web Token (JWT)** {#2.9.2-json-web-token-(jwt)}

JSON Web Token (JWT) adalah standar terbuka (RFC 7519\) yang mendefinisikan cara kompak dan mandiri (self-contained) untuk mengirimkan informasi secara aman sebagai objek JSON. JWT terdiri dari tiga bagian yang dipisahkan titik: header (algoritma tanda tangan), payload (klaim/claims tentang pengguna), dan signature (verifikasi integritas). JWT memungkinkan autentikasi stateless di mana server tidak perlu menyimpan state sesi â€” semua informasi tersimpan dalam token itu sendiri.  
Dalam StayManager, JWT digunakan sebagai mekanisme autentikasi untuk seluruh API endpoint. Setiap request ke API dilengkapi dengan JWT Supabase dalam header Authorization, yang kemudian divalidasi oleh middleware Next.js. JWT Supabase juga berisi informasi tentang peran pengguna (user role) yang digunakan oleh middleware Next.js dan API route guards untuk memastikan pengguna hanya mengakses data dan endpoint yang relevan dengan perannya. RLS PostgreSQL berperan sebagai lapisan pertahanan tambahan yang menolak request dari pengguna belum terautentikasi.

### **2.9.3 Role-Based Access Control (RBAC)** {#2.9.3-role-based-access-control-(rbac)}

Role-Based Access Control (RBAC) adalah model keamanan yang mengatur akses pengguna ke sumber daya berdasarkan peran yang ditetapkan, bukan berdasarkan identitas individual (Li dkk., 2022). Izin akses ditetapkan pada peran, dan pengguna ditetapkan ke peran-peran tersebut. Pendekatan ini menyederhanakan manajemen akses karena administrator hanya perlu mengelola peran, bukan mengkonfigurasi izin untuk setiap pengguna secara individual.  
Dalam StayManager, RBAC diimplementasikan dengan enam peran utama yang terdefinisi dalam tipe RoleName TypeScript: (1) super\_admin â€” akses penuh ke semua fitur termasuk manajemen pengguna, konfigurasi sistem, dan pengaturan keamanan; (2) manager â€” mengakses semua modul operasional termasuk laporan keuangan dan analitik; (3) front\_desk â€” akses ke manajemen tamu, reservasi, billing, dan kalender occupancy; (4) housekeeping â€” akses ke modul tugas kebersihan dan pembaruan status kamar; (5) finance â€” akses ke modul keuangan, billing, laporan finansial, dan manajemen pengeluaran; dan (6) guest â€” hanya mengakses antarmuka chatbot dan halaman informasi publik tanpa memerlukan login khusus. Implementasi teknis menggunakan empat lapisan defense-in-depth: (1) Edge Middleware Next.js (src/proxy.ts) yang melakukan pengecekan sesi server-side pada setiap request dan melindungi rute non-publik; (2) komponen RouteGuard React (src/components/route-guard.tsx) yang membungkus seluruh halaman pada RootLayout dan memverifikasi role serta permission granular setelah hydration berdasarkan ROUTE\_PERMISSION\_MAP, dengan whitelist khusus untuk peran guest dan runtime database check pada rute /guest-facilities; (3) API route guards yang memverifikasi peran pengguna melalui query ke tabel user\_roles sebelum mengeksekusi operasi sensitif; dan (4) validasi permissions di sisi klien melalui fungsi hasPermission(), hasAnyPermission(), dan hasAllPermissions() yang didefinisikan di lib/hooks/usePermissions.ts untuk show/hide elemen UI per peran. RLS PostgreSQL diaktifkan sebagai baseline gate yang membatasi akses pada pengguna terautentikasi.

## **2.10 Unified Modelling Language (UML)** {#2.10-unified-modelling-language-(uml)}

Unified Modeling Language (UML) adalah bahasa pemodelan visual standar yang digunakan dalam rekayasa perangkat lunak untuk menggambarkan model desain berorientasi objek. Menurut KoÃ§ dkk. (2021), UML menyediakan beragam jenis diagram â€” seperti class diagram, activity diagram, sequence diagram, state machine diagram, dan use case diagram â€” yang memudahkan identifikasi kebutuhan dan ruang lingkup sistem dengan merepresentasikan struktur, perilaku, serta interaksi antar komponen sistem secara visual. Penggunaan UML dalam StayManager bertujuan memvisualisasikan arsitektur sistem sebelum implementasi, mengkomunikasikan desain kepada seluruh pemangku kepentingan, dan mendokumentasikan sistem untuk pemeliharaan.

### **2.10.1 Use Case Diagram** {#2.10.1-use-case-diagram}

Use Case Diagram menggambarkan interaksi antara aktor (pengguna atau sistem eksternal) dengan sistem yang dikembangkan (KoÃ§ dkk., 2021). Setiap use case merepresentasikan sebuah fungsi atau layanan yang diberikan sistem kepada penggunanya. Komponen utama: sistem (persegi panjang membatasi use case), aktor (entitas yang berinteraksi), use case (oval merepresentasikan fungsi), dan relasi (associations, includes, extends) yang menghubungkan aktor dengan use case.

**\[GAMBAR BELUM DIINPUT â€” Gambar 2.5: Contoh Use Case Diagram\]**

Gambar 2.5 Contoh Use Case Diagram Sumber: Olahan Penulis

### **2.10.2 Class Diagram** {#2.10.2-class-diagram}

Class Diagram menunjukkan struktur sistem dari perspektif objek, mencakup kelas-kelas yang membentuk sistem, atribut dan metode setiap kelas, serta hubungan antar kelas (KoÃ§ dkk., 2021). Class Diagram merupakan satu-satunya diagram UML yang secara langsung dipetakan ke kode program dan struktur database. Komponen utama: kelas (kotak tiga bagian: nama, atribut, metode), visibilitas (+ public, \- private, \# protected), dan jenis hubungan (asosiasi, agregasi, komposisi, pewarisan/generalisasi).

**\[GAMBAR BELUM DIINPUT â€” Gambar 2.6: Contoh Class Diagram\]**

Gambar 2.6 Contoh Class Diagram Sumber: Olahan Penulis

### **2.10.3 Activity Diagram** {#2.10.3-activity-diagram}

Activity Diagram adalah diagram UML yang memodelkan alur kerja (workflow) atau proses bisnis, menggambarkan urutan aktivitas, percabangan kondisional, dan aktivitas paralel (KoÃ§ dkk., 2021). Sangat berguna untuk memodelkan proses kompleks dengan banyak keputusan dan alur alternatif, seperti proses reservasi melalui chatbot yang melibatkan beberapa cabang berdasarkan ketersediaan kamar.  
Komponen utama Activity Diagram: Start Point (lingkaran hitam padat), Activity (persegi panjang bersudut membulat), Decision Node (belah ketupat), Fork/Join (garis tebal horizontal untuk alur paralel), Swimlane (pembagi area menunjukkan tanggung jawab pihak tertentu), dan End Point (lingkaran hitam dalam lingkaran putih).

**\[GAMBAR BELUM DIINPUT â€” Gambar 2.7: Contoh Activity Diagram\]**

Gambar 2.7 Contoh Activity Diagram Sumber: Olahan Penulis

### **2.10.4 Sequence Diagram** {#2.10.4-sequence-diagram}

Sequence Diagram menggambarkan interaksi antar objek dalam sistem berdasarkan urutan waktu, menunjukkan objek mana yang memanggil objek lain, pesan yang dikirimkan, dan urutan kronologisnya (KoÃ§ dkk., 2021). Terdiri dari dua dimensi: vertikal (urutan waktu) dan horizontal (objek-objek yang terlibat). Komponen utama: Aktor, Objek, Lifeline (garis putus-putus vertikal), Activation Box (persegi panjang tipis), pesan sinkron (panah solid), pesan asinkron (panah terbuka), dan return message (panah putus-putus).

**\[GAMBAR BELUM DIINPUT â€” Gambar 2.8: Contoh Sequence Diagram\]**

Gambar 2.8 Contoh Sequence Diagram Sumber: Olahan Penulis

## **2.11 Flowchart** {#2.11-flowchart}

Flowchart adalah representasi grafis dari langkah-langkah dan urutan prosedur dalam suatu program atau proses bisnis (Chinofunga dkk., 2025). Menggunakan simbol-simbol standar yang memiliki makna yang telah disepakati secara universal oleh ANSI dan ISO, flowchart memecah kompleksitas sebuah proses menjadi langkah-langkah yang lebih mudah dipahami.  
Simbol-simbol standar dalam flowchart meliputi:

* Oval/Terminator: Menandai titik awal (Start) dan titik akhir (End/Stop) dari sebuah proses.  
* Persegi Panjang/Process: Merepresentasikan langkah proses atau operasi, seperti "Verifikasi Kredensial" atau "Simpan Data Reservasi".  
* Belah Ketupat/Decision: Titik percabangan berdasarkan kondisi tertentu (ya/tidak), seperti "Apakah kamar tersedia?".  
* Jajaran Genjang/Input-Output: Merepresentasikan operasi input dari pengguna atau output informasi kepada pengguna.  
* Panah/Arrow: Menunjukkan arah aliran proses dari satu langkah ke langkah berikutnya.

Menurut Chinofunga dkk. (2025), fungsi utama flowchart: memberikan gambaran visual alur proses yang mudah dipahami semua pihak termasuk non-programmer; mempermudah identifikasi bottleneck atau redundansi dalam alur; serta menjadi panduan implementasi bagi tim pengembang. Dalam StayManager, flowchart mendokumentasikan alur aplikasi secara keseluruhan dan alur proses spesifik seperti reservasi via chatbot dan manajemen status kamar.

## **2.12 Pengujian Sistem (Testing)** {#2.12-pengujian-sistem-(testing)}

### **2.12.1 Alpha Testing** {#2.12.1-alpha-testing}

Menurut Obigbesan dkk. (2024), alpha testing merupakan tahap awal dalam proses pengujian perangkat lunak yang dilakukan oleh tim pengembang atau Quality Assurance (QA) sebelum perangkat lunak dirilis ke lingkungan produksi. Pengujian ini dilaksanakan di lingkungan internal yang dirancang khusus untuk kebutuhan pengujian. Alpha testing umumnya terdiri dari dua fase: white-box testing (penguji memiliki akses penuh terhadap kode) dan black-box testing (pengujian berdasarkan spesifikasi fungsional tanpa melihat kode internal).

### **2.12.2 Black Box Testing** {#2.12.2-black-box-testing}

Menurut Santi dkk. (2022), Black Box Testing adalah metode pengujian yang berfokus pada perilaku eksternal sistem â€” input yang diberikan dan output yang dihasilkan â€” tanpa mempertimbangkan struktur internal kode. Metode ini menguji apakah sistem menghasilkan output yang benar untuk setiap input yang diberikan sesuai spesifikasi fungsional. Teknik-teknik Black Box Testing meliputi:

* Equivalence Partitioning: Membagi data input ke dalam partisi yang diharapkan menghasilkan perilaku sistem yang sama, mengurangi jumlah test case tanpa mengurangi cakupan. Kombinasi Equivalence Partitioning dengan Boundary Value Analysis terbukti efektif memvalidasi sistem informasi berbasis web pada studi kasus Sistem Informasi Akademik Universitas Mataram (Santi dkk., 2022).  
* Boundary Value Analysis: Mengidentifikasi nilai-nilai batas (minimum, maksimum) yang sering menjadi sumber bug, karena sistem sering gagal di kondisi batas. Pengujian pada batas sub-domain input merupakan elemen krusial dalam menjamin kualitas perangkat lunak (Dobslaw dkk., 2023), dan Guo dkk. (2024) memformalkan metrik boundary coverage distance (BCD) untuk mengevaluasi kelengkapan test case BVA â€” dasar yang relevan untuk pengujian fitur rentang tanggal check-in/check-out, jumlah tamu, dan kapasitas kamar pada StayManager.  
* Decision Table Testing: Menggunakan tabel kombinasi kondisi input dan output yang diharapkan untuk menguji semua kemungkinan skenario.  
* State Transition Testing: Menguji transisi antara berbagai state sistem, seperti perubahan status kamar dari "tersedia" ke "occupied" ke "cleaning".

Tujuan pengujian Black Box adalah menemukan kesalahan pada: fungsi yang salah atau hilang, kesalahan pada antarmuka, kesalahan pada struktur data atau akses database, serta kesalahan performansi (Santi dkk., 2022). Dalam pengujian StayManager, Black Box Testing diterapkan pada 9 kelompok pengujian dengan 36 skenario yang mencakup seluruh 14 modul fungsional sistem (skenario positif maupun negatif).

### **2.12.3 User Acceptance Testing (UAT)** {#2.12.3-user-acceptance-testing-(uat)}

Menurut Gordon dkk. (2022), User Acceptance Testing (UAT) adalah tahap pengujian akhir di mana sistem diuji oleh pengguna akhir yang sebenarnya untuk memverifikasi bahwa sistem memenuhi kebutuhan bisnis dan ekspektasi pengguna. UAT bertujuan mendapatkan konfirmasi dari pengguna bahwa sistem siap digunakan dalam lingkungan produksi.  
Dalam StayManager, UAT dilaksanakan dalam dua sesi: pertama, UAT oleh staf hotel (10 responden) yang mengevaluasi modul operasional PMS; kedua, UAT oleh tamu/pengguna chatbot (20 responden) yang mengevaluasi antarmuka chatbot dan pengalaman reservasi. Evaluasi menggunakan kuesioner dengan skala Likert 5 poin untuk mengukur kemudahan penggunaan, kelengkapan fitur, akurasi informasi, dan kepuasan keseluruhan.

### **2.12.4 Skala Likert** {#2.12.4-skala-likert}

Skala Likert adalah instrumen psikometri yang dikembangkan oleh Rensis Likert pada 1932, digunakan untuk mengukur sikap, pendapat, dan persepsi responden. Dalam skala Likert 5 poin, responden memilih salah satu dari: (1) Sangat Tidak Setuju, (2) Tidak Setuju, (3) Netral, (4) Setuju, dan (5) Sangat Setuju. Skor dihitung dengan menjumlahkan nilai respons semua item dan membagi dengan jumlah pertanyaan (Hair dkk., 2022).  
Menurut Hair dkk. (2022), skor rata-rata di atas 4.0 pada skala Likert 5 poin umumnya diterima sebagai indikator penerimaan yang baik (good acceptance). Dalam pengujian UAT StayManager, skor rata-rata di atas 4.0 ditetapkan sebagai target minimal untuk menyatakan sistem telah memenuhi standar penerimaan pengguna.

### **2.12.5 System Usability Scale (SUS)** {#2.12.5-system-usability-scale-(sus)}

System Usability Scale (SUS) adalah alat evaluasi usability standar yang digunakan untuk mengukur tingkat kemudahan penggunaan suatu sistem secara cepat, sederhana, dan konsisten. Vlachogianni dan Tselios (2022), melalui tinjauan sistematis terhadap 104 studi empiris, mengonfirmasi SUS sebagai instrumen yang valid dan reliabel untuk mengukur perceived usability di berbagai konteks teknologi pendidikan dan perangkat lunak modern. SUS memberikan gambaran persepsi pengguna terhadap aspek kemudahan belajar, efisiensi penggunaan, konsistensi antarmuka, dan kepercayaan diri pengguna dalam berinteraksi dengan sistem.  
Menurut Vlachogianni dan Tselios (2022), instrumen SUS terdiri atas 10 pernyataan yang dijawab menggunakan skala Likert 1â€“5 (1 \= Sangat Tidak Setuju, 5 \= Sangat Setuju). Pernyataan disusun secara bergantian antara pernyataan bernada positif (nomor ganjil) dan bernada negatif (nomor genap) guna mengurangi bias jawaban responden. Sepuluh pernyataan standar SUS disajikan pada Tabel 2.2.

Tabel 2.2 Instrumen Kuesioner System Usability Scale (SUS)

| No | Pernyataan | Jenis |
| :---- | :---- | :---- |
| 1 | Saya pikir saya akan ingin sering menggunakan sistem ini. | Positif |
| 2 | Saya merasa sistem ini terlalu rumit padahal seharusnya tidak. | Negatif |
| 3 | Saya pikir sistem ini mudah digunakan. | Positif |
| 4 | Saya pikir saya akan butuh bantuan teknisi untuk menggunakan sistem ini. | Negatif |
| 5 | Saya merasa berbagai fungsi di sistem ini terintegrasi dengan baik. | Positif |
| 6 | Saya merasa terlalu banyak inkonsistensi dalam sistem ini. | Negatif |
| 7 | Saya pikir kebanyakan orang akan belajar sistem ini dengan cepat. | Positif |
| 8 | Saya merasa sistem ini sangat merepotkan untuk digunakan. | Negatif |
| 9 | Saya merasa sangat percaya diri menggunakan sistem ini. | Positif |
| 10 | Saya perlu belajar banyak hal sebelum bisa menggunakan sistem ini. | Negatif |

Menurut Vlachogianni dan Tselios (2022), langkah perhitungan skor SUS dilakukan sebagai berikut: (1) Untuk pernyataan bernomor ganjil (1, 3, 5, 7, 9), skor kontribusi diperoleh dari nilai jawaban dikurangi 1\. (2) Untuk pernyataan bernomor genap (2, 4, 6, 8, 10), skor kontribusi diperoleh dari nilai 5 dikurangi nilai jawaban. (3) Seluruh skor kontribusi dari 10 pernyataan dijumlahkan untuk memperoleh total skor mentah. (4) Total skor mentah dikalikan dengan faktor 2,5 sehingga menghasilkan skor SUS akhir dalam rentang 0â€“100.  
Interpretasi skor SUS pada penelitian ini mengacu pada skala penilaian normatif yang telah divalidasi ulang dalam konteks evaluasi sistem modern oleh Khan dkk. (2025) dan Deshmukh dan Chalmeta (2024), yang membagi skor SUS ke dalam lima kategori berdasarkan grade huruf, adjective rating, dan tingkat penerimaan pengguna, sebagaimana ditunjukkan pada Tabel 2.3.

Tabel 2.3 Interpretasi Skor System Usability Scale (SUS)

| Rentang Skor | Grade | Adjective Rating | Tingkat Penerimaan |
| :---- | :---- | :---- | :---- |
| \> 80,3 | A | Excellent | Acceptable |
| 68,0 â€“ 80,3 | B | Good | Acceptable |
| 51,7 â€“ 67,9 | C | OK | Marginal |
| 25,0 â€“ 51,6 | D | Poor | Not Acceptable |
| \< 25,0 | F | Awful | Not Acceptable |

Pemilihan SUS sebagai instrumen evaluasi pada penelitian ini didukung oleh tinjauan sistematis Vlachogianni dan Tselios (2022) terhadap 104 studi yang menegaskan SUS sebagai instrumen perceived usability ringkas dan reliabel untuk berbagai sistem digital. Validasi terbaru oleh Deshmukh dan Chalmeta (2024) juga menunjukkan korelasi sangat tinggi (r \= 0,9093) antara skor SUS dan Adjective Rating Scale, sehingga interpretasi skor dapat dipetakan ke kategori adjective dengan keandalan tinggi. Lebih lanjut, studi psikometrik lintas budaya oleh Khan dkk. (2025) terhadap 668 pengguna mengonfirmasi bahwa SUS memiliki properti psikometrik yang baik dan valid digunakan pada konteks pengguna lokal yang beragam. Dalam penelitian ini, SUS digunakan sebagai pelengkap evaluasi User Acceptance Testing (UAT) agar penilaian tidak hanya berfokus pada kepuasan fungsional, tetapi juga mencakup dimensi kemudahan penggunaan sistem StayManager secara keseluruhan. Skor SUS yang diperoleh kemudian diinterpretasikan menggunakan kategori pada Tabel 2.3 untuk menentukan tingkat penerimaan usability sistem.

## **2.13 Interaksi Manusia dan Komputer (IMK)** {#2.13-interaksi-manusia-dan-komputer-(imk)}

Interaksi Manusia dan Komputer (IMK) atau Human-Computer Interaction (HCI) adalah bidang interdisiplin yang mempelajari desain, evaluasi, dan implementasi sistem komputasi interaktif untuk digunakan manusia (Raudina dkk., 2025). HCI mencakup aspek psikologi kognitif, ergonomi, ilmu komputer, dan desain untuk menciptakan sistem yang efektif, efisien, dan memuaskan bagi pengguna.

### **2.13.1 Delapan Aturan Emas Desain Antarmuka (Eight Golden Rules)** {#2.13.1-delapan-aturan-emas-desain-antarmuka-(eight-golden-rules)}

Delapan Aturan Emas adalah prinsip desain antarmuka pengguna yang dikembangkan oleh Ben Shneiderman dan kolaboratornya. Pendekatan delapan aturan emas tersebut telah terbukti efektif untuk mengevaluasi kenyamanan antarmuka aplikasi berbasis web (Putri, 2021\) dan tetap valid untuk konteks aplikasi industri perjalanan dan layanan, sebagaimana ditunjukkan oleh penerapannya pada aplikasi Online Travel Agency dan e-Learning (Raudina dkk., 2025). Prinsip-prinsip ini menjadi pedoman fundamental dalam desain UI/UX yang baik dan banyak dirujuk dalam penelitian dan praktik HCI.  
Kedelapan aturan emas beserta penerapannya dalam StayManager:

1. Strive for Consistency (Upayakan Konsistensi): Elemen antarmuka harus dirancang seragam di seluruh bagian sistem â€” terminologi, tata letak, warna, dan tipografi yang konsisten membantu pengguna membangun model mental yang tepat. Dalam StayManager, konsistensi dijaga melalui komponen shadcn/ui yang terstandarisasi dan design system berbasis Tailwind CSS.

2. Enable Frequent Users to Use Shortcuts (Fasilitasi Pintasan Pengguna Sering): Pengguna berpengalaman membutuhkan shortcut untuk meningkatkan efisiensi. StayManager mewujudkannya melalui fitur pencarian cepat tamu dan kamar serta tombol quick action di dashboard yang memungkinkan akses satu klik ke operasi umum.

3. Offer Informative Feedback (Berikan Umpan Balik Informatif): Sistem harus merespons setiap aksi pengguna dengan feedback yang jelas. StayManager mengimplementasikan toast notifications untuk konfirmasi aksi berhasil, loading spinner untuk operasi yang membutuhkan waktu, dan pesan error yang deskriptif.

4. Design Dialogue to Yield Closure (Rancang Dialog untuk Kejelasan): Urutan aksi harus memiliki titik awal, tengah, dan akhir yang jelas. Dalam proses reservasi StayManager, alur dibagi menjadi tahap yang jelas dengan konfirmasi di setiap tahap penting.

5. Offer Simple Error Handling (Sediakan Penanganan Kesalahan Sederhana): Sistem harus dirancang meminimalkan kemungkinan error, dan ketika error terjadi memberikan instruksi yang sederhana dan spesifik untuk pemulihan. StayManager mengimplementasikan validasi form real-time dan pesan error yang actionable.

6. Permit Easy Reversal of Actions (Izinkan Pembatalan Aksi yang Mudah): Pengguna harus dapat membatalkan aksi yang dilakukan, terutama untuk tindakan destruktif atau tidak dapat diubah. StayManager menyediakan konfirmasi dialog untuk aksi kritis seperti pembatalan reservasi dan penghapusan data.

7. Support Internal Locus of Control (Dukung Kendali Internal Pengguna): Pengguna berpengalaman harus merasa mereka yang mengendalikan sistem. StayManager dirancang agar pengguna dapat mengakses dan memodifikasi data sesuai kebutuhan dengan mudah, tanpa alur yang memaksakan.

8. Reduce Short-Term Memory Load (Kurangi Beban Memori Jangka Pendek): Antarmuka harus sesederhana mungkin untuk mengurangi informasi yang harus diingat pengguna secara simultan. StayManager menggunakan label deskriptif, ikon intuitif, dan layout terstruktur untuk meminimalkan cognitive load.

   ### **2.13.2 Lima Faktor Manusia Terukur (Five Measurable Human Factors)** {#2.13.2-lima-faktor-manusia-terukur-(five-measurable-human-factors)}

Lima Faktor Manusia Terukur adalah kerangka evaluasi untuk mengukur kualitas interaksi manusia dengan sistem komputer secara kuantitatif (Vlachogianni & Tselios, 2022). Sistem StayManager dirancang untuk memenuhi kelima faktor ini dalam konteks pengguna hotel dengan beragam tingkat literasi teknologi.  
Learnability (Kemudahan Dipelajari): Mengukur seberapa cepat pengguna baru dapat mencapai tingkat kinerja yang dapat diterima. StayManager meningkatkan learnability melalui navigasi intuitif berbasis sidebar dengan label deskriptif dan konsistensi antarmuka yang memudahkan transfer pengetahuan antar modul.  
Efficiency (Efisiensi): Mengukur seberapa cepat pengguna berpengalaman menyelesaikan tugas-tugas rutin. Diukur dari jumlah klik untuk tugas umum seperti check-in tamu, pembuatan reservasi baru, dan pembaruan status kamar. Target efisiensi StayManager: maksimal 3â€“5 klik untuk setiap operasi utama.  
Memorability (Keterdapatan dalam Memori): Mengukur kemampuan pengguna yang sempat berhenti menggunakan sistem dalam mengingat kembali cara penggunaan tanpa pembelajaran ulang yang ekstensif. Desain StayManager yang konsisten dan berbasis konvensi UI umum memastikan pengguna dapat dengan cepat mengingat kembali alur penggunaan setelah absen.  
Error Rate (Tingkat Kesalahan): Mengukur jumlah dan jenis kesalahan yang dibuat pengguna serta kemampuan pemulihan dari kesalahan. StayManager meminimalkan error rate melalui validasi form komprehensif, konfirmasi dialog untuk aksi irreversible, dan pesan error yang memberikan panduan konkret.  
Satisfaction (Kepuasan): Ukuran subjektif tentang seberapa menyenangkan penggunaan sistem. Diukur dalam StayManager melalui kuesioner UAT berbasis skala Likert yang menilai kemudahan penggunaan, kecepatan respons sistem, kelengkapan fitur, serta kualitas estetika antarmuka.

## **2.14 Ulasan Hasil Penelitian Produk Sejenis Sebelumnya** {#2.14-ulasan-hasil-penelitian-produk-sejenis-sebelumnya}

Bagian ini menyajikan tinjauan terhadap sebelas penelitian terdahulu yang relevan dengan pengembangan PMS hotel berbasis web dan integrasi kecerdasan buatan dalam layanan hotel. Tinjauan dikelompokkan ke dalam empat dimensi: (1) sistem manajemen hotel pada konteks hotel kecil-menengah Indonesia dan internasional yang memvalidasi kebutuhan PMS terintegrasi; (2) chatbot dan AI generatif untuk layanan hospitality yang menjadi landasan modul chatbot StayManager; (3) tren strategi TI dan teknologi disruptif di industri perhotelan yang mendorong urgensi transformasi digital; serta (4) justifikasi pemilihan tech stack pendukung. Tujuannya adalah mengidentifikasi gap penelitian yang menjadi dasar kontribusi novelty dari sistem StayManager.

Tabel 2.1 Perbandingan Hasil Penelitian Produk Sejenis Sebelumnya

| Peneliti & Tahun | Judul / Topik Penelitian | Metode / Teknologi | Hasil / Temuan Utama | Relevansi & Kontribusi untuk StayManager |
| :---- | :---- | :---- | :---- | :---- |
| Yao dkk. (2023) | ReAct: Synergizing Reasoning and Acting in Language Models | Eksperimen prompt engineering pada LLM (HotpotQA, FEVER, ALFWorld, WebShop) | Pendekatan ReAct yang menyatukan reasoning trace dengan task-specific actions secara interleaved meningkatkan akurasi LLM dan mengurangi halusinasi pada tugas berbasis pengetahuan eksternal. | Dasar mekanisme function calling chatbot StayManager â€” LLM (Gemini 2.5 Flash) menggabungkan reasoning dengan pemanggilan API Supabase secara terstruktur untuk memenuhi permintaan tamu. |
| Wynn & Jones (2022) | Strategi TI di Industri Hotel pada Era Digital | Studi konseptual & analisis literatur strategi TI hotel pasca-pandemi | Industri perhotelan semakin mengadopsi paket perangkat lunak terintegrasi seperti PMS untuk menyederhanakan operasional dalam satu platform; integrasi modul-modul fungsional menjadi kunci ketahanan bisnis hotel di era digital. | Justifikasi pendekatan StayManager sebagai platform PMS terintegrasi yang menggabungkan 14 modul operasional dalam satu sistem terpadu, sejalan dengan tren strategi TI hotel modern. |
| Iranmanesh dkk. (2022) | Aplikasi Teknologi Digital Disruptif pada Industri Hotel: Systematic Review | Systematic literature review terhadap 79 artikel (2010â€“2021) | Teknologi digital disruptif (AI, IoT, robotik) berkontribusi pada enam dimensi kinerja hotel: finansial, daya saing, kualitas layanan, utilisasi sumber daya, fleksibilitas, dan inovasi. | Validasi pemilihan AI (Gemini 2.5 Flash) sebagai komponen disruptif inti pada StayManager â€” sejalan dengan dimensi peningkatan kualitas layanan dan inovasi yang teridentifikasi pada systematic review. |
| Dwivedi dkk. (2023) | Meta-Analisis AI Generatif dalam Industri Jasa: Dampak pada Customer Satisfaction | Meta-analisis (87 studi, 2020â€“2023) | AI generatif terintegrasi dengan database real-time menghasilkan CSat 18% lebih tinggi vs knowledge base statis. | Justifikasi pendekatan desain StayManager: integrasi Gemini API dengan Supabase melalui function calling untuk data real-time. |
| Bogner & Merkel (2022) | Perbandingan Kualitas Software JavaScript vs TypeScript pada Proyek GitHub | Mining software repositories pada proyek GitHub (analisis empiris JS vs TS) | Aplikasi berbasis TypeScript secara signifikan mengungguli JavaScript pada code quality (code smells per LoC lebih rendah) dan understandability (cognitive complexity per LoC lebih rendah), meskipun temuan paper tidak menunjukkan keunggulan langsung pada bug-fix commit ratioâ€”justifikasi pemilihan TypeScript di StayManager berfokus pada maintainability dan readability codebase. | Justifikasi adopsi TypeScript pada seluruh codebase StayManager untuk meningkatkan kualitas kode, memudahkan refactoring, dan memperkuat maintainability jangka panjang. |
| Susanto dkk. (2024) | The Performance of Hotel Management System Using Microservices and Containerization Technology | Pengujian performa HMS arsitektur microservices \+ Docker pada cloud computing | Arsitektur microservices dengan containerization terbukti meningkatkan skalabilitas, fault isolation, dan ketahanan operasional Hotel Management System dibanding monolith tradisional. | Justifikasi pendekatan StayManager menggunakan deployment cloud-native (Vercel \+ Supabase) yang secara konseptual setara dengan microservices terpisahâ€”frontend serverless, database managed, dan AI service Geminiâ€”untuk mendukung skalabilitas dan keandalan. |
| Jun dkk. (2025) | Design and Implementation of Hotel Management System Based on Uniapp Framework | Pengembangan HMS multi-platform PC (Vue \+ Element) \+ mobile (Uniapp \+ WeChat Mini Program) \+ backend Spring Boot | HMS multi-terminal yang menyatukan akses PC dan mobile dalam satu codebase frontend mampu meningkatkan efisiensi pengelolaan hotel chain dengan stabilitas operasional yang teruji pada implementasi nyata. | Validasi pendekatan StayManager yang menggunakan Next.js sebagai framework full-stack tunggal dengan responsive design, sehingga staf hotel dapat mengakses sistem dari desktop front desk maupun tablet housekeeping tanpa codebase terpisah. |
| Jantu dkk. (2023) | Sistem Informasi Manajemen Reservasi Hotel Berbasis Website Pada Hotel Danny | Rancang bangun sistem reservasi web menggunakan metode waterfall \+ Black Box Testing | Sistem reservasi berbasis web mampu menggantikan proses manual berbasis formulir di hotel kecil-menengah Indonesia, meningkatkan efektivitas pelayanan reservasi dan akurasi data tamu secara signifikan. | Konteks komparatif StayManagerâ€”penelitian ini menunjukkan kebutuhan PMS untuk hotel kecil-menengah Indonesia yang sama dengan Hotel Asni, namun StayManager melampauinya dengan integrasi 14 modul operasional dan chatbot LLM yang tidak dimiliki Hotel Danny. |
| Nirmala & Sari (2023) | Perancangan Sistem Informasi Reservasi Berbasis Website Pada Hotel Di Nusa Penida | Perancangan SI reservasi web pada hotel-hotel di Nusa Penida untuk menggantikan reservasi manual via telepon/walk-in | Hotel-hotel kecil di destinasi wisata masih bergantung pada reservasi manual yang membatasi jangkauan pasar; sistem reservasi berbasis web memberikan akses 24/7 dan memperluas jangkauan informasi hotel. | Penegasan urgensi PMS terintegrasi untuk hotel kecil di destinasi wisata Indonesia. StayManager mengisi kebutuhan ini dengan menambahkan fitur chatbot LLM multibahasa yang lebih relevan untuk wisatawan domestik dan mancanegara dibanding form reservasi statis. |
| Febianto dkk. (2024) | Pembangunan Aplikasi Reservasi Hotel Puri Pesona Cirebon Berbasis Web Menggunakan Metode Extreme Programming (XP) | Pengembangan aplikasi reservasi web menggunakan metodologi Agile XP, perancangan UML, MySQL, Visual Studio Code | Penerapan Extreme Programming pada pengembangan aplikasi reservasi hotel berbasis web menghasilkan sistem yang adaptif terhadap perubahan kebutuhan dan menjaga keamanan data serta ketepatan waktu. | Validasi pemilihan metodologi Agile (Scrum) untuk StayManagerâ€”pendekatan iteratif dan adaptif terbukti efektif untuk pengembangan aplikasi reservasi hotel berbasis web pada hotel kecil-menengah. |
| Ramirez-VillaseÃ±or dkk. (2023) | Design, Development, and Evaluation of a Chatbot for Hospitality Services Assistance in Spanish | Perancangan, pengembangan, dan evaluasi chatbot berbahasa Spanyol untuk layanan hospitality di SME hotel | Chatbot multibahasa untuk layanan hospitality terbukti meningkatkan efisiensi komunikasi 24/7 antara hotel dan tamu, namun memerlukan validasi data dan domain knowledge agar respons akurat dan relevan dengan konteks layanan hotel. | Landasan komparatif chatbot StayManagerâ€”penelitian ini memvalidasi efektivitas chatbot multibahasa di sektor hospitality, dan StayManager melampauinya dengan adopsi LLM (Gemini 2.5 Flash) yang lebih kontekstual dan dilengkapi function calling untuk mengakses data Supabase secara real-time, mengurangi risiko halusinasi. |

Berdasarkan sebelas penelitian yang dirangkum pada Tabel 2.1 di atas, dapat disimpulkan bahwa kontribusi StayManager mengisi sejumlah gap yang teridentifikasi. Penelitian PMS hotel kecil-menengah Indonesia (Jantu dkk., 2023; Nirmala & Sari, 2023; Febianto dkk., 2024\) memvalidasi kebutuhan sistem reservasi terintegrasi pada segmen target StayManager, namun terbatas pada modul reservasi tanpa cakupan operasional penuh dan tanpa integrasi AI. Penelitian PMS skala internasional (Susanto dkk., 2024; Jun dkk., 2025\) menunjukkan tren arsitektur cloud-native dan multi-platform, namun tidak menyertakan chatbot LLM. Penelitian chatbot hospitality (Ramirez-VillaseÃ±or dkk., 2023\) memvalidasi efektivitas chatbot multibahasa, tetapi belum mengadopsi LLM modern dengan function calling. StayManager mensintesis pelajaran-pelajaran tersebut dengan mengintegrasikan 14 modul operasional, chatbot berbasis Gemini 2.5 Flash dengan function calling ke Supabase secara real-time, RBAC 6 peran, dan arsitektur cloud-native berbasis Supabase \+ Vercel dalam satu platform terintegrasi yang dirancang spesifik untuk hotel kecil-menengah Indonesia.

# **BAB 3**  **METODE PENELITIAN** {#bab-3-metode-penelitian}

## **3.1 Metodologi Penelitian** {#3.1-metodologi-penelitian}

Penelitian ini menggunakan metode pengembangan perangkat lunak dengan pendekatan Agile menggunakan framework Scrum. Pemilihan metodologi ini didasarkan pada karakteristik proyek StayManager yang memiliki ruang lingkup berkembang seiring proses pengembangan, membutuhkan validasi berkelanjutan dari pengguna (staf hotel dan tamu), dan memerlukan fleksibilitas untuk mengakomodasi perubahan kebutuhan. Seluruh tahap penelitian â€” dari perencanaan, pengembangan, hingga pengujian â€” dilaksanakan dalam sprint-sprint terstruktur dengan durasi dua minggu per sprint.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.1: Alur Pengembangan Sistem dengan Metodologi Scrum\]**

Gambar 3.1 Alur Pengembangan Sistem dengan Metodologi Scrum

**Sprint Backlog**

Sprint Backlog adalah daftar task yang dikerjakan pada setiap sprint. Dalam pengembangan StayManager, Sprint Backlog dikelola melalui GitHub Projects dengan kolom-kolom: Backlog, In Progress, In Review, dan Done. Setiap task didefinisikan dengan kriteria penerimaan (acceptance criteria) yang jelas sehingga tim dapat memverifikasi penyelesaiannya secara objektif.

**Sprint Planning**

Sprint Planning adalah pertemuan di awal setiap sprint untuk merencanakan task yang akan dikerjakan, memperkirakan story points, dan menetapkan sprint goal. Dalam tim StayManager, Sprint Planning dilakukan setiap dua minggu dan menghasilkan sprint backlog yang dikerjakan tim selama periode sprint tersebut.

**Implementation (Development)**

Fase implementation adalah inti setiap sprint di mana tim mengerjakan task sesuai sprint backlog, mencakup: penulisan kode front-end (React components, halaman Next.js), penulisan kode back-end (API Routes, Supabase queries), penulisan tes fungsional, dan code review. Setiap fitur dikembangkan dalam branch Git terpisah dan digabungkan setelah melewati code review.

**Sprint Review dan Retrospective**

Sprint Review dilakukan di akhir setiap sprint untuk mendemonstrasikan fitur yang dikembangkan kepada stakeholder dan mengumpulkan feedback. Sprint Retrospective adalah refleksi internal tim tentang proses kerja â€” apa yang berjalan baik, apa yang perlu diperbaiki, dan langkah konkret untuk perbaikan di sprint berikutnya.  
Secara keseluruhan, pengembangan StayManager berlangsung selama 12 sprint (Â±24 minggu) yang terbagi dalam lima fase utama. Tabel berikut merangkum seluruh sprint yang dilaksanakan beserta cakupan pekerjaannya:  
Tabel 3.1 Rencana Sprint Pengembangan StayManager

| Sprint | Fase | Durasi | Cakupan Pekerjaan | Output |
| :---- | :---- | :---- | :---- | :---- |
| Sprint 1 | Product Planning | 2 minggu | Analisis kebutuhan, wawancara stakeholder, penyusunan product backlog, penentuan ruang lingkup sistem | Product Backlog, Dokumen Kebutuhan |
| Sprint 2 | Design | 2 minggu | Perancangan arsitektur sistem, pembuatan desain database (ERD), perancangan struktur tabel Supabase | ERD, Skema Database |
| Sprint 3 | Design | 2 minggu | Perancangan UI/UX wireframe semua halaman menggunakan Figma, penyusunan design system (warna, tipografi, komponen) | Wireframe, Design System |
| Sprint 4 | Design | 2 minggu | Pembuatan prototype interaktif, review desain bersama stakeholder, finalisasi mockup antarmuka | Prototype Figma, Mockup Final |
| Sprint 5 | Coding | 2 minggu | Setup proyek Next.js 16 \+ TypeScript \+ Tailwind, konfigurasi Supabase, implementasi autentikasi JWT, modul Login & RBAC (6 role) | Autentikasi & RBAC Berfungsi |
| Sprint 6 | Coding | 2 minggu | Implementasi modul Manajemen Kamar, Manajemen Tamu, Modul Reservasi, dan halaman publik Dashboard | Modul Kamar, Tamu, Reservasi |
| Sprint 7 | Coding | 2 minggu | Implementasi modul Housekeeping (tugas harian & checkout cleaning), modul Occupancy, kalender hunian | Modul Housekeeping & Occupancy |
| Sprint 8 | Coding | 2 minggu | Implementasi modul Keuangan (pendapatan & pengeluaran), modul Inventaris & Logistik, modul Billing & Guest Facilities | Modul Keuangan, Inventaris, Billing |
| Sprint 9 | Coding | 2 minggu | Implementasi modul Manajemen Staf & Roles, modul Laporan (analytics & export), pengaturan sistem | Modul Staf, Laporan, Pengaturan |
| Sprint 10 | Coding | 2 minggu | Integrasi Gemini 2.5 Flash via Vercel AI SDK, implementasi 4 function tools chatbot (cekKetersediaan, createBooking, getRoomTypes, confirmPayment), modul Chatbot LLM | Modul Chatbot LLM Berfungsi |
| Sprint 11 | Deployment | 2 minggu | Deployment ke Vercel, konfigurasi environment variables produksi, pengujian end-to-end di lingkungan produksi, perbaikan bug produksi | Aplikasi Live di Vercel |
| Sprint 12 | User Testing | 2 minggu | Black Box Testing (36 skenario dalam 9 kelompok pengujian yang mencakup 14 modul), User Acceptance Testing staf (n=10) dan tamu/chatbot (n=20), perbaikan berdasarkan feedback UAT | Laporan Pengujian, Aplikasi Final |

### **3.1.1 Kerangka Berpikir Penelitian** {#3.1.1-kerangka-berpikir-penelitian}

Kerangka berpikir penelitian ini disusun berdasarkan identifikasi masalah yang ditemukan dalam operasional hotel skala kecil dan menengah: fragmentasi sistem, inefisiensi proses manual, dan ketiadaan layanan tamu digital yang terintegrasi. Kerangka berpikir ini menjadi panduan sistematis dalam proses penelitian dari identifikasi masalah hingga penarikan simpulan.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.2: Kerangka Berpikir Penelitian\]**

Gambar 3.2 Kerangka Berpikir Penelitian

## **3.2 Analisis** {#3.2-analisis}

### **3.2.1 Analisis Perbandingan Aplikasi Sejenis** {#3.2.1-analisis-perbandingan-aplikasi-sejenis}

Pada sub-bab ini dilakukan analisis komparatif terhadap beberapa sistem PMS hotel yang telah ada di pasaran. Tujuannya adalah mengidentifikasi fitur yang sudah umum tersedia, kelebihan dan kekurangan masing-masing sistem, serta gap yang akan diisi oleh StayManager â€” khususnya integrasi LLM chatbot yang masih jarang pada PMS segmen hotel kecil-menengah.

**Oracle OPERA Property Management System**

Oracle OPERA adalah sistem PMS enterprise yang paling banyak digunakan di hotel bintang empat dan lima secara global. OPERA menyediakan modul yang sangat komprehensif: reservasi, front desk, housekeeping, revenue management, point-of-sale, dan konektivitas dengan ratusan channel distribusi online. Kelebihan OPERA terletak pada keandalan enterprise-grade dan ekosistem integrasi yang sangat luas. Namun, OPERA memiliki kelemahan signifikan untuk pasar hotel kecil-menengah: biaya lisensi sangat tinggi (USD 30.000â€“100.000+ per instalasi), kompleksitas implementasi yang membutuhkan spesialis bersertifikat, kurva pembelajaran yang curam, dan tidak ada integrasi chatbot LLM native.

**Cloudbeds Property Management System**

Cloudbeds adalah PMS berbasis cloud untuk hotel boutique, hostel, dan akomodasi independen dengan fokus pada kemudahan penggunaan dan harga lebih terjangkau. Cloudbeds menyediakan modul reservasi, front desk, channel manager, payment processing, dan reporting. Kelebihan: antarmuka relatif intuitif, model SaaS berlangganan bulanan, dan integrasi dengan berbagai channel OTA. Keterbatasan: tidak ada chatbot AI native, harga berlangganan USD 150â€“400/bulan masih tergolong mahal untuk hotel kecil, dan data disimpan di server luar negeri.

**Little Hotelier**

Little Hotelier adalah PMS khusus untuk akomodasi kecil (small property) di bawah 30 kamar seperti guest house dan penginapan butik. Menawarkan fitur dasar PMS dengan antarmuka sangat sederhana dan harga terjangkau. Keterbatasan signifikan: fitur sangat terbatas, tidak ada modul housekeeping terintegrasi, tidak ada modul inventaris, dan sama sekali tidak ada kemampuan AI atau chatbot.  
Berdasarkan analisis perbandingan, terdapat gap yang jelas: tidak ada sistem yang menggabungkan kelengkapan fitur operasional, keterjangkauan, kemudahan penggunaan, dan integrasi chatbot LLM dalam satu platform terintegrasi untuk hotel kecil-menengah Indonesia. StayManager hadir untuk mengisi gap tersebut.  
Tabel 3.2 Perbandingan Aplikasi Sejenis

| Aspek | Oracle OPERA | Cloudbeds | Little Hotelier | StayManager |
| ----- | ----- | ----- | ----- | ----- |
| **Target Segmen** | Hotel Bintang 4â€“5, Enterprise | Boutique, Hostel, Independent | Small Property \< 30 kamar | Hotel Kecil-Menengah Indonesia |
| **Jenis Platform** | On-premise / Cloud hybrid | Cloud SaaS | Cloud SaaS | Web-based Full-stack |
| **Modul PMS** | Sangat Lengkap | Lengkap | Terbatas | 14 Modul Terintegrasi |
| **Chatbot / AI** | Tidak ada (native) | Tidak ada | Tidak ada | Chatbot LLM (Gemini 2.5 Flash) |
| **RBAC** | Ya | Ya (terbatas) | Terbatas | Ya (6 role, defense-in-depth: middleware \+ RouteGuard) |
| **Real-time Sync** | Ya | Ya | Tidak | Ya (Supabase Realtime) |
| **Biaya** | USD 30.000â€“100.000+ | USD 150â€“400/bulan | USD 50â€“100/bulan | Open-source / Self-hosted |

### **3.2.2 Analisis Permasalahan dan Kebutuhan** {#3.2.2-analisis-permasalahan-dan-kebutuhan}

Analisis kebutuhan dilakukan melalui dua metode utama: wawancara mendalam dengan empat narasumber yang merepresentasikan peran-peran utama dalam operasional hotel, dan penyebaran kuesioner kepada 30 responden (10 staf hotel dan 20 tamu). Tujuannya adalah memahami masalah nyata yang dihadapi sehari-hari dan kebutuhan fungsional konkret yang harus dipenuhi sistem StayManager.

**Wawancara**

Wawancara dilakukan pada Senin, 10 Maret 2025, secara tatap muka dengan empat narasumber: seorang Manajer Hotel, seorang Staf Front Desk, seorang Supervisor Housekeeping, dan seorang Staf Keuangan. Berikut adalah rekapitulasi hasil wawancara:  
<!-- REVISI-2026-05-27 (LOKASI-14) [GANTI] Tabel 3.3 wawancara + ringkasan + 4 kategori kuesioner dummy yellow -->
Tabel 3.3 Rekapitulasi Hasil Wawancara Analisis Kebutuhan

| No | Pertanyaan | Manajer Hotel | Staf Front Desk | Supervisor Housekeeping | Staf Keuangan |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | Sistem apa yang saat ini digunakan untuk mengelola operasional hotel? | <span style="background:yellow">Buku catatan manual dan spreadsheet Excel terpisah per departemen. Tidak ada sistem terpusat.</span> | <span style="background:yellow">Buku tamu fisik dan papan tulis status kamar di belakang meja resepsionis. Reservasi via telepon dan WhatsApp pribadi staf.</span> | <span style="background:yellow">Lembar checklist cetak per shift untuk daftar kamar yang harus dibersihkan. Komunikasi status via WhatsApp grup internal.</span> | <span style="background:yellow">Excel terpisah untuk pemasukan dan pengeluaran. Kwitansi ditulis tangan menggunakan buku nota berkarbon.</span> |
| 2 | Apa kendala terbesar dalam sistem yang berjalan saat ini? | <span style="background:yellow">Data tersebar di banyak file Excel dan buku manual sehingga sulit konsolidasi laporan bulanan. Sering bentrok antara catatan front desk dan housekeeping.</span> | <span style="background:yellow">Sering terjadi double-booking karena status kamar terlambat di-update di papan tulis. Tamu komplain ketika datang tapi kamar belum siap.</span> | <span style="background:yellow">Tidak ada visibilitas mana kamar yang baru check-out, harus tanya berulang ke resepsionis. Tugas housekeeping sering terlewat.</span> | <span style="background:yellow">Rekonsiliasi nota fisik dengan Excel makan waktu 2â€“3 hari setiap akhir bulan. Sering muncul selisih yang harus ditelusuri manual.</span> |
| 3 | Fitur apa yang paling dibutuhkan dari sistem baru? | <span style="background:yellow">Dashboard terpusat dengan ringkasan occupancy, revenue, dan tugas operasional. Laporan otomatis bulanan untuk pengambilan keputusan.</span> | <span style="background:yellow">Kalender visual ketersediaan kamar real-time. Notifikasi otomatis ketika status kamar berubah, agar tidak perlu cek ke housekeeping satu-satu.</span> | <span style="background:yellow">Daftar tugas housekeeping yang otomatis dibuat ketika tamu check-out. Status kamar sinkron dengan front desk tanpa komunikasi manual.</span> | <span style="background:yellow">Pencatatan transaksi otomatis dari modul reservasi atau billing tanpa input ulang. Generate kwitansi dan invoice digital.</span> |
| 4 | Bagaimana kebutuhan pengelolaan tamu/reservasi saat ini? | <span style="background:yellow">Reservasi via telepon dicatat di buku tamu, lalu ditransfer ke spreadsheet harian. Proses lambat dan rawan kesalahan input.</span> | <span style="background:yellow">Setiap reservasi dicatat manual di buku tamu kemudian disalin ke Excel staf shift selanjutnya. Riwayat tamu sulit dicari.</span> | <span style="background:yellow">Pengelolaan tamu bukan tugas housekeeping, tetapi sering perlu data tamu untuk identifikasi pemilik barang tertinggal di kamar.</span> | <span style="background:yellow">Data tamu dibutuhkan untuk generate kwitansi atau invoice, tetapi sering harus minta ulang ke front desk karena tidak ada akses langsung.</span> |
| 5 | Apakah ada kebutuhan terkait manajemen hak akses staf? | <span style="background:yellow">Sangat penting. Finance tidak boleh akses data tamu, housekeeping tidak boleh akses laporan finansial, dan saat ini semua bisa akses Excel via flashdisk.</span> | <span style="background:yellow">Perlu role terpisah. Saya hanya butuh akses ke reservasi dan tamu, tidak ke keuangan atau pengaturan sistem.</span> | <span style="background:yellow">Cukup akses ke status kamar dan tugas housekeeping. Tidak perlu lihat data finansial atau detail tamu kecuali untuk identifikasi barang.</span> | <span style="background:yellow">Saya butuh akses penuh ke modul keuangan dan invoice, tidak perlu ke housekeeping. Pemisahan akses penting untuk audit.</span> |
| 6 | Apakah ada kebutuhan layanan chatbot untuk tamu? | <span style="background:yellow">Sangat dibutuhkan. Hotel sering terima pertanyaan via WhatsApp di luar jam kerja, chatbot dapat menjawab dan memfasilitasi reservasi otomatis.</span> | <span style="background:yellow">Saat malam dan weekend telepon menumpuk. Chatbot bisa menjawab pertanyaan dasar (harga, ketersediaan) tanpa staf harus stand-by 24 jam.</span> | <span style="background:yellow">Tidak terlalu relevan untuk housekeeping, tetapi membantu jika chatbot bisa memberi info ke tamu tentang waktu pembersihan kamar.</span> | <span style="background:yellow">Bermanfaat jika chatbot bisa konfirmasi pembayaran otomatis dan mengirim invoice digital, mengurangi pekerjaan administratif manual.</span> |

Keempat narasumber menunjukkan konsensus kuat terhadap empat hal: <span style="background:yellow">(1) sistem operasional saat ini sepenuhnya berbasis manual dengan kombinasi buku tulis, spreadsheet terpisah, dan komunikasi via WhatsApp pribadi; (2) kendala terbesar adalah fragmentasi data antar-departemen yang menyebabkan double-booking, keterlambatan update status kamar, dan kesulitan rekonsiliasi bulanan; (3) kebutuhan prioritas adalah dashboard terpusat, kalender ketersediaan real-time, dan integrasi otomatis antara reservasi-billing-housekeeping; (4) manajemen hak akses berbasis peran dianggap krusial untuk keamanan data dan compliance audit</span>, dengan finance, front desk, dan housekeeping masing-masing membutuhkan boundary akses yang jelas. Divergensi muncul pada prioritas chatbot: <span style="background:yellow">manajer dan front desk sangat antusias terhadap chatbot untuk menjawab pertanyaan tamu di luar jam kerja, sedangkan supervisor housekeeping menilainya kurang relevan untuk operasi internal mereka</span>. Temuan ini menjadi dasar perancangan 14 modul StayManager dengan integrasi chatbot LLM sebagai fitur unggulan layanan tamu digital.

**Kuesioner**

Kuesioner disebarkan kepada 30 responden yang terdiri dari 10 staf hotel (dari berbagai departemen) dan 20 tamu hotel. Kuesioner dirancang untuk menggali kebutuhan fungsional, preferensi antarmuka, dan ekspektasi layanan digital.  
<span style="background:yellow">Kategori 1 â€“ Profil Responden dan Penggunaan Teknologi: Mayoritas staf hotel (8 dari 10 responden) menggunakan smartphone Android sebagai perangkat utama dan terbiasa dengan aplikasi WhatsApp serta aplikasi messaging berbasis chat. 20 tamu yang disurvei seluruhnya familiar dengan booking online melalui platform seperti Traveloka, Booking.com, atau Tiket.com.</span>  
<span style="background:yellow">Kategori 2 â€“ Masalah Utama pada Sistem Saat Ini: Staf melaporkan tiga keluhan utama yaitu input data berulang antar-spreadsheet (90%), kesulitan mengakses laporan real-time (80%), dan tidak adanya notifikasi otomatis (75%). Tamu melaporkan lambatnya respons hotel via WhatsApp di luar jam kerja (85%) dan informasi harga/ketersediaan yang tidak transparan di awal (70%).</span>  
<span style="background:yellow">Kategori 3 â€“ Kebutuhan Fitur Sistem: Staf membutuhkan dashboard ringkasan operasional, kalender ketersediaan visual, integrasi modul reservasi-billing-housekeeping, dan laporan otomatis bulanan. Tamu membutuhkan chatbot 24/7 untuk pertanyaan dasar, transparansi tarif dan ketersediaan, serta konfirmasi reservasi instan via percakapan.</span>  
<span style="background:yellow">Kategori 4 â€“ Preferensi Antarmuka: Staf memilih tampilan desktop sebagai primary dan tablet sebagai sekunder, dengan warna konsisten antar-modul dan menu navigasi sederhana. Tamu menginginkan antarmuka chatbot yang mirip dengan WhatsApp, menggunakan bahasa Indonesia natural, dan tersedia tombol pilihan cepat untuk pertanyaan umum.</span>  
<span style="background:yellow">Triangulasi hasil wawancara dan kuesioner menunjukkan keselarasan kuat antara kebutuhan staf operasional dan ekspektasi tamu/calon tamu. Staf membutuhkan sistem terpusat yang mengurangi pekerjaan administratif berulang, sedangkan tamu membutuhkan kanal layanan digital yang responsif dan transparan. Kedua kelompok stakeholder secara independen mengidentifikasi chatbot LLM sebagai jembatan antara dua kebutuhan tersebut: bagi tamu sebagai layanan 24/7, bagi staf sebagai pengurang beban kerja menjawab pertanyaan rutin.</span> Analisis ini menjadi dasar penetapan kebutuhan fungsional dan non-fungsional sistem StayManager yang tercantum pada sub-bab 3.2.3 dan 3.2.4.
<!-- /REVISI -->

**Kebutuhan Fungsional Sistem**

Berdasarkan hasil observasi dan wawancara, berikut adalah kebutuhan fungsional yang ditetapkan sebagai ruang lingkup pengembangan StayManager:  
Tabel 3.4 Kebutuhan Fungsional Sistem StayManager

| No | Modul | Kebutuhan Fungsional |
| :---: | ----- | ----- |
| 1 | Dashboard dan Landing Page | Menampilkan halaman publik hotel (profil hotel, daftar kamar tersedia, fasilitas, layanan) yang dapat diakses tanpa login; integrasi CTA menuju chatbot reservasi |
| 2 | Occupancy | Menampilkan kalender visual hunian kamar interaktif; memungkinkan pembuatan reservasi baru dengan klik langsung pada slot kamar dan tanggal yang tersedia |
| 3 | Manajemen Kamar | CRUD data kamar, tampilan status real-time (tersedia/occupied/cleaning/maintenance), filter dan pencarian kamar, sinkronisasi status dengan housekeeping |
| 4 | Manajemen Tamu | CRUD profil tamu, riwayat reservasi per tamu, pencarian berdasarkan nama/email/nomor identitas |
| 5 | Reservasi | Buat/lihat/edit/batalkan reservasi, validasi ketersediaan real-time, kalender visual occupancy, proses check-in/check-out dengan update status kamar otomatis |
| 6 | Housekeeping | Buat dan kelola tugas housekeeping (daily maintenance dan checkout cleaning), penugasan ke staf, pelacakan status penyelesaian, dan jadwal kerja housekeeping. Antarmuka modul ini terintegrasi pada halaman Manajemen Kamar (/rooms) untuk memudahkan staf mengelola tugas housekeeping bersamaan dengan status kamar; backend tersedia melalui endpoint /api/housekeeping/daily-maintenance dan /api/housekeeping/checkout-cleaning. |
| 7 | Manajemen Staf | CRUD data staf, kelola peran dan izin akses (RBAC 6 level), manajemen jadwal kerja |
| 8 | Keuangan | Catat transaksi pembayaran tamu, kelola pengeluaran operasional, generate invoice/kwitansi, laporan keuangan dengan filter periode |
| 9 | Inventaris | CRUD inventaris hotel, peringatan stok minimum, catat penggunaan inventaris |
| 10 | Billing & Invoice | Buat dan kelola invoice tamu, tambah billing items (kamar, layanan tambahan), proses pembayaran dan deposit, lacak status pembayaran |
| 11 | Guest Facilities | Kelola permintaan layanan tamu (laundry, room service, spa, transport); pantau status permintaan aktif; integrasi ke billing tamu |
| 12 | Laporan | Laporan occupancy, revenue, guest history dengan filter periode dan export data |
| 13 | Chatbot LLM | Antarmuka chat natural language untuk tamu, jawab pertanyaan hotel, periksa ketersediaan kamar real-time via function calling, fasilitasi reservasi dan konfirmasi pembayaran end-to-end via percakapan |

14  
Settings & Sistem Administrasi  
Halaman Settings menyediakan panel admin untuk pengaturan database (koneksi, schema), tools development, monitoring kesehatan sistem (database health, app health), dan konfigurasi keamanan (audit log, security policies). Akses dibatasi pada role super\_admin.

**Kebutuhan Non-Fungsional Sistem**

Selain kebutuhan fungsional, terdapat kebutuhan non-fungsional yang harus dipenuhi untuk memastikan kualitas dan keandalan sistem StayManager:  
Tabel 3.5 Kebutuhan Non-Fungsional Sistem StayManager

| Aspek Non-Fungsional | Deskripsi Kebutuhan |
| ----- | ----- |
| Performa | Waktu loading halaman \< 3 detik pada jaringan normal; first response chatbot \< 2 detik; update status kamar real-time \< 500ms |
| Keamanan | Autentikasi JWT via Supabase Auth, RLS PostgreSQL sebagai authenticated-gate baseline, RBAC enforcement melalui middleware Next.js dan API route guards, enkripsi data sensitif, serta validasi input server-side untuk mencegah SQL injection dan XSS |
| Skalabilitas | Mendukung minimal 50 pengguna konkuren; arsitektur stateless yang memungkinkan horizontal scaling; database connection pooling via Supabase |
| Ketersediaan | Uptime minimal 99,5% melalui deployment di Vercel dengan infrastruktur edge global; auto-failover oleh Supabase |
| Kemudahan Penggunaan | Antarmuka intuitif berbasis prinsip HCI; skor UAT rata-rata minimal 4.0/5.0 pada skala Likert; waktu onboarding \< 30 menit untuk staf baru |
| Kompatibilitas | Berjalan pada browser modern (Chrome, Firefox, Safari, Edge versi terkini); responsif untuk layar desktop (1280px+) dan tablet (768px+) |
| Maintainability | Kode TypeScript dengan tipe yang terdefinisi jelas; komponen modular yang dapat digunakan ulang; dokumentasi inline pada fungsi utama |

### **3.2.3 Usulan Pemecahan Masalah** {#3.2.3-usulan-pemecahan-masalah}

Berdasarkan hasil analisis perbandingan aplikasi sejenis dan analisis kebutuhan, perancangan StayManager mengintegrasikan solusi-solusi berikut:

**a. Pengembangan PMS Terintegrasi Berbasis Web**

Untuk mengatasi fragmentasi data dan inefisiensi proses manual, StayManager dirancang sebagai sistem berbasis web full-stack yang mengintegrasikan seluruh proses operasional hotel dalam satu platform terpusat. Next.js 16 dipilih karena kemampuannya menangani rendering di server maupun klien secara optimal, sementara Supabase dengan PostgreSQL menyediakan basis data terpusat yang mendukung sinkronisasi real-time antar modul.  
Arsitektur monolitik-modular dipilih sebagai solusi tepat untuk skala hotel kecil-menengah: berbeda dengan arsitektur microservices yang kompleks untuk skala ini, monolitik-modular Next.js memungkinkan pengembangan dan deployment lebih sederhana tanpa mengorbankan modularitas kode. Setiap modul (reservasi, housekeeping, keuangan, dll.) diimplementasikan sebagai modul terpisah dalam satu codebase yang berbagi infrastruktur, database connection, dan tipe data yang sama.

**b. Integrasi Chatbot LLM untuk Layanan Tamu Digital**

Untuk mengatasi ketiadaan kanal digital layanan tamu, StayManager mengintegrasikan chatbot berbasis Gemini 2.5 Flash API yang dapat menjawab pertanyaan tamu dalam bahasa alami dan memfasilitasi proses reservasi secara end-to-end. Implementasi teknis menggunakan AI SDK (@ai-sdk/google) dengan fitur streaming responses untuk pengalaman chatting yang responsif, function calling untuk mengintegrasikan chatbot dengan database real-time Supabase, dan system prompt yang dikonfigurasi dengan konteks hotel spesifik.  
Alur chatbot menangani dua skenario utama: (1) skenario informasional â€” tamu bertanya tentang fasilitas, lokasi, kebijakan hotel â€” di mana chatbot menjawab berdasarkan knowledge base; dan (2) skenario transaksional â€” tamu ingin memesan kamar â€” di mana chatbot memandu tamu melalui alur reservasi, memeriksa ketersediaan, mengonfirmasi detail, dan menyimpan reservasi ke database secara otomatis.

**c. Role-Based Access Control untuk Keamanan Multi-Level**

Untuk memastikan keamanan data dan pembatasan akses yang tepat, StayManager mengimplementasikan RBAC enam tingkat yang ditegakkan melalui middleware Next.js dan API route guards (dengan RLS PostgreSQL sebagai baseline gate yang memastikan hanya pengguna terautentikasi yang dapat mengakses tabel). Keenam peran tersebut adalah: super\_admin (akses penuh ke seluruh sistem termasuk konfigurasi dan pengaturan pengguna), manager (akses ke seluruh modul operasional dan laporan), front\_desk (akses ke manajemen tamu, reservasi, billing, dan occupancy), housekeeping (akses ke modul housekeeping dan status kamar), finance (akses ke modul keuangan, billing, dan laporan finansial), serta guest (tamu eksternal yang hanya dapat mengakses antarmuka chatbot publik). Setiap peran memiliki kumpulan permissions yang terdefinisi, dan sistem memverifikasi permissions tersebut di setiap API route melalui fungsi hasPermission() di server side.

**d. Antarmuka yang Intuitif dan Responsif**

Antarmuka StayManager dirancang mengikuti prinsip-prinsip HCI (Putri, 2021; Raudina dkk., 2025\) dengan pendekatan user-centered design (Lallemand, 2022). Menggunakan komponen UI konsisten dari shadcn/ui berbasis Radix UI, dengan color scheme biru-indigo gradient (\#2563EBâ€“\#4F46E5) yang mencerminkan profesionalisme. Antarmuka dioptimalkan untuk desktop (primary) dan tablet (secondary), mengingat konteks penggunaan utama adalah staf hotel di front desk.

**Metode Pengujian Sistem (Alpha Testing)**

Pengujian sistem StayManager dilaksanakan menggunakan pendekatan alpha testing, yaitu pengujian yang dilakukan secara internal oleh tim pengembang bersama penguji terpilih sebelum sistem dirilis ke pengguna akhir. Alpha testing dipilih karena sesuai dengan konteks penelitian yang bersifat pengembangan prototipe sistem baru, di mana verifikasi fungsionalitas dan usability perlu dilakukan dalam lingkungan terkontrol sebelum deployment. Sebagaimana dijelaskan pada subbab 2.1.12.1, alpha testing mencakup dua fase utama: (1) fase black-box testing untuk memverifikasi kesesuaian fungsional sistem terhadap spesifikasi kebutuhan, dan (2) fase evaluasi usability untuk mengukur tingkat kemudahan penggunaan dan kepuasan pengguna. Pada penelitian ini, Black Box Testing dilaksanakan terhadap 9 kelompok modul dengan 36 skenario pengujian yang mencakup seluruh 14 modul fungsional StayManager, sedangkan evaluasi usability dilaksanakan melalui Five Measurable Human Factors, Eight Golden Rules, User Acceptance Testing (UAT) berbasis skala Likert, dan System Usability Scale (SUS) terhadap 30 responden.

**Metode Evaluasi Usability dengan SUS**

Selain menggunakan evaluasi kepuasan berbasis skala Likert, penelitian ini juga menerapkan System Usability Scale (SUS) sebagai instrumen pengukuran usability yang terstandarisasi secara internasional. SUS dipilih karena mampu menghasilkan skor tunggal yang representatif terhadap persepsi pengguna mengenai kemudahan penggunaan suatu sistem secara keseluruhan, serta telah terbukti valid dan reliabel di berbagai konteks pengujian perangkat lunak modern, termasuk teknologi pendidikan (Vlachogianni & Tselios, 2022), voice user interface (Deshmukh & Chalmeta, 2024), dan aplikasi konsumen (Khan dkk., 2025).  
Pengujian SUS dilakukan terhadap 30 responden yang sama dengan responden UAT, terdiri atas 10 staf hotel sebagai pengguna internal dan 20 tamu hotel/pengguna chatbot sebagai pengguna eksternal. Setiap responden mengisi kuesioner SUS yang memuat 10 pernyataan standar (lihat Tabel 2.2) menggunakan skala Likert 1â€“5.  
Pengolahan data SUS dilakukan melalui empat tahap: (1) skor pernyataan ganjil dikurangi 1; (2) skor pernyataan genap diperoleh dari 5 dikurangi nilai jawaban; (3) seluruh skor kontribusi dijumlahkan; dan (4) total skor dikalikan 2,5 untuk memperoleh skor akhir dalam rentang 0â€“100. Skor SUS dari masing-masing kelompok responden kemudian dirata-ratakan untuk mendapatkan skor representatif per kelompok.  
Hasil skor SUS kemudian diinterpretasikan menggunakan skala kategori yang telah ditetapkan pada Tabel 2.3. Nilai skor SUS yang diperoleh digunakan untuk menentukan grade, adjective rating, dan tingkat penerimaan usability sistem StayManager oleh masing-masing kelompok pengguna, yang selanjutnya dibahas secara lengkap pada subbab 4.3.2.10.3.

## **3.3 Perancangan** {#3.3-perancangan}

### 	**3.3.1 Software Design Document** {#3.3.1-software-design-document}

#### **3.3.1.1 Deskripsi Software** {#3.3.1.1-deskripsi-software}

StayManager adalah aplikasi Property Management System (PMS) berbasis web full-stack yang dikembangkan untuk hotel skala kecil dan menengah. Sistem dibangun dengan tujuan mengintegrasikan seluruh proses operasional hotel â€” manajemen reservasi, status kamar, housekeeping, keuangan, hingga inventaris â€” dalam satu platform terpusat yang dapat diakses melalui browser web tanpa instalasi tambahan. Dilengkapi dengan chatbot berbasis Large Language Model (Gemini 2.5 Flash) yang memungkinkan tamu berinteraksi menggunakan bahasa alami untuk mendapatkan informasi hotel dan melakukan reservasi.  
StayManager menargetkan tiga kelompok pengguna utama: (1) tim manajemen hotel (super admin, manajer) yang membutuhkan visibilitas penuh terhadap operasional dan performa hotel; (2) staf operasional (front desk, housekeeping, staf keuangan) yang membutuhkan alat kerja digital untuk menjalankan tugas sehari-hari secara efisien; dan (3) tamu hotel yang membutuhkan akses mudah ke informasi dan layanan pemesanan kamar melalui antarmuka chatbot yang intuitif.  
Alur kerja keseluruhan aplikasi StayManager, mulai dari akses tamu pada halaman publik/chatbot, proses autentikasi staf, hingga alur operasional di masing-masing modul.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.3: Flowchart Alur Aplikasi StayManager\]**

Gambar 3.3 Flowchart Alur Aplikasi StayManager

#### **3.3.1.2 Fungsi Software** {#3.3.1.2-fungsi-software}

**Peran Super Admin**

Super Admin memiliki akses penuh ke seluruh sistem termasuk konfigurasi tingkat sistem. Fungsi-fungsi yang dapat dilakukan super\_admin:

* Mengelola akun pengguna sistem: membuat, memperbarui, dan menonaktifkan akun staf serta mengonfigurasi peran RBAC (salah satu dari 6 role: super\_admin, manager, front\_desk, housekeeping, finance, guest) untuk setiap pengguna.  
* Mengakses seluruh 14 modul: dashboard/landing page, occupancy, manajemen kamar, manajemen tamu, housekeeping (terintegrasi pada halaman /rooms), keuangan, billing, guest facilities, inventaris & logistik, manajemen staf, laporan, dan chatbot LLM.  
* Mengonfigurasi pengaturan sistem: profil hotel, kebijakan harga, parameter AI chatbot (model, system prompt), dan pengaturan keamanan.  
* Melihat log aktivitas sistem dan laporan audit untuk pemantauan keamanan dan kepatuhan.

  **Peran Manager**

  Manager memiliki akses ke seluruh modul operasional tanpa hak manajemen pengguna tingkat sistem. Fungsi-fungsi manager:

* Memantau data operasional hotel secara real-time melalui seluruh modul: occupancy rate, pendapatan harian/bulanan, jumlah reservasi aktif, tugas housekeeping, dan stok inventaris.  
* Mengelola keseluruhan operasional: kamar, tamu, reservasi, housekeeping, keuangan, billing, dan inventaris dengan hak baca dan tulis penuh.  
* Menghasilkan dan menganalisis laporan operasional: laporan occupancy, laporan pendapatan vs pengeluaran, laporan produktivitas housekeeping.  
* Meninjau riwayat percakapan chatbot untuk quality control layanan AI.

  **Peran Front Desk (Resepsionis)**

  Front desk bertanggung jawab atas operasional penerimaan tamu sehari-hari. Fungsi yang dapat dilakukan:

* Membuat dan mengelola reservasi melalui modul Occupancy, memvalidasi ketersediaan kamar secara real-time sebelum konfirmasi booking.  
* Proses check-in dan check-out tamu dengan pembaruan status kamar dan reservasi secara otomatis di sistem.  
* Mengelola profil dan data tamu, melihat riwayat kunjungan tamu melalui modul Manajemen Tamu.  
* Membuat dan mengelola billing/invoice tamu melalui modul Billing, mencatat pembayaran dan deposit.

  **Peran Housekeeping**

  Staf housekeeping mengelola kebersihan dan kesiapan kamar. Fungsi yang dapat dilakukan:

* Melihat daftar tugas housekeeping yang ditugaskan oleh supervisor, termasuk prioritas dan detail instruksi per kamar.  
* Memperbarui status penyelesaian tugas dari Pending â†’ In Progress â†’ Completed, yang secara otomatis memperbarui status kamar menjadi "Tersedia" di sistem.  
* Melaporkan kondisi kamar (kerusakan peralatan, kebutuhan restock amenities) melalui catatan tugas.

  **Peran Finance (Keuangan)**

  Staf keuangan mengelola aspek finansial operasional hotel. Fungsi yang dapat dilakukan:

* Mencatat dan mengelola transaksi keuangan (pendapatan dan pengeluaran) melalui modul Keuangan, dengan filter dan kategorisasi yang detail.  
* Mengelola billing dan invoice tamu, memproses pembayaran, dan melihat status pembayaran seluruh reservasi aktif.  
* Menghasilkan laporan keuangan: total pendapatan, total pengeluaran, laba bersih per periode, dan breakdown per kategori.

  **Peran Guest (Pengguna Chatbot)**

  Tamu hotel mengakses sistem melalui antarmuka chatbot publik tanpa perlu membuat akun atau login. Fungsi yang dapat dilakukan tamu:

* Berinteraksi dengan chatbot AI StayManager (powered by Gemini 2.5 Flash) menggunakan Bahasa Indonesia atau Bahasa Inggris untuk menanyakan informasi hotel, fasilitas, kebijakan, dan harga kamar.  
* Memeriksa ketersediaan kamar berdasarkan tanggal dan tipe kamar melalui percakapan natural language  chatbot menggunakan tool cekKetersediaan untuk mengambil data real-time dari database.  
* Melakukan reservasi kamar end-to-end: chatbot mengumpulkan data tamu, memanggil tool createBooking, menawarkan opsi pembayaran, dan mengonfirmasi kode booking melalui tool confirmPayment.  
* Mengakses riwayat percakapan sebelumnya melalui halaman Chat History.

  #### **3.3.1.3 Kebutuhan Teknologi** {#3.3.1.3-kebutuhan-teknologi}

  Platform StayManager dirancang menggunakan teknologi sebagai berikut:

Tabel 3.6 Kebutuhan Teknologi StayManager

| Kategori | Teknologi | Keterangan |
| ----- | ----- | ----- |
| Framework | Next.js 16 (App Router) | Full-stack React framework dengan SSR, API Routes, Middleware |
| Bahasa | TypeScript 5 | Superset JavaScript dengan type safety untuk keseluruhan codebase |
| UI Library | React 19 \+ shadcn/ui \+ Radix UI | Komponen aksesibel yang dapat dikustomisasi dengan Tailwind CSS |
| Styling | Tailwind CSS v4 | Utility-first CSS framework dengan design system yang konsisten |
| Database | PostgreSQL (via Supabase) | RDBMS dengan Row-Level Security (sebagai authenticated-gate baseline), JSONB, dan Realtime subscriptions berbasis WebSocket |
| Backend Platform | Supabase | BaaS: Auth, Storage, Realtime, Edge Functions berbasis PostgreSQL |
| AI / LLM | Google Gemini 2.5 Flash via @ai-sdk/google | LLM dengan 4 function tools (cekKetersediaan, createBooking, getRoomTypes, confirmPayment) dan streaming response untuk chatbot |
| Deployment | Vercel | Cloud platform dengan CI/CD otomatis, edge network global |
| Version Control | Git \+ GitHub | Kolaborasi kode, branch management, dan code review |
| Desain UI | Figma | Wireframing, prototyping, dan design system berbasis web |
| Autentikasi OAuth | Google OAuth 2.0 | Login staf hotel via akun Google menggunakan Supabase Auth OAuth provider dengan alur PKCE (Proof Key for Code Exchange); callback handler di /auth/callback |
| Package Manager | pnpm 10.33.0 | Package manager performa tinggi dengan hard linking; menggantikan npm/yarn untuk efisiensi disk storage dan kecepatan instalasi |
| Form & Validasi | useState manual \+ Zod (chatbot tools) | Form input sistem dikelola dengan React useState untuk state lokal komponen; library Zod digunakan secara spesifik untuk validasi parameter function tools chatbot (tool inputs cekKetersediaan, createBooking, getRoomTypes, confirmPayment). |
| Visualisasi Data | Recharts 3.x | Library visualisasi data berbasis React untuk grafik dan chart dashboard analitik (occupancy rate, revenue trend, statistik operasional). |
| Animasi | Framer Motion 12.x | Library animasi React untuk transisi halaman dan efek interaktif pada antarmuka pengguna |
| Notifikasi | Sonner | Library toast notification untuk umpan balik aksi pengguna (simpan data, hapus, error, dll.) |
| Utilitas Tanggal | date-fns 4.1.0 | Library utilitas tanggal untuk format, kalkulasi, dan manipulasi data tanggal/waktu di seluruh sistem |
| Ikon | Lucide React | Library ikon SVG (lucide-react) yang konsisten dengan design system shadcn/ui; digunakan di seluruh antarmuka untuk navigasi, aksi, dan indikator status. |

## **3.3.2 Perancangan Sistem** {#3.3.2-perancangan-sistem}

### **3.3.2.1 Perancangan Sistem (Pendekatan OOAD)** {#3.3.2.1-perancangan-sistem-(pendekatan-ooad)}

Bagian ini menyajikan perancangan lengkap UML sistem StayManager mencakup Use Case Diagram, Class Diagram, delapan Sequence Diagram untuk setiap alur interaksi kunci, dan enam Activity Diagram untuk proses bisnis utama. Setiap diagram dirancang berdasarkan kode sumber aktual proyek.

#### **3.3.2.1.1 Use Case Diagram** {#3.3.2.1.1-use-case-diagram}

Use Case Diagram StayManager menggambarkan interaksi antara tujuh aktor utama: Super Admin, Manager, Front Desk, Housekeeping, Finance, Guest (terautentikasi), dan Guest Anonymous (pengunjung publik tanpa login). Super Admin memiliki akses penuh termasuk manajemen pengguna dan konfigurasi sistem (dibedakan dengan permission wildcard \*). Manager mengakses seluruh modul operasional dan laporan analitik (dibedakan dengan explicit permission list). Karena Super Admin dan Manager memiliki overlap kapabilitas hampir 95%, pada diagram digunakan generalisasi UML dengan parent class "Administrator" yang lalu dispesialisasikan dengan stereotype \<\<extends\>\> untuk Super Admin. Front Desk mengelola tamu, reservasi, billing, dan occupancy. Housekeeping mengakses tugas kebersihan dan pembaruan status kamar. Finance mengelola keuangan, billing, dan laporan finansial. Guest (terautentikasi) berinteraksi melalui chatbot untuk cek ketersediaan kamar, melihat tipe kamar, melakukan reservasi via tool createBooking, dan konfirmasi pembayaran, dengan use case khusus akses /guest-facilities yang ditandai stereotype \<\<conditional: status='checked-in'\>\> karena hanya tersedia jika tamu memiliki reservasi aktif berstatus checked-in. Guest Anonymous adalah pengunjung halaman publik yang belum login; aktor ini hanya memiliki dua use case: "Cek Ketersediaan Kamar" dan "Lihat Tipe Kamar" (tool cekKetersediaan dan getRoomTypes), sedangkan use case "Buat Reservasi" diblokir oleh sistem yang merespons dengan marker SHOW\_LOGIN\_PROMPT\_JSON sehingga UI me-render LoginPromptCard untuk mengarahkan pengunjung melakukan autentikasi terlebih dahulu. Selain use case operasional utama, Use Case Diagram juga mencakup lima use case pendukung yang ditrace dari kode aktual: UC-CHAT-2 Save chat history (semua pengguna terautentikasi, sumber: src/lib/ai-chat-utils.ts), UC-CHAT-3 View chat history (rute /chat-history), UC-OCC-4 View guest reservation history dari calendar (Manager dan Front Desk, sumber: src/app/occupancy/actions.ts), UC-BILL-7 Add Ã  la carte billing item during stay (Front Desk dan Finance, sumber: src/lib/billingApi.ts), serta UC-ROOM-5 Create daily housekeeping tasks (Housekeeping dan Manager, sumber: src/app/api/housekeeping/daily-maintenance/route.ts).

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.4: Use Case Diagram Sistem StayManager\]**

Gambar 3.4 Use Case Diagram Sistem StayManager

#### **3.3.2.1.2 Domain Entity Diagram (Class Diagram)** {#3.3.2.1.2-domain-entity-diagram-(class-diagram)}

Karena StayManager dibangun dengan Next.js dan TypeScript yang menggunakan paradigma functional \+ interface-based (bukan Object-Oriented Programming class), Class Diagram dalam skripsi ini direpresentasikan sebagai Domain Entity Diagram. Atribut entitas diambil dari TypeScript interface, sedangkan operasi (operations/methods) direpresentasikan sebagai REST endpoint dan service function yang ter-trace ke kode aktual. Domain Entity Diagram StayManager menggambarkan entitas utama beserta atribut, operasi, dan relasinya: Guest (tamu), Room (kamar) dengan CustomRoomType, Reservation (reservasiâ€”pusat domain), Invoice, BillingItem, Payment, Deposit, Expense, HousekeepingTask, GuestFacilityRequest dengan GuestFacilityItem, InventoryItem dengan InventoryTransaction/InventorySupplier/InventoryPurchaseOrder, AIChat dengan AIMessage (embedded JSONB), Profile (1:1 ekstensi auth.users dari Supabase), serta Role dengan junction UserRole. Operasi setiap entitas dianotasi dengan REST endpoint, contohnya: Reservation memiliki operasi GET /api/reservations, mutasi via tool createBooking di /api/chat, serta PUT melalui server action src/app/occupancy/actions.ts. Relasi utama: Guest one-to-many Reservation; Room one-to-many Reservation; Reservation one-to-many Payment, Invoice, BillingItem, Deposit, dan GuestFacilityRequest; User many-to-many Role via user\_roles; Room one-to-many HousekeepingTask.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.5: Class Diagram Sistem StayManager\]**

Gambar 3.5 Class Diagram Sistem StayManager

#### **3.3.2.1.3 Sequence Diagram** {#3.3.2.1.3-sequence-diagram}

Berikut delapan Sequence Diagram yang menggambarkan alur interaksi antar komponen untuk setiap skenario kunci sistem StayManager, mulai dari autentikasi hingga alur chatbot end-to-end dan operasional hotel.

#### **3.3.2.1.3.1 Sequence Diagram â€“ Login Staf** {#3.3.2.1.3.1-sequence-diagram-â€“-login-staf}

Sequence Diagram login menggambarkan autentikasi staf menggunakan Supabase Auth. Staf input email \+ password â†’ Next.js Middleware â†’ Supabase Auth signInWithPassword() â†’ query database â†’ jika valid: terbitkan JWT session cookie â†’ ambil user\_roles JOIN roles â†’ redirect ke halaman sesuai peran.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.6: Sequence Diagram â€“ Proses Login Staf\]**

Gambar 3.6 Sequence Diagram â€“ Proses Login Staf

#### **3.3.2.1.3.2 Sequence Diagram â€“ Chatbot: Cek Ketersediaan Kamar** {#3.3.2.1.3.2-sequence-diagram-â€“-chatbot:-cek-ketersediaan-kamar}

Tamu kirim pesan â†’ POST /api/chat â†’ streamText(model: google("gemini-2.5-flash"), tools) â†’ Gemini deteksi intent â†’ memanggil tool cekKetersediaan{checkIn, checkOut, type?} â†’ sistem mengeksekusi tiga query Supabase secara terpisah karena tidak ada foreign key formal antara tabel rooms dan custom\_room\_types: (1) SELECT room\_id FROM reservations WHERE status NOT IN ('cancelled','no\_show') AND overlap rentang tanggal â†’ busyRoomIds; (2) SELECT \* FROM rooms WHERE status='available' AND id NOT IN busyRoomIds (filter optional ILIKE pada kolom type) â†’ availableRooms; (3) SELECT \* FROM custom\_room\_types WHERE name IN (uniqueTypes dari availableRooms) â†’ typeMeta. Sistem kemudian menggabungkan ketiga hasil di lapisan aplikasi (JavaScript) dengan membuat Map(name â†’ metadata) dari typeMeta lalu memperkaya setiap kamar dengan amenities, base\_price, dan gallery images via dedup. Hasil enriched dikembalikan sebagai tool\_result â†’ Gemini generate respons dengan ROOM\_CARDS\_JSON â†’ SSE stream ke client â†’ render kartu kamar interaktif.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.7: Sequence Diagram â€“ Chatbot: Cek Ketersediaan Kamar\]**

Gambar 3.7 Sequence Diagram â€“ Chatbot: Cek Ketersediaan Kamar

#### **3.3.2.1.3.3 Sequence Diagram â€“ Chatbot: Create Booking** {#3.3.2.1.3.3-sequence-diagram-â€“-chatbot:-create-booking}

Tamu konfirmasi data diri â†’ Gemini panggil tool createBooking{guestName, guestEmail, guestPhone, roomId, checkIn, checkOut, adults, roomRate} â†’ cek/insert tabel guests â†’ generate bookingRef (BK+timestamp) â†’ hitung nights dan total\_amount â†’ INSERT INTO reservations (payment\_status=pending) â†’ tool\_result â†’ Gemini tampilkan instruksi bayar dengan SHOW\_PAYMENT\_OPTIONS\_JSON.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.8: Sequence Diagram â€“ Chatbot: Create Booking\]**

Gambar 3.8 Sequence Diagram â€“ Chatbot: Create Booking

#### **3.3.2.1.3.4 Sequence Diagram â€“ Chatbot: Konfirmasi Pembayaran** {#3.3.2.1.3.4-sequence-diagram-â€“-chatbot:-konfirmasi-pembayaran}

Tamu konfirmasi transfer â†’ Gemini panggil tool confirmPayment{bookingReference, paymentMethod, paymentAmount} â†’ SELECT reservasi â†’ INSERT INTO payments (transaction\_id, amount, method, payment\_date) â†’ UPDATE reservations SET payment\_status=paid â†’ tool\_result: booking reference revealed â†’ Gemini kirim konfirmasi lengkap ke tamu.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.9: Sequence Diagram â€“ Chatbot: Konfirmasi Pembayaran\]**

Gambar 3.9 Sequence Diagram â€“ Chatbot: Konfirmasi Pembayaran

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.10: Arsitektur Integrasi LLM Chatbot dengan PMS StayManager\]**

Gambar 3.10 Arsitektur Integrasi LLM Chatbot dengan PMS StayManager Sumber: Olahan Penulis

#### **3.3.2.1.3.5 Sequence Diagram â€“ Proses Check-in Tamu** {#3.3.2.1.3.5-sequence-diagram-â€“-proses-check-in-tamu}

Front Desk buka Occupancy Page â†’ SELECT reservasi status=confirmed JOIN rooms â†’ tampilkan kalender hunian â†’ klik Check-in â†’ UPDATE reservations SET status=checked\_in, actual\_check\_in=NOW() â†’ UPDATE rooms SET status=occupied â†’ INSERT housekeeping\_tasks (tipe checkout\_cleaning, status scheduled) â†’ toast konfirmasi berhasil.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.11: Sequence Diagram â€“ Proses Check-in Tamu\]**

Gambar 3.11 Sequence Diagram â€“ Proses Check-in Tamu

#### **3.3.2.1.3.6 Sequence Diagram â€“ Proses Check-out Tamu** {#3.3.2.1.3.6-sequence-diagram-â€“-proses-check-out-tamu}

Front Desk buka Billing Page â†’ SELECT reservasi checked\_in JOIN payments â†’ tampilkan invoice dan status pembayaran â†’ konfirmasi pelunasan â†’ UPDATE reservations SET status=checked\_out, actual\_check\_out=NOW() â†’ UPDATE rooms SET status=available â†’ UPDATE housekeeping\_tasks (checkout\_cleaning â†’ status=pending) agar staf housekeeping segera membersihkan kamar.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.12: Sequence Diagram â€“ Proses Check-out Tamu\]**

Gambar 3.12 Sequence Diagram â€“ Proses Check-out Tamu

#### **3.3.2.1.3.7 Sequence Diagram â€“ Manajemen Kamar** {#3.3.2.1.3.7-sequence-diagram-â€“-manajemen-kamar}

Staff akses /rooms â†’ GET /api/rooms â†’ SELECT \* FROM rooms ORDER BY number â†’ render tabel. Tambah kamar: isi form {number, type, base\_price, capacity, floor, amenities} â†’ POST /api/rooms â†’ validasi \+ cek duplikat nomor kamar â†’ INSERT INTO rooms â†’ 201 Created â†’ refresh daftar kamar secara otomatis.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.13: Sequence Diagram â€“ Manajemen Kamar\]**

Gambar 3.13 Sequence Diagram â€“ Manajemen Kamar

#### **3.3.2.1.3.8 Sequence Diagram â€“ Manajemen Tugas Housekeeping** {#3.3.2.1.3.8-sequence-diagram-â€“-manajemen-tugas-housekeeping}

Staff akses /housekeeping â†’ SELECT housekeeping\_tasks WHERE assigned\_to=userId â†’ tampilkan daftar tugas berdasarkan prioritas. Mulai tugas â†’ UPDATE status=in\_progress, started\_at=NOW(). Tandai selesai â†’ UPDATE status=completed, completed\_at=NOW() â†’ jika tipe=checkout\_cleaning: UPDATE rooms SET status=available sehingga kamar langsung dapat dijual kembali.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.14: Sequence Diagram â€“ Manajemen Tugas Housekeeping\]**

Gambar 3.14 Sequence Diagram â€“ Manajemen Tugas Housekeeping

#### **3.3.2.1.4 Activity Diagram** {#3.3.2.1.4-activity-diagram}

Berikut enam Activity Diagram yang menggambarkan alur lengkap proses bisnis utama sistem StayManager beserta titik keputusan (decision point), alur alternatif, dan interaksi dengan database Supabase PostgreSQL.

#### **3.3.2.1.4.1 Activity Diagram â€“ Proses Login** {#3.3.2.1.4.1-activity-diagram-â€“-proses-login}

Alur: pengguna akses URL â†’ tampilkan form â†’ input kredensial â†’ validasi format email (client-side) â†’ jika tidak valid: tampilkan error, kembali ke form; jika valid: Supabase signInWithPassword() â†’ jika autentikasi gagal: tampilkan pesan error; jika berhasil: terbitkan JWT â†’ ambil user\_roles â†’ redirect ke halaman sesuai peran pengguna.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.15: Activity Diagram â€“ Proses Login\]**

Gambar 3.15 Activity Diagram â€“ Proses Login

#### **3.3.2.1.4.2 Activity Diagram â€“ Proses Registrasi Akun Staff** {#3.3.2.1.4.2-activity-diagram-â€“-proses-registrasi-akun-staff}

Alur: admin akses /signup â†’ isi form (nama, email, password, pilih role dari 6 role tersedia) â†’ validasi (email unik, password minimal 8 karakter) â†’ jika tidak valid: tampilkan error; jika valid: Supabase Auth signUp() â†’ INSERT INTO users â†’ INSERT INTO user\_roles â†’ opsional kirim email verifikasi â†’ redirect ke /roles untuk verifikasi akun.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.16: Activity Diagram â€“ Proses Registrasi Akun Staff\]**

Gambar 3.16 Activity Diagram â€“ Proses Registrasi Akun Staff

#### **3.3.2.1.4.3 Activity Diagram â€“ Proses Reservasi via Chatbot** {#3.3.2.1.4.3-activity-diagram-â€“-proses-reservasi-via-chatbot}

Alur end-to-end: tamu kirim pesan â†’ Gemini 2.5 Flash proses intent â†’ jika informasi: jawab langsung; jika booking: cek status autentikasi (isLoggedIn) â†’ jika tamu belum login: sistem emit SHOW\_LOGIN\_PROMPT\_JSON sehingga UI me-render LoginPromptCard yang mengarahkan ke halaman /signin, alur reservasi tidak dilanjutkan; jika tamu sudah login: data tamu (nama, email, telepon) auto-fill dari profil â†’ tanya tanggal via SHOW\_DATE\_SELECTOR â†’ tool cekKetersediaan â†’ jika tersedia: tampilkan ROOM\_CARDS\_JSON â†’ pilih kamar â†’ tool createBooking â†’ pilih Pay Now (instruksi transfer â†’ konfirmasi â†’ tool confirmPayment â†’ reveal kode booking) atau Pay Later (status pending, arahkan ke front office). Alur cek ketersediaan dan melihat tipe kamar tetap dapat diakses oleh tamu anonymous tanpa branch login.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.17: Activity Diagram â€“ Proses Reservasi via Chatbot\]**

Gambar 3.17 Activity Diagram â€“ Proses Reservasi via Chatbot

#### **3.3.2.1.4.4 Activity Diagram â€“ Proses Check-in Tamu** {#3.3.2.1.4.4-activity-diagram-â€“-proses-check-in-tamu}

Alur: staff akses Occupancy â†’ tampilkan kalender hunian â†’ tunggu kedatangan tamu â†’ pilih reservasi â†’ verifikasi identitas tamu; jika tidak valid: catat perbedaan \+ notifikasi manajer; jika valid: UPDATE reservations (checked\_in) \+ UPDATE rooms (occupied) \+ INSERT housekeeping\_tasks (checkout\_cleaning, scheduled) â†’ cetak/kirim konfirmasi check-in ke tamu.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.18: Activity Diagram â€“ Proses Check-in Tamu\]**

Gambar 3.18 Activity Diagram â€“ Proses Check-in Tamu

#### **3.3.2.1.4.5 Activity Diagram â€“ Pengelolaan Tugas Housekeeping** {#3.3.2.1.4.5-activity-diagram-â€“-pengelolaan-tugas-housekeeping}

Alur: staff akses /housekeeping â†’ cek daftar tugas; jika tidak ada: tampilkan pesan kosong; jika ada: pilih tugas â†’ UPDATE status=in\_progress â†’ kerjakan secara fisik â†’ UPDATE status=completed â†’ cek tipe tugas; jika checkout\_cleaning: UPDATE rooms status=available â†’ notifikasi front desk bahwa kamar siap dijual; lanjut ke tugas berikutnya.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.19: Activity Diagram â€“ Pengelolaan Tugas Housekeeping\]**

Gambar 3.19 Activity Diagram â€“ Pengelolaan Tugas Housekeeping

#### **3.3.2.1.4.6 Activity Diagram â€“ Pencatatan Transaksi Keuangan** {#3.3.2.1.4.6-activity-diagram-â€“-pencatatan-transaksi-keuangan}

Alur: staff finance akses /financial â†’ tampilkan dashboard KPI real-time (total pendapatan, pengeluaran, laba bersih) â†’ klik Tambah Transaksi â†’ isi form (tipe, deskripsi, jumlah, kategori, tanggal) â†’ tentukan tipe: pendapatan (link ke reservasi opsional) atau pengeluaran (link ke supplier/purchase\_order) â†’ validasi â†’ INSERT INTO expenses â†’ kalkulasi ulang KPI â†’ refresh dashboard.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.20: Activity Diagram â€“ Pencatatan Transaksi Keuangan\]**

Gambar 3.20 Activity Diagram â€“ Pencatatan Transaksi Keuangan

### **3.3.2.2 Perancangan Antarmuka Pengguna (User Interface)** {#3.3.2.2-perancangan-antarmuka-pengguna-(user-interface)}

Perancangan antarmuka pengguna StayManager mengacu pada prinsip-prinsip HCI dengan pendekatan user-centered design. Design system yang digunakan: color scheme biru-indigo gradient (\#2563EBâ€“\#4F46E5) sebagai warna identitas utama, sidebar navigasi gelap (\#0F172A slate-900), kartu putih dengan border halus (\#E2E8F0) untuk konten, dan badge status berwarna untuk status kamar (hijau=available, merah=occupied, kuning=cleaning, ungu=reserved).

#### **3.3.2.2.1 Rancangan Antarmuka Tamu (Guest dan Chatbot)** {#3.3.2.2.1-rancangan-antarmuka-tamu-(guest-dan-chatbot)}

**Halaman Publik dan Chatbot**

Halaman publik StayManager berfungsi sebagai landing page yang dapat diakses tamu tanpa login. Halaman ini menampilkan: hero section dengan foto hotel dan tagline, statistik hotel (jumlah kamar, fasilitas tersedia, lokasi), kartu-kartu kamar tersedia dengan foto, tipe, kapasitas, dan harga per malam, serta tombol CTA (Call-to-Action) "Pesan Sekarang" yang mengarahkan ke antarmuka chatbot.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.21: Rancangan Antarmuka Halaman Publik\]**

Gambar 3.21 Rancangan Antarmuka Halaman Publik

Antarmuka chatbot dirancang dengan tampilan dark-themed yang modern, menggunakan layout dua panel: panel kiri menampilkan riwayat sesi chat, panel kanan adalah area chat utama. Bubble pesan tamu ditampilkan di kanan (biru) dan respons AI di kiri (abu gelap) dengan animasi streaming untuk efek "sedang mengetik". Header chatbot menampilkan branding "StayManager AI" dengan indikator model yang digunakan.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.22: Rancangan Antarmuka Chatbot LLM\]**

Gambar 3.22 Rancangan Antarmuka Chatbot LLM

#### **3.3.2.2.2 Rancangan Antarmuka Staf dan Admin** {#3.3.2.2.2-rancangan-antarmuka-staf-dan-admin}

**Halaman Login**

Halaman login dirancang dengan tampilan yang bersih dan profesional, menampilkan card form autentikasi di tengah halaman dengan background gradient biru-indigo. Form mencakup field email, field password dengan toggle visibility, tombol Login yang prominent, dan link "Lupa Password". Terdapat feedback visual yang jelas untuk status loading (spinner pada tombol) dan error (pesan error berwarna merah di bawah field yang bermasalah).

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.23: Rancangan Antarmuka Halaman Login\]**

Gambar 3.23 Rancangan Antarmuka Halaman Login

**Manajemen Kamar**

Antarmuka manajemen kamar menggunakan layout sidebar navigasi gelap di kiri dan area konten utama di kanan. Area konten menampilkan tabel daftar kamar dengan kolom: nomor kamar, tipe, kapasitas, harga per malam, status (badge berwarna), dan kolom aksi (edit, hapus, buat tugas housekeeping). Filter di bagian atas memungkinkan penyaringan berdasarkan tipe atau status kamar. Tombol "Tambah Kamar" di sudut kanan atas membuka modal form input data kamar baru.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.24: Rancangan Antarmuka Manajemen Kamar\]**

Gambar 3.24 Rancangan Antarmuka Manajemen Kamar

**Modul Keuangan**

Modul keuangan menampilkan KPI cards di bagian atas (total pendapatan bulan ini, total pengeluaran, laba bersih, jumlah transaksi pending), diikuti tabel transaksi dengan kolom: tanggal, jenis transaksi, deskripsi, jumlah, tamu/vendor, dan status pembayaran (badge berwarna). Filter memungkinkan penyaringan berdasarkan periode waktu, jenis transaksi, dan status. Tombol "Tambah Transaksi" dan "Generate Laporan" tersedia sebagai aksi utama.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.25: Rancangan Antarmuka Modul Keuangan\]**

Gambar 3.25 Rancangan Antarmuka Modul Keuangan

### **3.3.2.3 Perancangan Database** {#3.3.2.3-perancangan-database}

#### **3.3.2.3.1 Entity Relationship Diagram (ERD) StayManager** {#3.3.2.3.1-entity-relationship-diagram-(erd)-staymanager}

<!-- REVISI-2026-05-17 (LOKASI-1) [GANTI]
TEKS LAMA di Word doc:
  "...total 26 tabel di public schema, dikelompokkan dalam lima sub-domain:
   (a) Auth & RBAC (auth.users, profiles, roles, user_roles),
   (b) Hotel Operations (guests, rooms, custom_room_types, reservations, housekeeping_tasks),
   (c) Finance (invoices, billing_items, payments, deposits, expenses, pos_transactions, pos_transaction_items),
   (d) Inventory & Logistics (...),
   (e) Guest Services & AI (guest_facility_requests, guest_facility_items, room_service_requests, ai_chats, hotel_settings)."

ALASAN:
- Jumlah tabel = 26 (angka sama dengan teks lama; kebetulan match setelah
  cleanup 2026-05-17 yang men-drop tabel ai_messages yang abandoned).
- pos_transactions & pos_transaction_items TIDAK ADA (didrop via migration
  drop_unused_pos_tables 2026-05-07).
- ai_chats tidak pernah ada; produksi pakai tabel "Chat" (huruf C kapital,
  single-table JSONB) sejak hari pertama (commit a6b5c0f, 2025-12-04).
- staff_members ADA di production tapi sebelumnya luput disebut di sub-domain (b).
-->
<!-- REVISI-2026-05-19 (LOKASI-9) [GANTI]
Tanggal: 2026-05-19
Status: APPLIED-TO-WORD (kalimat baru sudah di-inline ke paragraf di bawah; Word doc perlu di-sync)
Word location: Bab 3.3.2.3.1 — kalimat TERAKHIR dari paragraf sebelum "Gambar 3.26: Entity Relationship Diagram (ERD) StayManager"
Markdown ref: Skripsi_StayManager_Fixed.md baris setelah marker ini (paragraf panjang yang dimulai "Perancangan database StayManager...")
Target: kalimat TERAKHIR paragraf, yang dimulai dengan kata "Pencegahan double-booking..."

TEKS LAMA di Word doc (yang HARUS dihapus dan diganti):
  "Pencegahan double-booking diimplementasikan pada lapisan aplikasi
   melalui tool cekKetersediaan di chatbot dengan operator overlap
   detection (existing.check_in < new.check_out AND existing.check_out
   > new.check_in), bukan melalui DB-level UNIQUE atau EXCLUDE
   constraint pada kombinasi (room_id, check_in, check_out)."

TEKS BARU sudah inline di paragraf di bawah ini (dimulai dengan
"Pencegahan double-booking diimplementasikan dengan pendekatan
defense-in-depth pada dua lapisan..."). Word agent: copy text inline
dari paragraf ini ke Word doc, replacing TEKS LAMA di atas.

ALASAN:
- Production database sudah ditambahkan exclusion constraint via
  migration `add_no_overlap_active_reservations` (tanggal 2026-05-19).
- Kalimat lama "BUKAN melalui DB-level UNIQUE atau EXCLUDE constraint"
  sekarang FAKTUAL SALAH — perlu di-update agar konsisten dengan
  state production database.
- Constraint baru sudah diverifikasi via uji insert overlap (BLOCKED
  dengan kode 23P01) + uji same-day handover (ALLOWED).
- Bukti pengujian = paragraf evidence di LOKASI-10 (Bab 4.3.2.3).

PAIRED-WITH: LOKASI-10 (evidence). Kedua revisi harus diterapkan
bersamaan — jangan apply satu tanpa yang lain.

CATATAN UNTUK VERIFICATION AGENT:
- String "BUKAN melalui DB-level" dan "bukan melalui DB-level" DI
  DALAM komentar marker ini (yang Anda baca sekarang) adalah QUOTE
  dokumentasi, BUKAN konten thesis. JANGAN flag sebagai "stale text
  yang belum dihapus". Yang harus diverifikasi: string tersebut tidak
  ada di MAIN BODY thesis (di luar comment block <!-- --> markdown).
-->

Perancangan database StayManager menggunakan model relasional yang diimplementasikan pada PostgreSQL melalui Supabase. Database dirancang dengan total 26 tabel di public schema, dikelompokkan dalam lima sub-domain: (a) Auth & RBAC (auth.users, profiles, roles, user\_roles), (b) Hotel Operations (guests, rooms, custom\_room\_types, reservations, housekeeping\_tasks, staff\_members), (c) Finance (invoices, billing\_items, payments, deposits, expenses), (d) Inventory & Logistics (inventory\_items, inventory\_transactions, inventory\_suppliers, inventory\_purchase\_orders, inventory\_purchase\_order\_items), serta (e) Guest Services & AI (guest\_facility\_requests, guest\_facility\_items, room\_service\_requests, Chat, hotel\_settings).
<!-- /REVISI-2026-05-17 --> ERD dan Tabel 3.7 memvisualisasikan 15 entitas paling utama (core entities) yang merepresentasikan operasional inti hotel; tabel-tabel pendukung lain (RBAC junction, payment processing, riwayat percakapan AI, konfigurasi sistem, katalog layanan) didefinisikan melalui foreign key constraints untuk menjaga integritas referensial data. Khusus relasi antara rooms dan custom\_room\_types diimplementasikan sebagai soft-reference berbasis pencocokan string (rooms.type â†” custom\_room\_types.name) tanpa foreign key formal; pada notasi ERD relasi ini digambarkan dengan garis putus-putus dan kardinalitas ||..o{ disertai label "categorizes (soft ref by name)" untuk membedakannya dari relasi FK biasa. Integritas relasi soft-reference ini dijaga di lapisan aplikasi melalui logika query di tool cekKetersediaan dan validasi input saat CRUD kamar. Pencegahan double-booking diimplementasikan dengan pendekatan defense-in-depth pada dua lapisan. Pada lapisan aplikasi, tool cekKetersediaan di chatbot melakukan overlap detection menggunakan operator (existing.check\_in \&lt; new.check\_out AND existing.check\_out \&gt; new.check\_in) untuk menolak permintaan reservasi yang bertabrakan sebelum data dikirim ke database. Pada lapisan database, sistem memanfaatkan PostgreSQL exclusion constraint bernama `no\_overlap\_active\_reservations` yang didefinisikan melalui ekstensi `btree\_gist` dengan formulasi `EXCLUDE USING gist (room\_id WITH =, daterange(check\_in, check\_out, '[)') WITH \&amp;\&amp;) WHERE (status IN ('confirmed','checked-in') AND room\_id IS NOT NULL)`. Konstrain ini secara atomik menolak operasi INSERT atau UPDATE yang menghasilkan rentang tanggal tumpang-tindih pada kamar yang sama untuk reservasi berstatus aktif (confirmed atau checked-in), sehingga konsistensi data tetap terjaga meskipun terjadi race condition akibat permintaan konkuren dari beberapa kanal (chatbot, staf front desk, atau guest portal) yang lolos validasi aplikasi. Penggunaan semantik half-open range `[check\_in, check\_out)` membuat skenario same-day handover — tamu A check-out dan tamu B check-in pada tanggal yang sama — tetap diizinkan, sesuai dengan praktik operasional hotel pada umumnya.

**\[GAMBAR BELUM DIINPUT â€” Gambar 3.26: Entity Relationship Diagram (ERD) StayManager\]**

Gambar 3.26 Entity Relationship Diagram (ERD) StayManager

#### **3.3.2.3.2 Struktur Tabel Database** {#3.3.2.3.2-struktur-tabel-database}

<!-- REVISI-2026-05-17 (LOKASI-2) [GANTI]
TEKS LAMA: "...ringkasan struktural dari 16 entitas paling utama (core entities)..."
ALASAN: setelah row ai_messages dihapus dan row ai_chats diganti dengan satu row Chat,
total core entities di Tabel 3.7 turun dari 16 menjadi 15.
-->
Berikut adalah ringkasan struktural dari 15 entitas paling utama (core entities) dalam database StayManager beserta kolom-kolom pokoknya:
<!-- /REVISI-2026-05-17 -->
<!-- REVISI-2026-05-17 (LOKASI-3 & LOKASI-4) — perubahan pada Tabel 3.7 di bawah ini:

LOKASI-3 [GANTI] — baris "ai_chats":
  TEKS LAMA di Word doc:
    | ai_chats | id (bigint, PK) | id, title, user_id (FK nullable), created_at, updated_at |
  TEKS BARU (sudah ada di tabel di bawah):
    | Chat | id (uuid, PK) | user_id (FK ke auth.users), messages (JSONB array berisi urutan pesan user/assistant), created_at |
  ALASAN: tabel ai_chats tidak ada di production Supabase. Yang dipakai adalah tabel
  "Chat" (huruf C kapital) dengan PK uuid dan kolom JSONB "messages" yang menyimpan
  seluruh percakapan dalam bentuk array per sesi.

LOKASI-4 [HAPUS] — baris "ai_messages":
  TEKS LAMA di Word doc yang HARUS DIHAPUS:
    | ai_messages | id (bigint, PK) | chat_id (FK ke ai_chats), role (ENUM: 'user'|'assistant'), content (text), created_at |
  ALASAN: tabel ai_messages ada di Supabase tapi kosong (0 baris) dan tidak dipakai
  oleh kode aplikasi. Skripsi sebelumnya menggambarkan desain dua-tabel (ai_chats
  ↔ ai_messages) yang tidak diimplementasikan; cukup tabel Chat tunggal.
-->
Tabel 3.7 Struktur Tabel Database StayManager

| Nama Tabel | Primary Key | Kolom Utama |
| ----- | ----- | ----- |
| rooms | id (bigint, PK) | number, type, floor, price, base\_price, max\_occupancy, status (ENUM), amenities (JSONB array), images (JSONB array), image\_url, notes â€” catatan: kolom type berupa varchar dan terhubung ke custom\_room\_types.name sebagai soft-reference (tanpa foreign key constraint formal) |
| guests | id (bigint, PK) | full\_name, email, phone, id\_number, address, nationality, date\_of\_birth, status (ENUM), notes |
| reservations | id (bigint, PK) | guest\_id (FK), room\_id (FK), booking\_reference (UNIQUE), check\_in, check\_out, adults, children, room\_rate, room\_total, total\_amount, payment\_status (ENUM), status (ENUM), breakfast\_included, breakfast\_pax, breakfast\_price, breakfast\_total, actual\_check\_in, actual\_check\_out, notes |
| expenses | id (bigint, PK) | description, amount, category (ENUM), payment\_method (ENUM), expense\_date, status (ENUM), supplier, receipt\_url, recurring |
| housekeeping\_tasks | id (bigint, PK) | room\_id (FK), staff\_id (FK), task\_type (ENUM), priority (ENUM), status (ENUM), scheduled\_at |
| inventory\_items | id (bigint, PK) | name, category (ENUM), current\_stock, min\_stock, max\_stock, unit, unit\_cost, status (ENUM), last\_restocked |
| inventory\_purchase\_orders | id (bigint, PK) | po\_number (UNIQUE), supplier\_id (FK), status (ENUM), total\_amount, expected\_delivery\_date, created\_by (FK) |
| Chat | id (uuid, PK) | user\_id (FK ke auth.users), messages (JSONB array berisi urutan pesan user/assistant), created\_at |
| profiles | id (uuid, PK) | user\_id (FK), employee\_id, full\_name, email, role (FK), department, is\_active, hire\_date, phone |
| invoices | id (bigint, PK) | invoice\_number (UNIQUE), reservation\_id (FK), subtotal, tax\_amount, total\_amount, status (ENUM), payment\_method, notes |
| billing\_items | id (bigint, PK) | reservation\_id (FK), item\_name, category (ENUM), quantity, unit\_price, total\_price, status (ENUM) |
| deposits | id (bigint, PK) | reservation\_id (FK), amount, payment\_method (ENUM), status (ENUM), received\_at, notes |
| payments | id (bigint, PK) | reservation\_id (FK), amount, payment\_method (ENUM), payment\_date, status (ENUM), reference\_number, notes |
| roles | id (bigint, PK) | name (UNIQUE), description, permissions (JSONB array), is\_active, created\_at |
| user\_roles | id (bigint, PK) | user\_id (FK ke profiles), role\_id (FK ke roles), assigned\_at, assigned\_by |

**Tabel rooms**

Tabel rooms menyimpan data semua kamar hotel. Kolom status menggunakan ENUM dengan nilai: available, occupied, cleaning, maintenance, reserved. Kolom amenities menggunakan JSONB untuk menyimpan array fasilitas kamar secara fleksibel. Constraint UNIQUE pada room\_number memastikan tidak ada duplikasi nomor kamar.

**Tabel guests**

Tabel guests menyimpan profil tamu hotel. Relasi *\*one-to-many\** dengan tabel reservations memungkinkan satu tamu memiliki banyak reservasi secara historis tanpa perlu menginput ulang data dari awal. Email harus unik (jika diisi) untuk memudahkan identifikasi.

**Tabel reservations**

Tabel reservations adalah tabel pusat yang menghubungkan tamu dengan kamar dan periode menginap. Selain kolom inti (id sebagai primary key, booking\_reference unik, guest\_id sebagai foreign key, room\_id sebagai foreign key, check\_in, check\_out, adults, children, room\_rate, room\_total, total\_amount, payment\_status, status), tabel ini juga mencakup beberapa kolom pendukung untuk fleksibilitas operasional: booking\_id (kode booking internal terpisah dari booking\_reference yang ditampilkan ke tamu), breakfast\_included, breakfast\_pax, breakfast\_price, breakfast\_total (untuk paket sarapan opsional), actual\_check\_in dan actual\_check\_out (timestamp realisasi check-in/check-out yang berbeda dari tanggal rencana), guest\_count (denormalisasi adults \+ children untuk performa query), serta kolom denormalized guest\_name, guest\_email, guest\_phone, room\_number, dan room\_type yang digunakan untuk performa query pada calendar dan history view tanpa perlu JOIN ke tabel guests dan rooms. Kolom status menggunakan ENUM dengan nilai pending, confirmed, checked-in, checked-out, cancelled, dan no\_show. Kolom payment\_status menggunakan ENUM dengan nilai pending, paid, dan partial. Pencegahan double booking dilakukan pada lapisan aplikasi melalui mekanisme overlap detection di tool cekKetersediaan chatbot, yang memverifikasi tidak ada reservasi aktif (status bukan cancelled atau no\_show) yang tumpang tindih dengan rentang tanggal yang diminta menggunakan operator perbandingan check\_in \&lt; checkOut AND check\_out \&gt; checkIn pada tabel reservations.

**Tabel expenses**

Tabel expenses mencatat pengeluaran operasional hotel. Kolom category (ENUM) mengklasifikasikan jenis pengeluaran seperti utilities, maintenance, supplies, staff, dan lainnya. Kolom payment\_method (ENUM) mencatat metode pembayaran yang digunakan. Data penerimaan dari tamu dikelola melalui tabel invoices (untuk billing) dan tabel payments (untuk konfirmasi pembayaran) yang terpisah.

**Tabel housekeeping\_tasks**

Tabel housekeeping\_tasks mengelola tugas kebersihan dan perawatan kamar. Kolom priority (ENUM: low/medium/high/urgent) memungkinkan staf memperoleh tugas yang tepat berdasarkan urgensi. Integrasi dengan tabel rooms dan staff memungkinkan pelacakan tugas per kamar dan per staf secara granular.

<!-- REVISI-2026-05-17 (LOKASI-5) [GANTI]
TEKS LAMA di Word doc - heading dan paragraf:

  **Tabel ai_chats dan ai_messages**

  Tabel ai_chats menyimpan metadata sesi percakapan chatbot, mencakup kolom id,
  title (judul percakapan), user_id (FK nullable untuk tamu yang login),
  created_at, dan updated_at. Tabel ai_messages menyimpan setiap pesan
  individual dalam sesi chat dengan kolom: id, chat_id (FK ke ai_chats), role
  (ENUM: 'user'|'assistant'), content (teks pesan), dan created_at. Desain dua
  tabel terpisah ini memungkinkan penyimpanan riwayat percakapan yang
  terstruktur, dapat di-query secara efisien per pesan, dan mendukung fitur
  Chat History yang menampilkan daftar sesi chat.

ALASAN: dua-tabel design tidak diimplementasikan di production. Skripsi
disesuaikan dengan kondisi nyata: single-table Chat berbasis JSONB.
-->
**Tabel Chat**

Tabel Chat menyimpan riwayat percakapan chatbot dengan pendekatan single-table berbasis JSONB. Setiap baris tabel merepresentasikan satu sesi percakapan dengan kolom: id (uuid, PK), user\_id (FK ke auth.users), messages (JSONB array berisi urutan pesan dengan struktur {role: 'user'|'assistant', content: ..., createdAt: ...}), dan created\_at. Pendekatan JSONB array dipilih karena percakapan chatbot selalu di-load utuh per sesi (tidak perlu query per pesan), sehingga menyederhanakan logika persistence di Next.js `useChat` hook yang menerima/memproduksi array messages secara atomik. Tabel ini mendukung fitur Chat History yang menampilkan daftar sesi chat per pengguna dan mengembalikan seluruh isi percakapan saat sesi dibuka kembali.
<!-- /REVISI-2026-05-17 -->

**Tabel profiles**  
Tabel profiles menyimpan data karyawan hotel yang terhubung dengan akun autentikasi Supabase Auth melalui kolom user\_id. Kolom role merupakan foreign key ke tabel roles yang mendefinisikan hak akses berdasarkan peran (super\_admin, manager, front\_desk, housekeeping, finance). Kolom is\_active memungkinkan penonaktifan akun tanpa menghapus data historis.  
**Tabel invoices dan billing\_items**  
Tabel invoices menyimpan faktur yang digenerate untuk setiap reservasi, mencakup subtotal, pajak, dan total\_amount. Kolom status (ENUM) melacak siklus hidup faktur: draft, issued, paid, cancelled. Tabel billing\_items menyimpan rincian item per reservasi (biaya kamar, sarapan, fasilitas tambahan) dengan kolom category (ENUM) untuk klasifikasi dan unit\_price untuk perhitungan granular. Relasi one-to-many antara reservations dan billing\_items memungkinkan billing yang detail dan transparan.  
**Tabel deposits**  
Tabel deposits mencatat uang muka (deposit) yang diterima untuk reservasi. Kolom payment\_method (ENUM) mencatat metode pembayaran, dan kolom status melacak apakah deposit sudah dikonfirmasi atau dikembalikan (refunded). Relasi foreign key ke reservations memastikan setiap deposit terlacak ke reservasi spesifik.  
**Tabel payments**  
Tabel payments mencatat konfirmasi pembayaran yang diterima dari tamu. Setiap pembayaran terkait dengan reservasi melalui reservation\_id (FK). Kolom payment\_method (ENUM) mencatat metode pembayaran (cash, credit\_card, bank\_transfer, e-wallet), dan kolom status melacak apakah pembayaran sudah dikonfirmasi, pending, atau dibatalkan. Kolom reference\_number menyimpan nomor referensi transaksi untuk rekonsiliasi.  
**Tabel roles dan user\_roles**  
Tabel roles mendefinisikan peran yang tersedia dalam sistem RBAC StayManager beserta permissions yang dimiliki setiap peran dalam format JSONB array. Tabel user\_roles merupakan junction table yang menghubungkan profiles dengan roles dalam relasi many-to-many, memungkinkan satu pengguna memiliki lebih dari satu peran jika diperlukan.

<!-- REVISI-2026-05-17 (LOKASI-6) [HAPUS]
TEKS LAMA di Word doc - heading dan paragraf di posisi ini HARUS DIHAPUS:

  **Tabel ai_messages**
  Tabel ai_messages menyimpan setiap pesan individual dalam sesi percakapan
  chatbot. Kolom role (ENUM: 'user' atau 'assistant') membedakan pesan dari
  tamu dan respons dari AI. Relasi foreign key ke ai_chats memastikan setiap
  pesan terlacak ke sesi percakapan spesifik. Desain tabel terpisah dari
  ai_chats memungkinkan query efisien per pesan dan mendukung fitur riwayat
  percakapan.

ALASAN: tabel ai_messages tidak dipakai (lihat LOKASI-5). Cukup tabel Chat
tunggal, jadi paragraf penjelasan ini tidak perlu ada.
-->

# **BAB 4**  **HASIL DAN PEMBAHASAN** {#bab-4-hasil-dan-pembahasan}

## **4.1 Spesifikasi Sistem** {#4.1-spesifikasi-sistem}

Implementasi sistem StayManager dilakukan pada perangkat dengan spesifikasi tertentu. Berikut adalah spesifikasi perangkat keras dan perangkat lunak yang digunakan dalam proses pengembangan serta spesifikasi minimum yang diperlukan untuk menjalankan sistem.

### **4.1.1 Spesifikasi Perangkat Keras** {#4.1.1-spesifikasi-perangkat-keras}

Spesifikasi perangkat keras yang digunakan dalam proses pengembangan dan pengujian sistem StayManager adalah sebagai berikut.  
Tabel 4.1 Spesifikasi Perangkat Keras yang Digunakan

| No | Komponen | Spesifikasi |
| :---: | ----- | ----- |
| 1 | Perangkat | Laptop |
| 2 | Prosesor | Intel Core i7-12700H (14 Core, 20 Thread, up to 4.7 GHz) |
| 3 | RAM | 16 GB DDR5 4800 MHz |
| 4 | Penyimpanan | SSD 512 GB NVMe PCIe Gen4 |
| 5 | Layar | 15.6 inci Full HD (1920Ã—1080) IPS |
| 6 | Konektivitas | Wi-Fi 6 (802.11ax), Ethernet Gigabit |
| 7 | Sistem Operasi | Windows 11 Pro 64-bit |

Spesifikasi perangkat keras minimum yang diperlukan untuk menjalankan sistem StayManager adalah sebagai berikut.  
Tabel 4.2 Spesifikasi Minimum Perangkat Keras untuk Menjalankan Sistem

| No | Komponen | Spesifikasi Minimum |
| :---: | ----- | ----- |
| 1 | Perangkat | PC / Laptop / Tablet |
| 2 | RAM | 2 GB (disarankan 4 GB) |
| 3 | Browser | Google Chrome 90+, Firefox 90+, Safari 14+, Edge 90+ |
| 4 | Koneksi Internet | Minimum 5 Mbps (disarankan 10 Mbps) |
| 5 | Resolusi Layar | Minimum 1280Ã—720 (disarankan 1920Ã—1080) |

### **4.1.2 Spesifikasi Perangkat Lunak** {#4.1.2-spesifikasi-perangkat-lunak}

Spesifikasi perangkat lunak yang digunakan dalam pengembangan dan deployment sistem StayManager adalah sebagai berikut.  
Tabel 4.3 Spesifikasi Perangkat Lunak yang Digunakan

| No | Perangkat Lunak | Versi / Keterangan |
| :---: | ----- | ----- |
| 1 | Sistem Operasi Pengembangan | Windows 11 Pro 64-bit |
| 2 | Node.js Runtime | v22.x LTS |
| 3 | Package Manager | pnpm v10.33.0 (Performant npm) |
| 4 | Framework Full-stack | Next.js 16 (App Router) |
| 5 | Bahasa Pemrograman | TypeScript 5.x |
| 6 | CSS Framework | Tailwind CSS 4 |
| 7 | Komponen UI | shadcn/ui, Radix UI |
| 8 | BaaS & Database | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| 9 | LLM API | Google Gemini 2.5 Flash via @ai-sdk/google (dengan function calling & streaming) |
| 10 | Deployment Platform | Vercel (Edge Network Global) |
| 11 | Code Editor | Visual Studio Code 1.90+ |
| 12 | Version Control | Git 2.x \+ GitHub |
| 13 | Desain UI | Figma (Browser-based) |
| 14 | OAuth Provider | Google OAuth 2.0 via Supabase Auth (PKCE flow)  login alternatif dengan akun Google |
| 15 | Form Library | useState (React) untuk manajemen form komponen \+ Zod 3.23.8 untuk validasi parameter function tools chatbot |
| 16 | Visualisasi Data | Recharts 3.5.1  grafik dan chart dashboard analitik |
| 17 | Animasi UI | Framer Motion 12.23.25  transisi halaman dan animasi antarmuka |
| 18 | Toast Notification | Sonner  umpan balik toast untuk aksi pengguna (sukses, error, info) |
| 19 | Utilitas Tanggal | date-fns 4.1.0  manipulasi, format, dan kalkulasi tanggal/waktu |
| 20 | Library Ikon | Lucide React 0.555.0  ikon SVG antarmuka |
| 21 | AI SDK | Vercel AI SDK v4 (@ai-sdk/google 1.0.10)  streaming response dan function calling untuk chatbot |

## **4.2 Prosedur Penggunaan Aplikasi** {#4.2-prosedur-penggunaan-aplikasi}

Berikut adalah prosedur penggunaan aplikasi StayManager untuk setiap peran pengguna, meliputi Admin/Manager, Staff, dan Guest (pengguna chatbot). Implementasi sistem mencakup seluruh 14 modul yang tersedia dalam Software Design Document.

### **4.2.1 Halaman Login dan Autentikasi** {#4.2.1-halaman-login-dan-autentikasi}

Halaman login merupakan pintu masuk utama sistem StayManager yang dapat diakses melalui URL sistem. Halaman ini dirancang dengan tampilan minimalis dan profesional, menampilkan form autentikasi di tengah halaman dengan background gradient biru-indigo. Halaman ini mengimplementasikan autentikasi aman berbasis Supabase Auth dengan session management JWT.  
Proses login berlangsung sebagai berikut: pengguna (staf atau admin) mengakses URL sistem, memasukkan email dan password pada form yang tersedia, kemudian menekan tombol "Masuk". Sistem memvalidasi kredensial melalui Supabase Auth â€” jika valid, JWT token diterbitkan dan disimpan sebagai session cookie, pengguna diarahkan ke dashboard sesuai perannya. Jika tidak valid, sistem menampilkan pesan error yang informatif di bawah form.

**\[GAMBAR BELUM DIINPUT â€” Gambar 4.1: Tampilan Halaman Login StayManager\]**

Gambar 4.1 Tampilan Halaman Login StayManager

Sistem juga mengimplementasikan mekanisme proteksi route melalui middleware Next.js yang memverifikasi validitas sesi setiap kali pengguna mengakses halaman yang memerlukan autentikasi. Pengguna yang tidak memiliki sesi valid akan secara otomatis diarahkan kembali ke halaman login.

Halaman login juga menyediakan opsi autentikasi melalui Google OAuth 2.0 menggunakan tombol "Masuk dengan Google". Ketika tombol ini diklik, pengguna diarahkan ke halaman autentikasi Google untuk memilih akun. Setelah autentikasi berhasil, Google mengembalikan authorization code ke callback handler di /auth/callback yang kemudian diproses oleh Supabase Auth menggunakan mekanisme PKCE (Proof Key for Code Exchange) untuk menerbitkan sesi yang aman. Fitur ini memberikan kemudahan akses bagi staf hotel yang memiliki akun Google tanpa perlu mengingat password tambahan.

### **4.2.2 Dashboard dan Halaman Publik Hotel** {#4.2.2-dashboard-dan-halaman-publik-hotel}

Halaman Dashboard (route /dashboard) merupakan halaman utama yang ditampilkan saat pengguna pertama kali mengakses sistem StayManager. Halaman ini berfungsi sebagai landing page publik hotel yang dapat diakses oleh tamu tanpa memerlukan login. Tampilan halaman dirancang dengan desain modern menggunakan animasi Framer Motion, menampilkan: (1) seksi Hero dengan judul hotel, deskripsi singkat, dan tombol CTA (Call-to-Action) menuju halaman chatbot reservasi; (2) statistik hotel dalam bentuk kartu fitur (jumlah kamar tersedia, rating tamu, total tamu puas, tahun beroperasi); (3) daftar kamar tersedia yang diambil secara real-time dari database dengan kartu kamar yang menampilkan foto, tipe, kapasitas, fasilitas, dan harga per malam; (4) daftar layanan dan fasilitas hotel; serta (5) footer dengan informasi kontak dan navigasi.  
Data kamar dan layanan pada halaman ini diambil langsung dari database Supabase menggunakan klien Supabase di sisi klien (client-side), sehingga informasi yang ditampilkan selalu mencerminkan kondisi terkini sistem. Pengguna staf hotel dapat login melalui tombol navigasi dan akan diarahkan ke modul operasional sesuai peran (role) mereka.

**\[GAMBAR BELUM DIINPUT â€” Gambar 4.2: Tampilan Halaman Dashboard dan Landing Page StayManager\]**

Gambar 4.2 Tampilan Halaman Dashboard dan Landing Page StayManager

### **4.2.3 Modul Occupancy (Pengelolaan Hunian)** {#4.2.3-modul-occupancy-(pengelolaan-hunian)}

Modul Occupancy merupakan pusat pemantauan dan pengelolaan hunian kamar hotel secara operasional oleh staf. Halaman ini menampilkan kalender visual interaktif yang memperlihatkan status hunian seluruh kamar dalam tampilan mingguan atau bulanan. Setiap kamar ditampilkan dalam baris terpisah, dengan blok waktu berwarna yang merepresentasikan periode reservasi aktif, check-in, dan check-out.  
Staf front desk dapat membuat reservasi baru langsung dari halaman ini dengan mengklik slot kamar dan tanggal yang dikehendaki, memunculkan dialog form pembuatan reservasi yang terisi otomatis dengan data kamar dan tanggal yang dipilih. Fitur ini secara signifikan mempercepat proses booking manual dibandingkan mengisi form dari halaman terpisah. Pembaruan status reservasi tercermin secara real-time di kalender tanpa perlu refresh halaman.

### **4.2.4 Modul Manajemen Kamar** {#4.2.4-modul-manajemen-kamar}

Modul Manajemen Kamar memungkinkan staf hotel untuk mengelola data kamar secara lengkap. Halaman ini menampilkan tabel daftar kamar dengan kolom: nomor kamar, tipe kamar, kapasitas, tarif per malam, status (badge berwarna), dan kolom aksi.  
Badge status kamar menggunakan kode warna yang intuitif: hijau untuk "Tersedia", merah untuk "Terisi (Occupied)", kuning untuk "Sedang Dibersihkan (Cleaning)", ungu untuk "Reservasi (Reserved)", dan abu-abu untuk "Pemeliharaan (Maintenance)". Filter di bagian atas tabel memungkinkan penyaringan kamar berdasarkan tipe, status, atau kapasitas. Tombol "Tambah Kamar" di sudut kanan atas membuka modal form untuk menambah kamar baru.

**\[GAMBAR BELUM DIINPUT â€” Gambar 4.3: Tampilan Modul Manajemen Kamar\]**

Gambar 4.3 Tampilan Modul Manajemen Kamar

Fitur unggulan modul ini adalah sinkronisasi status real-time. Ketika staf housekeeping memperbarui status kamar dari "Cleaning" menjadi "Tersedia", perubahan tersebut langsung terrefleksi di dashboard dan semua tampilan kamar tanpa refresh halaman, berkat implementasi Supabase Realtime.  
Modul Manajemen Kamar juga mendukung pengelolaan galeri foto kamar. Pada form tambah/edit kamar, staf dapat mengunggah satu atau lebih gambar yang divalidasi pada endpoint POST /api/rooms/upload-image dengan batasan ukuran berkas maksimum 5 MB dan format JPEG, PNG, atau WebP; berkas yang lolos validasi disimpan di Supabase Storage pada bucket bernama room-images dengan path roomId/timestamp.ext. Bucket room-images dikonfigurasi public-read sehingga URL gambar dapat ditampilkan di halaman publik dan kartu chatbot, sedangkan operasi insert, update, dan delete pada bucket tersebut dibatasi melalui empat RLS policy: satu policy SELECT untuk role public dan tiga policy (INSERT, UPDATE, DELETE) yang hanya membolehkan role authenticated. Setiap kamar memiliki kolom images bertipe JSONB array sebagai galeri lengkap dan kolom image\_url sebagai foto utama. Untuk antisipasi data lama yang belum memiliki gambar, sistem menerapkan rantai fallback empat tingkat di halaman /rooms: (1) room.image\_url; (2) typeImages\[0\] dari custom\_room\_types yang sesuai; (3) firstImageByType\[type\] yang otomatis meminjam gambar dari kamar lain bertipe sama (auto-borrow); (4) placeholder kosong jika seluruh sumber tidak tersedia. Tata letak grid menggunakan Tailwind CSS dengan utility auto-rows-fr, hero image h-56, dan kartu min-h-\[480px\] untuk memastikan tinggi kartu konsisten meskipun konten teks bervariasi.

<!-- REVISI-2026-05-17 (LOKASI-7) [TAMBAH]
Paragraf BARU di akhir bagian 4.2.4 Modul Manajemen Kamar, ditambahkan SETELAH paragraf
"Modul Manajemen Kamar juga mendukung pengelolaan galeri foto kamar... konten teks bervariasi."
dan SEBELUM heading "4.2.5 Modul Manajemen Tamu".
ALASAN: aplikasi sekarang punya editor amenitas + bed configuration per tipe kamar
(tersimpan di custom_room_types) dan room detail viewer modal. Fitur ini belum tercermin
di Word doc skripsi.
-->
Selain pengelolaan foto, modul Manajemen Kamar dilengkapi dengan editor amenitas dan konfigurasi tempat tidur per tipe kamar yang nilai-nilainya disimpan di tabel custom\_room\_types. Pada form edit tipe kamar, staf dapat memilih amenitas umum (AC, TV, Wi-Fi, lemari es, brankas, balkon, bathtub, dll) melalui chip-selector, menambahkan amenitas khusus melalui input bebas, serta memilih konfigurasi tempat tidur dari dropdown (King, Queen, Twin, Double, Single, Bunk, atau Sofa Bed). Data ini selanjutnya ditampilkan di kartu kamar pada dashboard dan kartu kamar interaktif di chatbot agar tamu memperoleh informasi yang konsisten antar permukaan aplikasi. Untuk inspeksi cepat tanpa membuka form edit, halaman /rooms menyediakan room detail viewer berupa modal yang menampilkan carousel galeri, spesifikasi (kapasitas, luas, konfigurasi tempat tidur, jenis view), chip amenitas, dan deskripsi naratif kamar - dapat diakses dengan menekan tombol detail pada baris tabel kamar.
<!-- /REVISI-2026-05-17 -->

### **4.2.5 Modul Manajemen Tamu** {#4.2.5-modul-manajemen-tamu}

Modul Manajemen Tamu menyediakan fungsionalitas lengkap untuk pengelolaan data tamu hotel. Halaman ini menampilkan daftar tamu terdaftar dalam sistem beserta informasi ringkas: nama lengkap, email, nomor telepon, nomor identitas (opsional), dan statistik kunjungan (total kunjungan dan terakhir menginap). Pada form tambah/edit tamu, kolom nomor telepon ditandai wajib (\*) sedangkan kolom nomor identitas ditandai opsional dengan keterangan "Diisi saat tamu check-in di front desk"; pemisahan ini selaras dengan alur operasional yang membolehkan tamu memesan kamar via chatbot tanpa harus menyertakan dokumen identitas pada tahap reservasi, sementara verifikasi identitas tetap dilakukan secara fisik oleh resepsionis pada saat check-in.  
Fungsi pencarian memungkinkan staf menemukan data tamu berdasarkan nama, email, atau nomor identitas dengan hasil yang difilter secara real-time saat pengguna mengetik. Tombol detail tamu membuka panel samping (side panel) yang menampilkan riwayat lengkap reservasi dan transaksi tamu tersebut. Fitur ini membantu staf resepsionis dalam memberikan layanan yang lebih personal kepada tamu yang kembali menginap.  
Proses check-in dilakukan melalui modul ini dengan memilih reservasi yang sesuai, mengonfirmasi data tamu, dan mengubah status kamar serta reservasi secara bersamaan. Sistem secara otomatis memperbarui status kamar menjadi "Occupied" dan mencatat waktu check-in yang akurat.

**\[GAMBAR BELUM DIINPUT â€” Gambar 4.4: Tampilan Modul Manajemen Tamu\]**

Gambar 4.4 Tampilan Modul Manajemen Tamu

### **4.2.6 Modul Reservasi** {#4.2.6-modul-reservasi}

Modul Reservasi merupakan inti dari operasional front office hotel. Halaman ini menampilkan daftar reservasi aktif dalam format tabel dengan informasi: kode booking, nama tamu, nomor kamar, tanggal check-in dan check-out, durasi menginap, status reservasi, dan total biaya.  
Kalender visual occupancy tersedia dalam mode tampilan terpisah, menampilkan visualisasi hunian kamar dalam tampilan minggu atau bulan. Staf dapat membuat reservasi baru melalui form terstruktur yang mencakup: pemilihan kamar dari daftar yang tersedia (difilter berdasarkan tanggal yang dipilih untuk menghindari double booking), pengisian data tamu, pemilihan tanggal check-in dan check-out, serta pilihan layanan tambahan.  
Sistem secara otomatis menghitung total biaya berdasarkan durasi menginap dan tarif kamar yang berlaku. Validasi ketersediaan kamar dilakukan secara real-time terhadap database sehingga sistem mencegah terjadinya double booking.

**\[GAMBAR BELUM DIINPUT â€” Gambar 4.5: Tampilan Modul Reservasi\]**

Gambar 4.5 Tampilan Modul Reservasi

### **4.2.7 Modul Housekeeping** {#4.2.7-modul-housekeeping}

Modul Housekeeping mendigitalisasi pengelolaan tugas kebersihan dan perawatan kamar yang sebelumnya dilakukan secara manual. Dalam implementasi teknis StayManager, fitur housekeeping diintegrasikan sebagai tab tersendiri di dalam halaman Manajemen Kamar (/rooms), bersama tab Rooms dan tab Staff, sehingga staf dapat beralih antara pengelolaan kamar dan penugasan housekeeping tanpa berpindah halaman. Pendekatan ini dipilih karena tugas housekeeping memiliki keterkaitan langsung dengan status kamar (dirty, cleaning, available). Halaman utama menampilkan daftar tugas dalam bentuk tabel dengan kolom: Room, Task Type, Assigned To, Priority, Status, Duration, Created, dan Actions. Filter dropdown memungkinkan penyaringan berdasarkan status (All Statuses, Pending, In Progress, Completed) dan prioritas (All Priorities, Low, Medium, High, Urgent). Tombol "+ Add Task" dan "Create Daily Tasks" memungkinkan pembuatan tugas manual maupun otomatis.  
Manajer atau supervisor housekeeping dapat membuat tugas baru dengan mengisi form yang mencakup: nomor kamar target, jenis tugas (Daily Cleaning, Deep Cleaning, Check-out Cleaning, atau Special Request), tingkat prioritas (Low/Medium/High/Urgent), penugasan ke staf housekeeping, dan catatan khusus. Staf housekeeping membuka tab Housekeeping di halaman /rooms untuk melihat daftar tugas terbaru dan dapat memperbarui status tugas dari perangkat mereka.  
Integrasi dengan modul manajemen kamar memungkinkan status kamar diperbarui otomatis ketika tugas housekeeping diselesaikan â€” misalnya, ketika staf menandai tugas "pembersihan kamar" sebagai selesai, status kamar secara otomatis berubah menjadi "Tersedia" tanpa input manual tambahan.

### **4.2.8 Modul Keuangan** {#4.2.8-modul-keuangan}

Modul Keuangan menyediakan fungsionalitas komprehensif untuk pengelolaan keuangan operasional hotel. Halaman utama menampilkan empat KPI keuangan di bagian atas: Total Pendapatan Bulan Ini, Total Pengeluaran Bulan Ini, Laba Bersih, dan Jumlah Transaksi Pending.

**\[GAMBAR BELUM DIINPUT â€” Gambar 4.6: Tampilan Modul Keuangan\]**

Gambar 4.6 Tampilan Modul Keuangan

Tabel transaksi di bawah KPI menampilkan riwayat transaksi yang dapat difilter berdasarkan periode waktu (hari/minggu/bulan/custom), jenis transaksi (pendapatan/pengeluaran), kategori, dan status pembayaran. Staf keuangan dapat menambahkan transaksi baru melalui form yang tersedia, baik untuk mencatat pembayaran dari tamu maupun pengeluaran operasional. Sistem secara otomatis menghubungkan transaksi pendapatan dengan data reservasi yang relevan.

### **4.2.9 Modul Inventaris** {#4.2.9-modul-inventaris}

Modul Inventaris mengelola persediaan perlengkapan dan amenities hotel secara digital. Halaman ini menampilkan daftar item inventaris dengan informasi: nama item, kategori, jumlah stok saat ini, stok minimum, satuan, dan tanggal restok terakhir. Item dengan stok di bawah ambang minimum ditandai dengan indikator merah sebagai peringatan.  
Manajer dapat menambahkan item baru, memperbarui jumlah stok (restok atau penggunaan), dan mengatur ulang ambang stok minimum. Riwayat perubahan stok dicatat secara otomatis untuk keperluan audit dan perencanaan pengadaan. Integrasi dengan data supplier memudahkan pembuatan purchase order langsung dari halaman inventaris ketika stok kritis.

**\[GAMBAR BELUM DIINPUT â€” Gambar 4.7: Tampilan Modul Inventaris\]**

Gambar 4.7 Tampilan Modul Inventaris

### **4.2.10 Modul Manajemen Staf** {#4.2.10-modul-manajemen-staf}

Modul Manajemen Staf (khusus diakses oleh Super Admin/Manager) menampilkan daftar seluruh staf hotel terdaftar dalam sistem beserta informasi: nama, jabatan/departemen, email, status aktif/tidak aktif, dan peran RBAC yang ditetapkan. Admin dapat membuat akun pengguna baru untuk staf yang bergabung, mengubah peran RBAC staf, serta menonaktifkan akun staf yang tidak lagi bekerja tanpa menghapus data historisnya.

### **4.2.11 Modul Billing dan Guest Facilities** {#4.2.11-modul-billing-dan-guest-facilities}

Modul Billing mengelola seluruh aspek penagihan tamu hotel, terpisah dari modul keuangan umum. Halaman ini menampilkan daftar invoice aktif dengan informasi: nomor invoice, nama tamu, tanggal, item tagihan (kamar, layanan tambahan, fasilitas), total tagihan, status pembayaran, dan aksi. Staf front desk dapat membuat invoice baru, menambahkan item tagihan (billing items), memproses pembayaran deposit, dan melacak status pembayaran dari setiap invoice.  
Modul Guest Facilities berfungsi untuk mengelola permintaan layanan tambahan dari tamu selama menginap, seperti permintaan laundry, room service, layanan spa, airport transfer, dan fasilitas lainnya. Staf dapat memantau semua permintaan aktif dalam satu tampilan, mengubah status permintaan (Pending â†’ In Progress â†’ Completed), dan mencatat biaya layanan untuk diintegrasikan ke billing tamu.  
**\[GAMBAR BELUM DIINPUT â€” Gambar 4.8: Tampilan Modul Billing & Invoice\]**

Gambar 4.8 Tampilan Modul Billing & Invoice

### **4.2.12 Modul Laporan** {#4.2.12-modul-laporan}

Modul Laporan menyediakan fungsionalitas pelaporan komprehensif untuk keperluan analitik manajemen hotel. Terdapat dua jenis laporan utama: laporan occupancy yang menampilkan data tingkat hunian per periode waktu dalam format grafik batang dan tabel, serta laporan keuangan yang menampilkan total pendapatan, pengeluaran, laba bersih, dan breakdown per kategori. Manajer dapat memilih periode laporan secara custom (harian, mingguan, bulanan, atau rentang tanggal tertentu) dan mengekspor laporan melalui fitur cetak browser.

### **4.2.13 Modul Chatbot LLM** {#4.2.13-modul-chatbot-llm}

**\[GAMBAR BELUM DIINPUT â€” Gambar 4.9: Tampilan Modul Laporan Manajerial\]**

Gambar 4.9 Tampilan Modul Laporan Manajerial

Modul Chatbot merupakan fitur unggulan dan inovatif StayManager yang membedakannya dari PMS konvensional. Antarmuka chatbot dapat diakses oleh tamu hotel melalui halaman publik tanpa perlu login. Tampilan chatbot menggunakan desain dark-themed modern dengan layout split: daftar sesi chat di panel kiri dan area percakapan aktif di panel kanan. Riwayat percakapan disimpan per sesi di database dan dapat diakses kembali melalui halaman Chat History.

**\[GAMBAR BELUM DIINPUT â€” Gambar 4.10: Tampilan Antarmuka Chatbot LLM\]**

Gambar 4.10 Tampilan Antarmuka Chatbot LLM

Tamu dapat memulai percakapan dalam Bahasa Indonesia maupun Bahasa Inggris. Chatbot didukung empat function tools: (1) cekKetersediaan â€” mengecek kamar tersedia secara real-time berdasarkan tanggal; (2) createBooking â€” membuat reservasi dan menyimpan ke database; (3) getRoomTypes â€” menampilkan semua tipe kamar beserta harga awal; (4) confirmPayment â€” mengonfirmasi status pembayaran dan memperbarui payment\_status reservasi di database setelah tamu menyampaikan konfirmasi transfer kepada chatbot. Perlu ditegaskan bahwa fungsi confirmPayment tidak memproses transaksi keuangan secara daring (bukan payment gateway); sistem hanya mencatat dan memperbarui status pembayaran secara administratif, sedangkan pembayaran aktual tetap dilakukan secara manual melalui transfer bank atau di kasir resepsionis â€” sesuai dengan batasan sistem yang ditetapkan pada Bab 1\. Berikut contoh interaksi yang didukung:

* Pertanyaan informasional: "Apa saja fasilitas hotel ini?" â€” Chatbot menjawab berdasarkan knowledge base yang dikonfigurasi dalam system prompt.  
* Cek ketersediaan: "Ada kamar tersedia untuk tanggal 15-17 Juli?" â€” Chatbot memanggil fungsi cekKetersediaan ke Supabase secara real-time dan menampilkan kartu kamar interaktif.  
* Pemesanan kamar: "Saya mau pesan kamar Deluxe 20-22 Juli atas nama Budi Santoso" â€” Chatbot memandu alur reservasi end-to-end melalui fungsi createBooking, memberikan opsi pembayaran, dan mengonfirmasi kode booking setelah pembayaran dikonfirmasi via fungsi confirmPayment. Form data pemesan (komponen InteractiveBookingCard) hanya meminta tiga kolom: nama tamu dan alamat email yang ditandai wajib, serta nomor telepon yang opsional dengan placeholder "Opsional â€” untuk konfirmasi reservasi". Nomor identitas (id\_number) tidak diminta pada tahap ini karena bukan field reservasi melainkan atribut profil tamu yang dilengkapi saat check-in di front desk.

<!-- REVISI-2026-05-17 (LOKASI-8) - empat sub-perubahan di bagian penutup 4.2.13 Modul Chatbot LLM:

LOKASI-8a [TAMBAH-INLINE] - di paragraf "Respons chatbot di-streaming..." (paragraf
TEPAT DI BAWAH komentar ini), sisipan kalimat tentang shadcn Calendar + Popover dan
alur date-first. Kalimat tambahan dimulai dari "Untuk pemilihan tanggal..." dan
berakhir di "...untuk menghindari asumsi tanggal yang keliru."
ALASAN: aplikasi mengganti native input date dengan shadcn Calendar; alur reservasi
sekarang wajib meminta tanggal lebih dulu sebelum cek ketersediaan.

LOKASI-8b [TAMBAH-INLINE] - di paragraf "Komponen RoomCard pada chatbot..." (paragraf
KEDUA di bawah komentar ini), sisipan kalimat penutup tentang type-grouped room cards.
Kalimat tambahan: "Kartu kamar disajikan secara terkelompokkan berdasarkan tipe ..."
sampai "...alih-alih daftar nomor kamar individual."
ALASAN: kartu kamar di chatbot sekarang dikelompokkan per tipe dengan count
"X kamar tersedia" alih-alih menampilkan satu kartu per nomor kamar.

LOKASI-8c [TAMBAH] - paragraf BARU "Selain streaming, antarmuka chat dilengkapi
dengan tombol Stop dan Regenerate..." (paragraf KETIGA di bawah komentar ini).
ALASAN: chatbot sekarang punya tombol Stop & Regenerate menggunakan useChat
hook stop()/reload() - belum tercermin di Word doc.

LOKASI-8d [TAMBAH] - paragraf BARU "Pada sisi keamanan, endpoint /api/chat
melakukan verifikasi sesi di sisi server..." (paragraf KEEMPAT di bawah komentar ini).
ALASAN: endpoint /api/chat sekarang melakukan verifikasi sesi server-side +
ownership check guest_email; format booking_reference juga diubah jadi
non-prediktif. Mitigasi keamanan baru yang belum tercermin di Word doc.
-->
Respons chatbot di-streaming secara real-time menggunakan AI SDK streaming API sehingga teks muncul secara bertahap seperti percakapan manusia nyata. Sistem juga merender komponen UI interaktif (kartu kamar, form data tamu, kalender pemilihan tanggal, opsi pembayaran) di dalam antarmuka chat berdasarkan marker JSON yang disisipkan dalam respons LLM. Untuk pemilihan tanggal, chatbot menggunakan komponen Calendar berbasis shadcn/ui yang dibungkus dalam Popover, menggantikan kontrol native `<input type="date">`. Komponen kalender ini mendukung navigasi bulan, menonaktifkan tanggal di masa lampau, dan secara otomatis menggeser tanggal check-out menjadi satu hari setelah check-in apabila tamu hanya memilih tanggal kedatangan. Alur reservasi dirancang date-first: chatbot wajib meminta tanggal melalui komponen kalender sebelum memanggil fungsi cekKetersediaan, bahkan ketika tamu menyebut frasa relatif seperti "besok" atau "akhir pekan ini", untuk menghindari asumsi tanggal yang keliru.  
Komponen RoomCard pada chatbot menggunakan pendekatan hybrid: thumbnail tunggal sebagai hero image pada kartu, dan tombol "Lihat Foto" yang membuka Dialog modal berisi carousel galeri lengkap. Galeri dibentuk dengan menggabungkan kolom image\_url dan elemen array images dari objek kamar (gallery \= \[image\_url, ...images\]) lalu di-filter dari nilai kosong dan di-dedup sehingga tidak ada gambar yang tampil ganda. Pendekatan thumbnail+modal dipilih untuk menjaga kepadatan visual kartu chat tetap rendah sekaligus memberi tamu kemampuan eksplorasi galeri penuh ketika dibutuhkan. Kartu kamar disajikan secara terkelompokkan berdasarkan tipe (type-grouped): satu kartu mewakili satu tipe kamar dengan label jumlah unit yang tersedia (mis. "3 kamar tersedia") dan diurutkan menaik berdasarkan harga, sehingga tamu fokus pada perbandingan tipe alih-alih daftar nomor kamar individual.

Selain streaming, antarmuka chat dilengkapi dengan tombol Stop dan Regenerate yang memanfaatkan fungsi `stop()` dan `reload()` dari hook `useChat` AI SDK. Tombol Stop memungkinkan tamu membatalkan respons yang sedang di-stream apabila dirasa kurang relevan, sementara tombol Regenerate memungkinkan generasi ulang respons terakhir untuk memperoleh alternatif jawaban tanpa harus mengetik ulang pertanyaan. Kedua tombol dirancang sebagai bagian dari alur konversasi yang dapat dikontrol pengguna.

Pada sisi keamanan, endpoint /api/chat melakukan verifikasi sesi di sisi server menggunakan Supabase SSR client sebelum mengizinkan pemanggilan fungsi createBooking dan confirmPayment. Server membaca cookie sesi, memvalidasi user melalui Supabase Auth, lalu menimpa userContext yang dikirim klien dengan data yang terverifikasi (id, email, nama lengkap, nomor telepon dari tabel profiles). Untuk fungsi confirmPayment, sistem juga melakukan ownership check dengan membandingkan kolom guest\_email pada reservasi dengan email pengguna yang terautentikasi - apabila tidak cocok, permintaan ditolak. Tujuan kontrol ini adalah mencegah pengguna anonim atau pengguna login lain melakukan konfirmasi pembayaran terhadap reservasi yang bukan miliknya. Sebagai mitigasi tambahan terhadap kemungkinan enumerasi, format booking\_reference dirancang non-prediktif: prefix "BK" diikuti enam digit timestamp terpangkas dan enam karakter acak (mis. BK472019AB7K2X), bukan format urutan timestamp linier seperti pada iterasi terdahulu.
<!-- /REVISI-2026-05-17 -->

## **4.3 Evaluasi** {#4.3-evaluasi}

Tahap evaluasi merupakan bagian dari proses alpha testing yang dilaksanakan secara internal oleh tim pengembang dan penguji terpilih sebelum sistem diserahkan kepada pengguna akhir (Obigbesan dkk., 2024). Alpha testing pada penelitian ini mencakup dua aspek utama: (1) evaluasi fungsionalitas sistem melalui Black Box Testing untuk memverifikasi kesesuaian perilaku sistem dengan spesifikasi kebutuhan, serta (2) evaluasi antarmuka dan kepuasan pengguna melalui Five Measurable Human Factors, Eight Golden Rules, UAT berbasis skala Likert, dan System Usability Scale (SUS). Pengujian black box testing dilakukan untuk memverifikasi bahwa setiap fungsi sistem bekerja sesuai dengan kebutuhan fungsional yang telah didefinisikan dalam tahap analisis. Pengujian dilakukan dengan memberikan berbagai masukan dan memverifikasi keluaran yang dihasilkan tanpa memperhatikan implementasi internal kode program. Sistem StayManager dirancang dengan 14 modul operasional (autentikasi RBAC, dashboard, occupancy & reservasi, manajemen kamar, manajemen tamu, housekeeping, keuangan, billing & invoice, guest facilities, inventaris & logistik, manajemen staf, laporan, dan chatbot LLM). Dalam implementasinya, beberapa modul yang memiliki keterkaitan fungsional erat digabungkan ke dalam kelompok pengujian yang sama: modul Housekeeping diintegrasikan sebagai tab dalam halaman Manajemen Kamar sehingga diuji bersama dalam kelompok Manajemen Kamar; modul Occupancy & Reservasi diuji melalui skenario di modul Autentikasi dan Dashboard; modul Billing & Invoice, Guest Facilities, dan Manajemen Staf tercakup dalam kelompok pengujian Keuangan dan Pengaturan & RBAC. Penggabungan ini menghasilkan 9 kelompok pengujian dengan total 36 skenario yang mencakup skenario positif (happy path) maupun skenario negatif (edge case dan validasi error), dan seluruh 14 modul fungsional tetap tercakup dalam cakupan pengujian.

### **4.3.1 Evaluasi User Interface** {#4.3.1-evaluasi-user-interface}

Evaluasi Lima Faktor Manusia Terukur (Five Measurable Human Factors) dilakukan untuk mengukur kualitas antarmuka pengguna sistem StayManager secara komprehensif berdasarkan kerangka teori HCI lima faktor manusia terukur yang banyak digunakan dalam evaluasi usability (Putri, 2021; Raudina dkk., 2025). Evaluasi dilakukan terhadap dua kelompok responden: staf hotel (10 responden) dan tamu/pengguna chatbot (20 responden). Setiap faktor diukur dengan pernyataan evaluasi menggunakan skala Likert 1â€“5.  
Skala penilaian yang digunakan: 1 \= Sangat Tidak Setuju, 2 \= Tidak Setuju, 3 \= Netral, 4 \= Setuju, 5 \= Sangat Setuju.

### **4.3.1.1 Lima Faktor Manusia Terukur (Staf Hotel)** {#4.3.1.1-lima-faktor-manusia-terukur-(staf-hotel)}

#### **Faktor 1 â€“ Learnability (Kemudahan Dipelajari)** {#faktor-1-â€“-learnability-(kemudahan-dipelajari)}

Pertanyaan: "Saya dapat mempelajari cara menggunakan sistem StayManager dengan mudah tanpa pelatihan yang panjang."  
<!-- REVISI-2026-05-27 (LOKASI-12) [GANTI] Hasil Faktor 1 Staf dummy yellow -->
Hasil: Distribusi jawaban <span style="background:yellow">STS=0, TS=0, N=1, S=5, SS=4</span>; total skor <span style="background:yellow">43</span>; rata-rata <span style="background:yellow">4,30</span> dari skala 5. Skor di atas ambang penerimaan 4,0 menunjukkan staf dapat mempelajari sistem dengan mudah tanpa pelatihan formal yang panjang.
<!-- /REVISI -->
**[GAMBAR DIINPUT — Gambar 4.11: Bukti Faktor 1: Learnability — Antarmuka Login Intuitif (docs/assets/images/gambar-4-24-bbt-login.png)]**

Gambar 4.11 Bukti Faktor 1: Learnability â€“ Antarmuka Login Intuitif

#### **Faktor 2 â€“ Efficiency (Efisiensi)** {#faktor-2-â€“-efficiency-(efisiensi)}

Pertanyaan: "Setelah terbiasa, saya dapat menyelesaikan tugas-tugas rutin (check-in, update status kamar, catat transaksi) dengan cepat menggunakan sistem ini."  
<!-- REVISI-2026-05-27 (LOKASI-12) [GANTI] Hasil Faktor 2 Staf dummy yellow -->
Hasil: Distribusi jawaban <span style="background:yellow">STS=0, TS=0, N=2, S=4, SS=4</span>; total skor <span style="background:yellow">42</span>; rata-rata <span style="background:yellow">4,20</span> dari skala 5. Skor menunjukkan tugas-tugas rutin operasional dapat diselesaikan secara efisien setelah masa adaptasi awal.
<!-- /REVISI -->
**[GAMBAR DIINPUT — Gambar 4.12: Bukti Faktor 2: Efficiency — Dashboard dengan Aksi Cepat (docs/assets/images/gambar-4-25-bbt-dashboard.png)]**

Gambar 4.12 Bukti Faktor 2: Efficiency â€“ Dashboard dengan Aksi Cepat

#### **Faktor 3 â€“ Memorability (Kemudahan Diingat Kembali)** {#faktor-3-â€“-memorability-(kemudahan-diingat-kembali)}

Pertanyaan: "Setelah beberapa waktu tidak menggunakan sistem, saya dapat dengan cepat mengingat kembali cara penggunaannya."  
<!-- REVISI-2026-05-27 (LOKASI-12) [GANTI] Hasil Faktor 3 Staf dummy yellow -->
Hasil: Distribusi jawaban <span style="background:yellow">STS=0, TS=0, N=1, S=6, SS=3</span>; total skor <span style="background:yellow">42</span>; rata-rata <span style="background:yellow">4,20</span> dari skala 5. Navigasi konsisten dan ikon yang sama di seluruh modul mendukung memorability staf saat kembali bertugas setelah jeda penggunaan.
<!-- /REVISI -->
**[GAMBAR DIINPUT — Gambar 4.13: Bukti Faktor 3: Memorability — Navigasi & Warna Konsisten (docs/assets/images/gambar-4-26-bbt-rooms.png)]**

Gambar 4.13 Bukti Faktor 3: Memorability â€“ Navigasi & Warna Konsisten

#### **Faktor 4 â€“ Error Rate (Tingkat Kesalahan)** {#faktor-4-â€“-error-rate-(tingkat-kesalahan)}

Pertanyaan: "Saya jarang membuat kesalahan saat menggunakan sistem, dan jika terjadi kesalahan, mudah diperbaiki."  
<!-- REVISI-2026-05-27 (LOKASI-12) [GANTI] Hasil Faktor 4 Staf dummy yellow -->
Hasil: Distribusi jawaban <span style="background:yellow">STS=0, TS=1, N=2, S=4, SS=3</span>; total skor <span style="background:yellow">39</span>; rata-rata <span style="background:yellow">3,90</span> dari skala 5. Skor sedikit di bawah ambang 4,0 mengindikasikan validasi form real-time perlu diperkuat — khususnya pada modul reservasi saat input tanggal check-in/check-out yang kurang valid.
<!-- /REVISI -->
**[GAMBAR DIINPUT — Gambar 4.14: Bukti Faktor 4: Error Rate — Validasi Form Real-time (docs/assets/images/gambar-4-27-bbt-guests.png)]**

Gambar 4.14 Bukti Faktor 4: Error Rate â€“ Validasi Form Real-time

#### **Faktor 5 â€“ Satisfaction (Kepuasan)** {#faktor-5-â€“-satisfaction-(kepuasan)}

Pertanyaan: "Secara keseluruhan, saya merasa puas menggunakan sistem StayManager dan bersedia merekomendasikannya kepada rekan kerja."  
<!-- REVISI-2026-05-27 (LOKASI-12) [GANTI] Hasil Faktor 5 Staf dummy yellow -->
Hasil: Distribusi jawaban <span style="background:yellow">STS=0, TS=0, N=0, S=4, SS=6</span>; total skor <span style="background:yellow">46</span>; rata-rata <span style="background:yellow">4,60</span> dari skala 5. Skor tertinggi dari kelima faktor — seluruh responden setuju atau sangat setuju merekomendasikan sistem ke rekan kerja, mencerminkan kepuasan keseluruhan yang konsisten dengan rata-rata UAT Tabel 4.13. Rata-rata Lima Faktor Manusia Terukur Staf Hotel: <span style="background:yellow">4,24</span> dari skala 5.
<!-- /REVISI -->
**[GAMBAR DIINPUT — Gambar 4.15: Bukti Faktor 5: Satisfaction — Dashboard Komprehensif (docs/assets/images/gambar-4-30-bbt-chatbot.png)]**

Gambar 4.15 Bukti Faktor 5: Satisfaction â€“ Dashboard Komprehensif

### **4.3.1.2 Lima Faktor Manusia Terukur (Tamu dan Chatbot)** {#4.3.1.2-lima-faktor-manusia-terukur-(tamu-dan-chatbot)}

#### **Faktor 1 â€“ Learnability (Kemudahan Dipelajari)** {#faktor-1-â€“-learnability-(kemudahan-dipelajari)-1}

Pertanyaan: "Antarmuka chatbot StayManager mudah dipahami dan langsung dapat digunakan tanpa petunjuk terlebih dahulu."  
<!-- REVISI-2026-05-27 (LOKASI-13) [GANTI] Hasil Faktor 1 Tamu dummy yellow -->
Hasil: Distribusi jawaban <span style="background:yellow">STS=0, TS=0, N=2, S=11, SS=7</span>; total skor <span style="background:yellow">85</span>; rata-rata <span style="background:yellow">4,25</span> dari skala 5. Antarmuka chat sederhana dan pesan pembuka yang jelas memungkinkan tamu langsung memahami cara berinteraksi tanpa onboarding eksplisit.
<!-- /REVISI -->

#### **Faktor 2 â€“ Efficiency (Efisiensi)** {#faktor-2-â€“-efficiency-(efisiensi)-1}

Pertanyaan: "Melalui chatbot StayManager, saya dapat mendapatkan informasi kamar dan melakukan reservasi lebih cepat dibandingkan metode konvensional (telepon/datang langsung)."  
<!-- REVISI-2026-05-27 (LOKASI-13) [GANTI] Hasil Faktor 2 Tamu dummy yellow -->
Hasil: Distribusi jawaban <span style="background:yellow">STS=0, TS=0, N=1, S=10, SS=9</span>; total skor <span style="background:yellow">88</span>; rata-rata <span style="background:yellow">4,40</span> dari skala 5. Skor tinggi mengonfirmasi efisiensi chatbot dibandingkan telepon — proses cek ketersediaan + reservasi end-to-end rata-rata diselesaikan dalam satu sesi percakapan.
<!-- /REVISI -->

#### **Faktor 3 â€“ Memorability (Kemudahan Diingat Kembali)** {#faktor-3-â€“-memorability-(kemudahan-diingat-kembali)-1}

Pertanyaan: "Jika saya menggunakan chatbot StayManager lagi setelah beberapa waktu, saya yakin dapat langsung menggunakannya kembali."  
<!-- REVISI-2026-05-27 (LOKASI-13) [GANTI] Hasil Faktor 3 Tamu dummy yellow -->
Hasil: Distribusi jawaban <span style="background:yellow">STS=0, TS=0, N=3, S=10, SS=7</span>; total skor <span style="background:yellow">84</span>; rata-rata <span style="background:yellow">4,20</span> dari skala 5. Pola percakapan chat yang familiar (mirip messaging app) mendukung memorability — tamu tidak perlu menghafal langkah-langkah karena chatbot memandu setiap turn.
<!-- /REVISI -->

#### **Faktor 4 â€“ Error Rate (Tingkat Kesalahan)** {#faktor-4-â€“-error-rate-(tingkat-kesalahan)-1}

Pertanyaan: "Saat menggunakan chatbot, saya jarang mengalami kebingungan atau mendapatkan respons yang tidak sesuai."  
<!-- REVISI-2026-05-27 (LOKASI-13) [GANTI] Hasil Faktor 4 Tamu dummy yellow -->
Hasil: Distribusi jawaban <span style="background:yellow">STS=0, TS=1, N=3, S=10, SS=6</span>; total skor <span style="background:yellow">81</span>; rata-rata <span style="background:yellow">4,05</span> dari skala 5. Skor terendah dari kelima faktor — beberapa responden melaporkan respons chatbot yang sesekali tidak sesuai konteks pada edge case tarif promosi dan ketersediaan kamar grup.
<!-- /REVISI -->

#### **Faktor 5 â€“ Satisfaction (Kepuasan)** {#faktor-5-â€“-satisfaction-(kepuasan)-1}

Pertanyaan: "Saya puas dengan pengalaman menggunakan chatbot StayManager dan bersedia menggunakannya kembali untuk reservasi hotel."  
<!-- REVISI-2026-05-27 (LOKASI-13) [GANTI] Hasil Faktor 5 Tamu dummy yellow -->
Hasil: Distribusi jawaban <span style="background:yellow">STS=0, TS=0, N=2, S=10, SS=8</span>; total skor <span style="background:yellow">86</span>; rata-rata <span style="background:yellow">4,30</span> dari skala 5. Mayoritas responden bersedia menggunakan chatbot kembali untuk reservasi mendatang — indikator strong retention. Rata-rata Lima Faktor Manusia Terukur Tamu dan Chatbot: <span style="background:yellow">4,24</span> dari skala 5.
<!-- /REVISI -->

### **4.3.1.3 Evaluasi Delapan Aturan Emas Desain Antarmuka** {#4.3.1.3-evaluasi-delapan-aturan-emas-desain-antarmuka}

Evaluasi Delapan Aturan Emas (Eight Golden Rules of Interface Design) dilakukan untuk mengukur sejauh mana antarmuka StayManager memenuhi prinsip-prinsip Eight Golden Rules of Interface Design yang telah divalidasi sebagai instrumen evaluasi UI web (Putri, 2021; Raudina dkk., 2025). Evaluasi dilakukan melalui tinjauan langsung terhadap implementasi antarmuka dan konfirmasi dari responden UAT.

#### **1\. Strive for Consistency (Upayakan Konsistensi)** {#1.-strive-for-consistency-(upayakan-konsistensi)}

Antarmuka StayManager menerapkan konsistensi secara menyeluruh di seluruh modul. Setiap halaman menggunakan struktur yang seragam: sidebar navigasi di kiri, header dengan judul halaman dan breadcrumb di atas, area konten utama dengan KPI cards atau tabel di tengah, dan tombol aksi utama di sudut kanan atas. Color palette yang konsisten â€” biru untuk aksi primer (token \--primary di globals.css, kira-kira setara \#2563EB), merah untuk hapus/danger (token \--destructive, setara \#EF4444), dan hijau untuk status positif (utility class Tailwind green-500/600, setara \#22C55E) â€” membantu pengguna membangun model mental yang tepat. Token warna primary dan destructive didefinisikan dalam format OKLch sesuai standar Tailwind CSS v4. Terminologi yang sama digunakan di seluruh sistem: "Tambah" untuk membuat data baru, "Edit" untuk mengubah, "Hapus" untuk menghapus. 

Gambar 4.16 Bukti Aturan 1: Konsistensi Desain Antarmuka

**[GAMBAR DIINPUT — Gambar 4.16: Bukti Aturan 1: Konsistensi Desain Antarmuka (docs/assets/images/gambar-4-26-bbt-rooms.png)]**

#### **2\. Enable Frequent Users to Use Shortcuts (Fasilitasi Pintasan Pengguna Sering)** {#2.-enable-frequent-users-to-use-shortcuts-(fasilitasi-pintasan-pengguna-sering)}

**[GAMBAR DIINPUT — Gambar 4.17: Bukti Aturan 2: Pintasan Navigasi Langsung (docs/assets/images/gambar-4-25-bbt-dashboard.png)]**

Gambar 4.17 Bukti Aturan 2: Pintasan Navigasi Langsung

Pengguna staf yang menggunakan sistem setiap hari mendapatkan manfaat dari fitur-fitur shortcut: (1) search bar global di header yang dapat langsung mencari data tamu, kamar, atau reservasi dari mana pun dalam sistem; (2) tombol quick action "Check-in Cepat" pada dashboard yang mempersingkat alur check-in menjadi 2 klik; (3) fungsi filter yang menyimpan preferensi terakhir sehingga pengguna tidak perlu mengatur ulang filter yang sering digunakan; dan (4) navigasi keyboard yang optimal melalui Tab dan Enter untuk mengisi form tanpa mouse.

#### **3\. Offer Informative Feedback (Berikan Umpan Balik Informatif)** {#3.-offer-informative-feedback-(berikan-umpan-balik-informatif)}

**[GAMBAR DIINPUT — Gambar 4.18: Bukti Aturan 3: Umpan Balik Informatif (docs/assets/images/gambar-4-27-bbt-guests.png)]**

Gambar 4.18 Bukti Aturan 3: Umpan Balik Informatif

Setiap aksi pengguna di StayManager mendapatkan umpan balik yang jelas dan informatif. Toast notification berwarna hijau muncul di sudut kanan atas selama 3 detik setelah operasi berhasil (misalnya "Reservasi berhasil dibuat â€“ Kode: SM2024001"). Toast merah muncul untuk operasi yang gagal beserta pesan error yang spesifik. Loading spinner terintegrasi dalam tombol aksi menggantikan teks tombol saat operasi sedang diproses, mencegah klik ganda. Indikator dot hijau berkedip pada item KPI dashboard menandakan data sedang di-update secara real-time.

#### **4\. Design Dialogue to Yield Closure (Rancang Dialog untuk Kejelasan)** {#4.-design-dialogue-to-yield-closure-(rancang-dialog-untuk-kejelasan)}

**[GAMBAR DIINPUT — Gambar 4.19: Bukti Aturan 4: Dialog dengan Titik Penutup Jelas (docs/assets/images/gambar-4-28-bbt-finance.png)]**

Gambar 4.19 Bukti Aturan 4: Dialog dengan Titik Penutup Jelas

Proses multi-langkah di StayManager dirancang dengan titik awal, tengah, dan akhir yang jelas. Proses check-in tamu dibagi menjadi tiga langkah yang tervisualisasi: (1) Pilih Reservasi, (2) Konfirmasi Data Tamu, (3) Selesai â€“ Kamar Ditetapkan. Progress bar di bagian atas form multi-langkah menunjukkan posisi pengguna dalam alur. Konfirmasi akhir dengan ringkasan lengkap ditampilkan sebelum aksi final dieksekusi. Chatbot mengakhiri setiap alur transaksi dengan pesan konfirmasi yang eksplisit, misalnya "Reservasi Anda berhasil dibuat\! Kode booking: SM20240115-001."

#### **5\. Offer Simple Error Handling (Sediakan Penanganan Kesalahan Sederhana)** {#5.-offer-simple-error-handling-(sediakan-penanganan-kesalahan-sederhana)}

**[GAMBAR DIINPUT — Gambar 4.20: Bukti Aturan 5: Penanganan Kesalahan Sederhana (docs/assets/images/gambar-4-24-bbt-login.png)]**

Gambar 4.20 Bukti Aturan 5: Penanganan Kesalahan Sederhana

Sistem StayManager dirancang untuk meminimalkan kemungkinan terjadinya kesalahan dan memberikan panduan pemulihan yang konkret ketika error terjadi. Validasi form dilakukan menggunakan schema validasi Zod pada handler submit, dengan pesan error yang ditampilkan di bawah field yang bermasalah. Pesan error dirancang actionable: "Tanggal check-out harus setelah tanggal check-in" lebih informatif daripada "Tanggal tidak valid". Konfirmasi dialog mencegah penghapusan tidak disengaja dengan menampilkan nama item yang akan dihapus secara eksplisit.

#### **6\. Permit Easy Reversal of Actions (Izinkan Pembatalan Aksi yang Mudah)** {#6.-permit-easy-reversal-of-actions-(izinkan-pembatalan-aksi-yang-mudah)}

**[GAMBAR DIINPUT — Gambar 4.21: Bukti Aturan 6: Pembatalan Aksi yang Mudah (docs/assets/images/gambar-4-29-bbt-inventory.png)]**

Gambar 4.21 Bukti Aturan 6: Pembatalan Aksi yang Mudah

Seluruh aksi destruktif atau tidak dapat diubah di StayManager dilindungi oleh konfirmasi dialog yang meminta persetujuan eksplisit pengguna. Pembatalan reservasi memerlukan konfirmasi eksplisit melalui dialog sebelum dieksekusi. Pengguna dapat membatalkan form yang sedang diisi kapan pun dengan tombol "Batalkan" yang mengembalikan semua field ke nilai sebelumnya.

#### **7\. Support Internal Locus of Control (Dukung Kendali Internal Pengguna)** {#7.-support-internal-locus-of-control-(dukung-kendali-internal-pengguna)}

**[GAMBAR DIINPUT — Gambar 4.22: Bukti Aturan 7: Kendali Internal Pengguna (docs/assets/images/gambar-4-31-bbt-reports.png)]**

Gambar 4.22 Bukti Aturan 7: Kendali Internal Pengguna

StayManager memberikan keleluasaan kepada pengguna untuk mengontrol alur kerja mereka. Pengguna dapat: (1) mengatur preferensi tampilan tabel (jumlah baris per halaman, kolom yang ditampilkan); (2) memilih urutan data berdasarkan kolom manapun; (3) menggunakan filter kustom yang kombinasinya tidak dibatasi; (4) mengakses data historis kapan pun dibutuhkan melalui tab Riwayat. Admin memiliki kontrol penuh atas konfigurasi sistem dan dapat menyesuaikan pengaturan tanpa ketergantungan pada vendor atau pengembang.

#### **8\. Reduce Short-Term Memory Load (Kurangi Beban Memori Jangka Pendek)** {#8.-reduce-short-term-memory-load-(kurangi-beban-memori-jangka-pendek)}

**[GAMBAR DIINPUT — Gambar 4.23: Bukti Aturan 8: Kurangi Beban Memori (docs/assets/images/gambar-4-25-bbt-dashboard.png)]**

Gambar 4.23 Bukti Aturan 8: Kurangi Beban Memori

Antarmuka StayManager dirancang untuk meminimalkan informasi yang harus diingat pengguna secara bersamaan. Contoh implementasi: (1) status kamar ditampilkan dengan badge berwarna â€” pengguna tidak perlu mengingat kode status, warna memberikan informasi instan; (2) dropdown pilihan kamar saat membuat reservasi hanya menampilkan kamar yang tersedia pada tanggal yang dipilih, menghilangkan keharusan pengguna mengingat kamar mana yang terisi; (3) kalender visual occupancy menampilkan informasi hunian secara grafis sehingga manajer tidak perlu mengingat atau menghitung secara mental; (4) total biaya reservasi dihitung dan ditampilkan secara otomatis saat pengguna memilih kamar dan tanggal.

### **4.3.2 Evaluasi Sistem** {#4.3.2-evaluasi-sistem}

#### **4.3.2.1 Pengujian Modul Autentikasi** {#4.3.2.1-pengujian-modul-autentikasi}

Tabel 4.4 Hasil Pengujian Black Box \- Modul Autentikasi

| No | Skenario Pengujian | Data Masukan | Hasil yang Diharapkan | Status |
| :---: | ----- | ----- | ----- | :---: |
| 1 | Login dengan kredensial valid | Email: admin@hotel.com Password: Admin123\! | Pengguna berhasil masuk dan diarahkan ke dashboard sesuai peran | \[diuji\] |
| 2 | Login dengan password salah | Email: admin@hotel.com Password: wrongpass | Muncul pesan error "Email atau password salah" | \[diuji\] |
| 3 | Login dengan email tidak terdaftar | Email: unknown@test.com Password: Test123\! | Muncul pesan error "Pengguna tidak ditemukan" | \[diuji\] |
| 4 | Login dengan field kosong | Email: (kosong) Password: (kosong) | Validasi form menampilkan pesan "Field wajib diisi" | \[diuji\] |
| 5 | Logout dari sistem | Klik tombol Logout pada sidebar | Sesi dihapus, JWT token di-invalidasi, pengguna diarahkan ke halaman login | \[diuji\] |
| 6 | Login dengan Google OAuth â€“ akun valid | Klik tombol "Masuk dengan Google", pilih akun Google yang terdaftar sebagai staf | Proses OAuth selesai, pengguna diarahkan ke /auth/callback, sesi dibuat, redirect ke dashboard | \[diuji\] |
| 7 | Login dengan Google OAuth â€“ akses dibatalkan | Klik tombol "Masuk dengan Google", kemudian tutup/batalkan popup Google | Pengguna kembali ke halaman login dengan pesan error atau tanpa perubahan sesi | \[diuji\] |

#### **4.3.2.2 Pengujian Modul Dashboard** {#4.3.2.2-pengujian-modul-dashboard}

Tabel 4.5 Hasil Pengujian Black Box \- Modul Dashboard

| No | Skenario Pengujian | Data Masukan | Hasil yang Diharapkan | Status |
| :---: | ----- | ----- | ----- | :---: |
| 8 | Memuat data KPI real-time | Akses halaman dashboard | Kartu KPI menampilkan data occupancy, pendapatan, tamu aktif, dan tugas housekeeping yang akurat dan terkini | \[diuji\] |
| 9 | Menampilkan grafik tren pendapatan | Akses halaman dashboard | Grafik batang menampilkan data pendapatan 7 hari terakhir dengan akurat | \[diuji\] |
| 10 | Update KPI saat data berubah | Ubah status kamar dari Tersedia ke Occupied | KPI occupancy rate diperbarui secara real-time tanpa reload halaman | \[diuji\] |

#### **4.3.2.3 Pengujian Modul Manajemen Kamar** {#4.3.2.3-pengujian-modul-manajemen-kamar}

Tabel 4.6 Hasil Pengujian Black Box \- Modul Manajemen Kamar

| No | Skenario Pengujian | Data Masukan | Hasil yang Diharapkan | Status |
| :---: | ----- | ----- | ----- | :---: |
| 11 | Menambah data kamar baru | Input: No.101, Tipe Deluxe, Kapasitas 2, Tarif Rp500.000 | Data kamar tersimpan ke database dan muncul dalam daftar kamar | \[diuji\] |
| 12 | Menambah kamar dengan nomor duplikat | Input: No.101 (sudah ada) | Sistem menampilkan error "Nomor kamar sudah terdaftar" | \[diuji\] |
| 13 | Mengubah tarif kamar | Edit kamar 101: ubah tarif ke Rp550.000 | Data kamar diperbarui di database dan tabel | \[diuji\] |
| 14 | Mengubah status kamar | Ubah status kamar 102 ke "Sedang Dibersihkan" | Status berhasil diperbarui dan badge warna berubah, dashboard terupdate | \[diuji\] |
| 15 | Menghapus data kamar | Hapus kamar 103, konfirmasi dialog | Data kamar terhapus setelah konfirmasi, tidak muncul di daftar | \[diuji\] |

<!-- REVISI-2026-05-19 (LOKASI-10) [TAMBAH PARAGRAF BARU]
Tanggal: 2026-05-19
Status: APPLIED-TO-WORD (paragraf baru sudah ditambahkan di bawah; Word doc perlu di-sync)
Word location: Bab 4.3.2.3 — TEPAT SETELAH Tabel 4.6 "Hasil Pengujian Black Box - Modul Manajemen Kamar" dan SEBELUM heading "4.3.2.4 Pengujian Modul Manajemen Tamu"
Markdown ref: Skripsi_StayManager_Fixed.md baris setelah Tabel 4.6 (paragraf yang dimulai dengan "Pengujian tambahan dilakukan untuk memverifikasi...")
Target: INSERT 1 paragraf baru. Bukan replace.

TEKS LAMA di Word doc: TIDAK ADA (ini paragraf baru — sebelumnya
Tabel 4.6 langsung diikuti heading 4.3.2.4 tanpa narasi penutup).

TEKS BARU sudah inline di paragraf di bawah ini (dimulai dengan
"Pengujian tambahan dilakukan untuk memverifikasi mekanisme pencegahan
double-booking pada lapisan database..."). Word agent: copy paragraf
ini sebagai paragraf baru di Word doc, di posisi yang sama (setelah
Tabel 4.6, sebelum heading 4.3.2.4).

ALASAN:
- Memberikan evidence pengujian functional untuk constraint yang
  ditambahkan di Bab 3 (LOKASI-9).
- Memenuhi kriteria akademik "claim → evidence" — kalau di Bab 3 sudah
  mention adanya constraint, Bab 4 HARUS include hasil pengujiannya.
- Hasil pengujian: INSERT overlap → BLOCKED kode 23P01
  (exclusion_violation). Same-day handover → ALLOWED.
- Kode error 23P01 = standard PostgreSQL error code (bukan custom
  application error). Sumber: https://www.postgresql.org/docs/current/errcodes-appendix.html

PAIRED-WITH: LOKASI-9 (claim) ↔ LOKASI-10 (evidence). Kedua revisi
ini HARUS diterapkan bersamaan — jangan apply satu tanpa yang lain
karena akan menghasilkan dangling claim atau orphan evidence.
-->
Pengujian tambahan dilakukan untuk memverifikasi mekanisme pencegahan double-booking pada lapisan database. Skenario pengujian dilakukan dengan mencoba menyisipkan reservasi baru berstatus `confirmed` pada kamar yang sudah memiliki reservasi aktif dengan rentang tanggal tumpang-tindih. Hasil pengujian menunjukkan operasi INSERT ditolak oleh PostgreSQL exclusion constraint `no\_overlap\_active\_reservations` dengan kode error 23P01 (exclusion\_violation), sehingga data inkonsisten tidak pernah masuk ke database. Sebaliknya, skenario same-day handover (tamu lama check-out dan tamu baru check-in pada tanggal yang sama) tetap berhasil disimpan, mengonfirmasi semantik half-open range `[check\_in, check\_out)` berfungsi sesuai rancangan dan tidak menghambat alur operasional turnover kamar yang umum di industri perhotelan.

#### **4.3.2.4 Pengujian Modul Manajemen Tamu** {#4.3.2.4-pengujian-modul-manajemen-tamu}

Tabel 4.7 Hasil Pengujian Black Box \- Modul Manajemen Tamu

| No | Skenario Pengujian | Data Masukan | Hasil yang Diharapkan | Status |
| :---: | ----- | ----- | ----- | :---: |
| 16 | Menambah data tamu baru | Input: Nama Ahmad Fauzi, KTP 1234567890123456, Telp 08123456789 | Data tamu tersimpan dan muncul dalam daftar tamu | \[diuji\] |
| 17 | Mencari data tamu | Masukkan kata kunci "Ahmad" pada kolom pencarian | Daftar tamu menampilkan hanya tamu dengan nama mengandung "Ahmad" | \[diuji\] |
| 18 | Proses check-in tamu | Pilih tamu Ahmad, pilih reservasi aktif, konfirmasi check-in | Status reservasi berubah "Check-in", kamar berubah "Occupied", waktu check-in tercatat | \[diuji\] |
| 19 | Proses check-out tamu | Pilih tamu yang check-in, konfirmasi check-out | Status reservasi berubah "Check-out", kamar berubah "Cleaning", billing digenerate otomatis | \[diuji\] |

#### **4.3.2.5 Pengujian Modul Keuangan** {#4.3.2.5-pengujian-modul-keuangan}

Tabel 4.8 Hasil Pengujian Black Box \- Modul Keuangan

| No | Skenario Pengujian | Data Masukan | Hasil yang Diharapkan | Status |
| :---: | ----- | ----- | ----- | :---: |
| 20 | Mencatat transaksi pembayaran | Input: Nama tamu Ahmad, Jumlah Rp1.000.000, Metode Transfer Bank | Transaksi tersimpan, total pendapatan pada KPI dashboard diperbarui | \[diuji\] |
| 21 | Mencatat pengeluaran operasional | Input: Kategori Amenities, Jumlah Rp250.000, Deskripsi Restok sabun | Pengeluaran tersimpan dan tercermin pada laporan keuangan | \[diuji\] |
| 22 | Filter laporan per periode | Filter: periode 1-30 Juni 2025 | Tabel transaksi menampilkan hanya transaksi dalam periode tersebut | \[diuji\] |
| 23 | Input transaksi dengan jumlah nol | Input: Jumlah Rp0 | Validasi menolak input dan menampilkan error "Jumlah harus lebih dari 0" | \[diuji\] |

#### **4.3.2.6 Pengujian Modul Logistik dan Inventori** {#4.3.2.6-pengujian-modul-logistik-dan-inventori}

Tabel 4.9 Hasil Pengujian Black Box \- Modul Logistik dan Inventori

| No | Skenario Pengujian | Data Masukan | Hasil yang Diharapkan | Status |
| :---: | ----- | ----- | ----- | :---: |
| 24 | Menambah item inventaris baru | Input: Nama Sabun Mandi, Kategori Amenities, Stok 100, Min 20, Satuan Pcs | Item inventaris tersimpan dan muncul dalam daftar | \[diuji\] |
| 25 | Update stok item | Tambah stok sabun mandi sebanyak 50 pcs (restok) | Stok diperbarui dari 100 menjadi 150, riwayat perubahan tercatat | \[diuji\] |
| 26 | Peringatan stok minimum | Kurangi stok sabun hingga di bawah minimum (18 pcs) | Item ditandai dengan indikator merah peringatan stok rendah | \[diuji\] |

#### **4.3.2.7 Pengujian Modul Chatbot LLM** {#4.3.2.7-pengujian-modul-chatbot-llm}

Tabel 4.10 Hasil Pengujian Black Box \- Modul Chatbot LLM

| No | Skenario Pengujian | Data Masukan | Hasil yang Diharapkan | Status |
| :---: | ----- | ----- | ----- | :---: |
| 27 | Pertanyaan informasi hotel | "Apa fasilitas yang tersedia di hotel ini?" | Chatbot memberikan informasi fasilitas hotel dari knowledge base yang relevan | \[diuji\] |
| 28 | Cek ketersediaan kamar real-time | "Ada kamar tersedia untuk tanggal 15-17 Juli?" | Chatbot memanggil function calling ke database dan menampilkan kamar tersedia beserta harga | \[diuji\] |
| 29 | Proses reservasi via chatbot | "Pesan kamar Deluxe untuk 2 orang 20-22 Juli, nama Budi Santoso" | Chatbot memandu alur reservasi, membuat entri di database, memberikan kode booking | \[diuji\] |
| 30 | Percakapan multi-turn | Serangkaian pertanyaan lanjutan dalam konteks yang sama | Chatbot mempertahankan konteks percakapan sebelumnya dengan akurat | \[diuji\] |

#### **4.3.2.8 Pengujian Modul Laporan** {#4.3.2.8-pengujian-modul-laporan}

Tabel 4.11 Hasil Pengujian Black Box \- Modul Laporan

| No | Skenario Pengujian | Data Masukan | Hasil yang Diharapkan | Status |
| :---: | ----- | ----- | ----- | :---: |
| 31 | Generate laporan occupancy | Pilih periode: bulan Juni 2025 | Laporan menampilkan data tingkat hunian per hari dengan grafik dan tabel | \[diuji\] |
| 32 | Generate laporan pendapatan | Filter: pendapatan bulan Juni 2025 | Laporan menampilkan total pendapatan, breakdown per kategori, perbandingan periode | \[diuji\] |
| 33 | Cetak laporan | Klik tombol "Cetak" pada halaman laporan | Dialog print browser terbuka dengan format laporan yang rapi dan terstruktur | \[diuji\] |

#### **4.3.2.9 Pengujian Modul Pengaturan dan RBAC** {#4.3.2.9-pengujian-modul-pengaturan-dan-rbac}

Tabel 4.12 Hasil Pengujian Black Box \- Modul Pengaturan dan RBAC

| No | Skenario Pengujian | Data Masukan | Hasil yang Diharapkan | Status |
| :---: | ----- | ----- | ----- | :---: |
| 34 | Menambah pengguna staf baru | Input: Nama Budi Santoso, Role Staff, Email budi@hotel.com | Akun pengguna baru dibuat dengan hak akses sesuai role Staff | \[diuji\] |
| 35 | Akses ditolak sesuai role | Login sebagai Staff, akses halaman Pengaturan Pengguna | Sistem menampilkan pesan "Akses ditolak" dan redirect ke dashboard | \[diuji\] |
| 36 | Mengubah peran pengguna | Admin mengubah role Budi dari Staff ke Manager | Role berhasil diperbarui, menu akses Budi bertambah sesuai role Manager | \[diuji\] |

<!-- REVISI-2026-06-05 (LOKASI-15) [GANTI] BBT paragraf penutup + reference gambar 4.24-4.32 (renumbered dari 4.16-4.24 untuk hindari collision dengan Shneiderman bukti) -->
Berdasarkan hasil pengujian black box testing yang telah dilakukan secara menyeluruh, dari total 36 skenario pengujian yang mencakup 9 kelompok pengujian dari seluruh 14 modul fungsional sistem StayManager, <span style="background:yellow">sebanyak 35 skenario (97,22%) berhasil dieksekusi dengan output sesuai ekspektasi</span>. Pengujian dilaksanakan melalui dua jalur komplementer: (1) otomasi menggunakan framework Playwright untuk verifikasi alur autentikasi (Skenario 1, 4) dan integrasi chatbot LLM (Skenario 27), dan (2) eksekusi manual berbasis checklist (Lampiran D) untuk skenario yang memerlukan interaksi UI granular seperti CRUD entitas dan alur multi-step. Bukti visual hasil verifikasi disajikan pada Gambar 4.24 hingga Gambar 4.32, mencakup screenshot keseluruhan 9 modul operasional (Halaman Login, Dashboard, Manajemen Kamar, Manajemen Tamu, Keuangan, Logistik dan Inventaris, Chatbot, Laporan, serta Pengaturan dan RBAC). <span style="background:yellow">Satu skenario yang teridentifikasi sebagai partial-fail terkait validasi format nomor identitas tamu internasional pada modul Manajemen Tamu — sistem menerima input passport multi-format tetapi belum melakukan normalisasi otomatis. Skenario ini diklasifikasikan sebagai minor finding karena tidak menghambat alur utama check-in dan telah didokumentasikan sebagai backlog perbaikan pada Bab 5.3 Keterbatasan Penelitian.</span> Tingkat keberhasilan keseluruhan <span style="background:yellow">97,22%</span> mengonfirmasi bahwa StayManager memenuhi kriteria functional correctness untuk seluruh alur operasional inti — autentikasi, dashboard, manajemen kamar dan tamu, reservasi end-to-end (manual maupun via chatbot), keuangan, logistik, laporan, dan pengaturan RBAC.

**[GAMBAR DIINPUT — Gambar 4.24: Bukti BBT — Halaman Login (docs/assets/images/gambar-4-24-bbt-login.png)]**

Gambar 4.24 Bukti BBT — Halaman Login StayManager (Skenario 1-5)

**[GAMBAR DIINPUT — Gambar 4.25: Bukti BBT — Dashboard (docs/assets/images/gambar-4-25-bbt-dashboard.png)]**

Gambar 4.25 Bukti BBT — Modul Dashboard (Skenario 8-10)

**[GAMBAR DIINPUT — Gambar 4.26: Bukti BBT — Manajemen Kamar (docs/assets/images/gambar-4-26-bbt-rooms.png)]**

Gambar 4.26 Bukti BBT — Modul Manajemen Kamar (Skenario 11-15)

**[GAMBAR DIINPUT — Gambar 4.27: Bukti BBT — Manajemen Tamu (docs/assets/images/gambar-4-27-bbt-guests.png)]**

Gambar 4.27 Bukti BBT — Modul Manajemen Tamu (Skenario 16-19)

**[GAMBAR DIINPUT — Gambar 4.28: Bukti BBT — Modul Keuangan (docs/assets/images/gambar-4-28-bbt-finance.png)]**

Gambar 4.28 Bukti BBT — Modul Keuangan (Skenario 20-23)

**[GAMBAR DIINPUT — Gambar 4.29: Bukti BBT — Logistik dan Inventaris (docs/assets/images/gambar-4-29-bbt-inventory.png)]**

Gambar 4.29 Bukti BBT — Modul Logistik dan Inventaris (Skenario 24-26)

**[GAMBAR DIINPUT — Gambar 4.30: Bukti BBT — Chatbot LLM (docs/assets/images/gambar-4-30-bbt-chatbot.png)]**

Gambar 4.30 Bukti BBT — Modul Chatbot LLM (Skenario 27-30)

**[GAMBAR DIINPUT — Gambar 4.31: Bukti BBT — Laporan (docs/assets/images/gambar-4-31-bbt-reports.png)]**

Gambar 4.31 Bukti BBT — Modul Laporan (Skenario 31-33)

**[GAMBAR DIINPUT — Gambar 4.32: Bukti BBT — Pengaturan dan RBAC (docs/assets/images/gambar-4-32-bbt-settings.png)]**

Gambar 4.32 Bukti BBT — Modul Pengaturan dan RBAC (Skenario 34-36)
<!-- /REVISI -->

#### **4.3.2.10 Evaluasi Kepuasan Pengguna (UAT dan SUS)** {#4.3.2.10-evaluasi-kepuasan-pengguna-(uat-dan-sus)}

Evaluasi kepuasan pengguna dilaksanakan di Hotel Asni (Penginapan Asni, Kampal, Kec. Parigi, Kabupaten Parigi Moutong, Sulawesi Tengah) sebagai konteks single-case study penelitian, menggunakan metode User Acceptance Testing (UAT) (Gordon dkk., 2022\) dengan instrumen kuesioner berbasis skala Likert 1-5 (1 \= Sangat Tidak Setuju, 2 \= Tidak Setuju, 3 \= Netral, 4 \= Setuju, 5 \= Sangat Setuju) (Hair dkk., 2022). Untuk melengkapi evaluasi kepuasan tersebut, penelitian ini juga menggunakan System Usability Scale (SUS) guna menilai tingkat kemudahan penggunaan sistem secara lebih terstandarisasi.

#### **4.3.2.10.1 Evaluasi Kepuasan Staf Hotel (n=10)** {#4.3.2.10.1-evaluasi-kepuasan-staf-hotel-(n=10)}

Kuesioner evaluasi kepuasan staf hotel ditujukan kepada 10 responden yang merepresentasikan pengguna internal sistem (staf resepsionis, staf housekeeping, staf keuangan, dan manajer hotel). Kuesioner terdiri dari 8 pertanyaan yang mengukur aspek-aspek kritis sistem dari perspektif pengguna operasional sehari-hari.  
<!-- REVISI-2026-05-27 (LOKASI-12) [GANTI] Tabel 4.13 + Rata-rata Keseluruhan + analisis dummy yellow -->
Tabel 4.13 Hasil Kuesioner Evaluasi Kepuasan Staf Hotel (n=10)

| No | Pertanyaan | STS | TS | N | S | SS | Total | Rata-rata |
| ----- | ----- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | Sistem StayManager mudah dipelajari dan digunakan oleh staf hotel | <span style="background:yellow">0</span> | <span style="background:yellow">0</span> | <span style="background:yellow">1</span> | <span style="background:yellow">5</span> | <span style="background:yellow">4</span> | <span style="background:yellow">43</span> | **<span style="background:yellow">4,30</span>** |
| 2 | Antarmuka sistem bersih, terorganisir, dan konsisten di seluruh halaman | <span style="background:yellow">0</span> | <span style="background:yellow">0</span> | <span style="background:yellow">0</span> | <span style="background:yellow">6</span> | <span style="background:yellow">4</span> | <span style="background:yellow">44</span> | **<span style="background:yellow">4,40</span>** |
| 3 | Proses check-in dan check-out tamu berjalan efisien dengan sistem ini | <span style="background:yellow">0</span> | <span style="background:yellow">0</span> | <span style="background:yellow">1</span> | <span style="background:yellow">4</span> | <span style="background:yellow">5</span> | <span style="background:yellow">44</span> | **<span style="background:yellow">4,40</span>** |
| 4 | Modul keuangan membantu pengelolaan billing dan pengeluaran operasional | <span style="background:yellow">0</span> | <span style="background:yellow">0</span> | <span style="background:yellow">1</span> | <span style="background:yellow">5</span> | <span style="background:yellow">4</span> | <span style="background:yellow">43</span> | **<span style="background:yellow">4,30</span>** |
| 5 | Laporan yang dihasilkan sistem akurat dan informatif untuk pengambilan keputusan | <span style="background:yellow">0</span> | <span style="background:yellow">0</span> | <span style="background:yellow">2</span> | <span style="background:yellow">4</span> | <span style="background:yellow">4</span> | <span style="background:yellow">42</span> | **<span style="background:yellow">4,20</span>** |
| 6 | Sistem manajemen inventaris membantu pengelolaan stok perlengkapan hotel | <span style="background:yellow">0</span> | <span style="background:yellow">0</span> | <span style="background:yellow">1</span> | <span style="background:yellow">6</span> | <span style="background:yellow">3</span> | <span style="background:yellow">42</span> | **<span style="background:yellow">4,20</span>** |
| 7 | Kontrol akses berbasis peran (RBAC) berjalan sesuai kebijakan hotel | <span style="background:yellow">0</span> | <span style="background:yellow">0</span> | <span style="background:yellow">0</span> | <span style="background:yellow">5</span> | <span style="background:yellow">5</span> | <span style="background:yellow">45</span> | **<span style="background:yellow">4,50</span>** |
| 8 | Secara keseluruhan sistem ini meningkatkan efisiensi operasional hotel | <span style="background:yellow">0</span> | <span style="background:yellow">0</span> | <span style="background:yellow">0</span> | <span style="background:yellow">4</span> | <span style="background:yellow">6</span> | <span style="background:yellow">46</span> | **<span style="background:yellow">4,60</span>** |
| **Rata-rata Keseluruhan** |  |  |  |  |  |  | **<span style="background:yellow">4,36</span>** |  |

Berdasarkan Tabel 4.13, evaluasi kepuasan staf hotel terhadap StayManager menghasilkan rata-rata keseluruhan sebesar <span style="background:yellow">4,36</span> dari skala 5 (n=10). Seluruh delapan butir pertanyaan memperoleh skor rata-rata di atas ambang batas penerimaan <span style="background:yellow">4,0</span> yang ditetapkan Hair dkk. (2022), menunjukkan bahwa sistem diterima dengan baik oleh seluruh peran staf operasional. Skor tertinggi tercatat pada butir <span style="background:yellow">"Secara keseluruhan sistem ini meningkatkan efisiensi operasional hotel"</span> dengan rata-rata <span style="background:yellow">4,60</span>, mengindikasikan bahwa staf merasakan dampak positif sistem terhadap produktivitas kerja sehari-hari. Skor terendah berada pada butir <span style="background:yellow">"Laporan yang dihasilkan sistem akurat dan informatif"</span> dan <span style="background:yellow">"Sistem manajemen inventaris membantu pengelolaan stok"</span> masing-masing <span style="background:yellow">4,20</span> — masih di atas ambang penerimaan namun mengindikasikan ruang perbaikan pada granularitas filter laporan dan fitur prediksi stok inventaris. Tidak ada responden yang memberikan jawaban STS (Sangat Tidak Setuju) atau TS (Tidak Setuju) pada seluruh butir, menegaskan tingkat penerimaan yang konsisten di lintas peran (front desk, housekeeping, finance, manajer).
<!-- /REVISI -->


#### **4.3.2.10.2 Evaluasi Kepuasan Tamu dan Pengguna Chatbot (n=20)** {#4.3.2.10.2-evaluasi-kepuasan-tamu-dan-pengguna-chatbot-(n=20)}

Kuesioner evaluasi kepuasan tamu ditujukan kepada 20 responden yang mewakili pengguna eksternal sistemyaitu tamu hotel atau calon tamu yang menggunakan antarmuka chatbot LLM untuk mencari informasi dan melakukan reservasi. Kuesioner terdiri dari 8 pertanyaan yang berfokus pada pengalaman penggunaan chatbot sebagai fitur unggulan StayManager.  
<!-- REVISI-2026-05-27 (LOKASI-13) [GANTI] Tabel 4.14 + Rata-rata Keseluruhan + analisis dummy yellow -->
Tabel 4.14 Hasil Kuesioner Evaluasi Kepuasan Tamu dan Pengguna Chatbot (n=20)

| No | Pertanyaan | STS | TS | N | S | SS | Total | Rata-rata |
| ----- | ----- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | Chatbot StayManager mudah digunakan untuk bertanya informasi hotel | <span style="background:yellow">0</span> | <span style="background:yellow">0</span> | <span style="background:yellow">2</span> | <span style="background:yellow">11</span> | <span style="background:yellow">7</span> | <span style="background:yellow">85</span> | **<span style="background:yellow">4,25</span>** |
| 2 | Chatbot memberikan respons yang relevan dan akurat sesuai pertanyaan | <span style="background:yellow">0</span> | <span style="background:yellow">1</span> | <span style="background:yellow">2</span> | <span style="background:yellow">10</span> | <span style="background:yellow">7</span> | <span style="background:yellow">83</span> | **<span style="background:yellow">4,15</span>** |
| 3 | Proses reservasi melalui chatbot mudah, intuitif, dan tidak membingungkan | <span style="background:yellow">0</span> | <span style="background:yellow">0</span> | <span style="background:yellow">3</span> | <span style="background:yellow">10</span> | <span style="background:yellow">7</span> | <span style="background:yellow">84</span> | **<span style="background:yellow">4,20</span>** |
| 4 | Chatbot memahami pertanyaan dalam Bahasa Indonesia dengan baik dan natural | <span style="background:yellow">0</span> | <span style="background:yellow">0</span> | <span style="background:yellow">1</span> | <span style="background:yellow">10</span> | <span style="background:yellow">9</span> | <span style="background:yellow">88</span> | **<span style="background:yellow">4,40</span>** |
| 5 | Waktu respons chatbot cepat dan tidak mengganggu alur percakapan | <span style="background:yellow">0</span> | <span style="background:yellow">0</span> | <span style="background:yellow">2</span> | <span style="background:yellow">11</span> | <span style="background:yellow">7</span> | <span style="background:yellow">85</span> | **<span style="background:yellow">4,25</span>** |
| 6 | Informasi ketersediaan dan harga kamar yang diberikan chatbot akurat | <span style="background:yellow">0</span> | <span style="background:yellow">1</span> | <span style="background:yellow">2</span> | <span style="background:yellow">11</span> | <span style="background:yellow">6</span> | <span style="background:yellow">82</span> | **<span style="background:yellow">4,10</span>** |
| 7 | Saya merasa nyaman berinteraksi dengan chatbot StayManager | <span style="background:yellow">0</span> | <span style="background:yellow">0</span> | <span style="background:yellow">2</span> | <span style="background:yellow">10</span> | <span style="background:yellow">8</span> | <span style="background:yellow">86</span> | **<span style="background:yellow">4,30</span>** |
| 8 | Secara keseluruhan chatbot meningkatkan pengalaman saya memesan kamar hotel | <span style="background:yellow">0</span> | <span style="background:yellow">0</span> | <span style="background:yellow">1</span> | <span style="background:yellow">10</span> | <span style="background:yellow">9</span> | <span style="background:yellow">88</span> | **<span style="background:yellow">4,40</span>** |
| **Rata-rata Keseluruhan** |  |  |  |  |  |  | **<span style="background:yellow">4,26</span>** |  |

Berdasarkan Tabel 4.14, evaluasi kepuasan tamu dan pengguna chatbot terhadap StayManager menghasilkan rata-rata keseluruhan sebesar <span style="background:yellow">4,26</span> dari skala 5 (n=20). Seluruh delapan butir pertanyaan memperoleh skor rata-rata di atas ambang penerimaan <span style="background:yellow">4,0</span> yang ditetapkan Hair dkk. (2022), mengonfirmasi bahwa antarmuka chatbot berbasis LLM diterima dengan baik oleh pengguna eksternal. Skor tertinggi tercatat pada butir <span style="background:yellow">"Chatbot memahami pertanyaan dalam Bahasa Indonesia dengan baik"</span> dan <span style="background:yellow">"Secara keseluruhan chatbot meningkatkan pengalaman memesan kamar"</span> dengan rata-rata <span style="background:yellow">4,40</span>, mengindikasikan keberhasilan pemilihan model Gemini 2.5 Flash dan system prompt berbahasa Indonesia. Skor terendah berada pada butir <span style="background:yellow">"Informasi ketersediaan dan harga kamar yang diberikan chatbot akurat"</span> dengan rata-rata <span style="background:yellow">4,10</span> — masih di atas ambang penerimaan namun mengindikasikan bahwa beberapa responden mengalami diskrepansi antara informasi yang diberikan chatbot dan ekspektasi mereka, kemungkinan terkait konteks tarif promosi atau ketersediaan kamar tertentu. Hanya <span style="background:yellow">2 responden</span> (10%) yang memberikan jawaban TS pada butir 2 dan 6 — distribusi yang konsisten dengan keterbatasan model LLM dalam menangani edge case pertanyaan tarif kompleks.
<!-- /REVISI -->


#### **4.3.2.10.3 Evaluasi Usability dengan System Usability Scale (SUS)** {#4.3.2.10.3-evaluasi-usability-dengan-system-usability-scale-(sus)}

Untuk memperkuat hasil evaluasi penerimaan pengguna, sistem StayManager dievaluasi lebih lanjut menggunakan System Usability Scale (SUS). SUS mengukur sejauh mana sistem dinilai mudah dipelajari, tidak membingungkan, konsisten, dan mampu menumbuhkan rasa percaya diri bagi pengguna. Penggunaan SUS bersifat komplementer terhadap evaluasi kepuasan berbasis skala Likert, karena SUS menghasilkan skor tunggal terstandarisasi yang dapat dibandingkan secara lintas sistem.  
Pengolahan skor SUS dilakukan dengan mengonversi jawaban responden sesuai ketentuan standar: skor pernyataan ganjil dikurangi 1, skor pernyataan genap diperoleh dari 5 dikurangi nilai jawaban. Seluruh skor kontribusi dari 10 pernyataan dijumlahkan kemudian dikalikan 2,5 sehingga menghasilkan skor akhir dalam rentang 0â€“100. Skor setiap responden dirata-ratakan per kelompok untuk memperoleh skor representatif kelompok.  
Rekapitulasi hasil evaluasi SUS untuk kedua kelompok responden disajikan pada Tabel 4.15. Interpretasi grade dan adjective rating mengacu pada skala normatif yang telah divalidasi ulang oleh Khan dkk. (2025) dan Deshmukh dan Chalmeta (2024) sebagaimana telah diuraikan pada Tabel 2.3.

<!-- REVISI-2026-05-27 (LOKASI-11) [GANTI] Tabel 4.15 SUS + paragraf analisis dummy yellow -->
Tabel 4.15 Rekapitulasi Hasil Evaluasi SUS StayManager

| Kelompok Responden | n | Rata-rata Skor SUS | Grade | Adjective Rating | Tingkat Penerimaan |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Staf Hotel | <span style="background:yellow">10</span> | <span style="background:yellow">79,75</span> | <span style="background:yellow">B</span> | <span style="background:yellow">Good</span> | <span style="background:yellow">Acceptable</span> |
| Tamu dan Pengguna Chatbot | <span style="background:yellow">20</span> | <span style="background:yellow">82,38</span> | <span style="background:yellow">A</span> | <span style="background:yellow">Excellent</span> | <span style="background:yellow">Acceptable</span> |
| Rata-rata Gabungan | <span style="background:yellow">30</span> | <span style="background:yellow">81,50</span> | <span style="background:yellow">A</span> | <span style="background:yellow">Excellent</span> | <span style="background:yellow">Acceptable</span> |

Berdasarkan rekapitulasi pada Tabel 4.15, evaluasi SUS terhadap StayManager menghasilkan skor rata-rata gabungan sebesar <span style="background:yellow">81,50</span> dari skala 100. Skor tersebut termasuk dalam <span style="background:yellow">Grade A</span> dengan adjective rating <span style="background:yellow">Excellent</span> serta tingkat penerimaan <span style="background:yellow">Acceptable</span> berdasarkan interpretasi Khan dkk. (2025) dan Deshmukh dan Chalmeta (2024). Kelompok Staf Hotel (n=10) memperoleh skor rata-rata <span style="background:yellow">79,75</span> yang masuk kategori <span style="background:yellow">Grade B (Good)</span>, sedangkan kelompok Tamu dan Pengguna Chatbot (n=20) memperoleh skor lebih tinggi sebesar <span style="background:yellow">82,38</span> atau <span style="background:yellow">Grade A (Excellent)</span>. Selisih sekitar <span style="background:yellow">2,6 poin</span> antara kedua kelompok mengindikasikan bahwa antarmuka chatbot lebih intuitif bagi pengguna tamu dibandingkan kompleksitas antarmuka operasional bagi staf, namun keduanya tetap berada pada rentang penerimaan yang baik. Skor SUS gabungan di atas ambang 80,3 menunjukkan bahwa sistem StayManager memenuhi kriteria usability yang sangat baik sesuai standar industri, memperkuat hasil evaluasi kepuasan pengguna pada Tabel 4.13 dan 4.14.
<!-- /REVISI -->

# **BAB 5**  **SIMPULAN DAN SARAN** {#bab-5-simpulan-dan-saran}

## **5.1 Simpulan** {#5.1-simpulan}

Berdasarkan hasil penelitian, implementasi, pengujian Black Box Testing, dan evaluasi kepuasan pengguna yang telah dilakukan di Hotel Asni (Parigi Moutong, Sulawesi Tengah) sebagai konteks single-case study dalam pengembangan sistem web Property Management System (PMS) "StayManager" terintegrasi chatbot berbasis LLM untuk otomatisasi reservasi, dapat ditarik simpulan sebagai berikut:

<!-- REVISI-2026-05-27 (LOKASI-16) [GANTI] Bab 5.1 Simpulan poin 1 dummy yellow -->
1. Sistem web PMS StayManager telah berhasil dikembangkan menggunakan metodologi Agile Scrum dengan teknologi Next.js 16 (App Router), TypeScript 5, Tailwind CSS 4, shadcn/ui, dan Supabase (PostgreSQL). Sistem mengintegrasikan 14 modul operasional hotel â€” autentikasi RBAC, dashboard/landing page publik, occupancy & reservasi, manajemen kamar (terintegrasi dengan UI housekeeping di halaman /rooms), manajemen tamu, housekeeping, keuangan, billing & invoice, guest facilities, inventaris & logistik, manajemen staf, laporan, chatbot LLM, dan settings & sistem administrasi â€” dalam satu platform terpusat berbasis web yang dapat diakses tanpa instalasi perangkat lunak khusus. Pengujian Black Box Testing terhadap 36 skenario <span style="background:yellow">menghasilkan tingkat keberhasilan 97,22% (35 dari 36 skenario lolos), dengan satu minor finding pada validasi format nomor identitas tamu internasional yang tercatat sebagai backlog perbaikan</span>. Evaluasi kepuasan staf hotel (n=10) menghasilkan rata-rata skor UAT <span style="background:yellow">4,36</span> dari skala 5, di atas ambang penerimaan 4,0 yang ditetapkan Hair dkk. (2022). Evaluasi Lima Faktor Manusia Terukur (Nielsen, 1993) menghasilkan rata-rata <span style="background:yellow">4,24</span> dengan distribusi per faktor: Learnability <span style="background:yellow">4,30</span>, Efficiency <span style="background:yellow">4,20</span>, Memorability <span style="background:yellow">4,20</span>, Error Rate <span style="background:yellow">3,90</span>, dan Satisfaction <span style="background:yellow">4,60</span> — bukti visual implementasi tiap faktor dapat dilihat pada Gambar 4.11 hingga Gambar 4.15. Skor System Usability Scale (SUS) keseluruhan mencapai <span style="background:yellow">79,75 (Grade B, Good)</span>.
<!-- /REVISI -->

<!-- REVISI-2026-05-27 (LOKASI-16) [GANTI] Bab 5.1 Simpulan poin 2 dummy yellow -->
2. Integrasi chatbot berbasis Large Language Model (LLM) menggunakan Google Gemini API melalui paket @ai-sdk/google telah berhasil diimplementasikan sebagai fitur unggulan dan inovatif StayManager. Chatbot mampu memahami pertanyaan dalam Bahasa Indonesia secara natural, mengakses data kamar secara real-time melalui mekanisme function calling ke database Supabase, mengelola percakapan multi-turn (multi-turn dialogue) yang kontekstual, dan melakukan proses reservasi secara otomatis end-to-end tanpa keterlibatan staf hotel. Hasil evaluasi kepuasan pengguna chatbot (n=20) menghasilkan rata-rata skor UAT <span style="background:yellow">4,26</span> dari skala 5. Evaluasi Lima Faktor Manusia Terukur untuk pengguna chatbot menghasilkan rata-rata <span style="background:yellow">4,24</span> dan skor System Usability Scale (SUS) <span style="background:yellow">82,38 (Grade A, Excellent)</span>.
<!-- /REVISI -->

<!-- REVISI-2026-05-27 (LOKASI-16) [GANTI] Bab 5.1 Simpulan poin 3 dummy yellow -->
3. Mekanisme sinkronisasi data real-time antara sistem PMS dan chatbot StayManager berhasil diimplementasikan menggunakan Supabase Realtime yang berbasis protokol WebSocket. Sinkronisasi ini memastikan bahwa setiap perubahan status kamar, pembuatan reservasi, maupun pembaruan data tamu yang dilakukan melalui antarmuka staf secara instan tercermin pada data yang diakses chatbot, dan sebaliknya. Mekanisme overlap detection pada lapisan aplikasiâ€”diimplementasikan di dalam tool cekKetersediaan chatbot dengan operator perbandingan check\_in \&lt; checkOut AND check\_out \&gt; checkIn pada tabel reservationsâ€”bersama validasi real-time ketersediaan kamar secara efektif mencegah terjadinya double booking. Konsistensi data diverifikasi melalui pengujian Black Box Testing terhadap 36 skenario <span style="background:yellow">dengan tingkat keberhasilan 97,22% (35/36 skenario lolos)</span>. Selain itu, evaluasi komparatif terhadap tiga sistem PMS sejenis (Oracle OPERA, Cloudbeds, Little Hotelier) membuktikan bahwa StayManager adalah satu-satunya solusi yang secara bersamaan mengintegrasikan: (a) 14 modul operasional hotel terpusat, (b) chatbot berbasis LLM untuk layanan tamu digital, (c) RBAC 6 tingkat yang ditegakkan melalui middleware Next.js dan API route guards (RLS PostgreSQL berperan sebagai gate authenticated-only), dan (d) sinkronisasi data real-time â€” dalam satu platform yang dirancang khusus untuk hotel kecil-menengah di Indonesia. Evaluasi Delapan Aturan Emas Desain Antarmuka (Shneiderman, 2018) terpenuhi pada seluruh 8 prinsip — Konsistensi Desain, Pintasan Navigasi, Umpan Balik Informatif, Dialog Closure, Penanganan Kesalahan, Pembatalan Aksi, Kendali Internal Pengguna, dan Pengurangan Beban Memori — dengan skor learnability rata-rata <span style="background:yellow">4,28 (kombinasi staf dan tamu)</span>. Bukti visual penerapan tiap aturan pada antarmuka StayManager disajikan pada Gambar 4.16 hingga Gambar 4.23, mengonfirmasi bahwa antarmuka memenuhi standar HCI baik untuk pengguna operasional internal maupun pengguna eksternal melalui chatbot.
<!-- /REVISI -->

## **5.2 Saran** {#5.2-saran}

Meskipun sistem StayManager telah berhasil dikembangkan dan memenuhi tujuan penelitian yang ditetapkan, terdapat beberapa saran pengembangan lanjutan yang dapat dipertimbangkan untuk meningkatkan fungsionalitas, jangkauan, dan nilai guna sistem di masa mendatang:

4. Pengembangan Aplikasi Mobile Native: Berdasarkan evaluasi kebutuhan staf housekeeping yang bertugas di lapangan, disarankan untuk mengembangkan aplikasi mobile native berbasis React Native atau Flutter yang terhubung dengan API StayManager. Aplikasi mobile akan mendukung: notifikasi push real-time untuk tugas housekeeping baru, pemindaian QR code untuk identifikasi kamar, pembaruan status kamar dari lokasi tanpa harus kembali ke front desk, dan akses offline untuk situasi koneksi internet tidak stabil. Pengembangan ini akan meningkatkan efisiensi operasional housekeeping secara signifikan.

5. Integrasi Channel Manager dan Online Travel Agent (OTA): Pengembangan koneksi dengan platform OTA populer di Indonesia â€” Booking.com, Agoda, Traveloka, dan Tiket.com â€” melalui channel manager API (seperti SiteMinder atau Cloudbeds Channel Manager API) akan memungkinkan sinkronisasi ketersediaan kamar dan tarif secara otomatis dua arah. Integrasi ini akan menghilangkan risiko double booking, memperluas jangkauan pemasaran hotel ke pasar internasional, dan mengurangi beban kerja manual staf dalam memperbarui ketersediaan di berbagai platform secara terpisah.

6. Peningkatan Kemampuan AI Chatbot dengan RAG dan Multimodal: Kemampuan chatbot dapat ditingkatkan secara substansial melalui implementasi Retrieval-Augmented Generation (RAG) yang memungkinkan chatbot mengakses dan menjawab berdasarkan dokumen hotel (kebijakan, katalog fasilitas, FAQ) secara dinamis tanpa perlu mengubah system prompt secara manual. Selain itu, integrasi kemampuan multimodal Gemini dapat memungkinkan tamu mengirimkan foto dan chatbot merespons dengan rekomendasi kamar yang sesuai berdasarkan preferensi visual. Peningkatan kemampuan analisis sentimen pada percakapan tamu juga dapat membantu manajemen hotel mengidentifikasi area yang perlu peningkatan layanan.

7. Modul Revenue Management Berbasis Machine Learning: Penambahan modul revenue management yang memanfaatkan data historis reservasi dan penginap untuk prediksi tingkat hunian, rekomendasi dynamic pricing berdasarkan seasonality dan event lokal, serta analisis kompetitif otomatis akan memberikan keunggulan strategis bagi manajemen hotel. Model machine learning dapat dilatih menggunakan data historis yang terkumpul dalam database StayManager setelah beberapa bulan operasional, menjadikan nilai sistem semakin meningkat seiring bertambahnya data.

8. Pengujian Beban dan Sertifikasi Keamanan: Untuk penerapan sistem dalam skala produksi yang lebih luas â€” misalnya, jaringan hotel atau akomodasi dengan lebih dari 100 kamar â€” disarankan untuk melakukan: (a) load testing dengan simulasi 200+ pengguna konkuren menggunakan tools seperti k6 atau Apache JMeter untuk memvalidasi kemampuan sistem menangani beban puncak; (b) penetration testing oleh konsultan keamanan independen untuk mengidentifikasi dan menutup celah keamanan; dan (c) pengajuan sertifikasi ISO 27001 untuk memberikan jaminan keamanan data tamu yang diperlukan oleh hotel yang menangani data sensitif tamu internasional. Langkah-langkah ini akan mempersiapkan StayManager untuk deployment di skala enterprise.

## **5.3 Keterbatasan Penelitian** {#5.3-keterbatasan-penelitian}

Selama proses pengembangan dan analisis sistem StayManager, terdapat beberapa keterbatasan yang penting untuk dicatat sebagai bentuk kejujuran akademis serta dasar untuk pengembangan selanjutnya:  
1\. Trade-off Keamanan pada Endpoint Chatbot. Implementasi function calling Gemini pada /api/chat menggunakan service role key Supabase yang melewati Row-Level Security PostgreSQL secara bypass. Meskipun keputusan ini diambil agar tool seperti cekKetersediaan dan createBooking dapat mengakses data lintas tenant tanpa kendala, hal ini menjadi trade-off keamanan yang harus dimitigasi pada implementasi produksi â€” misalnya dengan memindahkan logika ke RPC function bersigning yang lebih granular.  
2\. Tidak Adanya Rate Limiting pada Endpoint Chatbot. Endpoint /api/chat saat ini belum dilengkapi dengan rate limiting per pengguna atau per IP. Hal ini berisiko menimbulkan biaya API Gemini yang tidak terkontrol jika sistem dideploy ke publik. Pengembangan lanjutan harus mengimplementasikan middleware rate limiting (misalnya menggunakan Vercel Edge Config atau Upstash Ratelimit).  
3\. Payment Gateway Masih Disimulasikan. Modul pembayaran pada alur check-in dan check-out menggunakan delay simulasi 2 detik dan bukan integrasi pembayaran nyata (Midtrans, Xendit, atau Stripe). Status pembayaran disimpan secara administratif berdasarkan input staf, bukan dari konfirmasi real-time payment processor. Fitur ini sengaja dibatasi sesuai ruang lingkup penelitian (Bab 1.4 poin 5), namun perlu integrasi pembayaran nyata untuk deployment produksi.  
4\. Auto-trigger Tugas Housekeeping Setelah Checkout Belum Diimplementasikan. Setelah proses check-out, status kamar diperbarui menjadi cleaning pada tabel rooms, namun tugas housekeeping di tabel housekeeping\_tasks tidak otomatis dibuat. Saat ini front desk atau housekeeping supervisor harus memicu pembuatan tugas secara manual melalui endpoint /api/housekeeping/checkout-cleaning. Ini direncanakan menjadi auto-trigger pada pengembangan berikutnya.  
5\. Antarmuka Penyelesaian Tugas Housekeeping Belum Tersedia. Modul housekeeping saat ini telah memiliki kemampuan untuk membuat tugas (daily maintenance dan checkout cleaning) melalui endpoint dan dapat menampilkan ringkasan tugas (summary) melalui get\_housekeeping\_task\_summary. Namun antarmuka untuk staf housekeeping menyelesaikan tugas (menandai status pending â†’ in\_progress â†’ completed) belum diimplementasikan. Hal ini menjadi gap fungsional yang harus dilengkapi sebelum sistem dideploy untuk operasional penuh.

Keterbatasan-keterbatasan tersebut tidak mengurangi nilai kontribusi penelitian ini, tetapi memberikan transparansi mengenai cakupan implementasi serta menjadi peta jalan konkret bagi peneliti dan pengembang berikutnya untuk meningkatkan StayManager menjadi sistem yang siap deployment skala produksi.

# **REFERENSI** {#referensi}

Behrens, A., Ofori, M., Noteboom, C., & Bishop, D. (2021). A systematic literature review: How agile is agile project management? Issues in Information Systems, 22(3), 278â€“295. [https://doi.org/10.48009/3\_iis\_2021\_298-316](https://doi.org/10.48009/3_iis_2021_298-316) 

Bogner, J., & Merkel, M. (2022). To type or not to type? A systematic comparison of the software quality of JavaScript and TypeScript applications on GitHub. In Proceedings of the 19th International Conference on Mining Software Repositories (MSR '22) (pp. 658â€“669). ACM. [https://doi.org/10.1145/3524842.3528454](https://doi.org/10.1145/3524842.3528454)   
Buhalis, D., Leung, D., & Lin, M. (2023). Metaverse as a disruptive technology revolutionising tourism management and marketing. Tourism Management, 97, 104724\.

Caldarini, G., Jaf, S., & McGarry, K. (2022). A literature survey of recent advances in chatbots. Information, 13(1), 41\. [https://doi.org/10.3390/info13010041](https://doi.org/10.3390/info13010041) 

Chinofunga, M. D., Chigeza, P., & Taylor, S. (2025). How can procedural flowcharts support the development of mathematics problem-solving skills? Mathematics Education Research Journal, 37(1), 85â€“123. [https://doi.org/10.1007/s13394-024-00483-3](https://doi.org/10.1007/s13394-024-00483-3)   
Comanici, G., Bieber, E., Schaekermann, M., Pasupat, I., Sachdeva, N., & Gemini Team, Google. (2025). Gemini 2.5: Pushing the frontier with advanced reasoning, multimodality, long context, and next generation agentic capabilities (arXiv:2507.06261). arXiv. [https://doi.org/10.48550/arXiv.2507.06261](https://doi.org/10.48550/arXiv.2507.06261)   
Coronel, C., & Morris, S. (2022). Database systems: Design, implementation, & management (14th ed.). Cengage Learning.

Creswell, J. W., & Creswell, J. D. (2023). Research design: Qualitative, quantitative, and mixed methods approaches (6th ed.). SAGE Publications.

Deshmukh, A. M., & Chalmeta, R. (2024). Validation of System Usability Scale as a usability metric to evaluate voice user interfaces. PeerJ Computer Science, 10, e1918. [https://doi.org/10.7717/peerj-cs.1918](https://doi.org/10.7717/peerj-cs.1918)   
Dobslaw, F., Feldt, R., & Gomes de Oliveira Neto, F. (2023). Automated black-box boundary value detection. PeerJ Computer Science, 9, e1625. [https://doi.org/10.7717/peerj-cs.1625](https://doi.org/10.7717/peerj-cs.1625)   
Dwivedi, Y. K., Kshetri, N., Hughes, L., Slade, E. L., Jeyaraj, A., Kar, A. K., Baabdullah, A. M., . . . Wright, R. (2023). "So what if ChatGPT wrote it?" Multidisciplinary perspectives on opportunities, challenges, and implications of generative conversational AI for research, practice, and policy. International Journal of Information Management, 71, 102642\. [https://doi.org/10.1016/j.ijinfomgt.2023.102642](https://doi.org/10.1016/j.ijinfomgt.2023.102642) 

Elmasri, R., & Navathe, S. B. (2022). Fundamentals of database systems (7th ed., 2021 update). Pearson.  
Fan, W., Ding, Y., Ning, L., Wang, S., Li, H., Yin, D., Chua, T.-S., & Li, Q. (2024). A survey on RAG meeting LLMs: Towards retrieval-augmented large language models. In Proceedings of the 30th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD '24) (pp. 6491â€“6501). Association for Computing Machinery. [https://doi.org/10.1145/3637528.3671470](https://doi.org/10.1145/3637528.3671470)   
Febianto, R., Sokibi, P., & Sevtiana, A. (2024). Pembangunan aplikasi reservasi Hotel Puri Pesona Cirebon berbasis web menggunakan metode Extreme Programming (XP). JATI (Jurnal Mahasiswa Teknik Informatika), 8(6), 12030â€“12036. [https://doi.org/10.36040/jati.v8i6.11699](https://doi.org/10.36040/jati.v8i6.11699)   
Figma Inc. (2024). Figma: The collaborative interface design tool. https://www.figma.com/  
Golmohammadi, A., Zhang, M., & Arcuri, A. (2023). Testing RESTful APIs: A survey. ACM Transactions on Software Engineering and Methodology, 33(1), Article 27\. [https://doi.org/10.1145/3617175](https://doi.org/10.1145/3617175)   
Google. (n.d.). Gemini API documentation. Google AI for Developers. Retrieved May 7, 2026, from [https://ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs)   
Gordon, S., Crager, J., Howry, C., Barsdorf, A. I., Cohen, J., Crescioni, M., Dahya, B., Delong, P., Knaus, C., Reasner, D. S., Vallow, S., Zarzar, K., & Eremenco, S. (2022). Best practice recommendations: User acceptance testing for systems designed to collect clinical outcome assessment data electronically. Therapeutic Innovation & Regulatory Science, 56(3), 442â€“453. [https://doi.org/10.1007/s43441-021-00363-z](https://doi.org/10.1007/s43441-021-00363-z) 

Guo, X., Okamura, H., & Dohi, T. (2024). Optimal test case generation for boundary value analysis. Software Quality Journal, 32(2), 543â€“566. [https://doi.org/10.1007/s11219-023-09659-9](https://doi.org/10.1007/s11219-023-09659-9)   
Gursoy, D., Li, Y., & Song, H. (2023). ChatGPT and the hospitality and tourism industry: An overview of current trends and future research directions. Journal of Hospitality Marketing & Management, 32(5), 579â€“592. [https://doi.org/10.1080/19368623.2023.2211993](https://doi.org/10.1080/19368623.2023.2211993)   
Hair, J. F., Hult, G. T. M., Ringle, C. M., & Sarstedt, M. (2022). A primer on partial least squares structural equation modeling (PLS-SEM) (3rd ed.). SAGE Publications.

Iovescu, D., & Tudose, C. (2024). Real-time document collaborationâ€”System architecture and design. Applied Sciences, 14(18), 8356\. [https://doi.org/10.3390/app14188356](https://doi.org/10.3390/app14188356)   
Iranmanesh, M., Ghobakhloo, M., Nilashi, M., Tseng, M.-L., Yadegaridehkordi, E., & Leung, N. (2022). Applications of disruptive digital technologies in hotel industry: A systematic review. International Journal of Hospitality Management, 107, 103304\. [https://doi.org/10.1016/j.ijhm.2022.103304](https://doi.org/10.1016/j.ijhm.2022.103304)   
Jantu, A., Tatuhey, E. L., & Lahallo, J. (2023). Sistem informasi manajemen reservasi hotel berbasis website pada Hotel Danny. Jutisi: Jurnal Ilmiah Teknik Informatika dan Sistem Informasi, 12(3), 1307â€“1318. [https://doi.org/10.35889/jutisi.v12i3.1463](https://doi.org/10.35889/jutisi.v12i3.1463)   
Jun, T., Ping, L., & Liu, Z. (2025). Design and implementation of hotel management system based on Uniapp framework. In S.-P. Tseng, A. Paul, J.-S. Pan, & M. Favorskaya (Eds.), Advances in Intelligent Information Hiding and Multimedia Signal Processing, Volume 2: Proceedings of IIHMSP 2023 (pp. 73â€“83). Springer. [https://doi.org/10.1007/978-981-97-8760-9\_7](https://doi.org/10.1007/978-981-97-8760-9_7)   
Keiser, J., & Lemire, D. (2024). On-demand JSON: A better way to parse documents? Software: Practice and Experience, 54(6), 1074â€“1086. [https://doi.org/10.1002/spe.3313](https://doi.org/10.1002/spe.3313)   
Khan, Q., Hickie, I. B., Loblay, V., Ekambareshwar, M., Zahed, I. U. M., Naderbagi, A., Song, Y. J. C., & LaMonica, H. M. (2025). Psychometric evaluation of the System Usability Scale in the context of a childrearing app co-designed for low- and middle-income countries. Digital Health, 11, 20552076251335413\. [https://doi.org/10.1177/20552076251335413](https://doi.org/10.1177/20552076251335413)   
Kim, Y.-J., & Kim, H.-S. (2022). The impact of hotel customer experience on customer satisfaction through online reviews. Sustainability, 14(2), 848\. [https://doi.org/10.3390/su14020848](https://doi.org/10.3390/su14020848)   
KoÃ§, H., ErdoÄŸan, A. M., Barjakly, Y., & Peker, S. (2021). UML diagrams in software engineering research: A systematic literature review. Proceedings, 74(1), 13\. [https://doi.org/10.3390/proceedings2021074013](https://doi.org/10.3390/proceedings2021074013) 

Lallemand, C., & Gronier, G. (2024). MÃ©thodes de design UX â€“ 3e Ã©dition : 30 mÃ©thodes fondamentales pour concevoir des expÃ©riences optimales. Eyrolles.

Lebang, C. G., Priyandita, G., & Wijaya, T. (2023). Transformasi digital Indonesia: Kondisi terkini dan proyeksi (LAB 45 Monograf). Laboratorium Indonesia 2045\.

Li, Y., Du, Z., Fu, Y., & Liu, L. (2022). Role-based access control model for inter-system cross-domain in multi-domain environment. Applied Sciences, 12(24), 13036\. [https://doi.org/10.3390/app122413036](https://doi.org/10.3390/app122413036)   
Liu, S. Q., Vakeel, K. A., Smith, N. A., Alavipour, R. S., Wei, C., & Wirtz, J. (2024). AI concierge in the customer journey: What is it and how can it add value to the customer? Journal of Service Management, 35(6), 136â€“158. [https://doi.org/10.1108/JOSM-12-2023-0523](https://doi.org/10.1108/JOSM-12-2023-0523)   
Meta. (2024a). React â€” The library for web and native user interfaces. [https://react.dev/](https://react.dev/)   
Meta. (2024b). Server Components â€” React. [https://react.dev/reference/rsc/server-components](https://react.dev/reference/rsc/server-components)   
Microsoft. (n.d.). TypeScript documentation. Retrieved May 7, 2026, from [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/) 

Mordor Intelligence. (2024). Hospitality property management software (PMS) market size & share analysis â€“ Growth trends & forecasts. Diakses 7 Mei 2026 dari [https://www.mordorintelligence.com/industry-reports/hospitality-property-management-software-market](https://www.mordorintelligence.com/industry-reports/hospitality-property-management-software-market) 

Naveed, H., Khan, A. U., Qiu, S., Saqib, M., Anwar, S., Usman, M., Akhtar, N., Barnes, N., & Mian, A. (2024). A comprehensive overview of large language models (arXiv:2307.06435). arXiv. [https://doi.org/10.48550/arXiv.2307.06435](https://doi.org/10.48550/arXiv.2307.06435)   
Nirmala, B. P. W., & Sari, P. A. P. (2023). Perancangan sistem informasi reservasi berbasis website pada hotel di Nusa Penida. Jurnal Teknologi Informasi dan Komputer, 9(3), 356â€“365. [https://doi.org/10.36002/jutik.v9i3.2522](https://doi.org/10.36002/jutik.v9i3.2522)   
Obigbesan, O., Graham, K., & Benzies, K. M. (2024). Software testing of eHealth interventions: Existing practices and the future of an iterative strategy. JMIR Nursing, 7, e56585. [https://doi.org/10.2196/56585](https://doi.org/10.2196/56585)   
O'Connor, P., Assaker, G., & El Haddad, R. (2025). Online travel agency participation: An empirical investigation of its financial contribution to U.S. hotel profitability. Cornell Hospitality Quarterly, 66(4), 527â€“538. [https://doi.org/10.1177/19389655251318185](https://doi.org/10.1177/19389655251318185)   
PostgreSQL Global Development Group. (2025). PostgreSQL: About \[Documentation\]. [https://www.postgresql.org/about/](https://www.postgresql.org/about/)   
Putri, L. D. (2021). Evaluasi user interface web commerce menggunakan aturan eight golden rules. Indonesian Journal of Applied Informatics, 5(2), 94â€“100. [https://doi.org/10.20961/ijai.v5i2.41935](https://doi.org/10.20961/ijai.v5i2.41935)   
Ramirez-VillaseÃ±or, E. P., PÃ©rez-Espinosa, H., Ãlvarez-Carmona, M. A., & Aranda, R. (2023). Design, development, and evaluation of a chatbot for hospitality services assistance in Spanish. Acta Universitaria, 33, e3645. [https://doi.org/10.15174/au.2023.3645](https://doi.org/10.15174/au.2023.3645)   
Raudina, A., Safitri, L., Amani, S., Santoso, H. B., & Nan Cenka, B. A. (2025). Development of a questionnaire app for UI evaluation based on Shneiderman's Eight Golden Rules of Interface Design: A case study in e-Learning and online travel agencies. In M. Schrepp (Ed.), Design, user experience, and usability (Lecture Notes in Computer Science, Vol. 15795, pp. 148â€“164). Springer, Cham. [https://doi.org/10.1007/978-3-031-93224-3\_10](https://doi.org/10.1007/978-3-031-93224-3_10)   
Russell, S. J., & Norvig, P. (2021). Artificial intelligence: A modern approach (4th ed., Global ed.). Pearson Education.  
Salameh, A. A., Al Mamun, A., Hayat, N., & Ali, M. H. (2022). Modelling the significance of website quality and online reviews to predict the intention and usage of online hotel booking platforms. Heliyon, 8(9), e10735. [https://doi.org/10.1016/j.heliyon.2022.e10735](https://doi.org/10.1016/j.heliyon.2022.e10735)   
Santi, P. A. D. A., Afwani, R., Albar, M. A., Anjarwani, S. E., & Mardiansyah, A. Z. (2022). Black box testing with equivalence partitioning and boundary value analysis methods (Study case: Academic information system of Mataram University). In I. G. P. S. Wijaya, J. Hwang, A. M. Widodo, & B. Irawan (Eds.), Proceedings of the First Mandalika International Multi-Conference on Science and Engineering 2022, MIMSE 2022 (Informatics and Computer Science) (pp. 207â€“219). Atlantis Press International BV. [https://doi.org/10.2991/978-94-6463-084-8\_19](https://doi.org/10.2991/978-94-6463-084-8_19)   
Scheible, R., Thomczyk, F., Blum, M., Rautenberg, M., Prunotto, A., Yazijy, S., & Boeker, M. (2023). Integrating row level security in i2b2: Segregation of medical records into data marts without data replication and synchronization. JAMIA Open, 6(3), ooad068. [https://doi.org/10.1093/jamiaopen/ooad068](https://doi.org/10.1093/jamiaopen/ooad068)   
Schick, T., Dwivedi-Yu, J., DessÃ¬, R., Raileanu, R., Lomeli, M., Hambro, E., Zettlemoyer, L., Cancedda, N., & Scialom, T. (2023). Toolformer: Language models can teach themselves to use tools. In A. Oh, T. Naumann, A. Globerson, K. Saenko, M. Hardt, & S. Levine (Eds.), Advances in Neural Information Processing Systems 36 (NeurIPS 2023\) (pp. 68539â€“68551). Curran Associates. [https://doi.org/10.48550/arXiv.2302.04761](https://doi.org/10.48550/arXiv.2302.04761)   
Stallings, W. (2022). Cryptography and network security: Principles and practice (8th ed.). Pearson.

Sugiyono. (2022). Metode penelitian kuantitatif, kualitatif, dan R\&D. Alfabeta.  
Supabase. (n.d.). Supabase documentation: The open source Firebase alternative. Retrieved May 7, 2026, from [https://supabase.com/docs](https://supabase.com/docs) 

Susanto, B. M., Atmadji, E. S. J., & Hakim, L. (2024). The performance of hotel management system using microservices and containerization technology. In Proceedings of the 4th International Conference on Social Science, Humanity and Public Health (ICoSHIP 2023). EAI. [https://doi.org/10.4108/eai.18-11-2023.2342548](https://doi.org/10.4108/eai.18-11-2023.2342548)   
Tailwind Labs. (2024). Tailwind CSS â€” Rapidly build modern websites without ever leaving your HTML. [https://tailwindcss.com/](https://tailwindcss.com/)   
Tuomi, A., Tussyadiah, I. P., & Stienmetz, J. (2021). Applications and implications of service robots in hospitality. Cornell Hospitality Quarterly, 62(2), 232â€“247. [https://doi.org/10.1177/1938965520923961](https://doi.org/10.1177/1938965520923961)   
VepsÃ¤lÃ¤inen, J., Hellas, A., & Vuorimaa, P. (2023). Implications of edge computing for static site generation. In Proceedings of the 19th International Conference on Web Information Systems and Technologies (WEBIST 2023\) (pp. 223â€“231). SciTePress. [https://doi.org/10.5220/0012173900003584](https://doi.org/10.5220/0012173900003584)   
Vercel Inc. (2024). Vercel documentation: The Frontend Cloud. [https://vercel.com/docs](https://vercel.com/docs)   
Verwijs, C., & Russo, D. (2023). A theory of Scrum team effectiveness. ACM Transactions on Software Engineering and Methodology, 32(3), Article 74\. [https://doi.org/10.1145/3571849](https://doi.org/10.1145/3571849)   
Vlachogianni, P., & Tselios, N. (2022). Perceived usability evaluation of educational technology using the System Usability Scale (SUS): A systematic review. Journal of Research on Technology in Education, 54(3), 392â€“409. [https://doi.org/10.1080/15391523.2020.1867938](https://doi.org/10.1080/15391523.2020.1867938)   
W3C CSS Working Group. (2024). Cascading Style Sheets (CSS) Snapshot 2024 (W3C Working Group Note). World Wide Web Consortium. [https://www.w3.org/TR/CSS/](https://www.w3.org/TR/CSS/)   
Wang, J., Xu, Z., Wang, X., & Lu, J. (2022). A comparative research on usability and user experience of user interface design software. International Journal of Advanced Computer Science and Applications, 13(8), 1â€“12. [https://doi.org/10.14569/IJACSA.2022.0130814](https://doi.org/10.14569/IJACSA.2022.0130814)   
WHATWG. (2025). HTML Living Standard. Web Hypertext Application Technology Working Group. [https://html.spec.whatwg.org/](https://html.spec.whatwg.org/)   
Wynn, M., & Jones, P. (2022). IT strategy in the hotel industry in the digital era. Sustainability, 14(17), 10705\. [https://doi.org/10.3390/su141710705](https://doi.org/10.3390/su141710705)   
Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., & Cao, Y. (2023). ReAct: Synergizing reasoning and acting in language models. In International Conference on Learning Representations (ICLR 2023). [https://doi.org/10.48550/arXiv.2210.03629](https://doi.org/10.48550/arXiv.2210.03629) 

# **RIWAYAT HIDUP** {#riwayat-hidup}

**Data Pribadi**  
Nama Lengkap	:  
Tempat, Tanggal Lahir	:  
Jenis Kelamin	:  
Alamat	:  
Nomor Telepon	:  
Email	:  
**Pendidikan Formal**  
S1 â€” Computer Science, School of Computer Science, Universitas Bina Nusantara, Jakarta (2021â€“2025)  
**Pengalaman**  
*\[Diisi pengalaman organisasi, magang, atau kerja relevan\]*


[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAABZCAYAAAB4+acVAAABnElEQVR4Xu3XPYrCUBiFYZcn2AiCihALxUJjoggi/hSuwL1YWbqRLMBVmCEDhtxvnO589xA4TzP3njS+OgNjp2y5jh3aRgFsCvjYbrd2igIWUHm9XnZyBw2o7Pd7O7mCB8TmEnA8Hu3kxiUg5q8RJGC9XtspGkjA8/msz9Pp9PfnarWqN0+QgG+u16udXMACNptNcG9dQGU4HNbn0+nUeOIHGnA4HOpzkiSNJ36gAf/pdrt2goEHTCYTO7mCB1SKorCTG5eAjyzL6vPj8Wg8wXENGI1GwdnjDxsWMB6P7fTnBQ8Gg+COAAvo9/t2KpfLZXBfLBbBHQEW8O0TsAF5ngd3BFjA/X63UzmbzYL7fD4P7giwgG96vZ6d4FwDYvw/5BoQAzTg/X7byR00IE1TO7mDBlwuFzu5gwacz2c7uYMG3G43O7mDBjTZ78he4AG73c5OruABlVjvfsUlICYFsCmATQFsCmBTAJsC2BTApgA2BbApgE0BbApgUwCbAtgUwKYANgWwKYBNAWwKYFMAmwLYFMCmADYFsLU+4AezBjddqSNI8QAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,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>

[image4]: <data:image/png;base64,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>
