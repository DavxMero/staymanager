/**
 * StayManager — Revisi SUS Form 3
 * =================================================================
 * Memperbaiki Form 3 SUS Universal di Google Forms agar sesuai standar
 * SUS kanonik (Brooke, 1996; tervalidasi Vlachogianni & Tselios, 2022)
 * dan selaras dengan Tabel 2.2 skripsi.
 *
 * APA YANG DI-REVISI:
 *   A. Section "Pengantar SUS" — hapus disclosure polaritas (sumber bias),
 *      ganti dengan instruksi first-impression yang sesuai desain SUS.
 *   B. Item Q2 — wording sinkron Tabel 2.2: "terlalu rumit padahal seharusnya tidak"
 *   C. Item Q9 — wording sinkron Tabel 2.2: "sangat percaya diri"
 *
 * SAFETY:
 *   - Item ID tidak berubah saat lo edit text -> JAWABAN RESPONDEN LAMA TETAP TER-LINK.
 *   - Script idempotent: aman dijalankan berkali-kali (skip jika sudah benar).
 *
 * CARA PAKAI:
 *   1. Buka Form: docs.google.com/forms/d/1LSPiXl1-JbxMYzHDWgaIyWrjujJN_MMZw8NXsyHJjLg/edit
 *   2. Titik tiga kanan atas -> "Script editor" / Extensions -> Apps Script
 *   3. Paste seluruh isi file ini ke Code.gs (overwrite isi default)
 *   4. Save (Ctrl+S). Pilih function reviseSusForm di dropdown atas. Klik Run.
 *   5. Authorize akses Google Forms saat diminta.
 *   6. Cek log: View -> Logs (atau Ctrl+Enter).
 *   7. Refresh Form di browser — perubahan langsung terlihat.
 * =================================================================
 */

const FORM_ID = '1LSPiXl1-JbxMYzHDWgaIyWrjujJN_MMZw8NXsyHJjLg';

const NEW_SUS_INTRO =
  'System Usability Scale (SUS) adalah instrumen evaluasi usability standar industri ' +
  '(Brooke, 1996; tervalidasi ulang oleh Vlachogianni & Tselios, 2022). ' +
  '10 pernyataan, skala 1-5 (1=Sangat Tidak Setuju, 5=Sangat Setuju).\n\n' +
  'Jawab spontan berdasarkan kesan keseluruhan Anda terhadap StayManager. ' +
  'Tidak perlu menganalisis terlalu lama — kesan pertama justru yang paling akurat. ' +
  'Jika ragu antara dua nilai, pilih nilai tengah (3). Jangan kosongkan satu pun pernyataan.';

const NEW_Q2 = 'Saya merasa sistem ini terlalu rumit padahal seharusnya tidak';
const NEW_Q9 = 'Saya merasa sangat percaya diri menggunakan sistem ini';

const Q2_OLD_PATTERNS = [
  'Saya merasa sistem ini terlalu kompleks/rumit',
  'Saya merasa sistem ini terlalu kompleks',
  'Saya merasa sistem ini terlalu rumit',
];
const Q9_OLD_PATTERNS = [
  'Saya merasa percaya diri saat menggunakan sistem ini',
  'Saya merasa percaya diri menggunakan sistem ini',
];
const POLARITY_KEYWORDS = [
  'pertanyaan ganjil bersifat positif',
  'pertanyaan genap bersifat negatif',
  'memperhitungkan polaritas',
];

