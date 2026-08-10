import { test, expect } from '@playwright/test';

// Verifies the "Buy More Pages" UI/state-only flow on the URL Selection
// screen: banner CTA -> modal -> slider snapping -> live summary math ->
// keyboard access -> Continue placeholder -> zero backend/API calls.
// Fixture: pages.limit=100, 440 qualified URLs (seeded via
// odito_backend/_buypages_setup_tmp.mjs), so the quota banner is visible.

const EMAIL = 'buypages.fixture@odito.test';
const PASSWORD = 'FixturePass123!';
const PROJECT_ID = process.env.BUYPAGES_PROJECT_ID;

async function login(page) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(EMAIL);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });
}

test.beforeEach(async ({ page }) => {
  await login(page);
  await page.goto(`/projects/${PROJECT_ID}/url-selection`);
  await expect(page.getByText('Review Discovered URLs')).toBeVisible({ timeout: 15000 });
});

test('banner shows a clickable "Buy More Pages" CTA that opens the modal', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Buy More Pages' });
  await expect(trigger).toBeVisible();
  await trigger.click();

  await expect(page.getByText('Buy Additional Pages')).toBeVisible();
  await expect(page.getByText('Increase your audit capacity without changing your subscription plan.')).toBeVisible();
});

test('slider only snaps to allowed values and the summary updates live', async ({ page }) => {
  await page.getByRole('button', { name: 'Buy More Pages' }).click();
  const slider = page.getByRole('slider', { name: 'Additional pages' });
  await expect(slider).toBeVisible();

  // Default selection is the first pack (100 pages / $5).
  await expect(page.getByText('100 Pages', { exact: true })).toBeVisible();
  await expect(page.getByText('+100 Pages')).toBeVisible();
  await expect(page.getByText('200 Pages', { exact: true })).toBeVisible(); // New Total = 100 + 100
  await expect(page.getByText('$5.00')).toBeVisible();

  // Step forward through every allowed value via keyboard only — each
  // press must land exactly on the next configured pack, never an
  // arbitrary/interpolated number.
  const expected = [
    { additional: 200, total: 300, price: '$10.00' },
    { additional: 300, total: 400, price: '$15.00' },
    { additional: 400, total: 500, price: '$20.00' },
    { additional: 500, total: 600, price: '$25.00' },
    { additional: 750, total: 850, price: '$37.50' },
    { additional: 1000, total: 1100, price: '$50.00' },
    { additional: 1500, total: 1600, price: '$75.00' },
    { additional: 2000, total: 2100, price: '$100.00' },
  ];

  for (const step of expected) {
    await slider.press('ArrowRight');
    await expect(page.getByText(`+${step.additional} Pages`)).toBeVisible();
    await expect(page.getByText(`${step.total} Pages`, { exact: true })).toBeVisible();
    await expect(page.getByText(step.price)).toBeVisible();
  }

  // One more ArrowRight past the last option must NOT go out of range.
  await slider.press('ArrowRight');
  await expect(page.getByText('+2000 Pages')).toBeVisible();

  // Home/End jump to the extremes.
  await slider.press('Home');
  await expect(page.getByText('+100 Pages')).toBeVisible();
  await slider.press('End');
  await expect(page.getByText('+2000 Pages')).toBeVisible();

  // Clicking a tick label jumps straight to that exact value.
  await page.getByRole('button', { name: '300 pages' }).click();
  await expect(page.getByText('+300 Pages')).toBeVisible();
  await expect(page.getByText('400 Pages', { exact: true })).toBeVisible();
  await expect(page.getByText('$15.00')).toBeVisible();
});

test('Continue shows the placeholder message and makes zero backend/API calls', async ({ page }) => {
  const apiCalls = [];
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/api/') || url.includes(':5000')) apiCalls.push(url);
  });

  await page.getByRole('button', { name: 'Buy More Pages' }).click();
  await page.getByRole('button', { name: '500 pages' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByText('Stripe integration coming next.')).toBeVisible();

  expect(apiCalls).toEqual([]);
});

test('Cancel closes the modal without any change', async ({ page }) => {
  await page.getByRole('button', { name: 'Buy More Pages' }).click();
  await expect(page.getByText('Buy Additional Pages')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Buy Additional Pages')).toHaveCount(0);
});
