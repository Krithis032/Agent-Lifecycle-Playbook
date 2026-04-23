import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, 'playwright', '.auth', 'user.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // ── Auth setup (runs first, no dependencies) ──
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // ── Functional tests ──
    {
      name: 'functionality',
      testDir: './tests/functionality',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'integration',
      testDir: './tests/integration',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'security',
      testDir: './tests/security',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'scalability',
      testDir: './tests/scalability',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'maintainability',
      testDir: './tests/maintainability',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testDir: './tests/functionality',
      use: { ...devices['Desktop Firefox'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-safari',
      testDir: './tests/functionality',
      use: { ...devices['iPhone 14'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
