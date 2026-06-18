import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end test configuration.
 *
 * Run: `npm run test:e2e`. Specs live under `e2e/`.
 * Requires devDependency: @playwright/test (+ `npx playwright install`).
 * Boots the production build on :3000 and runs against it.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
