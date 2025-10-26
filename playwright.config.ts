import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './web-tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json', { outputFile: 'test-results.json' }]],

  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: [
    {
      command: 'cd /home/olibuijr/Projects/olfong_stack/backend && npm run dev',
      port: 5000,
      host: 'localhost',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'cd /home/olibuijr/Projects/olfong_stack/web && npm run dev',
      port: 3001,
      host: 'localhost',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});