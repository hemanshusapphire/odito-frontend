import { test, expect } from '@playwright/test';

// Verifies the frontend UX fix: ARIAChat's catch block must recognize
// BOTH INSUFFICIENT_CREDITS and SUBSCRIPTION_NOT_ACTIVE (the only two
// billing-lifecycle codes the backend actually returns from
// POST /app_user/projects) and route both into the same NEEDS_UPGRADE
// flow — never the generic error message.
//
// Uses the sessionStorage resume marker as the entry point into
// startProjectAndRankingFlow() — the exact same production code path
// Phase 15.5's own resume mechanism uses — rather than driving the full
// multi-turn chat UI (which depends on external APIs unavailable here).

const users = JSON.parse(process.env.P156FIX_USERS);

async function login(page, email, password) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });
}

async function seedResumeMarker(page) {
  const payload = {
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
  }, payload);
}

test('Case A: fresh user (plan=null, status=inactive, credits=0) -> Upgrade CTA, no generic error', async ({ page }) => {
  await seedResumeMarker(page);
  await login(page, users.caseA.email, users.caseA.password);
  await page.goto('/onboarding');

  await expect(page.getByText(/no project credits remaining/i)).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: /upgrade plan/i })).toBeVisible();
  await expect(page.getByText(/^❌ Error/)).toHaveCount(0);
});

test('Case B: past_due status with UNUSED credit (backend returns SUBSCRIPTION_NOT_ACTIVE) -> Upgrade CTA, no generic error', async ({ page }) => {
  await seedResumeMarker(page);
  await login(page, users.caseB.email, users.caseB.password);
  await page.goto('/onboarding');

  await expect(page.getByText(/no project credits remaining/i)).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: /upgrade plan/i })).toBeVisible();
  await expect(page.getByText(/^❌ Error/)).toHaveCount(0);
});

test('Case C: cancelled subscription -> Upgrade CTA, no generic error', async ({ page }) => {
  await seedResumeMarker(page);
  await login(page, users.caseC.email, users.caseC.password);
  await page.goto('/onboarding');

  await expect(page.getByText(/no project credits remaining/i)).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: /upgrade plan/i })).toBeVisible();
  await expect(page.getByText(/^❌ Error/)).toHaveCount(0);
});

test('Case D: paused subscription -> Upgrade CTA, no generic error', async ({ page }) => {
  await seedResumeMarker(page);
  await login(page, users.caseD.email, users.caseD.password);
  await page.goto('/onboarding');

  await expect(page.getByText(/no project credits remaining/i)).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: /upgrade plan/i })).toBeVisible();
  await expect(page.getByText(/^❌ Error/)).toHaveCount(0);
});

test('Case E: real network failure -> still shows generic error, NOT the Upgrade CTA', async ({ page }) => {
  await seedResumeMarker(page);
  // Let the subscription pre-check succeed (real credit available), but
  // make the actual project-creation request fail at the network level.
  await page.route('**/api/app_user/projects', (route) => route.abort('failed'));

  await login(page, users.caseEF.email, users.caseEF.password);
  await page.goto('/onboarding');

  // Resume-sync fix: this user has an active subscription with unused
  // credit, so the resume effect lands on the success/Proceed state, not
  // a silent auto-continue — Proceed is what actually attempts creation
  // and is where the mocked network failure below surfaces.
  await expect(page.getByRole('button', { name: /proceed/i })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: /proceed/i }).click();

  await expect(page.getByText(/^❌ Error/)).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/no project credits remaining/i)).toHaveCount(0);
});

test('Case F: unexpected backend 500 -> still shows generic error, NOT the Upgrade CTA', async ({ page }) => {
  await seedResumeMarker(page);
  await page.route('**/api/app_user/projects', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({
      status: 500, contentType: 'application/json',
      body: JSON.stringify({ success: false, message: 'Internal server error' }),
    });
  });

  await login(page, users.caseEF.email, users.caseEF.password);
  await page.goto('/onboarding');

  await expect(page.getByRole('button', { name: /proceed/i })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: /proceed/i }).click();

  await expect(page.getByText(/^❌ Error/)).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/no project credits remaining/i)).toHaveCount(0);
});
