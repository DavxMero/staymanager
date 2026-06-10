/**
 * StayManager — Inspect Google Form (READ-ONLY)
 * =================================================================
 * PURE INSPECTION. Tidak modify Form sama sekali.
 * Output structured supaya bisa di-paste ke chat untuk diff vs skripsi
 * dan source code.
 *
 * CARA PAKAI:
 *   1. Buka Form: docs.google.com/forms/d/<FORM_ID>/edit
 *   2. ⋮ kanan atas → Script editor
 *   3. Buat file baru: + → Script → nama "inspect_form"
 *      (atau paste ke Code.gs default — TIDAK menimpa revise_sus_form.gs
 *       karena nama function beda)
 *   4. Paste seluruh isi file ini
 *   5. Save (Ctrl+S)
 *   6. Pilih function `inspectForm` di dropdown → klik Run
 *   7. View → Logs (Ctrl+Enter) → COPY SEMUA output → kirim ke chat
 *
 * SAFETY:
 *   - Hanya pakai getter API (getItems, getTitle, getOptions, dll).
 *   - TIDAK ada setTitle/setHelpText/setOptions/deleteItem.
 *   - TIDAK touch responses (cuma getResponses().length untuk count).
 * =================================================================
 */

// Ganti kalau mau inspect Form lain. Default = Form 3 SUS Universal.
const INSPECT_FORM_ID = '1LSPiXl1-JbxMYzHDWgaIyWrjujJN_MMZw8NXsyHJjLg';

function inspectForm() {
  const form = FormApp.openById(INSPECT_FORM_ID);
  const items = form.getItems();

  Logger.log('===== FORM METADATA =====');
  Logger.log('Form ID         : ' + INSPECT_FORM_ID);
  Logger.log('Title           : ' + form.getTitle());
  Logger.log('Description     : ' + (form.getDescription() || '(kosong)'));
  Logger.log('Edit URL        : ' + form.getEditUrl());
  Logger.log('Publish URL     : ' + form.getPublishedUrl());
  Logger.log('Accepts response: ' + form.isAcceptingResponses());
  Logger.log('Collect email   : ' + form.collectsEmail());
  Logger.log('Limit 1 resp    : ' + form.hasLimitOneResponsePerUser());
  Logger.log('Total responses : ' + form.getResponses().length);
  Logger.log('Total items     : ' + items.length);
  Logger.log('');

  Logger.log('===== ITEMS DETAIL =====');
  items.forEach(function (item, idx) {
    const type = item.getType();
    Logger.log('---------- [' + idx + '] ----------');
    Logger.log('Type     : ' + type.toString());
    Logger.log('Item ID  : ' + item.getId());
    Logger.log('Title    : ' + (item.getTitle() || '(kosong)'));
    const helpText = item.getHelpText() || '';
    if (helpText) {
      Logger.log('HelpText : ' + helpText);
      Logger.log('HelpLen  : ' + helpText.length + ' chars');
    } else {
      Logger.log('HelpText : (kosong)');
    }

    switch (type) {
      case FormApp.ItemType.SECTION_HEADER:
        // already covered above
        break;

      case FormApp.ItemType.PAGE_BREAK: {
        const pb = item.asPageBreakItem();
        const nav = pb.getGoToPage();
        Logger.log('GoToPage : ' + (nav ? nav.getTitle() : '(default next)'));
        Logger.log('PageNavType: ' + pb.getPageNavigationType());
        break;
      }

      case FormApp.ItemType.TEXT: {
        const ti = item.asTextItem();
        Logger.log('Required : ' + ti.isRequired());
        break;
      }

      case FormApp.ItemType.PARAGRAPH_TEXT: {
        const pi = item.asParagraphTextItem();
        Logger.log('Required : ' + pi.isRequired());
        break;
      }

      case FormApp.ItemType.MULTIPLE_CHOICE: {
        const mc = item.asMultipleChoiceItem();
        Logger.log('Required : ' + mc.isRequired());
        Logger.log('HasOther : ' + mc.hasOtherOption());
        const opts = mc.getChoices();
        Logger.log('Options  : (' + opts.length + ')');
        opts.forEach(function (c, i) {
          Logger.log('  [' + i + '] ' + c.getValue());
        });
        break;
      }

      case FormApp.ItemType.CHECKBOX: {
        const cb = item.asCheckboxItem();
        Logger.log('Required : ' + cb.isRequired());
        Logger.log('HasOther : ' + cb.hasOtherOption());
        const opts = cb.getChoices();
        Logger.log('Options  : (' + opts.length + ')');
        opts.forEach(function (c, i) {
          Logger.log('  [' + i + '] ' + c.getValue());
        });
        break;
      }

      case FormApp.ItemType.LIST: {
        const li = item.asListItem();
        Logger.log('Required : ' + li.isRequired());
        const opts = li.getChoices();
        Logger.log('Options  : (' + opts.length + ')');
        opts.forEach(function (c, i) {
          Logger.log('  [' + i + '] ' + c.getValue());
        });
        break;
      }

      case FormApp.ItemType.SCALE: {
        const sc = item.asScaleItem();
        Logger.log('Required : ' + sc.isRequired());
        Logger.log('Bounds   : ' + sc.getLowerBound() + ' .. ' + sc.getUpperBound());
        Logger.log('Labels   : "' + (sc.getLeftLabel() || '') + '" .. "' + (sc.getRightLabel() || '') + '"');
        break;
      }

      case FormApp.ItemType.GRID: {
        const gr = item.asGridItem();
        Logger.log('Required : ' + gr.isRequired());
        Logger.log('Rows     : ' + JSON.stringify(gr.getRows()));
        Logger.log('Columns  : ' + JSON.stringify(gr.getColumns()));
        break;
      }

      case FormApp.ItemType.CHECKBOX_GRID: {
        const cg = item.asCheckboxGridItem();
        Logger.log('Required : ' + cg.isRequired());
        Logger.log('Rows     : ' + JSON.stringify(cg.getRows()));
        Logger.log('Columns  : ' + JSON.stringify(cg.getColumns()));
        break;
      }

      case FormApp.ItemType.DATE: {
        const di = item.asDateItem();
        Logger.log('Required : ' + di.isRequired());
        Logger.log('IncludesYear: ' + di.includesYear());
        break;
      }

      case FormApp.ItemType.TIME: {
        const tm = item.asTimeItem();
        Logger.log('Required : ' + tm.isRequired());
        break;
      }

      default:
        Logger.log('(no extra detail for this type)');
    }
    Logger.log('');
  });

  Logger.log('===== END INSPECTION =====');
  Logger.log('Run finished. Copy entire log → paste ke chat.');
}
