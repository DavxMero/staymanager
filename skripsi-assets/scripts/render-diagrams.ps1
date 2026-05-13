# render-diagrams.ps1 — Batch render semua .mmd → .png via mmdc (PowerShell)
#
# Usage:
#   pwsh scripts/render-diagrams.ps1
#
# Requires:
#   - @mermaid-js/mermaid-cli installed globally: npm install -g @mermaid-js/mermaid-cli

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir

$SourceDir = Join-Path $Root "diagrams\source"
$OutputDir = Join-Path $Root "diagrams\png"
$Width = 1800
$Height = 1400
$Bg = "white"

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$count = 0
Get-ChildItem -Path $SourceDir -Filter "*.mmd" | ForEach-Object {
    $base = $_.BaseName
    $input = $_.FullName
    $output = Join-Path $OutputDir "$base.png"
    Write-Host "[render] $($_.Name) -> $base.png"
    & mmdc -i $input -o $output -w $Width -H $Height -b $Bg
    if ($LASTEXITCODE -ne 0) {
        Write-Error "mmdc failed for $($_.Name)"
    }
    $count++
}

Write-Host ""
Write-Host "[OK] Rendered $count diagrams to $OutputDir"
