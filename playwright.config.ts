import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './docs/verification',
  testMatch: ['bbt-playwright.spec.ts', 'bbt-screenshot-capture.spec.ts', 'bab4-screenshot-capture.spec.ts'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'docs/verification/bbt-results.json' }],
    ['html', { outputFolder: 'docs/verification/bbt-html-report', open: 'never' }],
  ],
  timeout: 90_000,
  expect: { timeout: 30_000 },
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'api',
      testDir: './tests/api',
      testMatch: ['**/*.spec.ts'],
    },
  ],
});
