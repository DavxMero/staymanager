#!/usr/bin/env bash
# render-diagrams.sh — Batch render semua .mmd → .png via mmdc
#
# Usage:
#   bash scripts/render-diagrams.sh
#
# Requires:
#   - @mermaid-js/mermaid-cli installed globally: npm install -g @mermaid-js/mermaid-cli
#
# Output: PNG di skripsi-assets/diagrams/png/

set -e

cd "$(dirname "$0")/.."

SOURCE_DIR="diagrams/source"
OUTPUT_DIR="diagrams/png"
WIDTH=1800
HEIGHT=1400
BG="white"

mkdir -p "$OUTPUT_DIR"

count=0
for file in "$SOURCE_DIR"/*.mmd; do
    [ -f "$file" ] || continue
    base=$(basename "$file" .mmd)
    output="$OUTPUT_DIR/$base.png"
    echo "[render] $base.mmd → $base.png"
    mmdc -i "$file" -o "$output" -w "$WIDTH" -H "$HEIGHT" -b "$BG"
    count=$((count + 1))
done

echo ""
echo "✓ Rendered $count diagrams to $OUTPUT_DIR/"
