// capture-screenshots.mjs — Playwright headless capture untuk Bab 4 (4-01 .. 4-23)
//
// Run:
//   npm install --save-dev playwright
//   npx playwright install chromium
//   node scripts/capture-screenshots.mjs
//
// Env (set di file .env atau via shell):
//   BASE_URL          (default https://staymanager.vercel.app)
//   DEMO_EMAIL        (akun staff dengan akses semua modul)
//   DEMO_PASSWORD
//   DEMO_GUEST_EMAIL  (akun guest untuk capture chatbot login mode)
//   DEMO_GUEST_PASS
//   DEMO_ADMIN_EMAIL  (akun super_admin untuk modul Operations/Inventaris)
//   DEMO_ADMIN_PASS

import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'screenshots');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = process.env.BASE_URL || 'https://staymanager.vercel.app';
const STAFF_EMAIL = process.env.DEMO_EMAIL || '';
const STAFF_PASSWORD = process.env.DEMO_PASSWORD || '';
const GUEST_EMAIL = process.env.DEMO_GUEST_EMAIL || '';
const GUEST_PASSWORD = process.env.DEMO_GUEST_PASS || '';
const ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASS || '';

// Spec v3.1: viewport 1280x800
const VIEWPORT = { width: 1280, height: 800 };
const DEVICE_SCALE = 2;

// --- Per-shot interactions ----------------------------------------------
// Each function takes (page) and runs after page load, before screenshot.
// Returning truthy means the interaction succeeded; on failure we still
// capture the page as-is and log the warning.

async function openRoomsAddDialog(page) {
    // Trigger "Add Room" button at /rooms — opens modal.
    try {
        const btn = page.getByRole('button', { name: /add room/i }).first();
        await btn.waitFor({ state: 'visible', timeout: 8000 });
        await btn.click();
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
        await page.waitForTimeout(800);
        return true;
    } catch (e) {
        console.warn(`    [interact] openRoomsAddDialog failed: ${e.message}`);
        return false;
    }
}

async function openRoomsAddDialogAndScrollToCancel(page) {
    // Untuk 4-21 (Pembatalan Aksi): buka modal lalu isi sebagian form
    // → menampilkan skenario user yang ingin membatalkan input.
    const ok = await openRoomsAddDialog(page);
    if (!ok) return false;
    try {
        // Isi field pertama yang ditemukan dengan data sample
        const numberInput = page.locator('[role="dialog"] input').first();
        if (await numberInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await numberInput.fill('999');
            await page.waitForTimeout(300);
        }
        // Scroll modal ke bawah (kalau ada konten yang panjang)
        await page.evaluate(() => {
            const dialog = document.querySelector('[role="dialog"]');
            if (!dialog) return;
            const scrollable = dialog.querySelector('form, [class*="overflow"]') || dialog;
            scrollable.scrollTop = scrollable.scrollHeight;
        });
        await page.waitForTimeout(400);
        return true;
    } catch (e) {
        return false;
    }
}

async function triggerLoginValidation(page) {
    // Strategi: fill email INVALID format (bukan email valid), kosongkan
    // password, lalu submit → HTML5 native validation menampilkan tooltip
    // error "Please include '@' in the email address" atau "Please fill
    // out this field". Native validation = instant + reliable, tidak tergantung
    // network/toast library.
    try {
        await page.fill('input[type="email"], input[name="email"]', 'invalid-email');
        // Biarkan password kosong supaya kena required validation
        await page.click('button[type="submit"]');
        // Native HTML5 validation tooltip muncul langsung, capture pas masih ada
        await page.waitForTimeout(900);
        return true;
    } catch (e) {
        console.warn(`    [interact] triggerLoginValidation failed: ${e.message}`);
        return false;
    }
}

async function triggerLoginValidationEmptySubmit(page) {
    // Fallback: clear fields lalu click submit → trigger native HTML5 validation
    // tooltip ("Please fill out this field"). Lebih reliable karena tidak
    // depend on network/toast timing.
    try {
        await page.click('button[type="submit"]');
        await page.waitForTimeout(800);
        // Trigger reportValidity untuk pastikan native error tooltip muncul
        await page.evaluate(() => {
            const form = document.querySelector('form');
            if (form) form.reportValidity();
        });
        await page.waitForTimeout(600);
        return true;
    } catch (e) {
        return false;
    }
}