function reviseSusForm() {
  const form = FormApp.openById(FORM_ID);
  const items = form.getItems();
  const log = [];
  let updated = 0;
  let skipped = 0;

  items.forEach(function (item, idx) {
    const type = item.getType();
    const title = item.getTitle() || '';

    if (type === FormApp.ItemType.SECTION_HEADER || type === FormApp.ItemType.PAGE_BREAK) {
      const sectionItem = (type === FormApp.ItemType.PAGE_BREAK)
        ? item.asPageBreakItem()
        : item.asSectionHeaderItem();
      const helpText = sectionItem.getHelpText() || '';

      const hasPolarityDisclosure = POLARITY_KEYWORDS.some(function (kw) {
        return helpText.indexOf(kw) !== -1;
      });
      const isSusIntroSection = title.indexOf('Pengantar SUS') !== -1
        || (title.indexOf('SUS') !== -1 && helpText.indexOf('System Usability Scale') !== -1);

      if (hasPolarityDisclosure) {
        sectionItem.setHelpText(NEW_SUS_INTRO);
        log.push('[' + idx + '] FIX A: "' + title + '" — disclosure polaritas dihapus');
        updated++;
      } else if (isSusIntroSection && helpText !== NEW_SUS_INTRO && helpText.length < 100) {
        sectionItem.setHelpText(NEW_SUS_INTRO);
        log.push('[' + idx + '] FIX A: "' + title + '" — instruksi first-impression ditambahkan');
        updated++;
      } else if (helpText === NEW_SUS_INTRO) {
        skipped++;
      }
    }

    if (Q2_OLD_PATTERNS.indexOf(title) !== -1) {
      item.setTitle(NEW_Q2);
      log.push('[' + idx + '] FIX B: Q2 "' + title + '" -> "' + NEW_Q2 + '"');
      updated++;
    } else if (title === NEW_Q2) {
      skipped++;
    }

    if (Q9_OLD_PATTERNS.indexOf(title) !== -1) {
      item.setTitle(NEW_Q9);
      log.push('[' + idx + '] FIX C: Q9 "' + title + '" -> "' + NEW_Q9 + '"');
      updated++;
    } else if (title === NEW_Q9) {
      skipped++;
    }
  });

  Logger.log('============================================');
  Logger.log('  REVISI SUS FORM 3 — RINGKASAN');
  Logger.log('============================================');
  Logger.log('Form:    ' + form.getTitle());
  Logger.log('Updated: ' + updated + ' item');
  Logger.log('Skipped: ' + skipped + ' item (sudah benar)');
  Logger.log('--------------------------------------------');
  if (log.length > 0) {
    log.forEach(function (l) { Logger.log(l); });
  } else {
    Logger.log('(Tidak ada perubahan)');
  }
  Logger.log('--------------------------------------------');
  Logger.log('Buka Form: ' + form.getEditUrl());

  if (updated === 0 && skipped === 0) {
    Logger.log('');
    Logger.log('TIDAK ADA ITEM SUS TERDETEKSI. Kemungkinan:');
    Logger.log('  1. FORM_ID salah atau bukan Form 3 SUS');
    Logger.log('  2. Wording item di Form berbeda dari pattern di script');
    Logger.log('  3. Jalankan listAllItems() untuk inspeksi manual');
  } else if (updated === 0 && skipped > 0) {
    Logger.log('');
    Logger.log('Form sudah dalam versi terbaru.');
  }
}

function listAllItems() {
  const form = FormApp.openById(FORM_ID);
  const items = form.getItems();

  Logger.log('============================================');
  Logger.log('  STRUKTUR FORM: ' + form.getTitle());
  Logger.log('============================================');
  Logger.log('Total items: ' + items.length);
  Logger.log('');

  items.forEach(function (item, idx) {
    const type = item.getType().toString();
    const title = item.getTitle() || '(tanpa judul)';
    Logger.log('[' + idx + '] ' + type);
    Logger.log('     Title: ' + title);

    if (item.getType() === FormApp.ItemType.SECTION_HEADER) {
      const help = item.asSectionHeaderItem().getHelpText();
      if (help) Logger.log('     Help: ' + truncate(help, 200));
    } else if (item.getType() === FormApp.ItemType.PAGE_BREAK) {
      const help = item.asPageBreakItem().getHelpText();
      if (help) Logger.log('     Help: ' + truncate(help, 200));
    }
    Logger.log('');
  });
}

function truncate(s, n) {
  if (!s) return '';
  return s.length <= n ? s : s.substring(0, n) + '...';
}
