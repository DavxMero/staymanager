/**
 * Google Apps Script — Single Google Form (dengan branching) untuk Kuesioner Penelitian Skripsi StayManager
 * v4.1 — Format penelitian akademik formal, semua identitas sudah terisi:
 *   - Halaman 1: Informed Consent + identitas tim peneliti + demografi universal + pilih kategori
 *   - Branching → 1 dari 3 instrumen (Staf Hotel / System Evaluator / Tamu Umum)
 *   - Konvergen ke SUS (semua responden isi)
 *
 * ============ CARA PAKAI — DUA MODE ============
 *
 * 🆕 MODE A: BUAT FORM BARU (default — kalau belum punya form)
 * ────────────────────────────────────────────────────────────
 * 1. Buka https://script.google.com/ → New project
 * 2. Hapus isi default Code.gs, paste seluruh isi file ini
 * 3. Save (Ctrl+S), beri nama "StayManager Kuesioner Skripsi"
 * 4. PASTIKAN konstanta EXISTING_FORM_ID di bawah masih kosong ('')
 * 5. Pilih function "createStayManagerForm" di dropdown → klik Run
 * 6. Authorize akses Google Forms
 * 7. View → Logs → salin Edit URL + Respond URL
 *
 * 🔄 MODE B: REVISI FORM YANG SUDAH ADA (kalau sudah pernah bikin form)
 * ──────────────────────────────────────────────────────────────────
 * 1. Buka form Anda yang lama di Drive, salin Form ID dari URL.
 *    Contoh URL: https://docs.google.com/forms/d/1abc...xyz/edit
 *                                            └── Form ID ─┘
 * 2. Paste Form ID di konstanta EXISTING_FORM_ID di bawah.
 * 3. Pilih function "createStayManagerForm" → Run
 * 4. Script akan:
 *    • HAPUS semua pertanyaan lama
 *    • BUAT ULANG dengan versi terbaru (login flow, dll)
 *    • URL form TIDAK BERUBAH — link yang sudah Anda share tetap valid
 * 5. Reset EXISTING_FORM_ID ke '' kalau nanti mau bikin form baru lagi.
 */

// ============================================================================
// PROFIL PENELITI — sudah terisi dari Skripsi_StayManager40_complete.md
// ============================================================================

// Peneliti 1 (kontak utama)
const RESEARCHER_1_NAME = 'Dava Remero';
const RESEARCHER_1_NIM = '2540124412';
const RESEARCHER_1_EMAIL = 'davaromero72@gmail.com';

// Peneliti 2 (rekan tim skripsi)
const RESEARCHER_2_NAME = 'Moh. Rezki';
const RESEARCHER_2_NIM = '2501992936';

// Institusi
const PROGRAM_STUDI = 'Teknik Informatika (Computer Science)';
const SCHOOL = 'School of Computer Science';
const UNIVERSITY = 'Universitas Bina Nusantara (BINUS University)';

// Dosen Pembimbing
const SUPERVISOR_NAME = 'Bapak Pualam Dipa Nusantara, S.Kom., M.Kom.';
const SUPERVISOR_CODE = 'D5186';

// Judul Skripsi
const RESEARCH_TITLE =
    'PENGEMBANGAN WEB PROPERTY MANAGEMENT SYSTEM (PMS) "STAYMANAGER" ' +
    'TERINTEGRASI CHATBOT BERBASIS LLM UNTUK OTOMATISASI RESERVASI';
const RESEARCH_TITLE_EN =
    'Development of the "StayManager" Web-based Property Management System (PMS) ' +
    'with LLM Chatbot Integration for Reservation Automation';

const DEMO_URL = 'https://staymanager.vercel.app';
const DEMO_CHATBOT_URL = DEMO_URL + '/chatbot';

// Akun demo untuk Staf Hotel / System Evaluator — akses modul-modul staf hotel
// (Dashboard, Kamar, Tamu, Reservasi, Keuangan, dst)
const DEMO_STAFF_LOGIN =
    'AKUN DEMO STAF (untuk eksplorasi modul hotel):\n' +
    '  Email: demo.manager@hotel-asni.com\n' +
    '  Kata sandi: DemoManager2026!\n' +
    '  Peran: Manager (akses 8 modul utama)';

// Akun demo untuk Tamu — akses chatbot + reservasi
const DEMO_GUEST_LOGIN =
    'AKUN DEMO TAMU (untuk eksperimen reservasi chatbot):\n' +
    '  Email: demo.guest@hotel-asni.com\n' +
    '  Kata sandi: DemoGuest2026!\n' +
    '  Peran: Guest';

// ============================================================================
// MODE: BUAT BARU atau REVISI FORM YANG SUDAH ADA?
// ============================================================================
//
// Kalau kosong ('') → script akan BIKIN FORM BARU
// Kalau diisi ID form → script akan REVISI form existing (tanpa hapus URL/response)
//
// Cara dapat Form ID:
//   1. Buka form yang sudah Anda buat sebelumnya di Drive
//   2. Lihat URL: https://docs.google.com/forms/d/[FORM_ID_DI_SINI]/edit
//   3. Salin bagian setelah /d/ (sebelum /edit) — itulah Form ID-nya
//
// Contoh URL form Anda yang lama:
//   https://docs.google.com/forms/d/1wfO7pOEqk1FBJdbjYc91TGW9nkQgXjTmpRlQi3ky1qs/edit
//   → Form ID = '1wfO7pOEqk1FBJdbjYc91TGW9nkQgXjTmpRlQi3ky1qs'
//
const EXISTING_FORM_ID = '';

// ============================================================================
// MASTER FUNCTION — run this
// ============================================================================

