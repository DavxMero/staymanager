import { test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'demo.admin@hotel-asni.com';
const ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'E2eTestPass123!';
const GUEST_EMAIL = process.env.GUEST_EMAIL || 'david@gmail.com';
const GUEST_PASSWORD = process.env.GUEST_PASSWORD || 'david123';
const OUT = 'docs/assets/screenshots';

mkdirSync(OUT, { recursive: true });

test.use({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
test.describe.configure({ mode: 'serial' });

async function settle(page: Page, ms = 2500) {
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(ms);
}

async function shot(page: Page, name: string, fullPage: boolean) {
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {});
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
}

async function clearSpotlight(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll('.__spot').forEach((e) => e.remove());
  });
}

async function loginAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('#email').fill(ADMIN_EMAIL);
  await page.locator('#password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL(/\/dashboard|\/occupancy|\/rooms|\/chatbot/, { timeout: 30_000 });
  await settle(page, 1500);
}

async function loginGuest(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('#email').fill(GUEST_EMAIL);
  await page.locator('#password').fill(GUEST_PASSWORD);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL(/\/chatbot|\/dashboard/, { timeout: 30_000 });
  await settle(page, 1500);
}

async function sendChat(page: Page, text: string, waitMs = 5000) {
  const box = page.getByPlaceholder(/type your message/i);
  await box.click();
  await box.fill(text);
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => {
    const t = document.body.innerText;
    return !t.includes('Typing...') && !t.includes('Typing…');
  }, { timeout: 120_000 }).catch(() => {});
  await page.waitForTimeout(waitMs);
}

test('3.27 + 4.1 + 4.12 Login', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await settle(page);
  await shot(page, 'gambar-3-27-login', false);
  await shot(page, 'gambar-4-1-login', false);
  await shot(page, 'gambar-4-12-learnability-login', false);
});

