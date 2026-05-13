# Skripsi Assets — StayManager

Asset visual untuk naskah skripsi `Skripsi StayManager Final.docx`. Total **43 gambar** mengikuti numbering thesis aktual.

## Struktur

```
skripsi-assets/
├── diagrams/
│   ├── source/         # 34 file Mermaid (.mmd) — source of truth
│   └── png/            # 34 file PNG hasil render mmdc (1800x1400)
├── screenshots/        # 9 PNG screenshot UI Bab 4 (perlu di-generate)
├── scripts/
│   ├── render-diagrams.sh         # Render .mmd → .png (Bash)
│   ├── render-diagrams.ps1        # Render .mmd → .png (PowerShell)
│   └── capture-screenshots.mjs    # Playwright batch capture Bab 4
├── .env.example        # Template config Playwright
├── manifest.json       # Metadata semua diagram
├── MAPPING.md          # Mapping caption → file → status
└── README.md           # Dokumen ini
```

## Status

**34/43 selesai** (semua diagram). Sisa 9 screenshot Bab 4 butuh deployment + credentials.

Detail per gambar: lihat [MAPPING.md](MAPPING.md).

## Re-generate Diagram

Diagram di-render dari Mermaid source. Source code adalah **single source of truth** — kalau ada perubahan struktur sistem, edit `.mmd` lalu re-render.

### Prasyarat

```bash
# Install Mermaid CLI sekali saja (global)
npm install -g @mermaid-js/mermaid-cli
```

### Render semua diagram

```bash
# Bash (Linux / macOS / Git Bash di Windows)
bash scripts/render-diagrams.sh

# PowerShell (Windows native)
pwsh scripts/render-diagrams.ps1
```

Output: `diagrams/png/*.png` (resolusi 1800×1400, background putih).

### Render satu diagram saja

```bash
mmdc -i diagrams/source/gambar_3_4_use_case.mmd \
     -o diagrams/png/gambar_3_4_use_case.png \
     -w 1800 -H 1400 -b white
```

## Capture Screenshot Bab 4

Bab 4 berisi 9 screenshot UI dari deployment production. Capture pakai **Playwright** (browser automation tool dari Microsoft yang menjalankan Chromium headless untuk mengambil screenshot otomatis).

### 1. Install Playwright

Folder ini punya `package.json` sendiri (isolated dari project utama) supaya konflik deps tidak menggangu.

```bash
cd skripsi-assets

# Install Playwright (pakai --ignore-workspace karena project root pakai pnpm workspace)
pnpm install --ignore-workspace

# Download Chromium binary (~110 MB, hanya sekali)
pnpm exec playwright install chromium
```

> **Catatan:** Jangan `npm install playwright` di root repo — main project punya konflik dependency (`@vercel/ai-tsconfig` 404). Selalu install dari dalam folder `skripsi-assets/`.

### 2. Setup credentials

Copy `.env.example` jadi `.env` dan isi:

```bash
cp .env.example .env
```

Edit `.env`:

```env
BASE_URL=https://staymanager.vercel.app
DEMO_EMAIL=admin@hotel-asni.com         # akun staff super_admin/manager
DEMO_PASSWORD=your_password
DEMO_GUEST_EMAIL=tamu@example.com       # akun guest untuk capture chatbot
DEMO_GUEST_PASS=your_password
```

> **Tips data dummy:** Pastikan database punya data realistis konteks Hotel Asni (tamu nama Indonesia, kamar Deluxe/Standard, harga IDR). Akun seharusnya bisa login dan akses semua modul (kecuali guest).

### 3. Jalankan capture

```bash
# Load env variables (Linux / macOS / WSL)
set -a; source .env; set +a; node scripts/capture-screenshots.mjs

# PowerShell
Get-Content .env | Where-Object {$_ -match '^([^=]+)=(.*)$'} | ForEach-Object {
    [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
}
node scripts/capture-screenshots.mjs
```

Output: `screenshots/gambar_4_*.png` (9 file, viewport 1920×1080 @ 2x DPI = 3840×2160).

### 4. Capture single screenshot manual (alternatif)

Kalau Playwright bermasalah, capture manual via browser:
1. Login di production deployment dengan akun staff
2. Buka tiap halaman target
3. F12 → Toggle device toolbar → set viewport ke 1920×1080
4. Capture pakai built-in DevTools screenshot atau ekstensi seperti FireShot
5. Rename file sesuai pola `gambar_4_X_<nama>.png`

## Quality Checklist (sebelum insert ke Word)

- ✅ Resolusi 1800×1400 minimum (diagram) atau 1920×1080 @ 2x (screenshot)
- ✅ Background putih (diagram) atau gradient biru-indigo asli (screenshot UI)
- ✅ Tidak ada watermark "Demo" / "Lorem Ipsum"
- ✅ Tidak ada DevTools / overlay browser
- ✅ Data dummy realistis konteks Hotel Asni
- ✅ Caption di Word sesuai tabel di [MAPPING.md](MAPPING.md)

## Insert ke Naskah Word

1. Drag-drop tiap PNG ke placeholder gambar di docx, atau
2. Pakai Word agent (Claude di Word) untuk replace anchor text "Gambar X.Y" dengan inline picture pakai filename mapping di MAPPING.md

## Troubleshooting

### `mmdc: command not found`

Install Mermaid CLI: `npm install -g @mermaid-js/mermaid-cli`. Cek lokasi binary dengan `which mmdc` atau `npm bin -g`.

### Diagram terpotong / label tumpang tindih

Edit `.mmd` source — kurangi label panjang, pisah subgraph, atau ganti `direction LR` ke `TB`. Tweak parameter `-w` dan `-H` di render script kalau perlu lebih besar.

### Playwright login gagal

- Cek selector di `capture-screenshots.mjs` — kalau form login pakai field name yang beda, edit `page.fill()` selector
- Cek apakah deployment butuh CSRF token / captcha
- Coba run dengan `headless: false` di `chromium.launch({ headless: false })` untuk visual debug

### Screenshot kosong / loading state

Tambah `await page.waitForTimeout(3000)` di `capture()` function setelah `page.goto()` untuk tunggu data hydrate. Atau pakai `page.waitForSelector('selector-yang-pasti-ada')`.

## Source of Truth

Semua diagram di-generate dari kode aktual + skema Supabase production. Kalau ada perubahan struktur:
- `src/types/index.ts` — affects gambar 3.5
- `src/app/api/chat/route.ts` — affects gambar 2.3, 3.7, 3.8, 3.9, 3.16
- `src/app/login/page.tsx` — affects gambar 3.6, 3.14
- `src/app/occupancy/page.tsx` — affects gambar 3.10, 3.11, 3.17
- `src/app/rooms/page.tsx` — affects gambar 3.12, 3.13, 3.18
- Supabase schema — affects gambar 3.25 (ERD)

Re-render PNG setelah edit source.
