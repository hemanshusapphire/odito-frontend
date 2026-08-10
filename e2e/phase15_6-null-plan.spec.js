import { test, expect } from '@playwright/test';

// Phase 15.6 regression check: a TRULY new user now has plan:null,
// status:'inactive' (not plan:'starter' with exhausted credits, as Phase
// 15.5's test users had). This specifically exercises the usePlans()
// fallback added to PlanSummaryCard.jsx and ARIAChat.jsx's
// handleUpgradeClick, since subscription.plan.id no longer exists to fall
// back on for a never-subscribed user.

const user = JSON.parse(process.env.PHASE15_6_USER);

async function login(page, email, password) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });
}

test('Settings/Subscription page renders "No Active Subscription" for a plan:null user, with Upgrade visible and Manage Subscription hidden', async ({ page }) => {
  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  await login(page, user.email, user.password);
  await page.goto('/settings/subscription');

  await expect(page.getByText(/no active subscription/i)).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: /^upgrade$/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /manage subscription/i })).toHaveCount(0);
  await expect(page.getByText(/credits remaining|^0$/i)).toBeTruthy();

  expect(consoleErrors).toEqual([]);
});

test('Settings Upgrade button resolves a real plan id via usePlans() fallback and creates exactly one checkout session', async ({ page }) => {
  let checkoutRequestBody = null;
  await page.route('**/api/subscription/checkout', async (route) => {
    checkoutRequestBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'ok', data: { checkoutUrl: 'http://localhost:3000/settings/subscription?success=true' } }),
    });
  });

  await login(page, user.email, user.password);
  await page.goto('/settings/subscription');
  await expect(page.getByRole('button', { name: /^upgrade$/i })).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: /^upgrade$/i }).click();
  await page.waitForTimeout(1500);

  expect(checkoutRequestBody?.plan).toBe('starter');
});

test('Onboarding zero-credit CTA resolves a real plan id via usePlans() fallback for a plan:null user', async ({ page }) => {
  let checkoutRequestBody = null;
  await page.route('**/api/subscription/checkout', async (route) => {
    checkoutRequestBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'ok', data: { checkoutUrl: 'http://localhost:3000/settings/subscription?success=true' } }),
    });
  });

  const resumePayload = {
    projectData: {
      businessName: 'Test Business', businessLocation: 'Test City', websiteUrl: 'https://example.com',
      businessType: 'Service-based', subType: 'IT services', targetLevel: 'country',
      selectedKeywords: ['test keyword'], keywords: ['test keyword'], industry: 'Service-based',
      location: '', country: 'US', countryName: 'United States', language: 'en', onboardingMode: 'google_places',
    },
    overrideKeywords: ['test keyword'],
    previousFlowState: 'CONFIRM_KEYWORDS',
  };
  await page.addInitScript((p) => {
    sessionStorage.setItem('onboarding_upgrade_resume', JSON.stringify(p));
  }, resumePayload);

  await login(page, user.email, user.password);
  await page.goto('/onboarding');

  await expect(page.getByText(/no project credits remaining/i)).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: /upgrade plan/i }).click();
  await page.waitForTimeout(1500);

  expect(checkoutRequestBody?.plan).toBe('starter');
});
