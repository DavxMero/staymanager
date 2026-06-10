/**
 * StayManager — Revisi SUS Form v2 (untuk GRID Items)
 * =================================================================
 * Versi 1 (revise_sus_form.gs) pakai setTitle() per ScaleItem. Form
 * aktual TIDAK pakai ScaleItem terpisah — semua di-pack jadi GridItem.
 * Script ini handle GRID via asGridItem().setRows().
 *
 * APA YANG DI-PATCH (DENGAN ITEM ID, BUKAN TITLE PATTERN):
 *   1. SUS GRID  (ID 1917380744) — replace 10 rows ke canonical UAT.md
 *   2. Schneiderman GRID (ID 353947777) — replace 8 rows
 *      (utama: fix Aturan 8 dari "Informasi Tampil Langsung" yang salah
 *       konstruk ke "Kurangi Beban Memori" yang sesuai teori asli)
 *   3. Schneiderman GRID title (sama ID) — fix ejaan "Schneiderman" → SHNEIDERMAN_AUTHOR
 *   4. Page-break Bab 4 Schneiderman (ID 2053836688) — fix ejaan title
 *
 * APA YANG TIDAK DI-PATCH (sengaja):
 *   - Nielsen 5 Faktor GRID (item [42]) — tunggu sinkron dengan Bab 4
 *     real data dulu, baru disesuaikan di iterasi berikutnya
 *   - Pengantar SUS helpText [76] — sudah match UAT.md (verified pasca inspect)
 *
 * SAFETY:
 *   - Item ID tidak berubah → JAWABAN RESPONDEN LAMA TETAP TER-LINK.
 *     Untuk GRID, setRows() mengubah teks baris TANPA mereset response
 *     yang sudah ada untuk row index yang sama.
 *   - Idempotent: kalau rows sudah sesuai, skip (no-op).
 *   - DRY-RUN tersedia: jalanin `dryRunSusFormV2()` dulu untuk preview
 *     perubahan tanpa apply ke Form.
 *
 * CARA PAKAI:
 *   1. Buka Form di browser (owner): edit URL
 *   2. ⋮ kanan atas → Script editor → paste seluruh isi file ini
 *      ke Code.gs (atau buat file baru "revise_sus_form_v2")
 *   3. Save (Ctrl+S)
 *   4. Pilih function `dryRunSusFormV2` di dropdown → Run → cek log
 *      di View → Logs. Pastikan perubahan yang muncul = yang lo mau.
 *   5. Bila OK: pilih `reviseSusFormV2` → Run → cek log.
 *   6. Refresh Form di browser → verifikasi visual.
 *   7. Re-run `reviseSusFormV2` → harus log "skip" semua (idempotency check).
 * =================================================================
 */

const FORM_ID_V2 = '1LSPiXl1-JbxMYzHDWgaIyWrjujJN_MMZw8NXsyHJjLg';

// Item IDs dari inspectForm() output 2026-05-29 — LOCK untuk safety
const SUS_GRID_ITEM_ID         = 1917380744; // item [77]
const SCHN_GRID_ITEM_ID        = 353947777;  // item [44]
const SCHN_PAGEBREAK_ITEM_ID   = 2053836688; // item [43]

// Ejaan resmi pencipta 8 Golden Rules: Ben Shneiderman (University of Maryland HCI Lab).
// Verified 2026-05-29 via primary sources (IxDF, IDF, Wikipedia, faculty page).
// Skripsi md line 928 & 2370 sudah pakai ejaan benar ini.
const SHNEIDERMAN_AUTHOR = 'Shneiderman';

// ============= CANONICAL CONTENT =============

const SUS_ROWS_CANONICAL = [
  'Saya pikir saya akan ingin sering menggunakan sistem ini',
  'Saya merasa sistem ini terlalu rumit padahal seharusnya tidak',
  'Saya pikir sistem ini mudah digunakan',
  'Saya pikir saya akan butuh bantuan teknisi untuk menggunakan sistem ini',
  'Saya merasa berbagai fungsi di sistem ini terintegrasi dengan baik',
  'Saya merasa terlalu banyak inkonsistensi dalam sistem ini',
  'Saya pikir kebanyakan orang akan belajar sistem ini dengan cepat',
  'Saya merasa sistem ini sangat merepotkan untuk digunakan',
  'Saya merasa sangat percaya diri menggunakan sistem ini',
  'Saya perlu belajar banyak hal sebelum bisa menggunakan sistem ini',
];

const SCHN_ROWS_CANONICAL = [
  '[Aturan 1 — Konsistensi Desain] Tampilan tombol, warna, dan tipografi konsisten di seluruh halaman sistem',
  '[Aturan 2 — Pintasan Navigasi] Tersedia sidebar atau shortcut untuk akses cepat antar fitur',
  '[Aturan 3 — Umpan Balik Informatif] Setiap aksi pengguna direspons sistem secara jelas (indikator loading, notifikasi sukses, pesan error)',
  '[Aturan 4 — Dialog Closure] Setiap dialog/modal mudah ditutup, dan kapan suatu task selesai sangat jelas',
  '[Aturan 5 — Penanganan Kesalahan] Sistem mencegah pengguna melakukan kesalahan melalui validasi formulir sebelum data disubmit',
  '[Aturan 6 — Pembatalan Aksi Mudah] Tersedia tombol Cancel atau Kembali yang konsisten di setiap dialog',
  '[Aturan 7 — Kendali Internal Pengguna] Saya merasa sebagai pengguna yang mengontrol sistem, bukan sebaliknya',
  '[Aturan 8 — Kurangi Beban Memori] Saya tidak perlu mengingat detail dari halaman sebelumnya untuk menyelesaikan tugas di halaman saat ini',
];

