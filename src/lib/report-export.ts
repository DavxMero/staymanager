/**
 * Client-side report export helpers.
 * - CSV: generates UTF-8 BOM CSV (opens cleanly in Excel) and triggers download.
 * - PDF: opens a print-ready HTML window; user picks "Save as PDF" in browser print dialog.
 *
 * No external libraries required.
 */

interface DateRange {
    startDate: string
    endDate: string
}

const fmtRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)

const fmtPct = (n: number) => `${(n || 0).toFixed(2)}%`

// CSV-safe escape: wrap in quotes if contains comma/quote/newline, double-up internal quotes
const csvCell = (val: unknown): string => {
    if (val === null || val === undefined) return ''
    const str = String(val)
    if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
    return str
}

const csvRow = (cells: unknown[]) => cells.map(csvCell).join(',')

const triggerDownload = (content: string, filename: string, mime: string) => {
    const BOM = '﻿' // UTF-8 BOM so Excel renders Bahasa Indonesia & rupiah correctly
    const blob = new Blob([BOM + content], { type: `${mime};charset=utf-8;` })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

// ─── REPORTS PAGE ──────────────────────────────────────────────────────────

export function exportReportToCSV(data: any, range: DateRange) {
    const lines: string[] = []

    lines.push('Laporan Analitik StayManager')
    lines.push(`Periode,${range.startDate} s/d ${range.endDate}`)
    lines.push(`Tanggal Cetak,${new Date().toLocaleString('id-ID')}`)
    lines.push('')

    // Summary section
    lines.push('=== RINGKASAN KEUANGAN ===')
    lines.push(csvRow(['Metrik', 'Nilai']))
    lines.push(csvRow(['Total Revenue', fmtRupiah(data.summary?.totalRevenue)]))
    lines.push(csvRow(['Total Bookings', data.summary?.totalBookings ?? 0]))
    lines.push(csvRow(['Occupancy Rate', fmtPct(data.summary?.currentOccupancyRate)]))
    lines.push(csvRow(['Average Daily Rate (ADR)', fmtRupiah(data.summary?.adr)]))
    lines.push(csvRow(['RevPAR', fmtRupiah(data.summary?.revpar)]))
    lines.push(csvRow(['Total Rooms', data.summary?.totalRooms ?? 0]))
    lines.push(csvRow(['Occupied Rooms', data.summary?.occupiedRooms ?? 0]))
    lines.push('')

    // Revenue trend
    if (Array.isArray(data.revenueData) && data.revenueData.length > 0) {
        lines.push('=== TREN REVENUE & BOOKING ===')
        lines.push(csvRow(['Periode', 'Bookings', 'Revenue (Rp)']))
        data.revenueData.forEach((d: any) =>
            lines.push(csvRow([d.month || d.date || d.label || '', d.bookings ?? 0, d.revenue ?? 0]))
        )
        lines.push('')
    }

    // Room type revenue
    if (Array.isArray(data.roomTypeRevenue) && data.roomTypeRevenue.length > 0) {
        lines.push('=== REVENUE PER TIPE KAMAR ===')
        lines.push(csvRow(['Tipe', 'Revenue (Rp)']))
        data.roomTypeRevenue.forEach((d: any) =>
            lines.push(csvRow([d.type || d.name || '', d.revenue ?? d.value ?? 0]))
        )
        lines.push('')
    }

    // Room service stats
    if (data.roomServiceStats) {
        lines.push('=== ROOM SERVICE REQUESTS ===')
        lines.push(csvRow(['Total', data.roomServiceStats.total ?? 0]))
        lines.push(csvRow(['Pending', data.roomServiceStats.pending ?? 0]))
        lines.push(csvRow(['In Progress', data.roomServiceStats.inProgress ?? 0]))
        lines.push(csvRow(['Completed', data.roomServiceStats.completed ?? 0]))
        lines.push('')
    }

    // Housekeeping stats
    if (data.housekeepingStats) {
        lines.push('=== HOUSEKEEPING TASKS ===')
        lines.push(csvRow(['Total', data.housekeepingStats.total ?? 0]))
        lines.push(csvRow(['Pending', data.housekeepingStats.pending ?? 0]))
        lines.push(csvRow(['In Progress', data.housekeepingStats.inProgress ?? 0]))
        lines.push(csvRow(['Completed', data.housekeepingStats.completed ?? 0]))
        lines.push('')
    }

    const filename = `staymanager-report-${range.startDate}-to-${range.endDate}.csv`
    triggerDownload(lines.join('\n'), filename, 'text/csv')
}

export function exportReportToPDF(data: any, range: DateRange) {
    const win = window.open('', '_blank', 'width=900,height=1200')
    if (!win) {
        throw new Error('Browser memblokir pop-up. Mohon izinkan pop-up untuk situs ini lalu coba lagi.')
    }

    const summaryRow = (label: string, value: string) =>
        `<tr><td>${label}</td><td class="num">${value}</td></tr>`

    const revenueRows = Array.isArray(data.revenueData)
        ? data.revenueData
            .map(
                (d: any) =>
                    `<tr><td>${d.month || d.date || d.label || ''}</td><td class="num">${d.bookings ?? 0}</td><td class="num">${fmtRupiah(d.revenue || 0)}</td></tr>`
            )
            .join('')
        : ''

    const roomTypeRows = Array.isArray(data.roomTypeRevenue)
        ? data.roomTypeRevenue
            .map(
                (d: any) =>
                    `<tr><td>${d.type || d.name || ''}</td><td class="num">${fmtRupiah(d.revenue ?? d.value ?? 0)}</td></tr>`
            )
            .join('')
        : ''

    const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Laporan Analitik StayManager — ${range.startDate} s/d ${range.endDate}</title>
<style>
  @page { size: A4; margin: 18mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; margin: 0; padding: 24px; }
  header { border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
  h1 { margin: 0 0 8px; font-size: 22px; color: #1e3a8a; }
  .meta { color: #555; font-size: 13px; }
  h2 { font-size: 15px; color: #1e40af; margin: 24px 0 8px; border-left: 4px solid #2563eb; padding-left: 10px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 13px; }
  th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; }
  th { background: #eff6ff; font-weight: 600; color: #1e3a8a; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
  .kpi { border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; }
  .kpi .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
  .kpi .value { font-size: 20px; font-weight: 700; color: #111827; margin-top: 4px; }
  footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #d1d5db; font-size: 11px; color: #6b7280; text-align: center; }
  @media print { body { padding: 0; } .no-print { display: none; } }
  .actions { text-align: center; margin: 16px 0; }
  .actions button { padding: 10px 24px; background: #2563eb; color: #fff; border: 0; border-radius: 6px; font-size: 14px; cursor: pointer; }
</style>
</head>
<body>
<header>
  <h1>Laporan Analitik StayManager</h1>
  <div class="meta">
    Periode: <strong>${range.startDate}</strong> s/d <strong>${range.endDate}</strong><br>
    Tanggal Cetak: ${new Date().toLocaleString('id-ID')}
  </div>
</header>

<div class="actions no-print">
  <button onclick="window.print()">🖨️ Cetak / Simpan sebagai PDF</button>
</div>

<h2>Ringkasan Kinerja</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="label">Total Revenue</div><div class="value">${fmtRupiah(data.summary?.totalRevenue)}</div></div>
  <div class="kpi"><div class="label">Total Bookings</div><div class="value">${data.summary?.totalBookings ?? 0}</div></div>
  <div class="kpi"><div class="label">Occupancy Rate</div><div class="value">${fmtPct(data.summary?.currentOccupancyRate)}</div></div>
  <div class="kpi"><div class="label">Average Daily Rate</div><div class="value">${fmtRupiah(data.summary?.adr)}</div></div>
  <div class="kpi"><div class="label">RevPAR</div><div class="value">${fmtRupiah(data.summary?.revpar)}</div></div>
  <div class="kpi"><div class="label">Kamar Terisi</div><div class="value">${data.summary?.occupiedRooms ?? 0} / ${data.summary?.totalRooms ?? 0}</div></div>
</div>

${revenueRows
            ? `<h2>Tren Revenue & Booking</h2>
<table>
  <thead><tr><th>Periode</th><th>Bookings</th><th>Revenue</th></tr></thead>
  <tbody>${revenueRows}</tbody>
</table>`
            : ''
        }

${roomTypeRows
            ? `<h2>Revenue per Tipe Kamar</h2>
<table>
  <thead><tr><th>Tipe Kamar</th><th>Revenue</th></tr></thead>
  <tbody>${roomTypeRows}</tbody>
</table>`
            : ''
        }

${data.roomServiceStats
            ? `<h2>Room Service Requests</h2>
<table>
  <tbody>
    ${summaryRow('Total Permintaan', String(data.roomServiceStats.total ?? 0))}
    ${summaryRow('Pending', String(data.roomServiceStats.pending ?? 0))}
    ${summaryRow('In Progress', String(data.roomServiceStats.inProgress ?? 0))}
    ${summaryRow('Completed', String(data.roomServiceStats.completed ?? 0))}
  </tbody>
</table>`
            : ''
        }

${data.housekeepingStats
            ? `<h2>Housekeeping Tasks</h2>
<table>
  <tbody>
    ${summaryRow('Total Tugas', String(data.housekeepingStats.total ?? 0))}
    ${summaryRow('Pending', String(data.housekeepingStats.pending ?? 0))}
    ${summaryRow('In Progress', String(data.housekeepingStats.inProgress ?? 0))}
    ${summaryRow('Completed', String(data.housekeepingStats.completed ?? 0))}
  </tbody>
</table>`
            : ''
        }

<footer>
  StayManager — Property Management System · Laporan ini dihasilkan secara otomatis oleh sistem
</footer>
</body>
</html>`

    win.document.write(html)
    win.document.close()
    // Beri waktu render sebelum print dialog dibuka otomatis
    setTimeout(() => {
        try { win.focus() } catch { }
    }, 200)
}

// ─── FINANCIAL PAGE ────────────────────────────────────────────────────────

interface FinancialExportPayload {
    totalIncome: number
    totalExpenses: number
    netProfit: number
    payments: Array<{
        id: string
        amount: number
        payment_method: string
        payment_date: string
        status: string
        reservation?: { guest_name: string; booking_id: string }
    }>
    expenses: Array<{
        id: number
        expense_date: string
        category: string
        amount: number
        description: string
        vendor?: string
        payment_method: string
        status: string
    }>
}

export function exportFinancialToCSV(data: FinancialExportPayload) {
    const lines: string[] = []
    const today = new Date().toISOString().slice(0, 10)

    lines.push('Laporan Keuangan StayManager')
    lines.push(`Tanggal Cetak,${new Date().toLocaleString('id-ID')}`)
    lines.push('')

    lines.push('=== RINGKASAN KEUANGAN ===')
    lines.push(csvRow(['Metrik', 'Jumlah']))
    lines.push(csvRow(['Total Income', fmtRupiah(data.totalIncome)]))
    lines.push(csvRow(['Total Expenses', fmtRupiah(data.totalExpenses)]))
    lines.push(csvRow(['Net Profit', fmtRupiah(data.netProfit)]))
    lines.push('')

    if (data.payments.length > 0) {
        lines.push('=== RIWAYAT PEMASUKAN ===')
        lines.push(csvRow(['Tanggal', 'Tamu', 'Booking ID', 'Metode Pembayaran', 'Status', 'Jumlah']))
        data.payments.forEach((p) =>
            lines.push(
                csvRow([
                    p.payment_date,
                    p.reservation?.guest_name || '-',
                    p.reservation?.booking_id || '-',
                    p.payment_method,
                    p.status,
                    p.amount,
                ])
            )
        )
        lines.push('')
    }

    if (data.expenses.length > 0) {
        lines.push('=== RIWAYAT PENGELUARAN ===')
        lines.push(csvRow(['Tanggal', 'Kategori', 'Deskripsi', 'Vendor', 'Metode', 'Status', 'Jumlah']))
        data.expenses.forEach((e) =>
            lines.push(
                csvRow([
                    e.expense_date,
                    e.category,
                    e.description,
                    e.vendor || '-',
                    e.payment_method,
                    e.status,
                    e.amount,
                ])
            )
        )
        lines.push('')
    }

    triggerDownload(lines.join('\n'), `staymanager-financial-${today}.csv`, 'text/csv')
}

export function exportFinancialToPDF(data: FinancialExportPayload) {
    const win = window.open('', '_blank', 'width=900,height=1200')
    if (!win) {
        throw new Error('Browser memblokir pop-up. Mohon izinkan pop-up untuk situs ini lalu coba lagi.')
    }

    const paymentRows = data.payments
        .map(
            (p) =>
                `<tr><td>${p.payment_date}</td><td>${p.reservation?.guest_name || '-'}</td><td>${p.payment_method}</td><td>${p.status}</td><td class="num">${fmtRupiah(p.amount)}</td></tr>`
        )
        .join('')

    const expenseRows = data.expenses
        .map(
            (e) =>
                `<tr><td>${e.expense_date}</td><td>${e.category}</td><td>${e.description}</td><td>${e.vendor || '-'}</td><td class="num">${fmtRupiah(e.amount)}</td></tr>`
        )
        .join('')

    const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Laporan Keuangan StayManager</title>
<style>
  @page { size: A4; margin: 18mm; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; padding: 24px; }
  header { border-bottom: 3px solid #16a34a; padding-bottom: 16px; margin-bottom: 24px; }
  h1 { margin: 0 0 8px; font-size: 22px; color: #14532d; }
  .meta { color: #555; font-size: 13px; }
  h2 { font-size: 15px; color: #15803d; margin: 24px 0 8px; border-left: 4px solid #16a34a; padding-left: 10px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 13px; }
  th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; }
  th { background: #f0fdf4; font-weight: 600; color: #14532d; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
  .kpi { border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; }
  .kpi .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
  .kpi .value { font-size: 18px; font-weight: 700; margin-top: 4px; }
  .income { color: #16a34a; }
  .expense { color: #dc2626; }
  .profit { color: #2563eb; }
  footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #d1d5db; font-size: 11px; color: #6b7280; text-align: center; }
  @media print { body { padding: 0; } .no-print { display: none; } }
  .actions { text-align: center; margin: 16px 0; }
  .actions button { padding: 10px 24px; background: #16a34a; color: #fff; border: 0; border-radius: 6px; font-size: 14px; cursor: pointer; }
</style>
</head>
<body>
<header>
  <h1>Laporan Keuangan StayManager</h1>
  <div class="meta">Tanggal Cetak: ${new Date().toLocaleString('id-ID')}</div>
</header>

<div class="actions no-print">
  <button onclick="window.print()">🖨️ Cetak / Simpan sebagai PDF</button>
</div>

<h2>Ringkasan</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="label">Total Income</div><div class="value income">${fmtRupiah(data.totalIncome)}</div></div>
  <div class="kpi"><div class="label">Total Expenses</div><div class="value expense">${fmtRupiah(data.totalExpenses)}</div></div>
  <div class="kpi"><div class="label">Net Profit</div><div class="value profit">${fmtRupiah(data.netProfit)}</div></div>
</div>

${paymentRows
            ? `<h2>Riwayat Pemasukan</h2>
<table>
  <thead><tr><th>Tanggal</th><th>Tamu</th><th>Metode</th><th>Status</th><th>Jumlah</th></tr></thead>
  <tbody>${paymentRows}</tbody>
</table>`
            : '<h2>Riwayat Pemasukan</h2><p>Belum ada data pemasukan.</p>'
        }

${expenseRows
            ? `<h2>Riwayat Pengeluaran</h2>
<table>
  <thead><tr><th>Tanggal</th><th>Kategori</th><th>Deskripsi</th><th>Vendor</th><th>Jumlah</th></tr></thead>
  <tbody>${expenseRows}</tbody>
</table>`
            : '<h2>Riwayat Pengeluaran</h2><p>Belum ada data pengeluaran.</p>'
        }

<footer>
  StayManager — Property Management System · Laporan keuangan ini dihasilkan secara otomatis oleh sistem
</footer>
</body>
</html>`

    win.document.write(html)
    win.document.close()
    setTimeout(() => {
        try { win.focus() } catch { }
    }, 200)
}
