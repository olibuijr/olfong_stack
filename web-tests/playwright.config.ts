import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2, // Reduced from undefined (6) to 2
  reporter: [['html'], ['json', { outputFile: 'test-results.json' }]],

  use: {
    baseURL: 'http://localhost:3001',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000, // Increased from 10000
    navigationTimeout: 45000, // Increased from 30000
    headless: false, // Set to false for debugging
  },

  // Enhanced reporting for better debugging
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
    ['line', { printSteps: true }]
  ],

  projects: [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
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