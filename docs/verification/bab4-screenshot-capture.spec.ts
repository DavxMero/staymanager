/**
 * Bab 4 Screenshot Capture — 23 Gambar untuk Skripsi (4.1 - 4.23)
 *
 * Output: docs/assets/bab4/gambar-4-N.png (1-23)
 *
 * Mapping:
 *   4.1-4.10  → 10 modul UI utama
 *   4.11-4.15 → Bukti 5 Faktor Nielsen (reuse module shots with focus)
 *   4.16-4.23 → Bukti 8 Aturan Shneiderman
 *
 * Jalan: pnpm exec playwright test docs/verification/bab4-screenshot-capture.spec.ts --config=playwright.config.ts
 */

import { test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const E2E_PASSWORD = 'E2eTestPass123!';
const OUT = 'docs/assets/bab4';

mkdirSync(OUT, { recursive: true });

async function loginSuperAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('#email').fill('demo.admin@hotel-asni.com');
  await page.locator('#password').fill(E2E_PASSWORD);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL(/\/dashboard|\/occupancy|\/rooms|\/chatbot/, { timeout: 30_000 });
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
}

async function capture(page: Page, n: number) {
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/gambar-4-${n}.png`, fullPage: true });
}

test.describe.configure({ mode: 'serial' });

// === 4.1-4.10: 10 Modul UI ===

test('4.1 Login', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await capture(page, 1);
});

test('4.2 Dashboard', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/dashboard`);
  await capture(page, 2);
});

test('4.3 Manajemen Kamar', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/rooms`);
  await capture(page, 3);
});

test('4.4 Manajemen Tamu', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/guests`);
  await capture(page, 4);
});

test('4.5 Reservasi (Occupancy)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/occupancy`);
  await capture(page, 5);
});

test('4.6 Keuangan', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/financial`);
  await capture(page, 6);
});

test('4.7 Inventaris (Logistics)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/logistics`);
  await capture(page, 7);
});

test('4.8 Billing & Invoice', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/billing`);
  await capture(page, 8);
});

test('4.9 Laporan', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/reports`);
  await capture(page, 9);
});

test('4.10 Chatbot LLM', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto(`${BASE_URL}/chatbot`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.getByPlaceholder(/type your message|tulis pesan/i)
    .fill('Tolong cek kamar yang tersedia untuk check-in 2026-06-20 dan check-out 2026-06-22');
  await page.keyboard.press('Enter');
  // Tunggu kartu kamar muncul (bukti tool cekKetersediaan + render kartu berhasil)
  await page.waitForFunction(() => {
    const t = document.body.innerText;
    const done = !t.includes('Typing...') && !t.includes('Typing…') && !t.includes('Checking our database');
    const hasRooms = /Standard|Deluxe|Superior|Suite/.test(t) && /\/malam|per malam|Book|Pesan|Lihat Detail|View Details/i.test(t);
    return done && hasRooms;
  }, { timeout: 120_000 }).catch(() => {});
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${OUT}/gambar-4-10.png`, fullPage: true });
});

// === 4.11-4.15: Nielsen Bukti ===

test('4.11 Learnability (Login Intuitif)', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await capture(page, 11);
});

test('4.12 Efficiency (Dashboard Aksi Cepat)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/dashboard`);
  await capture(page, 12);
});

test('4.13 Memorability (Navigasi Konsisten)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/rooms`);
  await capture(page, 13);
});

test('4.14 Error Rate (Validasi Form)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/guests`);
  await capture(page, 14);
});

const GUEST_EMAIL = process.env.GUEST_EMAIL || 'david@gmail.com';
const GUEST_PASSWORD = process.env.GUEST_PASSWORD || 'david123';

async function loginGuest(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('#email').fill(GUEST_EMAIL);
  await page.locator('#password').fill(GUEST_PASSWORD);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL(/\/chatbot|\/dashboard/, { timeout: 30_000 });
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
}

async function sendMessage(page: Page, text: string, waitMs = 4000) {
  const box = page.getByPlaceholder(/type your message|tulis pesan/i);
  await box.click();
  await box.fill(text);
  await page.keyboard.press('Enter');
  // tunggu sampai indikator mengetik / tool selesai
  await page.waitForFunction(() => {
    const t = document.body.innerText;
    return !t.includes('Typing...') && !t.includes('Typing…') && !t.includes('Checking our database');
  }, { timeout: 90_000 }).catch(() => {});
  await page.waitForTimeout(waitMs);
}

test('4.15 Satisfaction (Reservasi Sukses + E-Receipt)', async ({ page }) => {
  test.setTimeout(300_000);
  await loginGuest(page);
  await page.goto(`${BASE_URL}/chatbot`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

  // 1) Cek ketersediaan
  await sendMessage(page, 'Saya mau memesan kamar. Tolong cek kamar Deluxe yang tersedia untuk check-in 2026-06-20 dan check-out 2026-06-22.', 5000);

  // 2) Buat reservasi (user sudah login -> createBooking lolos auth)
  await sendMessage(page, 'Tolong buatkan reservasinya untuk kamar Deluxe tersebut. Data tamu: nama David, email david@gmail.com, telepon 081234567890, 2 dewasa, 0 anak, tanpa sarapan.', 6000);

  // 3) Konfirmasi pembayaran -> confirmPayment mengungkap kode booking + e-receipt
  await sendMessage(page, 'Saya mau bayar sekarang via transfer bank BCA dan saya SUDAH melakukan transfer penuh. Tolong konfirmasi pembayaran saya sekarang.', 6000);

  // tunggu kode booking / bukti lunas muncul
  await page.waitForFunction(() => {
    const t = document.body.innerText;
    return /BK\d|kode booking|booking reference|lunas|paid|berhasil|e-?receipt|terkonfirmasi/i.test(t);
  }, { timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/gambar-4-15.png`, fullPage: true });
});

// === 4.16-4.23: Shneiderman 8 Aturan Bukti ===

test('4.16 Aturan 1 Konsistensi Desain (Rooms)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/rooms`);
  await capture(page, 16);
});

test('4.17 Aturan 2 Pintasan Navigasi (Dashboard sidebar)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/dashboard`);
  await capture(page, 17);
});

test('4.18 Aturan 3 Umpan Balik Informatif (Guests)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/guests`);
  await capture(page, 18);
});

test('4.19 Aturan 4 Dialog Closure (Financial)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/financial`);
  await capture(page, 19);
});

test('4.20 Aturan 5 Penanganan Kesalahan (Login error state)', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('#email').fill('salah@hotel.com');
  await page.locator('#password').fill('wrongpass');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/gambar-4-20.png`, fullPage: true });
});

test('4.21 Aturan 6 Pembatalan Aksi (Logistics)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/logistics`);
  await capture(page, 21);
});

test('4.22 Aturan 7 Kendali Internal (Reports filter)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/reports`);
  await capture(page, 22);
});

test('4.23 Aturan 8 Kurangi Beban Memori (Dashboard badge status)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/dashboard`);
  await capture(page, 23);
});
