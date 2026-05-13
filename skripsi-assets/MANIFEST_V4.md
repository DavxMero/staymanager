# Skripsi Assets v4.1 — Ground-truth Schema Sync

Generated: 2026-05-12 (audit + regen run) · Target spec: 56 placeholders untuk thesis

## Naming Convention

| Aspect | v3.x (deleted) | **v4 (current)** |
|---|---|---|
| Pattern | `gambar_X_Y_descriptive.png` | `gambar-X-NN.png` |
| Separator | underscore `_` | hyphen `-` |
| Padding | tidak | 2 digits |
| Example | `gambar_3_4_use_case.png` | `gambar-3-04.png` |
| Resolution | 1800×1400 | **1950×2400** (300 DPI @ 6.5") |
| Background | white | white |

## v4.1 Changes vs v4.0

**Schema-verified via Supabase MCP (project `ncjneagfadrmivgicszm` v3.1):**

1. **`gambar-3-04` (Use Case)** — direstructure:
   - "Resepsionis" → **"Front Desk"** (sesuai roles.name)
   - Actor "Staf Inventaris" **dihapus** (tidak ada role `inventory` di DB; CRUD inventaris dilakukan manager/super_admin)
   - Tambah actor **"Tamu Terdaftar"** (role=`guest`) terpisah dari "Tamu Anonymous"
   - Total: 7 aktor (5 staff + 2 jenis tamu)

2. **`gambar-3-05` (Class Diagram)** — Reservation field sync:
   - Tambah: `guest_name`, `guest_email`, `guest_phone`, `room_number`, `room_type` (denormalized)
   - Tambah: `guest_count`, `room_total`, **`total_price`** (both `total_amount` & `total_price` ada di DB)
   - Tambah: `breakfast_pax`, `breakfast_price`, `breakfast_total`, `notes`
   - Note update: 6 DB roles + jelaskan inventory operations sub-role manager

3. **`gambar-3-26` (ERD)** — `reservations` entity sync:
   - Tambah denormalized fields (guest_*, room_*) yang ada di tabel actual
   - Klarifikasi: `total_amount` DAN `total_price` keduanya ada (transitional/redundant)
   - Tambah `notes` (BUKAN special_requests; tidak ada `created_by`)
   - Tambah breakfast fields, guest_count

**v3.x legacy files (73 file) dihapus** untuk menghindari ambiguity:
- 34 PNG `gambar_X_N_*.png` di `diagrams/png/`
- 30 MMD `gambar_X_N_*.mmd` di `diagrams/source/`
- 9 PNG `gambar_4_N_*.png` di `screenshots/`
- `manifest.json` (v3.1, obsolete)
- `MAPPING.md` (target 43 — sekarang 56)

---

## Status per File (43+13 / 56)

### BAB 1 — 1/1 ✅
| ID | File | Status |
|---|---|---|
| 1-01 | `diagrams/png/gambar-1-01.png` | ✅ rendered |

### BAB 2 — 6/6 ✅ (2-03 & 2-04 di-skip per spec)
| ID | Caption | Status |
|---|---|---|
| 2-01 | Arsitektur PMS | ✅ |
| 2-02 | Alur Kerja Scrum | ✅ |
| 2-05 | Contoh Use Case | ✅ |
| 2-06 | Contoh Class Diagram | ✅ |
| 2-07 | Contoh Activity Diagram | ✅ |
| 2-08 | Contoh Sequence Diagram | ✅ |

### BAB 3 — 26/26 ✅
| ID | Caption | Status |
|---|---|---|
| 3-01 | Alur Scrum 12 sprint | ✅ |
| 3-02 | Kerangka Berpikir | ✅ |
| 3-03 | Flowchart Aplikasi | ✅ |
| **3-04** | **Use Case 7 aktor** | ✅ **v4.1 — schema-aligned** |
| **3-05** | **Class Diagram 16 classes** | ✅ **v4.1 — Reservation fields synced** |
| 3-06 | Sequence Login Staf | ✅ |
| 3-07 | Sequence Cek Ketersediaan (3 query + JS merge) | ✅ |
| 3-08 | Sequence Create Booking (auth gate) | ✅ |
| 3-09 | Sequence Konfirmasi Pembayaran | ✅ |
| 3-10 | Arsitektur LLM Chatbot | ✅ |
| 3-11 | Sequence Check-in | ✅ |
| 3-12 | Sequence Check-out | ✅ |
| 3-13 | Sequence Manajemen Kamar | ✅ |
| 3-14 | Sequence Housekeeping | ✅ |
| 3-15 | Activity Login | ✅ |
| 3-16 | Activity Registrasi Staf | ✅ |
| 3-17 | Activity Reservasi Chatbot (auth branch) | ✅ |
| 3-18 | Activity Check-in | ✅ |
| 3-19 | Activity Housekeeping | ✅ |
| 3-20 | Activity Keuangan | ✅ |
| 3-21 | Wireframe Landing | ✅ |
| 3-22 | Wireframe Chatbot | ✅ |
| 3-23 | Wireframe Login | ✅ |
| 3-24 | Wireframe Manajemen Kamar | ✅ |
| 3-25 | Wireframe Keuangan | ✅ |
| **3-26** | **ERD v3.1 actual** | ✅ **v4.1 — reservations entity synced + soft-ref dashed** |

### BAB 4 — 23/23 ⚠️
**Auto-captured via Playwright @ 1280×800 deviceScale=2:**

| ID | Caption | URL | Auth |
|---|---|---|---|
| 4-01 | Login | /login | publik |
| 4-02 | Dashboard | /dashboard | staff |
| 4-03 | Kamar | /rooms | staff |
| 4-04 | Tamu | /guests | staff |
| 4-05 | Reservasi | /occupancy | staff |
| 4-06 | Keuangan | /financial | staff |
| 4-07 | Inventaris | /logistics | admin |
| 4-08 | Billing | /billing | staff |
| 4-09 | Laporan | /reports | staff |
| 4-10 | Chatbot | /chatbot | guest |

**Lima Faktor Manusia (4-11 .. 4-15) — placeholder UI:**
> Auto-capture menampilkan halaman yang merepresentasikan faktor; **chart/grafik hasil studi user harus di-overlay manual** oleh penulis (Excel/Looker/Tableau setelah survey selesai).

| ID | Faktor | URL placeholder | Action penulis |
|---|---|---|---|
| 4-11 | Learnability | /dashboard | Overlay grafik task completion time (novice users) |
| 4-12 | Efficiency | /occupancy | Overlay comparison expert vs novice time |
| 4-13 | Memorability | /dashboard | Overlay grafik task time after 1 week gap |
| 4-14 | Error Rate | /login | Overlay chart frekuensi error per task |
| 4-15 | Satisfaction | /reports | Overlay chart hasil SUS/UEQ |

**Delapan Aturan Emas (4-16 .. 4-23) — UI pattern evidence:**
| ID | Aturan | URL | Catatan |
|---|---|---|---|
| 4-16 | Konsistensi Desain | /rooms | Komponen tabel/button konsisten |
| 4-17 | Pintasan Navigasi | /dashboard | Sidebar + breadcrumb + search |
| 4-18 | Umpan Balik Informatif | /guests | ⚠️ Toast perlu trigger manual (CRUD action) |
| 4-19 | Dialog Closure | /rooms | ⚠️ Modal perlu di-open manual |
| 4-20 | Penanganan Kesalahan | /login | Submit kosong → validation error |
| 4-21 | Pembatalan Aksi | /rooms | ⚠️ Modal perlu di-open untuk lihat Cancel button |
| 4-22 | Kendali Internal | /occupancy | Filter/sort/date-picker |
| 4-23 | Informasi Tampil Langsung | /dashboard | KPI cards + real-time charts |

> ✅ **v4.1 update**: Script `capture-screenshots.mjs` sekarang punya per-shot `interact` handler — semua 23 screenshot **byte-unique** (MD5 verified). Interactive states yang sudah di-script:
> - **4-19** Dialog Closure: auto-open modal Add Room
> - **4-20** Penanganan Kesalahan: auto-submit invalid credentials → toast error
> - **4-21** Pembatalan Aksi: auto-open modal + isi field `999` (skenario user mau cancel)
> - **4-22** Kendali Internal: auto-expand filter button
> - **4-13** Memorability: navigate ke /reports (showing sidebar layout familiar)
> - **4-17** Pintasan Navigasi: navigate ke /staff (showing breadcrumb + sidebar di sub-page)
> - **4-23** Informasi Tampil Langsung: fullPage + scroll ke KPI section

---

## Total Coverage

- **Auto-captured + unique:** 33 diagrams + 23 BAB 4 screenshots = **56 / 56** ✅
- **MD5 verification:** 23/23 BAB 4 screenshots byte-unique (tidak ada duplicate konten)
- **Manual overlay tetap diperlukan:** 4-11 .. 4-15 → chart hasil studi user (SUS/UEQ) di-overlay penulis

## Ground-truth Schema References (verified 2026-05-12)

**Supabase project**: `ncjneagfadrmivgicszm` (`db.ncjneagfadrmivgicszm.supabase.co`, region `ap-southeast-1`, Postgres 17.4)

**Roles (6 total, public.roles):**
```
finance, front_desk, guest, housekeeping, manager, super_admin
```
Tidak ada role `receptionist`, `inventory`. Operasi inventaris = sub-role manager/super_admin.

**reservations columns (kunci):**
- `guest_id`, `guest_name`, `guest_email`, `guest_phone` (denormalized)
- `room_id`, `room_number`, `room_type` (denormalized)
- `check_in`, `check_out`, `adults`, `children`, `guest_count`
- `room_rate`, `room_total`, **`total_amount`**, **`total_price`** (both ada)
- `breakfast_included`, `breakfast_pax`, `breakfast_price`, `breakfast_total`
- `status`, `payment_status`, `notes`
- `actual_check_in`, `actual_check_out`
- `booking_id`, `booking_reference`
- ❌ TIDAK ADA: `special_requests`, `created_by`

**guests columns:**
- `full_name` NN, `email` NULLABLE, `phone` NULLABLE, `id_number` NULLABLE
- (Note: phone NULLABLE di DB tapi REQUIRED di UI `/guests` page; OPSIONAL di chatbot booking)

**custom_room_types columns:**
- `name` UK NN, `description`, `base_price` NN, `max_occupancy` NN default 2
- `amenities` JSONB (BUKAN `facilities`), `features` JSONB, `images` JSONB default '[]'
- `is_active` BOOLEAN default true
- Tambahan: `color_theme`, `view_type`, `special_features`, `room_size`, `bed_configuration`

**rooms columns:**
- `number` NN, `type` (varchar — soft ref ke `custom_room_types.name`)
- `floor` NN, `base_price` NN default 0, `status` NN default 'available'
- `image_url` (text, nullable, Supabase Storage URL)
- ❌ TIDAK ADA: `custom_type_id`, `notes`

---

## File Locations

```
e:\Github\staymanager\skripsi-assets\
├── diagrams\
│   ├── source\gambar-X-NN.mmd      (33 Mermaid sources, v4)
│   └── png\gambar-X-NN.png         (33 rendered, 1950×2400)
├── screenshots\gambar-4-NN.png     (Playwright captures, 1280×800 @ 2x)
├── scripts\
│   ├── capture-screenshots.mjs     (v4.1 — 23 entries: 4-01 .. 4-23)
│   ├── render-diagrams.ps1         (legacy script)
│   └── render-diagrams.sh
├── MANIFEST_V4.md                  (this file)
├── REFERENCES_ARSITEKTUR_PMS.md
├── README.md
├── .env / .env.example
├── package.json / pnpm-lock.yaml
└── node_modules\                   (playwright)
```

## Re-run Commands

**Render single diagram:**
```bash
cd skripsi-assets
mmdc -i diagrams/source/gambar-3-04.mmd -o diagrams/png/gambar-3-04.png -w 1950 -H 2400 -b white
```

**Batch render all 33:**
```bash
cd skripsi-assets
for f in diagrams/source/gambar-*.mmd; do
  base=$(basename "$f" .mmd)
  mmdc -i "$f" -o "diagrams/png/${base}.png" -w 1950 -H 2400 -b white
done
```

**Capture screenshots (semua 23):**
```bash
cd skripsi-assets
set -a; source .env; set +a
node scripts/capture-screenshots.mjs
```

**Capture subset:** `node scripts/capture-screenshots.mjs --shots=4-16,4-22,4-23`

---

## Anti-pattern Compliance Checklist (v3.1 ground-truth)

- ✅ ERD: `rooms ↔ custom_room_types` notasi `||..o{` (soft-ref by string, BUKAN FK)
- ✅ Class Diagram: tidak ada `custom_type_id` di Room class
- ✅ Use Case: 7 aktor sesuai 6 DB roles + Anonymous; "Front Desk" (BUKAN Resepsionis); tidak ada actor "Inventaris"
- ✅ Reservation entity: include `total_amount` AND `total_price`, `notes` (BUKAN special_requests), denormalized fields
- ✅ Guest: `phone` annotated "DB nullable / UI required di /guests; OPSIONAL di chatbot"; `id_number` annotated "opsional - saat check-in"
- ✅ Sequence Cek Ketersediaan: 3 query terpisah (busy + rooms + custom_room_types) + JS merge
- ✅ Sequence Create Booking: auth gate decision eksplisit (anonymous → SHOW_LOGIN_PROMPT_JSON)
- ✅ Activity Reservasi Chatbot: isLoggedIn? decision + LoginPromptCard flow

---

**End of MANIFEST_V4.md.**
