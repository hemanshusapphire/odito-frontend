import { test, expect } from '@playwright/test';

// Verifies the onboarding resume-sync fix: after a successful Stripe
// payment (real webhook fired against the temp backend), the resume flow
// must exit NEEDS_UPGRADE into a success/Proceed state — never silently
// auto-continue, and never remain stuck showing "no credits" once the
// subscription is genuinely active. Uses the sessionStorage resume marker
// as the entry point into the resume effect, matching Phase 15.5/15.6's
// established test pattern — this exercises the real production code
// path (ARIAChat's mount effect), not a mock of it.

const users = JSON.parse(process.env.P156RESUME_USERS);

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

async function fireCheckoutWebhook(request, userId) {
  const stripeModule = await import('stripe');
  const Stripe = stripeModule.default;
  const evtId = 'evt_p156resume_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  const eventObject = {
    id: evtId, object: 'event', type: 'checkout.session.completed', livemode: false,
    data: { object: {
      id: 'cs_resume_1', customer: 'cus_p156resume_' + userId.slice(-8),
      subscription: 'sub_p156resume_' + userId.slice(-8),
      amount_total: 2500, currency: 'usd', payment_status: 'paid',
      metadata: { userId, planId: 'starter' },
    } },
  };
  const payload = JSON.stringify(eventObject);
  const header = Stripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_test_dummy_local_only' });
  const res = await request.post('http://localhost:5000/api/subscription/webhook', {
    data: payload,
    headers: { 'Content-Type': 'application/json', 'Stripe-Signature': header },
  });
  expect(res.status()).toBe(200);
}

test('Case A: fresh user -> Upgrade CTA appears', async ({ page }) => {
  await seedResumeMarker(page);
  await login(page, users.caseA.email, users.caseA.password);
  await page.goto('/onboarding');

  await expect(page.getByText(/no project credits remaining/i)).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: /upgrade plan/i })).toBeVisible();
});

test('Case B+C+D: successful payment -> success state (not NEEDS_UPGRADE) -> Proceed -> project created, exactly once', async ({ page, request }) => {
  let createProjectCallCount = 0;
  await page.route('**/api/app_user/projects', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    createProjectCallCount++;
    await route.fulfill({
      status: 201, contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Project created', data: { projectId: 'e2e-resume-fixture' } }),
    });
  });

  // Fire the webhook BEFORE navigating — the realistic/common timing where
  // Stripe's webhook delivery completes before (or during) the browser's
  // own multi-hop redirect back through Settings to /onboarding.
  await fireCheckoutWebhook(request, users.caseBCD.id);

  await seedResumeMarker(page);
  await login(page, users.caseBCD.email, users.caseBCD.password);
  await page.goto('/onboarding');

  // Case B: the Upgrade screen must never appear at all in this timing —
  // the success state is what's shown instead.
  await expect(page.getByText(/subscription activated successfully/i)).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/no project credits remaining/i)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /upgrade plan/i })).toHaveCount(0);

  // Case C: Proceed button appears and is clickable.
  const proceedBtn = page.getByRole('button', { name: /proceed/i });
  await expect(proceedBtn).toBeVisible();
  await proceedBtn.click();

  // Case D: original onboarding resumes -> project creation is attempted.
  await page.waitForTimeout(2000);
  expect(createProjectCallCount).toBeGreaterThanOrEqual(1);

  // Case G: exactly one project, not a double-submit from a fast click.
  await proceedBtn.click({ timeout: 500 }).catch(() => {}); // button should already be gone/disabled
  await page.waitForTimeout(500);
  expect(createProjectCallCount).toBe(1);
});

test('Case E: cancelled/never-paid subscription -> Upgrade screen remains, no false success', async ({ page }) => {
  // No webhook fired at all for this user — genuinely never paid.
  await seedResumeMarker(page);
  await login(page, users.caseE.email, users.caseE.password);
  await page.goto('/onboarding');

  await expect(page.getByText(/no project credits remaining/i)).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/subscription activated successfully/i)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^proceed$/i })).toHaveCount(0);
});