test('3.25 Halaman publik (tanpa login)', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard`);
  await settle(page, 4000);
  await shot(page, 'gambar-3-25-halaman-publik', true);
});

test('3.26 Chatbot (tanpa login)', async ({ page }) => {
  await page.goto(`${BASE_URL}/chatbot`);
  await settle(page, 3000);
  await shot(page, 'gambar-3-26-chatbot', false);
});

test('4.2 + 4.13 + 4.18 Dashboard', async ({ page }) => {
  await loginAdmin(page);
  await page.goto(`${BASE_URL}/dashboard`);
  await settle(page, 4000);
  await shot(page, 'gambar-4-2-dashboard', true);
  await shot(page, 'gambar-4-13-efficiency-dashboard', false);
  await shot(page, 'gambar-4-18-aturan2-shortcut', false);
});

test('3.28 + 4.3 + 4.14 + 4.17 Manajemen Kamar', async ({ page }) => {
  await loginAdmin(page);
  await page.goto(`${BASE_URL}/rooms`);
  await settle(page, 4000);
  await shot(page, 'gambar-3-28-manajemen-kamar', true);
  await shot(page, 'gambar-4-3-manajemen-kamar', true);
  await shot(page, 'gambar-4-14-memorability-navigasi', false);
  await shot(page, 'gambar-4-17-aturan1-konsistensi', false);
});

test('4.20 Toast sukses edit kamar (closure) + 4.19c feedback toast', async ({ page }) => {
  test.setTimeout(120_000);
  await loginAdmin(page);
  await page.goto(`${BASE_URL}/rooms`);
  await settle(page, 3000);
  await page.getByRole('button', { name: 'Detail' }).first()
    .locator('xpath=following-sibling::button[1]')
    .click({ timeout: 10_000 });
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Update Room' }).click({ timeout: 10_000 });
  await page.waitForSelector('[data-sonner-toast]', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(600);
  await shot(page, 'gambar-4-20-aturan4-closure-toast', false);
  await shot(page, 'gambar-4-19c-aturan3-feedback-toast', false);
});

test('4.22 Dialog konfirmasi hapus (pembatalan aksi)', async ({ page }) => {
  await loginAdmin(page);
  await page.goto(`${BASE_URL}/rooms`);
  await settle(page, 3000);
  try {
    await page.locator('button:has(svg.lucide-trash-2), button:has(svg.lucide-trash)').first().click({ timeout: 8000 });
    await page.waitForTimeout(1200);
    await shot(page, 'gambar-4-22-aturan6-pembatalan-dialog', false);
    await page.getByRole('button', { name: /cancel|batal/i }).first().click({ timeout: 5000 }).catch(() => {});
  } catch {
    await shot(page, 'gambar-4-22-aturan6-pembatalan-dialog', false);
  }
});

test('4.4 Manajemen Tamu', async ({ page }) => {
  await loginAdmin(page);
  await page.goto(`${BASE_URL}/guests`);
  await settle(page, 4000);
  await shot(page, 'gambar-4-4-manajemen-tamu', true);
});

test('4.5 + 4.19 + 4.24 Occupancy', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loginAdmin(page);
  await page.goto(`${BASE_URL}/occupancy`);
  await settle(page, 5000);
  await shot(page, 'gambar-4-5-reservasi-occupancy', true);

  await clearSpotlight(page);
  await page.mouse.move(5, 5);
  await page.waitForTimeout(400);
  await shot(page, 'gambar-4-19a-aturan3-feedback-sebelum', false);

  await page.evaluate(() => {
    const el = document.querySelector('[class*="border-dashed"]') as HTMLElement | null;
    if (!el) return;
    el.classList.remove('border-dashed', 'text-transparent', 'bg-transparent');
    el.classList.add('border-solid', 'bg-blue-50', 'border-blue-300', 'text-blue-600');
    const plus = el.querySelector('.opacity-0') as HTMLElement | null;
    if (plus) plus.classList.remove('opacity-0');
    const r = el.getBoundingClientRect();
    const pad = 7;
    const ov = document.createElement('div');
    ov.className = '__spot';
    Object.assign(ov.style, {
      position: 'fixed',
      left: `${r.left - pad}px`,
      top: `${r.top - pad}px`,
      width: `${r.width + pad * 2}px`,
      height: `${r.height + pad * 2}px`,
      border: '3px solid #ef4444',
      borderRadius: '9999px',
      boxShadow: '0 0 10px 2px rgba(239,68,68,0.5)',
      zIndex: '999999',
      pointerEvents: 'none',
    });
    document.body.appendChild(ov);
  });
  await page.waitForTimeout(400);
  await shot(page, 'gambar-4-19b-aturan3-feedback-sesudah', false);
  await clearSpotlight(page);

  await page.evaluate(() => {
    const legend = [...document.querySelectorAll('div')].find(
      (d) =>
        d.className.includes('border-t') &&
        d.textContent!.includes('Booked (Confirmed)') &&
        d.textContent!.includes('Available')
    ) as HTMLElement | undefined;
    if (!legend) return;
    legend.scrollIntoView({ block: 'center' });
    const r = legend.getBoundingClientRect();
    const pad = 10;
    const ov = document.createElement('div');
    ov.className = '__spot';
    Object.assign(ov.style, {
      position: 'fixed',
      left: `${r.left - pad}px`,
      top: `${r.top - pad}px`,
      width: `${r.width + pad * 2}px`,
      height: `${r.height + pad * 2}px`,
      border: '3px solid #ef4444',
      borderRadius: '12px',
      boxShadow: '0 0 12px 2px rgba(239,68,68,0.5)',
      zIndex: '999999',
      pointerEvents: 'none',
    });
    document.body.appendChild(ov);
  });
  await page.waitForTimeout(500);
  await shot(page, 'gambar-4-24-aturan8-beban-memori', false);
  await clearSpotlight(page);
});

test('3.29 + 4.6 Keuangan (dipisah: ringkasan & riwayat)', async ({ page }) => {
  await loginAdmin(page);
  await page.goto(`${BASE_URL}/financial`);
  await settle(page, 4000);
  await shot(page, 'gambar-3-29-modul-keuangan', false);
  await shot(page, 'gambar-4-6a-keuangan-ringkasan', false);
  await page.getByRole('tab', { name: /income history/i })
    .or(page.getByText('Income History', { exact: true }))
    .first()
    .click({ timeout: 8000 });
  await page.waitForTimeout(1500);
  await shot(page, 'gambar-4-6b-keuangan-riwayat-transaksi', false);
});

test('4.7 Inventaris (Logistics)', async ({ page }) => {
  await loginAdmin(page);
  await page.goto(`${BASE_URL}/logistics`);
  await settle(page, 4000);
  await shot(page, 'gambar-4-7-inventaris', true);
});

test('4.8 Billing & Invoice (Invoices tab in Financial)', async ({ page }) => {
  await loginAdmin(page);
  await page.goto(`${BASE_URL}/financial?tab=invoices`);
  await settle(page, 4000);
  await shot(page, 'gambar-4-8-billing-invoice', true);
});

test('4.9 + 4.23 Laporan', async ({ page }) => {
  await loginAdmin(page);
  await page.goto(`${BASE_URL}/reports`);
  await settle(page, 5000);
  await shot(page, 'gambar-4-9-laporan', true);
  await shot(page, 'gambar-4-23-aturan7-kendali-pengguna', false);
});

test('4.21 Penanganan kesalahan (login error)', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('#email').fill('wrong@hotel.com');
  await page.locator('#password').fill('wrongpassword');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForTimeout(3500);
  await shot(page, 'gambar-4-21-aturan5-error-handling', false);
});

test('4.10 + 4.15 + 4.16 Chatbot: kartu kamar, validasi form, konfirmasi reservasi', async ({ page }) => {
  test.setTimeout(420_000);
  await loginGuest(page);
  await page.goto(`${BASE_URL}/chatbot`);
  await settle(page, 3000);

  await sendChat(page, 'Tolong cek kamar yang tersedia untuk check-in 2026-06-25 dan check-out 2026-06-27', 6000);
  await shot(page, 'gambar-4-10-chatbot', false);

  try {
    await page.getByRole('button', { name: /^book$/i }).first().click({ timeout: 8000 });
    await page.waitForTimeout(1500);
    const nameInput = page.locator('#bc-guest-name');
    await nameInput.fill('ab');
    await page.waitForTimeout(800);
    await shot(page, 'gambar-4-15-error-rate-validasi-form', false);
    await nameInput.fill('David Guest');
    await page.locator('#bc-guest-phone').fill('081234567890');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /confirm booking/i }).click({ timeout: 8000 });
    await page.waitForFunction(() => {
      const t = document.body.innerText;
      return /berhasil dibuat|reservasi.*dibuat|reservation.*created|payment|pembayaran/i.test(t) && !t.includes('Typing');
    }, { timeout: 120_000 }).catch(() => {});
    await page.waitForTimeout(5000);
    await shot(page, 'gambar-4-16-satisfaction-konfirmasi-reservasi', false);
  } catch {
    await shot(page, 'gambar-4-15-error-rate-validasi-form', false);
    await shot(page, 'gambar-4-16-satisfaction-konfirmasi-reservasi', false);
  }
});