function createStayManagerForm() {
    Logger.log('=== Kuesioner Penelitian Skripsi — StayManager ===\n');

    let form;
    if (EXISTING_FORM_ID) {
        Logger.log('🔄 Mode REVISI — membuka form yang sudah ada...');
        try {
            form = FormApp.openById(EXISTING_FORM_ID);
        } catch (e) {
            Logger.log('❌ Form ID tidak valid atau tidak bisa diakses: ' + e.message);
            Logger.log('   Pastikan Form ID benar dan akun Anda punya akses edit.');
            return;
        }
        Logger.log('   Form ditemukan: "' + form.getTitle() + '"');

        const oldItems = form.getItems();
        Logger.log('   Menghapus ' + oldItems.length + ' item lama (akan diganti dengan versi baru)...');
        // Delete dari belakang ke depan supaya index tidak shift
        for (let i = oldItems.length - 1; i >= 0; i--) {
            form.deleteItem(oldItems[i]);
        }

        // Reset title (in case judulnya pernah berbeda)
        form.setTitle('Kuesioner Penelitian Skripsi — Evaluasi StayManager');
        Logger.log('   ✓ Item lama berhasil dihapus. Lanjut membangun ulang...\n');
    } else {
        Logger.log('🆕 Mode BUAT BARU — membuat form baru di Drive...\n');
        form = FormApp.create('Kuesioner Penelitian Skripsi — Evaluasi StayManager');
    }
    form.setDescription(
        '═══════════════════════════════════════════════════════════════\n' +
        'KUESIONER PENELITIAN SKRIPSI\n' +
        '═══════════════════════════════════════════════════════════════\n\n' +
        'JUDUL PENELITIAN\n' +
        RESEARCH_TITLE + '\n\n' +
        '(' + RESEARCH_TITLE_EN + ')\n\n' +
        '───────────────────────────────────────────────────────────────\n' +
        'TIM PENELITI\n' +
        '───────────────────────────────────────────────────────────────\n' +
        '1. ' + RESEARCHER_1_NAME + ' (NIM ' + RESEARCHER_1_NIM + ')\n' +
        '   Email kontak: ' + RESEARCHER_1_EMAIL + '\n\n' +
        '2. ' + RESEARCHER_2_NAME + ' (NIM ' + RESEARCHER_2_NIM + ')\n\n' +
        'Program Studi ' + PROGRAM_STUDI + '\n' +
        SCHOOL + '\n' +
        UNIVERSITY + '\n' +
        'Jakarta, 2026\n\n' +
        'Dosen Pembimbing: ' + SUPERVISOR_NAME + ' (' + SUPERVISOR_CODE + ')\n\n' +
        '───────────────────────────────────────────────────────────────\n' +
        'LATAR BELAKANG PENELITIAN\n' +
        '───────────────────────────────────────────────────────────────\n' +
        'StayManager merupakan sistem manajemen hotel (Property Management System) berbasis web ' +
        'yang dirancang khusus untuk hotel kecil hingga menengah. Sistem ini dilengkapi dengan ' +
        'chatbot kecerdasan buatan (AI) berbahasa Indonesia berbasis Large Language Model (LLM) ' +
        'yang dapat melayani tamu 24 jam untuk pertanyaan informasi hotel maupun proses ' +
        'reservasi kamar secara otomatis.\n\n' +
        'TUJUAN KUESIONER\n' +
        'Mengukur tingkat usability (kemudahan penggunaan) sistem StayManager berdasarkan ' +
        'kerangka teori Lima Faktor Manusia Terukur (Nielsen, 1993) dan Delapan Aturan Emas ' +
        'Desain Antarmuka (Schneiderman, 2018), serta mengukur skor System Usability Scale ' +
        '(SUS) yang dikembangkan oleh Brooke (1996).\n\n' +
        'DURASI PENGISIAN\n' +
        'Pengisian kuesioner ini memakan waktu sekitar 15-25 menit, tergantung kategori ' +
        'responden. Form akan menyesuaikan otomatis berdasarkan pilihan kategori Anda pada ' +
        'halaman pertama.\n\n' +
        'KERAHASIAAN DATA\n' +
        'Identitas Bapak/Ibu/Saudara/i akan dijaga kerahasiaannya. Data hanya akan digunakan ' +
        'untuk keperluan akademik penyusunan skripsi dan tidak akan disebarluaskan di luar ' +
        'konteks penelitian. Bapak/Ibu/Saudara/i berhak menghentikan pengisian kapan saja ' +
        'tanpa konsekuensi apapun.\n\n' +
        'Demo aplikasi yang akan dievaluasi: ' + DEMO_URL
    );
    form.setCollectEmail(false);
    form.setAllowResponseEdits(true);
    form.setShowLinkToRespondAgain(false);
    form.setConfirmationMessage(
        'Terima kasih atas partisipasi Bapak/Ibu/Saudara/i dalam pengisian kuesioner ' +
        'penelitian ini. Tanggapan Anda akan memberikan kontribusi yang sangat berharga bagi ' +
        'penyempurnaan sistem StayManager dan kelancaran penyusunan skripsi tim peneliti.\n\n' +
        'Apabila terdapat pertanyaan terkait penelitian ini, mohon menghubungi peneliti ' +
        'melalui email: ' + RESEARCHER_1_EMAIL + '\n\n' +
        'Hormat kami,\n\n' +
        RESEARCHER_1_NAME + ' (NIM ' + RESEARCHER_1_NIM + ')\n' +
        RESEARCHER_2_NAME + ' (NIM ' + RESEARCHER_2_NIM + ')\n\n' +
        PROGRAM_STUDI + '\n' +
        SCHOOL + ' — ' + UNIVERSITY
    );

    // ========================================================================
    // BAGIAN 1 — INFORMED CONSENT, DEMOGRAFI, DAN PILIHAN KATEGORI RESPONDEN
    // ========================================================================

    form.addSectionHeaderItem()
        .setTitle('Bagian 1 — Persetujuan Partisipasi (Informed Consent)')
        .setHelpText(
            'Mohon dibaca dengan saksama sebelum mengisi kuesioner. Persetujuan Anda diperlukan ' +
            'sebagai bagian dari etika penelitian akademik.'
        );

    form.addMultipleChoiceItem()
        .setTitle(
            'PERNYATAAN PERSETUJUAN: Dengan ini saya menyatakan bahwa saya telah membaca informasi ' +
            'di atas dan SECARA SUKARELA bersedia berpartisipasi dalam kuesioner penelitian ini. ' +
            'Saya memahami bahwa identitas saya akan dijaga kerahasiaannya dan data hanya digunakan ' +
            'untuk kepentingan akademik skripsi.'
        )
        .setChoiceValues([
            'Ya, saya bersedia berpartisipasi',
            'Tidak (silakan tutup form jika Anda memilih opsi ini)',
        ])
        .setRequired(true);

    form.addSectionHeaderItem()
        .setTitle('Bagian 2 — Identitas Responden (Data Demografi)')
        .setHelpText('Mohon isi data demografi dasar berikut untuk keperluan analisis penelitian.');

    form.addTextItem()
        .setTitle('Nama (boleh menggunakan inisial)')
        .setHelpText('Identitas akan disamarkan dalam pelaporan skripsi.')
        .setRequired(true);

    form.addMultipleChoiceItem()
        .setTitle('Jenis Kelamin')
        .setChoiceValues(['Laki-laki', 'Perempuan', 'Memilih tidak menjawab'])
        .setRequired(true);

    form.addMultipleChoiceItem()
        .setTitle('Kelompok Usia')
        .setChoiceValues(['17-24 tahun', '25-34 tahun', '35-44 tahun', '45-54 tahun', '≥ 55 tahun'])
        .setRequired(true);

    form.addMultipleChoiceItem()
        .setTitle('Pendidikan Terakhir')
        .setChoiceValues([
            'SMP / Sederajat',
            'SMA / SMK / Sederajat',
            'Diploma (D1/D2/D3/D4)',
            'Sarjana (S1)',
            'Magister (S2)',
            'Doktor (S3)',
        ])
        .showOtherOption(true)
        .setRequired(true);

    form.addTextItem()
        .setTitle('Domisili (Kota/Kabupaten)')
        .setHelpText('Contoh: Jakarta Selatan, Bandung, Surabaya. Opsional.')
        .setRequired(false);

    form.addSectionHeaderItem()
        .setTitle('Bagian 3 — Penentuan Kategori Responden')
        .setHelpText(
            'Kuesioner ini terbagi menjadi tiga instrumen berdasarkan latar belakang responden. ' +
            'Mohon pilih kategori yang paling sesuai dengan kondisi Anda saat ini. Sistem akan otomatis ' +
            'mengarahkan Anda ke instrumen yang relevan.'
        );

    const routingQ = form.addMultipleChoiceItem()
        .setTitle(
            'Kategori responden Anda adalah:'
        )
        .setHelpText(
            'Penjelasan tiap kategori:\n\n' +
            '• STAF HOTEL — Bapak/Ibu/Saudara/i sedang atau pernah bekerja di hotel/penginapan/villa ' +
            '(sebagai front desk, housekeeping, finance, manager, owner, atau posisi operasional lain).\n\n' +
            '• SYSTEM EVALUATOR — Anda mahasiswa Sistem Informasi/Informatika/Ilmu Komputer ATAU ' +
            'karyawan/profesional yang familiar dengan aplikasi berbasis web (dashboard, ERP, CRM, ' +
            'dll), tetapi BUKAN staf hotel. Tugas Anda adalah mengevaluasi kemudahan penggunaan ' +
            'sistem dari perspektif teknis/usability.\n\n' +
            '• TAMU/PENGGUNA UMUM — Anda pengguna umum (mahasiswa, guru, karyawan, wiraswasta, ' +
            'masyarakat umum) yang pernah atau berpotensi memesan kamar hotel melalui aplikasi online ' +
            '(Traveloka, Booking.com, dll). Anda akan mengevaluasi chatbot pemesanan StayManager dari ' +
            'perspektif tamu hotel.'
        )
        .setRequired(true);

    // ========================================================================
    // INSTRUMEN A: STAF HOTEL REAL (7 sub-bagian)
    // ========================================================================

    // ---- Staf A1: Pekerjaan ----
    const secStaf1 = form.addPageBreakItem()
        .setTitle('INSTRUMEN A (STAF HOTEL) — Bagian 1 dari 7: Profil Pekerjaan')
        .setHelpText(
            'Bagian ini menanyakan posisi dan pengalaman Bapak/Ibu/Saudara/i di industri perhotelan ' +
            'sebagai konteks evaluasi sistem.'
        );

    form.addMultipleChoiceItem()
        .setTitle('Posisi/Departemen saat ini di hotel')
        .setChoiceValues([
            'Front Desk / Resepsionis',
            'Housekeeping',
            'Keuangan / Finance',
            'Manager / Supervisor',
            'Owner / General Manager',
        ])
        .showOtherOption(true)
        .setRequired(true);

    form.addMultipleChoiceItem()
        .setTitle('Lama bekerja di industri perhotelan')
        .setChoiceValues(['< 1 tahun', '1-3 tahun', '3-5 tahun', '> 5 tahun'])
        .setRequired(true);

    form.addTextItem()
        .setTitle('Nama hotel tempat bekerja (boleh disamarkan untuk kerahasiaan)')
        .setHelpText('Contoh deskripsi yang dapat digunakan: "Hotel bintang 3 di area Jakarta Selatan"')
        .setRequired(true);

    form.addMultipleChoiceItem()
        .setTitle('Skala/Ukuran hotel tempat bekerja')
        .setChoiceValues([
            'Guest house / Penginapan kecil (< 10 kamar)',
            'Hotel bintang 1-2 (10-50 kamar)',
            'Hotel bintang 3 (50-100 kamar)',
            'Hotel bintang 4-5 (> 100 kamar)',
        ])
        .setRequired(true);

    // ---- Staf A2: Sistem Existing ----
    form.addPageBreakItem()
        .setTitle('INSTRUMEN A — Bagian 2 dari 7: Sistem yang Saat Ini Digunakan')
        .setHelpText(
            'Bagian ini menanyakan tentang sistem/alat yang Bapak/Ibu/Saudara/i pakai SAAT INI ' +
            'untuk pekerjaan sehari-hari. Pertanyaan ini BUKAN tentang StayManager — jawaban Anda ' +
            'akan dijadikan baseline pembanding terhadap StayManager pada bagian-bagian selanjutnya.'
        );

    form.addCheckboxItem()
        .setTitle('Sistem/alat yang digunakan saat ini untuk operasional hotel (boleh pilih lebih dari satu)')
        .setChoiceValues([
            'Microsoft Excel / Google Sheets',
            'Aplikasi PMS spesifik (mohon sebutkan di "Lainnya")',
            'WhatsApp untuk koordinasi internal staf',
            'Pencatatan manual (buku/kertas)',
            'Aplikasi akuntansi (mis. Accurate, Jurnal.id)',
        ])
        .showOtherOption(true)
        .setRequired(true);

    form.addMultipleChoiceItem()
        .setTitle('Estimasi durasi rata-rata proses check-in tamu')
        .setChoiceValues(['< 5 menit', '5-10 menit', '10-20 menit', '> 20 menit'])
        .setRequired(true);

    form.addParagraphTextItem()
        .setTitle('Kendala utama yang Bapak/Ibu/Saudara/i hadapi dengan sistem yang dipakai saat ini')
        .setHelpText(
            'Mohon ceritakan secara bebas. Aspek yang dapat dibahas: efisiensi waktu, akurasi data, ' +
            'koordinasi antar staf, kemudahan rekap, dll.'
        )
        .setRequired(false);

    // ---- Staf A3: Antarmuka StayManager ----
    form.addPageBreakItem()
        .setTitle('INSTRUMEN A — Bagian 3 dari 7: Evaluasi Antarmuka Sistem StayManager')
        .setHelpText(
            'PETUNJUK EKSPLORASI:\n\n' +
            '1. Buka alamat demo: ' + DEMO_URL + '\n' +
            '2. Login menggunakan akun demo berikut:\n\n' +
            '   ' + DEMO_STAFF_LOGIN.split('\n').join('\n   ') + '\n\n' +
            '3. Eksplorasi minimal 10-15 menit, coba semua modul utama:\n' +
            '   Dashboard, Manajemen Kamar, Tamu, Reservasi (Occupancy), Keuangan,\n' +
            '   Billing, Laporan, dan Pengaturan.\n' +
            '4. Setelah eksplorasi, mohon berikan penilaian pada skala Likert 5-poin di bawah.\n\n' +
            'Keterangan skala: 1 = Sangat Tidak Setuju, 2 = Tidak Setuju, 3 = Netral, ' +
            '4 = Setuju, 5 = Sangat Setuju.'
        );

    addLikertGrid(form, 'Penilaian Antarmuka dan Navigasi', [
        'Tampilan antarmuka StayManager bersih, rapi, dan tidak membingungkan',
        'Navigasi antar modul (Kamar, Tamu, Reservasi, Keuangan, dll) mudah dipahami',
        'Label tombol, menu, dan formulir jelas dalam Bahasa Indonesia',
        'Sistem memberikan umpan balik (feedback) yang jelas ketika saya melakukan aksi',
        'Tata letak informasi pada setiap halaman terorganisir dengan baik',
    ]);

    // ---- Staf A4: Fungsionalitas Operasional ----
    form.addPageBreakItem()
        .setTitle('INSTRUMEN A — Bagian 4 dari 7: Fungsionalitas Operasional')
        .setHelpText(
            'Bagian ini berfokus pada penilaian fitur-fitur yang relevan dengan operasional hotel ' +
            'sehari-hari. Mohon menjawab berdasarkan pengalaman eksplorasi sistem.'
        );

    addLikertGrid(form, 'Penilaian Fungsionalitas Operasional', [
        'Modul Manajemen Kamar membantu mengelola status kamar (tersedia/terisi/perlu dibersihkan)',
        'Proses check-in tamu pada StayManager lebih cepat dibandingkan cara yang digunakan saat ini',
        'Modul Keuangan memudahkan pencatatan billing, deposit, dan pengeluaran operasional',
        'Fitur otomatisasi invoice dan laporan keuangan menghemat waktu kerja',
        'Modul Housekeeping membantu koordinasi tugas antar staf cleaning',
    ]);

    // ---- Staf A5: Chatbot AI ----
    form.addPageBreakItem()
        .setTitle('INSTRUMEN A — Bagian 5 dari 7: Penilaian Chatbot AI untuk Tamu')
        .setHelpText(
            'StayManager menyediakan chatbot AI berbahasa Indonesia yang dapat melayani pertanyaan ' +
            'tamu 24 jam dan menerima reservasi kamar via chat. Mohon evaluasi konsep ini.\n\n' +
            'Coba interaksi chatbot di alamat: ' + DEMO_CHATBOT_URL
        );

    addLikertGrid(form, 'Penilaian Konsep Chatbot AI', [
        'Konsep chatbot AI untuk reservasi tamu bermanfaat untuk hotel kami',
        'Chatbot dapat mengurangi beban kerja front desk dalam menjawab pertanyaan rutin tamu',
        'Tamu di hotel kami berpotensi menggunakan fitur chatbot ini',
        'Chatbot dapat membantu hotel beroperasi lebih efisien di luar jam kerja',
    ]);

    // ---- Staf A6: RBAC ----
    form.addPageBreakItem()
        .setTitle('INSTRUMEN A — Bagian 6 dari 7: Kontrol Akses dan Keamanan Data (RBAC)')
        .setHelpText(
            'StayManager menerapkan Role-Based Access Control (RBAC) dengan 6 peran pengguna: ' +
            'Super Admin, Manager, Front Desk, Housekeeping, Finance, dan Guest. Setiap peran ' +
            'memiliki tingkat akses berbeda ke modul-modul tertentu sesuai tanggung jawabnya.'
        );

    addLikertGrid(form, 'Penilaian Kontrol Akses', [
        'Pembagian akses berdasarkan peran sesuai dengan struktur organisasi hotel kami',
        'Sistem memberikan tingkat akses yang tepat untuk peran saya',
        'Pembatasan akses berdasarkan peran penting untuk keamanan data tamu dan operasional',
    ]);

    // ---- Staf A7: Kritik & Saran ----
    form.addPageBreakItem()
        .setTitle('INSTRUMEN A — Bagian 7 dari 7: Kritik dan Saran (Pertanyaan Terbuka)')
        .setHelpText(
            'Bagian ini bersifat opsional namun sangat berharga untuk pengembangan sistem. ' +
            'Mohon jawab sesuai pengalaman Bapak/Ibu/Saudara/i selama eksplorasi.'
        );

    form.addParagraphTextItem()
        .setTitle('Fitur StayManager yang paling membantu pekerjaan Anda')
        .setRequired(false);

    form.addParagraphTextItem()
        .setTitle('Fitur yang membingungkan atau memerlukan perbaikan')
        .setRequired(false);

    form.addParagraphTextItem()
        .setTitle('Fitur tambahan yang Anda butuhkan namun belum tersedia di sistem')
        .setRequired(false);

    form.addParagraphTextItem()
        .setTitle('Apakah Anda akan merekomendasikan sistem ini kepada hotel lain? Mohon jelaskan alasannya.')
        .setRequired(false);

    // ========================================================================
    // INSTRUMEN B: SYSTEM EVALUATOR (6 sub-bagian)
    // ========================================================================

    // ---- Eval B1: Latar Belakang Teknis ----
    const secEval1 = form.addPageBreakItem()
        .setTitle('INSTRUMEN B (SYSTEM EVALUATOR) — Bagian 1 dari 6: Latar Belakang Teknis')
        .setHelpText('Mohon isi data berikut untuk konteks analisis evaluasi.');

    form.addMultipleChoiceItem()
        .setTitle('Status pekerjaan/pendidikan Anda saat ini')
        .setChoiceValues(['Mahasiswa', 'Karyawan', 'Freelancer / Wiraswasta'])
        .showOtherOption(true)
        .setRequired(true);

    form.addTextItem()
        .setTitle('Detail status')
        .setHelpText(
            'Untuk mahasiswa: sebutkan jurusan dan semester (mis. Sistem Informasi semester 7). ' +
            'Untuk karyawan: sebutkan bidang pekerjaan (mis. Business Analyst, IT Support).'
        )
        .setRequired(false);

    form.addMultipleChoiceItem()
        .setTitle('Frekuensi penggunaan aplikasi berbasis web (dashboard, ERP, CRM, Notion, Trello, dll)')
        .setChoiceValues(['Setiap hari', 'Beberapa kali per minggu', 'Sesekali', 'Jarang'])
        .setRequired(true);

    form.addMultipleChoiceItem()
        .setTitle('Tingkat familiaritas dengan konsep usability/UX (User Experience)')
        .setChoiceValues([
            'Sangat familiar (pernah mempelajari secara formal)',
            'Familiar (pernah mendengar dan memahami konsep dasar)',
            'Belum familiar',
        ])
        .setRequired(true);

    // ---- Eval B2: Eksperimen ----
    form.addPageBreakItem()
        .setTitle('INSTRUMEN B — Bagian 2 dari 6: Eksperimen Eksplorasi Sistem')
        .setHelpText(
            'PETUNJUK PELAKSANAAN EKSPERIMEN:\n\n' +
            '1. Buka tautan demo sistem: ' + DEMO_URL + '\n\n' +
            '2. Login menggunakan akun demo MANAGER untuk dapat mengakses\n' +
            '   seluruh modul staf hotel:\n\n' +
            '   ' + DEMO_STAFF_LOGIN.split('\n').join('\n   ') + '\n\n' +
            '3. Eksplorasi sistem MINIMAL 10-15 menit, coba semua modul utama:\n' +
            '   Dashboard, Manajemen Kamar, Manajemen Tamu, Reservasi (Occupancy),\n' +
            '   Keuangan, Billing, Laporan, Pengaturan.\n\n' +
            '4. Jangan ragu untuk mengklik berbagai tombol — sistem ini sandbox demo,\n' +
            '   tidak ada konsekuensi data nyata.\n\n' +
            '5. TETAP LOGIN sebagai manager — Anda akan menggunakan akun yang sama\n' +
            '   pada Bagian 5 (Evaluasi Chatbot) untuk testing reservasi.\n\n' +
            '6. Setelah selesai eksplorasi, lanjutkan menjawab pertanyaan-pertanyaan berikut.'
        );

    form.addTextItem()
        .setTitle('Berapa lama Anda mengeksplorasi sistem sebelum mengisi kuesioner ini? (dalam menit)')
        .setRequired(true);

    form.addMultipleChoiceItem()
        .setTitle('Apakah Anda telah mencoba semua modul utama yang disebutkan?')
        .setChoiceValues(['Ya, semua modul', 'Sebagian besar (4-5 modul)', 'Hanya 1-3 modul'])
        .setRequired(true);

    form.addMultipleChoiceItem()
        .setTitle('Apakah Anda telah mencoba berinteraksi dengan chatbot di alamat /chatbot?')
        .setChoiceValues(['Ya', 'Belum'])
        .setRequired(true);

    // ---- Eval B3: Nielsen 5 ----
    form.addPageBreakItem()
        .setTitle('INSTRUMEN B — Bagian 3 dari 6: Evaluasi Lima Faktor Manusia Terukur (Nielsen, 1993)')
        .setHelpText(
            'Bagian ini mengukur lima dimensi standar usability menurut Jakob Nielsen (1993). ' +
            'Mohon berikan penilaian berdasarkan pengalaman eksplorasi sistem.\n\n' +
            'Keterangan skala: 1 = Sangat Tidak Setuju, 5 = Sangat Setuju.'
        );

    addLikertGrid(form, 'Lima Faktor Usability (Nielsen, 1993)', [
        '[Learnability] Saya dapat memahami cara penggunaan sistem ini dengan cepat tanpa memerlukan tutorial',
        '[Efficiency] Setelah memahami sistem, saya dapat menyelesaikan tugas-tugas dengan efisien',
        '[Memorability] Apabila saya berhenti menggunakan sistem ini selama satu minggu, saya yakin masih dapat mengingat cara penggunaannya',
        '[Error Rate] Sistem ini jarang membuat saya melakukan kesalahan; apabila terjadi, kesalahan mudah dikoreksi',
        '[Satisfaction] Secara keseluruhan saya merasa nyaman menggunakan sistem ini',
    ]);

    // ---- Eval B4: Schneiderman 8 ----
    form.addPageBreakItem()
        .setTitle('INSTRUMEN B — Bagian 4 dari 6: Evaluasi Delapan Aturan Emas Desain Antarmuka (Schneiderman, 2018)')
        .setHelpText(
            'Bagian ini mengukur penerapan delapan prinsip desain antarmuka pengguna menurut ' +
            'Ben Schneiderman (2018). Mohon berikan penilaian pada skala 1-5.'
        );

    addLikertGrid(form, 'Delapan Aturan Emas (Schneiderman, 2018)', [
        '[Aturan 1 — Konsistensi Desain] Tampilan tombol, warna, dan tipografi konsisten di seluruh halaman sistem',
        '[Aturan 2 — Pintasan Navigasi] Tersedia sidebar atau shortcut untuk akses cepat antar fitur',
        '[Aturan 3 — Umpan Balik Informatif] Setiap aksi pengguna direspons sistem secara jelas (indikator loading, notifikasi sukses, pesan error)',
        '[Aturan 4 — Dialog Closure] Setiap dialog/modal mudah ditutup, dan kapan suatu task selesai sangat jelas',
        '[Aturan 5 — Penanganan Kesalahan] Sistem mencegah pengguna melakukan kesalahan melalui validasi formulir sebelum data disubmit',
        '[Aturan 6 — Pembatalan Aksi Mudah] Tersedia tombol Cancel atau Kembali yang konsisten di setiap dialog',
        '[Aturan 7 — Kendali Internal Pengguna] Saya merasa sebagai pengguna yang mengontrol sistem, bukan sebaliknya',
        '[Aturan 8 — Informasi Tampil Langsung] Data penting (KPI, status) terlihat di dashboard tanpa harus melakukan banyak klik',
    ]);

    // ---- Eval B5: Chatbot ----
    form.addPageBreakItem()
        .setTitle('INSTRUMEN B — Bagian 5 dari 6: Evaluasi Chatbot AI (Berperan sebagai Tamu)')
        .setHelpText(
            'PETUNJUK PELAKSANAAN:\n\n' +
            '1. TETAP LOGIN menggunakan akun manager dari Bagian 2 — tidak perlu logout.\n' +
            '   Akun manager sudah terautentikasi, sehingga fitur reservasi chatbot dapat\n' +
            '   diakses tanpa hambatan tambahan.\n\n' +
            '2. Buka tautan chatbot: ' + DEMO_CHATBOT_URL + '\n\n' +
            '3. Berperan sebagai tamu hotel yang ingin memesan kamar. Lakukan interaksi:\n' +
            '   a. Tanyakan ketersediaan kamar untuk tanggal apa pun\n' +
            '      Contoh: "Ada kamar tersedia 20-22 Juli?"\n' +
            '   b. Lihat tipe kamar yang muncul dalam kartu interaktif (buka galeri\n' +
            '      foto, baca detail amenities)\n' +
            '   c. Pilih salah satu kamar lalu klik "Book This Room"\n' +
            '   d. Isi atau konfirmasi formulir reservasi (nama, email auto-fill dari\n' +
            '      akun manager) dan lanjutkan hingga TAHAP KONFIRMASI pemesanan\n\n' +
            '4. Berikan penilaian pada skala 1-5 untuk aspek-aspek berikut.\n\n' +
            'CATATAN: Reservasi yang Anda buat hanyalah simulasi pengujian dengan akun demo.\n' +
            'Tidak ada transaksi pembayaran nyata terjadi. Evaluasi pola "auth gate"\n' +
            '(yaitu Login Prompt Card yang muncul saat pengunjung anonim mencoba memesan)\n' +
            'akan dievaluasi oleh responden kategori Tamu/Pengguna Umum di Instrumen C.'
        );

    addLikertGrid(form, 'Penilaian Chatbot AI', [
        'Chatbot dapat memahami pertanyaan dalam Bahasa Indonesia dengan baik',
        'Respons chatbot relevan dengan pertanyaan yang saya ajukan',
        'Saya dapat menyelesaikan proses pemesanan kamar tanpa kebingungan',
        'Waktu respons chatbot terasa cepat (kurang dari 3 detik per pesan)',
        'Formulir reservasi otomatis terisi dengan data akun saya — fitur ini membantu mempercepat proses',
        'Alur dari mengecek ketersediaan, memilih kamar, hingga konfirmasi pemesanan terasa mulus secara keseluruhan',
    ]);

    // ---- Eval B6: Kritik ----
    form.addPageBreakItem()
        .setTitle('INSTRUMEN B — Bagian 6 dari 6: Kritik dan Saran (Pertanyaan Terbuka)')
        .setHelpText('Bagian terakhir untuk Anda. Bersifat opsional namun sangat berharga.');

    form.addParagraphTextItem()
        .setTitle('Tiga aspek terbaik dari sistem StayManager menurut penilaian Anda')
        .setRequired(false);

    form.addParagraphTextItem()
        .setTitle('Tiga aspek yang perlu diperbaiki dari sistem StayManager')
        .setRequired(false);

    form.addParagraphTextItem()
        .setTitle('Sebagai pengguna umum (bukan staf hotel), apakah sistem ini terasa approachable atau intimidating? Mohon jelaskan alasannya.')
        .setRequired(false);

    // ========================================================================
    // INSTRUMEN C: TAMU / PENGGUNA UMUM (7 sub-bagian)
    // ========================================================================

    // ---- Tamu C1: Latar Belakang ----
    const secTamu1 = form.addPageBreakItem()
        .setTitle('INSTRUMEN C (TAMU/PENGGUNA UMUM) — Bagian 1 dari 7: Latar Belakang Anda')
        .setHelpText('Pertanyaan tambahan untuk konteks demografi responden.');

    form.addMultipleChoiceItem()
        .setTitle('Status pekerjaan/pendidikan Anda saat ini')
        .setChoiceValues(['Mahasiswa', 'Guru / Dosen', 'Karyawan', 'Wiraswasta', 'Pelajar SMA'])
        .showOtherOption(true)
        .setRequired(true);

    // ---- Tamu C2: Pengalaman Memesan ----
    form.addPageBreakItem()
        .setTitle('INSTRUMEN C — Bagian 2 dari 7: Pengalaman Memesan Hotel')
        .setHelpText('Bagian ini menanyakan pengalaman Anda sebagai konsumen aplikasi pemesanan hotel.');

    form.addMultipleChoiceItem()
        .setTitle('Frekuensi memesan hotel dalam satu tahun terakhir')
        .setChoiceValues([
            'Belum pernah / jarang (< 1 kali)',
            '1-3 kali',
            '4-10 kali',
            '> 10 kali',
        ])
        .setRequired(true);

    form.addCheckboxItem()
        .setTitle('Aplikasi atau metode yang biasa Anda gunakan untuk memesan hotel (boleh pilih lebih dari satu)')
        .setChoiceValues([
            'Traveloka',
            'Booking.com',
            'Agoda',
            'Tiket.com',
            'Pegipegi',
            'Langsung menghubungi hotel via telepon/WhatsApp',
            'Walk-in (datang langsung tanpa reservasi)',
            'Belum pernah memesan hotel',
        ])
        .setRequired(true);

    form.addMultipleChoiceItem()
        .setTitle('Pengalaman menggunakan chatbot AI di aplikasi mana pun untuk berinteraksi')
        .setChoiceValues(['Ya, sering', 'Ya, kadang-kadang', 'Belum pernah'])
        .setRequired(true);

    // ---- Tamu C3: Ekspektasi ----
    form.addPageBreakItem()
        .setTitle('INSTRUMEN C — Bagian 3 dari 7: Ekspektasi Pra-Eksperimen')
        .setHelpText(
            'Sebelum mencoba chatbot StayManager pada bagian eksperimen, mohon sampaikan ekspektasi ' +
            'Anda terlebih dahulu. Jawaban Anda di sini akan dibandingkan dengan pengalaman aktual.'
        );

    form.addParagraphTextItem()
        .setTitle('Menurut Anda, apa karakteristik chatbot pemesanan hotel yang ideal?')
        .setRequired(false);

    form.addParagraphTextItem()
        .setTitle('Hal apa yang paling Anda hindari atau khawatirkan saat memesan hotel secara online?')
        .setRequired(false);

    // ---- Tamu C4: Eksperimen Reservasi ----
    form.addPageBreakItem()
        .setTitle('INSTRUMEN C — Bagian 4 dari 7: Eksperimen Reservasi via Chatbot')
        .setHelpText(
            'PETUNJUK PELAKSANAAN EKSPERIMEN (BACA SEKSAMA):\n\n' +
            '═══════════════════════════════════════════════════════════════\n' +
            'TAHAP 1 — Cek Ketersediaan (TANPA login)\n' +
            '═══════════════════════════════════════════════════════════════\n' +
            '1. Buka tautan chatbot: ' + DEMO_CHATBOT_URL + '\n' +
            '2. Anda akan masuk sebagai pengunjung anonim (tanpa login).\n' +
            '3. Tanyakan kepada chatbot ketersediaan kamar untuk tanggal apa pun,\n' +
            '   contoh: "Ada kamar tersedia 20-22 Juli?"\n' +
            '4. Chatbot akan menampilkan daftar kamar yang tersedia dalam bentuk\n' +
            '   kartu interaktif. Anda dapat membuka galeri foto dan melihat detail.\n\n' +
            '═══════════════════════════════════════════════════════════════\n' +
            'TAHAP 2 — Coba Pesan Kamar (akan muncul Login Prompt)\n' +
            '═══════════════════════════════════════════════════════════════\n' +
            '5. Klik tombol "Book This Room" pada salah satu kartu kamar, ATAU\n' +
            '   ketik di chatbot: "Saya mau pesan kamar ini".\n' +
            '6. PERHATIAN: chatbot akan menampilkan LOGIN PROMPT CARD karena\n' +
            '   pemesanan hanya bisa dilakukan oleh tamu terdaftar. INI BAGIAN\n' +
            '   PENTING DARI EKSPERIMEN — mohon perhatikan dan nilai pengalaman ini.\n\n' +
            '═══════════════════════════════════════════════════════════════\n' +
            'TAHAP 3 — Login & Selesaikan Reservasi\n' +
            '═══════════════════════════════════════════════════════════════\n' +
            '7. Klik tombol "Login" pada Login Prompt Card.\n' +
            '8. Gunakan akun demo tamu berikut:\n\n' +
            '   ' + DEMO_GUEST_LOGIN.split('\n').join('\n   ') + '\n\n' +
            '9. Setelah berhasil login, Anda akan otomatis kembali ke chatbot.\n' +
            '10. Lanjutkan percakapan dengan chatbot — formulir reservasi akan\n' +
            '    muncul dengan data nama/email yang sudah otomatis ter-isi dari\n' +
            '    akun demo.\n' +
            '11. Selesaikan hingga tahap KONFIRMASI PEMESANAN (Anda akan melihat\n' +
            '    kode booking dan instruksi pembayaran simulasi).\n\n' +
            '═══════════════════════════════════════════════════════════════\n' +
            'CATATAN ETIKA:\n' +
            '• Akun demo dibagikan untuk seluruh responden — tidak masalah ada\n' +
            '  beberapa reservasi simulasi atas nama akun yang sama.\n' +
            '• Tidak ada transaksi pembayaran nyata terjadi.\n' +
            '• Setelah eksperimen selesai, jawab pertanyaan-pertanyaan berikut\n' +
            '  secara objektif berdasarkan pengalaman aktual Anda.'
        );

    form.addMultipleChoiceItem()
        .setTitle('Apakah Anda berhasil menyelesaikan simulasi pemesanan hingga tahap KONFIRMASI (mendapat kode booking)?')
        .setChoiceValues([
            'Ya, berhasil dengan lancar',
            'Sebagian (mengalami kendala pada tahap tertentu)',
            'Tidak berhasil sampai konfirmasi',
        ])
        .setRequired(true);

    form.addTextItem()
        .setTitle('Estimasi durasi total proses dari awal hingga konfirmasi (dalam menit)')
        .setRequired(true);

    form.addMultipleChoiceItem()
        .setTitle(
            'Saat Anda mencoba memesan kamar SEBELUM login, chatbot menampilkan ' +
            '"Login Prompt Card" yang meminta Anda login terlebih dahulu. ' +
            'Bagaimana penilaian Anda terhadap pendekatan ini?'
        )
        .setHelpText(
            'Pertanyaan ini mengevaluasi pola desain "auth gate" — yaitu strategi sistem ' +
            'untuk meminta otentikasi sebelum transaksi penting dilakukan.'
        )
        .setChoiceValues([
            'Sangat membantu (saya jadi tahu harus login sebelum lanjut, tidak membuang waktu mengisi formulir kosong)',
            'Cukup membantu, namun bisa lebih jelas instruksinya',
            'Mengganggu alur — saya berharap bisa langsung pesan tanpa login',
            'Membingungkan — saya tidak yakin harus melakukan apa',
        ])
        .setRequired(true);

    form.addParagraphTextItem()
        .setTitle('Pada tahap manakah proses terasa paling mudah?')
        .setRequired(false);

    form.addParagraphTextItem()
        .setTitle('Pada tahap manakah Anda mengalami kebingungan atau kendala? (Mohon dijawab apabila ada)')
        .setRequired(false);

    // ---- Tamu C5: Evaluasi Chatbot ----
    form.addPageBreakItem()
        .setTitle('INSTRUMEN C — Bagian 5 dari 7: Penilaian Chatbot (Skala Likert)')
        .setHelpText(
            'Berdasarkan pengalaman eksperimen di Bagian 4, mohon berikan penilaian pada aspek-aspek ' +
            'berikut. Skala 1 = Sangat Tidak Setuju, 5 = Sangat Setuju.'
        );

    addLikertGrid(form, 'Penilaian Pengalaman Chatbot', [
        'Chatbot mudah dimulai dan diakses tanpa perlu instruksi tambahan',
        'Bahasa Indonesia yang digunakan chatbot terdengar natural dan mudah dipahami',
        'Respons chatbot cepat (kurang dari 3 detik per pesan)',
        'Informasi yang diberikan chatbot (harga, ketersediaan, kebijakan) lengkap dan akurat',
        'Proses dari menanyakan ketersediaan hingga konfirmasi pemesanan terasa mulus',
        'Saya merasa nyaman menggunakan chatbot tanpa harus berbicara dengan staf manusia',
        'Saya akan menggunakan chatbot ini lagi untuk pemesanan hotel di masa mendatang',
    ]);

    addLikertGrid(form, 'Penilaian Alur Login Saat Memesan Kamar', [
        'Munculnya Login Prompt Card saat saya mencoba memesan kamar terasa wajar (sesuai ekspektasi)',
        'Saya mudah memahami bahwa saya harus login untuk dapat menyelesaikan reservasi',
        'Proses perpindahan dari chatbot ke halaman login dan kembali lagi berjalan mulus',
        'Setelah login, formulir reservasi otomatis terisi dengan data akun saya — fitur ini membantu',
        'Saya merasa data pribadi saya aman karena reservasi memerlukan otentikasi',
    ]);

    // ---- Tamu C6: Perbandingan ----
    form.addPageBreakItem()
        .setTitle('INSTRUMEN C — Bagian 6 dari 7: Perbandingan dengan Aplikasi Sejenis')
        .setHelpText(
            'Mohon bandingkan pengalaman menggunakan chatbot StayManager dengan aplikasi pemesanan ' +
            'hotel yang biasa Anda gunakan (Traveloka, Booking.com, Agoda, dll).'
        );

    form.addMultipleChoiceItem()
        .setTitle('Dibandingkan dengan aplikasi pemesanan hotel yang biasa Anda gunakan, chatbot StayManager terasa:')
        .setChoiceValues([
            'Jauh lebih mudah digunakan',
            'Sedikit lebih mudah',
            'Setara/Sama saja',
            'Sedikit lebih sulit',
            'Jauh lebih sulit',
        ])
        .setRequired(true);

    form.addParagraphTextItem()
        .setTitle('Mohon jelaskan alasan jawaban perbandingan di atas')
        .setRequired(false);

    // ---- Tamu C7: Kritik ----
    form.addPageBreakItem()
        .setTitle('INSTRUMEN C — Bagian 7 dari 7: Kritik dan Saran (Pertanyaan Terbuka)')
        .setHelpText('Bagian terakhir untuk Anda. Bersifat opsional namun sangat berharga untuk penelitian.');

    form.addParagraphTextItem()
        .setTitle('Aspek terbaik dari chatbot StayManager menurut Anda')
        .setRequired(false);

    form.addParagraphTextItem()
        .setTitle('Aspek yang masih membingungkan atau kurang menurut Anda')
        .setRequired(false);

    form.addParagraphTextItem()
        .setTitle('Saran perbaikan untuk pengembangan chatbot ke depan')
        .setRequired(false);

    // ========================================================================
    // KONVERGEN: SUS (System Usability Scale) — diisi oleh SEMUA responden
    // ========================================================================

    const secSUS = form.addPageBreakItem()
        .setTitle('BAGIAN AKHIR (UNTUK SEMUA RESPONDEN) — System Usability Scale (SUS)')
        .setHelpText(
            'Bagian terakhir ini diisi oleh SELURUH responden, terlepas dari kategori sebelumnya.\n\n' +
            'System Usability Scale (SUS) adalah instrumen pengukuran usability standar industri yang ' +
            'dikembangkan oleh John Brooke (1996). SUS terdiri dari 10 pernyataan dengan skala Likert ' +
            '5-poin yang mengukur kesan keseluruhan terhadap sistem.\n\n' +
            'CATATAN PENTING:\n' +
            '• Pernyataan ganjil (1, 3, 5, 7, 9) bersifat positif terhadap sistem.\n' +
            '• Pernyataan genap (2, 4, 6, 8, 10) bersifat negatif terhadap sistem.\n' +
            '• Mohon jawab apa adanya — sistem skoring sudah memperhitungkan polaritas pernyataan.\n\n' +
            'Skala: 1 = Sangat Tidak Setuju, 2 = Tidak Setuju, 3 = Netral, 4 = Setuju, 5 = Sangat Setuju.\n\n' +
            'Estimasi waktu pengerjaan: 3 menit.'
        );

    addLikertGrid(form, 'Sepuluh Item SUS (Brooke, 1996 — Terjemahan Bahasa Indonesia)', [
        '1. Saya berpikir akan sering menggunakan sistem ini',
        '2. Saya merasa sistem ini terlalu kompleks',
        '3. Saya berpikir sistem ini mudah digunakan',
        '4. Saya berpikir akan membutuhkan bantuan teknisi untuk dapat menggunakan sistem ini',
        '5. Saya merasa berbagai fungsi pada sistem ini terintegrasi dengan baik',
        '6. Saya merasa terdapat terlalu banyak inkonsistensi pada sistem ini',
        '7. Saya berpikir kebanyakan orang akan mempelajari sistem ini dengan cepat',
        '8. Saya merasa sistem ini sangat merepotkan untuk digunakan',
        '9. Saya merasa percaya diri ketika menggunakan sistem ini',
        '10. Saya perlu mempelajari banyak hal terlebih dahulu sebelum dapat menggunakan sistem ini',
    ]);

    // ========================================================================
    // WIRE BRANCHING
    // ========================================================================

    routingQ.setChoices([
        routingQ.createChoice(
            'STAF HOTEL — saya bekerja di hotel/penginapan/villa',
            secStaf1
        ),
        routingQ.createChoice(
            'SYSTEM EVALUATOR — saya mahasiswa IT atau karyawan profesional, bukan staf hotel',
            secEval1
        ),
        routingQ.createChoice(
            'TAMU / PENGGUNA UMUM — saya pengguna umum yang pernah/mungkin memesan hotel',
            secTamu1
        ),
    ]);

    // Setelah Instrumen A (Staf) selesai → linier ke secEval1 → redirect ke SUS
    secEval1.setGoToPage(secSUS);
    // Setelah Instrumen B (Evaluator) selesai → linier ke secTamu1 → redirect ke SUS
    secTamu1.setGoToPage(secSUS);
    // Setelah Instrumen C (Tamu) selesai → linier ke secSUS → natural progression ✓

    // ========================================================================
    // OUTPUT
    // ========================================================================

    const action = EXISTING_FORM_ID ? 'BERHASIL DIREVISI' : 'BERHASIL DIBUAT';
    Logger.log('\n=== KUESIONER PENELITIAN ' + action + ' ===\n');
    Logger.log('📋 ' + form.getTitle());
    Logger.log('\n   Edit URL:    ' + form.getEditUrl());
    Logger.log('   Respond URL: ' + form.getPublishedUrl());

    if (EXISTING_FORM_ID) {
        Logger.log('\n♻️ URL form TIDAK BERUBAH — link yang sudah Anda share masih valid.');
        Logger.log('   Responden yang belum mengisi akan melihat versi BARU saat membuka link.');
    } else {
        Logger.log('\n✅ Langkah Distribusi:');
        Logger.log('   1. Buka Edit URL → tombol "Send" (kanan atas)');
        Logger.log('   2. Copy "Respond URL" → broadcast via WhatsApp/Instagram/Email');
        Logger.log('   3. Tab "Responses" → ikon Sheets → buat linked spreadsheet untuk export hasil');
    }
    Logger.log('\n📊 Analisis Data Nanti:');
    Logger.log('   - Filter responses berdasarkan kolom "Kategori responden Anda adalah:"');
    Logger.log('   - Instrumen A (Staf Hotel) → Tabel 4.13 skripsi (UAT staf)');
    Logger.log('   - Instrumen B (System Evaluator) → Tabel 4.13 (UAT evaluator)');
    Logger.log('   - Instrumen C (Tamu) → Tabel 4.14 (UAT tamu)');
    Logger.log('   - SUS dari SEMUA responden → Tabel 4.15 (skor SUS agregat)');
    Logger.log('\n💡 Tip: jalankan function hitungSkorSUS() pada linked spreadsheet untuk skor SUS otomatis.');

    return form;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Tambah Likert grid (skala 1-5) untuk batch pernyataan.
 */
function addLikertGrid(form, title, statements) {
    return form
        .addGridItem()
        .setTitle(title)
        .setHelpText(
            'Keterangan skala: ' +
            '1 = Sangat Tidak Setuju · ' +
            '2 = Tidak Setuju · ' +
            '3 = Netral · ' +
            '4 = Setuju · ' +
            '5 = Sangat Setuju'
        )
        .setRows(statements)
        .setColumns(['1', '2', '3', '4', '5'])
        .setRequired(true);
}

// ============================================================================
// BONUS: Function untuk hitung skor SUS otomatis dari linked Spreadsheet
// ============================================================================

/**
 * Setelah responden submit form, link form ke Spreadsheet (tab Responses di
 * form → ikon Sheets). Lalu buka Apps Script editor dari Spreadsheet tersebut
 * (Extensions → Apps Script), paste function ini, run hitungSkorSUS().
 *
 * Function ini akan:
 * 1. Mencari 10 kolom SUS berdasarkan prefix "1. Saya..." s/d "10. Saya..."
 * 2. Menghitung skor SUS per responden (rumus standar Brooke 1996)
 * 3. Menulis skor individu di kolom paling kanan
 * 4. Menampilkan ringkasan rata-rata + interpretasi
 */
function hitungSkorSUS() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
        SpreadsheetApp.getUi().alert('Belum terdapat data response.');
        return;
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const susColumns = [];

    for (let i = 1; i <= 10; i++) {
        const idx = headers.findIndex((h) => String(h).trim().startsWith(i + '. Saya '));
        if (idx === -1) {
            SpreadsheetApp.getUi().alert(
                'Gagal mencari kolom SUS item ' + i + '.\n\n' +
                'Pastikan header kolom mengandung teks "' + i + '. Saya..."'
            );
            return;
        }
        susColumns.push(idx + 1);
    }

    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();

    const susScores = data.map((row) => {
        let total = 0;
        for (let i = 0; i < 10; i++) {
            const val = parseInt(row[susColumns[i] - 1], 10);
            if (isNaN(val)) return null;
            // Item ganjil (i=0,2,4,6,8) bersifat positif: skor = val - 1
            // Item genap (i=1,3,5,7,9) bersifat negatif: skor = 5 - val
            total += i % 2 === 0 ? val - 1 : 5 - val;
        }
        return total * 2.5;
    });

    const scoreCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, scoreCol).setValue('Skor SUS').setFontWeight('bold');
    susScores.forEach((score, idx) => {
        if (score !== null) {
            sheet.getRange(idx + 2, scoreCol).setValue(score);
        }
    });

    const validScores = susScores.filter((s) => s !== null);
    const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length;

    let interpretasi;
    if (avg >= 80) interpretasi = 'Excellent (10% teratas dari sistem industri)';
    else if (avg >= 68) interpretasi = 'Good (di atas rata-rata industri 68)';
    else if (avg >= 51) interpretasi = 'OK / Marginal (perlu perbaikan)';
    else interpretasi = 'Poor (terdapat masalah usability yang signifikan)';

    Logger.log('=== Ringkasan Skor SUS ===');
    Logger.log('Total responden valid: ' + validScores.length);
    Logger.log('Rata-rata skor SUS: ' + avg.toFixed(2));
    Logger.log('Interpretasi: ' + interpretasi);

    SpreadsheetApp.getUi().alert(
        'Skor SUS Telah Dihitung',
        'Total responden valid: ' + validScores.length + '\n' +
        'Rata-rata Skor SUS: ' + avg.toFixed(2) + '\n' +
        'Interpretasi: ' + interpretasi + '\n\n' +
        'Skor individu per responden tersimpan di kolom paling kanan spreadsheet.',
        SpreadsheetApp.getUi().ButtonSet.OK
    );
}