const SCHN_GRID_TITLE_CANONICAL     = 'Delapan Aturan Emas (' + SHNEIDERMAN_AUTHOR + ', 2018)';
const SCHN_PAGEBREAK_TITLE_CANONICAL = 'INSTRUMEN B — Bagian 4 dari 6: Evaluasi Delapan Aturan Emas Desain Antarmuka (' + SHNEIDERMAN_AUTHOR + ', 2018)';

// ============= HELPERS =============

function _findById_(items, id) {
  for (var i = 0; i < items.length; i++) {
    if (items[i].getId() === id) return items[i];
  }
  return null;
}

function _diffArrays_(oldArr, newArr) {
  if (oldArr.length !== newArr.length) return { same: false, changes: [] };
  var changes = [];
  for (var i = 0; i < oldArr.length; i++) {
    if (oldArr[i] !== newArr[i]) {
      changes.push({ index: i, old: oldArr[i], new: newArr[i] });
    }
  }
  return { same: changes.length === 0, changes: changes };
}

function _processGrid_(item, expectedTypeId, label, canonicalRows, apply, log) {
  if (!item) {
    log.push('[' + label + '] ERROR: item ID ' + expectedTypeId + ' not found');
    return;
  }
  if (item.getType() !== FormApp.ItemType.GRID) {
    log.push('[' + label + '] ERROR: item is not GRID (actual type: ' + item.getType() + ')');
    return;
  }
  var grid = item.asGridItem();
  var oldRows = grid.getRows();
  var diff = _diffArrays_(oldRows, canonicalRows);

  if (diff.same) {
    log.push('[' + label + '] SKIP: rows already canonical (' + oldRows.length + ' rows match)');
    return;
  }

  log.push('[' + label + '] ' + (apply ? 'UPDATE' : 'WOULD-UPDATE') + ': ' + diff.changes.length + ' row(s) berubah');
  for (var i = 0; i < diff.changes.length; i++) {
    var c = diff.changes[i];
    log.push('  row ' + (c.index + 1) + ':');
    log.push('    OLD: ' + c.old);
    log.push('    NEW: ' + c.new);
  }
  if (oldRows.length !== canonicalRows.length) {
    log.push('  (row count change: ' + oldRows.length + ' → ' + canonicalRows.length + ')');
  }

  if (apply) {
    grid.setRows(canonicalRows);
  }
}

function _processTitle_(item, label, expectedTitle, apply, log) {
  if (!item) {
    log.push('[' + label + '] ERROR: item not found');
    return;
  }
  var oldTitle = item.getTitle();
  if (oldTitle === expectedTitle) {
    log.push('[' + label + '] SKIP: title already canonical');
    return;
  }
  log.push('[' + label + '] ' + (apply ? 'UPDATE' : 'WOULD-UPDATE') + ' title:');
  log.push('  OLD: ' + oldTitle);
  log.push('  NEW: ' + expectedTitle);
  if (apply) {
    item.setTitle(expectedTitle);
  }
}

// ============= MAIN ENTRY POINTS =============

function _runV2_(apply) {
  var form = FormApp.openById(FORM_ID_V2);
  var items = form.getItems();
  var log = [];

  log.push('============================================');
  log.push('  REVISI SUS FORM v2 — ' + (apply ? 'APPLY' : 'DRY-RUN'));
  log.push('============================================');
  log.push('Form: ' + form.getTitle());
  log.push('Total responses (preserved): ' + form.getResponses().length);
  log.push('Schneiderman author spelling: ' + SHNEIDERMAN_AUTHOR);
  log.push('--------------------------------------------');

  // PATCH 1: SUS GRID rows
  _processGrid_(
    _findById_(items, SUS_GRID_ITEM_ID),
    SUS_GRID_ITEM_ID,
    'SUS-GRID',
    SUS_ROWS_CANONICAL,
    apply,
    log
  );

  // PATCH 2: Schneiderman GRID rows
  _processGrid_(
    _findById_(items, SCHN_GRID_ITEM_ID),
    SCHN_GRID_ITEM_ID,
    'SCHN-GRID',
    SCHN_ROWS_CANONICAL,
    apply,
    log
  );

  // PATCH 3: Schneiderman GRID title
  _processTitle_(
    _findById_(items, SCHN_GRID_ITEM_ID),
    'SCHN-GRID-TITLE',
    SCHN_GRID_TITLE_CANONICAL,
    apply,
    log
  );

  // PATCH 4: Schneiderman page-break title
  _processTitle_(
    _findById_(items, SCHN_PAGEBREAK_ITEM_ID),
    'SCHN-PAGEBREAK-TITLE',
    SCHN_PAGEBREAK_TITLE_CANONICAL,
    apply,
    log
  );

  log.push('--------------------------------------------');
  log.push((apply ? 'APPLY' : 'DRY-RUN') + ' selesai.');
  log.push('Edit URL: ' + form.getEditUrl());

  for (var i = 0; i < log.length; i++) {
    Logger.log(log[i]);
  }
}

function dryRunSusFormV2() {
  _runV2_(false);
}

function reviseSusFormV2() {
  _runV2_(true);
}
