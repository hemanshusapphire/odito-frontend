import { test, expect } from '@playwright/test';

// Verifies page-quota enforcement on the URL Selection screen. Each case
// uses a dedicated real project (real Job + real seo_audit_url_pool docs,
// seeded directly in MongoDB — see odito_backend/_urlq_setup_tmp.mjs) and a
// dedicated user with a real subscription.pages quota, so this exercises
// the actual GET /url-pool + GET /subscription responses, not mocks.

const fixtures = JSON.parse(process.env.URLQ_FIXTURES);

async function login(page, email, password) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });
}

test('Case 1: pages.limit=100, qualified=440 -> auto-selected=100, Approve shows 100, banner visible', async ({ page }) => {
  const { user, project } = fixtures.case1;
  await login(page, user.email, user.password);
  await page.goto(`/projects/${project.projectId}/url-selection`);

  await expect(page.getByText('Review Discovered URLs')).toBeVisible({ timeout: 15000 });
  // The fix means 440 must never be shown as selected, at any point.
  await expect(page.getByRole('button', { name: /^approve 440/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^approve 100 urls$/i })).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/^100 URLs? selected$/)).toBeVisible();
  await expect(page.getByText(/discovered 440 pages.*allows auditing up to 100 pages/i)).toBeVisible();
});

test('Case 2: pages.limit=500, qualified=440 -> all 440 selected, Approve shows 440, banner hidden', async ({ page }) => {
  const { user, project } = fixtures.case2;
  await login(page, user.email, user.password);
  await page.goto(`/projects/${project.projectId}/url-selection`);

  await expect(page.getByText('Review Discovered URLs')).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: /^approve 440 urls$/i })).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/allows auditing up to/i)).toHaveCount(0);
});

test('Case 3: pages.limit=100, qualified=60 -> all 60 selected, Approve shows 60, banner hidden', async ({ page }) => {
  const { user, project } = fixtures.case3;
  await login(page, user.email, user.password);
  await page.goto(`/projects/${project.projectId}/url-selection`);

  await expect(page.getByText('Review Discovered URLs')).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: /^approve 60 urls$/i })).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/allows auditing up to/i)).toHaveCount(0);
});

test('Case 4: clicking Select All with limit=100/qualified=440 still selects only 100', async ({ page }) => {
  const { user, project } = fixtures.case4;
  await login(page, user.email, user.password);
  await page.goto(`/projects/${project.projectId}/url-selection`);

  await expect(page.getByRole('button', { name: /^approve 100 urls$/i })).toBeVisible({ timeout: 15000 });

  // Deselect everything, then hit Select All — must still cap at 100, not 440.
  await page.getByRole('button', { name: /^deselect all$/i }).click();
  await expect(page.getByRole('button', { name: /select at least one/i }).or(page.getByText(/^0 URLs? selected$/))).toBeVisible();
  await page.getByRole('button', { name: /^select all$/i }).click();

  await expect(page.getByRole('button', { name: /^approve 100 urls$/i })).toBeVisible({ timeout: 10000 });
});

test('Case 5: deselecting 10 URLs moves Approve from 100 to 90', async ({ page }) => {
  const { user, project } = fixtures.case5;
  await login(page, user.email, user.password);
  await page.goto(`/projects/${project.projectId}/url-selection`);

  await expect(page.getByRole('button', { name: /^approve 100 urls$/i })).toBeVisible({ timeout: 15000 });

  // Click the first 10 visible row checkboxes to deselect them.
  const rows = page.locator('input[type="checkbox"]:checked');
  for (let i = 0; i < 10; i++) {
    await rows.first().click();
  }

  await expect(page.getByRole('button', { name: /^approve 90 urls$/i })).toBeVisible({ timeout: 10000 });
});

test('Case 6: manually selecting past the limit is blocked with a message, count never exceeds 100', async ({ page }) => {
  const { user, project } = fixtures.case6;
  await login(page, user.email, user.password);
  await page.goto(`/projects/${project.projectId}/url-selection`);

  await expect(page.getByRole('button', { name: /^approve 100 urls$/i })).toBeVisible({ timeout: 15000 });

  // Search for an unselected qualified URL beyond the first 100 (which are
  // already selected) and try to check it.
  await page.locator('input[placeholder="Search URLs..."]').fill('qualified-150');
  const uncheckedBox = page.locator('input[type="checkbox"]:not(:checked)').first();
  await expect(uncheckedBox).toBeVisible({ timeout: 10000 });
  await uncheckedBox.click();

  await expect(page.getByText(/page limit reached/i)).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('button', { name: /^approve 100 urls$/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /^approve 101 urls$/i })).toHaveCount(0);
});
