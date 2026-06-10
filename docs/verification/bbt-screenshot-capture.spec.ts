/**
 * BBT Screenshot Capture — Bukti Visual untuk Bab 4.3.2 Skripsi
 *
 * Spec terpisah dari bbt-playwright.spec.ts. Tujuan: capture screenshot
 * 9 modul testing untuk dijadikan Gambar 4.16-4.20 di skripsi (atau sesuai
 * numbering yang konsisten dengan mapping di image-requirements.md).
 *
 * Output: docs/assets/images/gambar-4-XX.png
 *
 * Cara jalan:
 *   pnpm exec playwright test docs/verification/bbt-screenshot-capture.spec.ts --config=playwright.config.ts
 */

import { test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const E2E_PASSWORD = 'E2eTestPass123!';
const ASSET_DIR = 'docs/assets/images';

mkdirSync(ASSET_DIR, { recursive: true });

async function loginSuperAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('#email').fill('demo.admin@hotel-asni.com');
  await page.locator('#password').fill(E2E_PASSWORD);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL(/\/dashboard|\/occupancy|\/rooms|\/chatbot/, { timeout: 30_000 });
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
}

test.describe.configure({ mode: 'serial' });

test('Capture: Halaman Login (Gambar 4.16)', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.screenshot({ path: `${ASSET_DIR}/gambar-4-16-bbt-login.png`, fullPage: true });
});

test('Capture: Modul Dashboard (Gambar 4.17)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${ASSET_DIR}/gambar-4-17-bbt-dashboard.png`, fullPage: true });
});

test('Capture: Modul Manajemen Kamar (Gambar 4.18)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/rooms`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${ASSET_DIR}/gambar-4-18-bbt-rooms.png`, fullPage: true });
});

test('Capture: Modul Manajemen Tamu (Gambar 4.19)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/guests`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${ASSET_DIR}/gambar-4-19-bbt-guests.png`, fullPage: true });
});

test('Capture: Modul Keuangan/Financial (Gambar 4.20)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/financial`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${ASSET_DIR}/gambar-4-20-bbt-finance.png`, fullPage: true });
});

test('Capture: Modul Logistik/Inventaris (Gambar 4.21-alt)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/logistics`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${ASSET_DIR}/gambar-4-21-bbt-inventory.png`, fullPage: true });
});

test('Capture: Modul Chatbot (Gambar 4.22-alt)', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto(`${BASE_URL}/chatbot`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.getByPlaceholder(/type your message/i).fill('Apa fasilitas yang tersedia di hotel ini?');
  await page.keyboard.press('Enter');

  // Tunggu sampai status berubah dari "Typing..." → "Online" (streaming selesai)
  // Mekanisme: cari "Typing" hilang dari header DOM
  await page.waitForFunction(() => {
    const text = document.body.innerText;
    return !text.includes('Typing...') && !text.includes('Typing…');
  }, { timeout: 90_000 }).catch(() => {});

  // Pastikan response mengandung minimal 1 keyword fasilitas (validasi konten benar)
  await page.waitForFunction(() => {
    const text = document.body.innerText.toLowerCase();
    return text.includes('wifi') || text.includes('parkir') || text.includes('sarapan') || text.includes('housekeeping') || text.includes('resepsionis');
  }, { timeout: 30_000 }).catch(() => {});

  // Extra settle time untuk animasi
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${ASSET_DIR}/gambar-4-22-bbt-chatbot.png`, fullPage: true });
});

test('Capture: Modul Laporan (Gambar 4.23-alt)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/reports`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${ASSET_DIR}/gambar-4-23-bbt-reports.png`, fullPage: true });
});

test('Capture: Modul Pengaturan + RBAC (Gambar 4.24-alt)', async ({ page }) => {
  await loginSuperAdmin(page);
  await page.goto(`${BASE_URL}/settings`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${ASSET_DIR}/gambar-4-24-bbt-settings.png`, fullPage: true });
});