async function focusKpiSection(page) {
    // Scroll ke section yang memuat KPI cards (umumnya di top dashboard).
    // Mengurangi white-space dengan scroll ke section title kalau ada.
    try {
        await page.evaluate(() => {
            // Cari heading section pertama yang punya 'KPI' / 'Statistik' / chart.
            const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
            const target = headings.find((h) =>
                /kpi|statistik|overview|summary|ringkasan|metric/i.test(h.textContent || '')
            );
            if (target) {
                target.scrollIntoView({ behavior: 'instant', block: 'start' });
            }
        });
        await page.waitForTimeout(600);
        return true;
    } catch (e) {
        return false;
    }
}

async function navigateBackToDashboard(page) {
    // Untuk Memorability (4-13): nav ke /reports lalu balik ke /dashboard,
    // simulasi user yang kembali ke layout familiar.
    try {
        await page.goto(`${BASE_URL}/reports`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);
        await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2500);
        return true;
    } catch (e) {
        return false;
    }
}

async function openOccupancyFilter(page) {
    // Untuk Aturan 7 Kendali Internal: kalau ada date-picker / filter,
    // expand sekali untuk visualkan kontrol user.
    try {
        const filterBtn = page
            .getByRole('button', { name: /filter|sort|tanggal|date/i })
            .first();
        if (await filterBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await filterBtn.click();
            await page.waitForTimeout(600);
        }
        return true;
    } catch (e) {
        return false;
    }
}

// --- Shot definitions ----------------------------------------------------

const SHOTS = [
    // === Modul Aplikasi (4-01 .. 4-10) ===
    { id: '4-01', file: 'gambar-4-01.png', url: '/login', auth: false, desc: 'Halaman Login' },
    { id: '4-02', file: 'gambar-4-02.png', url: '/dashboard', auth: 'staff', desc: 'Dashboard dan Landing Page' },
    { id: '4-03', file: 'gambar-4-03.png', url: '/rooms', auth: 'staff', desc: 'Modul Manajemen Kamar' },
    { id: '4-04', file: 'gambar-4-04.png', url: '/guests', auth: 'staff', desc: 'Modul Manajemen Tamu' },
    { id: '4-05', file: 'gambar-4-05.png', url: '/occupancy', auth: 'staff', desc: 'Modul Reservasi' },
    { id: '4-06', file: 'gambar-4-06.png', url: '/financial', auth: 'staff', desc: 'Modul Keuangan' },
    { id: '4-07', file: 'gambar-4-07.png', url: '/logistics', auth: 'admin', desc: 'Modul Inventaris' },
    { id: '4-08', file: 'gambar-4-08.png', url: '/billing', auth: 'staff', desc: 'Modul Billing dan Invoice' },
    { id: '4-09', file: 'gambar-4-09.png', url: '/reports', auth: 'staff', desc: 'Modul Laporan Manajerial' },
    { id: '4-10', file: 'gambar-4-10.png', url: '/chatbot', auth: 'guest', desc: 'Antarmuka Chatbot LLM' },

    // === Lima Faktor Manusia (4-11 .. 4-15) — placeholder UI ===
    { id: '4-11', file: 'gambar-4-11.png', url: '/dashboard', auth: 'staff', fullPage: true, desc: 'Bukti Learnability — full dashboard untuk first impression' },
    { id: '4-12', file: 'gambar-4-12.png', url: '/occupancy', auth: 'staff', desc: 'Bukti Efficiency — kalender + quick action' },
    { id: '4-13', file: 'gambar-4-13.png', url: '/reports', auth: 'staff', desc: 'Bukti Memorability — layout konsisten di /reports (sidebar familiar)' },
    { id: '4-14', file: 'gambar-4-14.png', url: '/login', auth: false, desc: 'Bukti Error Rate — form validation design' },
    { id: '4-15', file: 'gambar-4-15.png', url: '/reports', auth: 'staff', fullPage: true, desc: 'Bukti Satisfaction — full reports analytics' },

    // === Delapan Aturan Emas (4-16 .. 4-23) ===
    { id: '4-16', file: 'gambar-4-16.png', url: '/rooms', auth: 'staff', desc: 'Aturan 1 Konsistensi Desain' },
    { id: '4-17', file: 'gambar-4-17.png', url: '/staff', auth: 'staff', desc: 'Aturan 2 Pintasan Navigasi — sub-page dengan sidebar nav' },
    { id: '4-18', file: 'gambar-4-18.png', url: '/guests', auth: 'staff', desc: 'Aturan 3 Umpan Balik Informatif — toast (manual trigger)' },
    { id: '4-19', file: 'gambar-4-19.png', url: '/rooms', auth: 'staff', interact: openRoomsAddDialog, desc: 'Aturan 4 Dialog Closure — modal Add Room dengan tombol close' },
    { id: '4-20', file: 'gambar-4-20.png', url: '/login', auth: false, interact: triggerLoginValidation, desc: 'Aturan 5 Penanganan Kesalahan — error login' },
    { id: '4-21', file: 'gambar-4-21.png', url: '/rooms', auth: 'staff', interact: openRoomsAddDialogAndScrollToCancel, desc: 'Aturan 6 Pembatalan Aksi — modal scrolled ke Cancel button' },
    { id: '4-22', file: 'gambar-4-22.png', url: '/occupancy', auth: 'staff', interact: openOccupancyFilter, desc: 'Aturan 7 Kendali Internal — filter/sort' },
    { id: '4-23', file: 'gambar-4-23.png', url: '/dashboard', auth: 'staff', fullPage: true, interact: focusKpiSection, desc: 'Aturan 8 Informasi Tampil Langsung — KPI cards fullPage' },
];

