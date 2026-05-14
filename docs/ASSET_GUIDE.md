# ASSET_GUIDE.md — Panduan Asset Skripsi (REDIRECT)

> **File ini sudah dimigrasikan** ke struktur baru di `/skripsi-assets/`.

## Lokasi baru

```
/skripsi-assets/
├── diagrams/source/    # 34 file Mermaid (.mmd)
├── diagrams/png/       # 34 file PNG hasil render
├── screenshots/        # 9 PNG screenshot Bab 4 (perlu generate)
├── scripts/            # render-diagrams.{sh,ps1} + capture-screenshots.mjs
├── manifest.json       # Metadata semua asset
├── MAPPING.md          # Caption thesis → file → status
└── README.md           # Cara re-generate semua asset
```

## Numbering — Total 43 gambar (mengikuti thesis aktual)

- **Bab 1:** 1 gambar (1.1)
- **Bab 2:** 8 gambar (2.1–2.8)
- **Bab 3:** 25 gambar (3.1–3.25)
- **Bab 4:** 9 gambar (4.1–4.9)

> ASSET_GUIDE.md lama menyebut 56 gambar. Itu **outdated** — thesis aktual hanya 43 gambar, dan numbering Bab 3 berbeda (3.10 = Sequence Check-in, 3.25 = ERD).

## Status

**34/43 selesai** (semua diagram). Sisa 9 screenshot Bab 4 butuh production deployment + demo credentials.

## Quick Start

```bash
# Re-render diagram
bash skripsi-assets/scripts/render-diagrams.sh

# Capture screenshot Bab 4 (setelah set .env)
node skripsi-assets/scripts/capture-screenshots.mjs
```

Detail lengkap: lihat [`/skripsi-assets/README.md`](../skripsi-assets/README.md).