// --- Capture pipeline ----------------------------------------------------

async function login(page, email, password) {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"], input[name="email"]', email);
    await page.fill('input[type="password"], input[name="password"]', password);
    await Promise.all([
        page.waitForURL((u) => !u.pathname.endsWith('/login'), { timeout: 30000 }),
        page.click('button[type="submit"]'),
    ]);
}

async function capture(browser, shot) {
    const ctx = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: DEVICE_SCALE,
    });
    const page = await ctx.newPage();

    try {
        if (shot.auth === 'staff') {
            if (!STAFF_EMAIL) {
                console.warn(`  ⚠ Skip ${shot.id}: DEMO_EMAIL tidak diset`);
                await ctx.close();
                return false;
            }
            await login(page, STAFF_EMAIL, STAFF_PASSWORD);
        } else if (shot.auth === 'guest') {
            if (!GUEST_EMAIL) {
                console.warn(`  ⚠ Skip ${shot.id}: DEMO_GUEST_EMAIL tidak diset`);
                await ctx.close();
                return false;
            }
            await login(page, GUEST_EMAIL, GUEST_PASSWORD);
        } else if (shot.auth === 'admin') {
            if (!ADMIN_EMAIL) {
                console.warn(`  ⚠ Skip ${shot.id}: DEMO_ADMIN_EMAIL tidak diset`);
                await ctx.close();
                return false;
            }
            await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
        }

        await page.goto(`${BASE_URL}${shot.url}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(4000); // hydration + data load

        // Jalankan interaction handler kalau ada
        if (typeof shot.interact === 'function') {
            console.log(`    [interact] running ${shot.interact.name}`);
            await shot.interact(page);
        }

        const finalUrl = new URL(page.url()).pathname;
        const expectedPath = shot.url.split('?')[0];
        if (finalUrl !== expectedPath && !shot.interact) {
            console.warn(`  ! ${shot.id} redirected: ${expectedPath} → ${finalUrl}`);
        }

        const outPath = resolve(OUT_DIR, shot.file);
        await page.screenshot({ path: outPath, fullPage: !!shot.fullPage });
        console.log(`  ✓ ${shot.id} → ${shot.file} (at ${finalUrl}${shot.fullPage ? ', fullPage' : ''}${shot.interact ? ', interacted' : ''})`);
        await ctx.close();
        return true;
    } catch (err) {
        console.error(`  ✗ ${shot.id} gagal:`, err.message);
        await ctx.close();
        return false;
    }
}

async function main() {
    console.log(`Capture target: ${BASE_URL}`);
    console.log(`Output: ${OUT_DIR}\n`);

    const cliShots = process.argv.find((a) => a.startsWith('--shots='));
    const filter = (cliShots ? cliShots.slice('--shots='.length) : process.env.SHOTS_FILTER || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    const targets = filter.length > 0 ? SHOTS.filter((s) => filter.includes(s.id)) : SHOTS;
    if (filter.length > 0) {
        console.log(`Filter aktif: hanya capture [${filter.join(', ')}] (${targets.length} shot)\n`);
    }

    const browser = await chromium.launch();
    let success = 0;
    for (const shot of targets) {
        console.log(`[${shot.id}] ${shot.desc}`);
        if (await capture(browser, shot)) success++;
    }
    await browser.close();

    console.log(`\n${success}/${targets.length} screenshot berhasil.`);
    if (success < targets.length) process.exit(1);
}

main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});
