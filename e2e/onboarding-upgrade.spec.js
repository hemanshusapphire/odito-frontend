import { test, expect } from '@playwright/test';

// Phase 15.5 verification. Users are pre-created directly in MongoDB (see
// odito_backend/_phase15_5_e2e_setup_tmp.mjs) with real credit states.
// STRIPE_SECRET_KEY is a dummy value in this environment, so a real Stripe
// Checkout Session cannot be created — POST /subscription/checkout is
// mocked at the network layer to return a checkoutUrl that points straight
// back to our own success/cancel return route, standing in for "the user
// completed/cancelled Stripe's own hosted page" (out of scope to re-test
// here; already covered by Phases 12-13's Stripe integration tests). The
// account-credit side effect of a real payment is simulated by firing a
// real, signature-verified checkout.session.completed webhook at the temp
// backend — that part exercises real, unmocked backend code.
// POST /app_user/projects is mocked too, since the downstream Python
// worker isn't running in this sandbox — the assertion is "was project
// creation attempted with the right data", not "did the full audit
// pipeline complete".

const users = JSON.parse(process.env.PHASE15_5_USERS);

async function login(page, email, password) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });
}

async function seedResumeState(page, { creditsRemainingAtSeedTime = 0 } = {}) {
  const payload = {
    projectData: {
      businessName: 'Test Business',
      businessLocation: 'Test City',
      websiteUrl: 'https://example.com',
      businessType: 'Service-based',
      subType: 'IT services',
      targetLevel: 'country',
      selectedKeywords: ['test keyword'],
      keywords: ['test keyword'],
      industry: 'Service-based',
      location: '',
      country: 'US',
      countryName: 'United States',
      language: 'en',
      onboardingMode: 'google_places',
    },
    overrideKeywords: ['test keyword'],
    previousFlowState: 'CONFIRM_KEYWORDS',
  };
  await page.addInitScript((p) => {
    sessionStorage.setItem('onboarding_upgrade_resume', JSON.stringify(p));
  }, payload);
}

async function mockCheckoutSession(page) {
  return page.route('**/api/subscription/checkout', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Checkout session created',
        data: { checkoutUrl: 'http://localhost:3000/settings/subscription?success=true' },
      }),
    });
  });
}

async function mockCancelledCheckoutSession(page) {
  return page.route('**/api/subscription/checkout', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Checkout session created',
        data: { checkoutUrl: 'http://localhost:3000/settings/subscription?cancelled=true' },
      }),
    });
  });
}

async function mockProjectCreation(page) {
  return page.route('**/api/app_user/projects', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Project created', data: { projectId: 'e2e-fake-project-id' } }),
    });
  });
}

test.describe('Phase 15.5 — Onboarding zero-credit upgrade flow', () => {

  test('Case 2: user with 0 credits sees the Upgrade CTA instead of a generic error', async ({ page }) => {
    await seedResumeState(page);
    await login(page, users.zeroCreditUserCase2.email, users.zeroCreditUserCase2.password);
    await page.goto('/onboarding');

    await expect(page.getByText(/no project credits remaining/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /upgrade plan/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /back/i })).toBeVisible();
    // Must NOT show the old generic error
    await expect(page.getByText(/unable to create project/i)).toHaveCount(0);
  });

  test('Case 1: user WITH credits proceeds normally (no Upgrade CTA, success state offers Proceed, project creation attempted)', async ({ page }) => {
    let createProjectCalled = false;
    await mockProjectCreation(page);
    page.on('request', (req) => {
      if (req.url().includes('/api/app_user/projects') && req.method() === 'POST') createProjectCalled = true;
    });

    await seedResumeState(page);
    await login(page, users.oneCreditUser.email, users.oneCreditUser.password);
    await page.goto('/onboarding');

    await expect(page.getByText(/no project credits remaining/i)).toHaveCount(0);
    // Resume-sync fix: a resume attempt with credits available now lands on
    // the success/Proceed confirmation state rather than silently
    // auto-continuing — click Proceed to reach the actual creation attempt.
    await expect(page.getByRole('button', { name: /proceed/i })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /proceed/i }).click();
    await page.waitForTimeout(2000);

    expect(createProjectCalled).toBe(true);
  });

  test('Case 6: double-clicking Upgrade Plan creates only ONE checkout session', async ({ page }) => {
    let checkoutCallCount = 0;
    await page.route('**/api/subscription/checkout', async (route) => {
      checkoutCallCount++;
      await new Promise((r) => setTimeout(r, 400)); // simulate network latency
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'ok', data: { checkoutUrl: 'http://localhost:3000/settings/subscription?success=true' } }),
      });
    });

    await seedResumeState(page);
    await login(page, users.zeroCreditUserCase6.email, users.zeroCreditUserCase6.password);
    await page.goto('/onboarding');
    await expect(page.getByRole('button', { name: /upgrade plan/i })).toBeVisible({ timeout: 15000 });

    // Two genuine, sequential clicks — NOT force:true (which bypasses the
    // disabled-button check entirely and isn't representative of a real
    // double-click; a real second click that lands after the button is
    // already disabled simply wouldn't dispatch onClick at all). This is
    // the actual race a fast human double-click can hit: the second click
    // may land before React re-renders the disabled attribute from the
    // first click's isPending update — the synchronous upgradeInFlightRef
    // guard in handleUpgradeClick() is what has to catch that, not the
    // disabled attribute (which is necessarily one render-tick behind).
    const upgradeBtn = page.getByRole('button', { name: /upgrade plan/i });
    await upgradeBtn.click();
    await upgradeBtn.click({ timeout: 1000 }).catch(() => {});
    await page.waitForTimeout(1500);

    expect(checkoutCallCount).toBe(1);
  });

  test('Case 3: cancelled checkout returns the user to onboarding with no project created, Upgrade CTA still shown', async ({ page }) => {
    let createProjectCalled = false;
    await mockCancelledCheckoutSession(page);
    await mockProjectCreation(page);
    page.on('request', (req) => {
      if (req.url().includes('/api/app_user/projects') && req.method() === 'POST') createProjectCalled = true;
    });

    await seedResumeState(page);
    await login(page, users.zeroCreditUserCase3.email, users.zeroCreditUserCase3.password);
    await page.goto('/onboarding');
    await expect(page.getByRole('button', { name: /upgrade plan/i })).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: /upgrade plan/i }).click();
    // Browser now navigates: onboarding -> (mocked) /settings/subscription?cancelled=true -> bounce back to /onboarding
    await page.waitForURL(/\/onboarding/, { timeout: 15000 });

    await expect(page.getByText(/no project credits remaining/i)).toBeVisible({ timeout: 15000 });
    expect(createProjectCalled).toBe(false);
  });

  test('Case 5: refreshing mid-onboarding produces no broken state', async ({ page }) => {
    const consoleErrors = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await login(page, users.refreshUser.email, users.refreshUser.password);
    await page.goto('/onboarding');
    await expect(page.getByText(/what's your business name/i)).toBeVisible({ timeout: 15000 });

    await page.getByPlaceholder(/enter your business name/i).fill('Refresh Test Co');
    // Do not submit — refresh immediately mid-turn.
    await page.reload();

    // Should cleanly show the initial greeting again, not a stuck spinner/crash.
    await expect(page.getByText(/what's your business name/i)).toBeVisible({ timeout: 15000 });
    expect(consoleErrors).toEqual([]);
  });

});

test.describe('Phase 15.5 — Case 4 (successful checkout resumes onboarding automatically)', () => {
  test('remaining credits > 0 after webhook -> auto-resumes project creation', async ({ page, request }) => {
    let createProjectCalled = false;
    await mockCheckoutSession(page);
    await mockProjectCreation(page);
    page.on('request', (req) => {
      if (req.url().includes('/api/app_user/projects') && req.method() === 'POST') createProjectCalled = true;
    });

    await seedResumeState(page);
    await login(page, users.zeroCreditUserCase4.email, users.zeroCreditUserCase4.password);
    await page.goto('/onboarding');
    await expect(page.getByRole('button', { name: /upgrade plan/i })).toBeVisible({ timeout: 15000 });

    // Fire a REAL signed webhook against the temp backend to simulate
    // Stripe's own side effect of a completed payment — this is the part
    // that must remain unmocked, since it's exactly what Phase 13-15 built
    // and this fix must not touch.
    const stripeModule = await import('stripe');
    const Stripe = stripeModule.default;
    const evtId = 'evt_p15_5_e2e_' + Date.now();
    const eventObject = {
      id: evtId, object: 'event', type: 'checkout.session.completed', livemode: false,
      data: { object: {
        id: 'cs_e2e_1', customer: 'cus_e2e_' + users.zeroCreditUserCase4.id.slice(-8),
        subscription: 'sub_e2e_' + users.zeroCreditUserCase4.id.slice(-8),
        amount_total: 2500, currency: 'usd', payment_status: 'paid',
        metadata: { userId: users.zeroCreditUserCase4.id, planId: 'starter' },
      } },
    };
    const payload = JSON.stringify(eventObject);
    const header = Stripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_test_dummy_local_only' });
    const webhookRes = await request.post('http://localhost:5000/api/subscription/webhook', {
      data: payload,
      headers: { 'Content-Type': 'application/json', 'Stripe-Signature': header },
    });
    expect(webhookRes.status()).toBe(200);

    // Click Upgrade -> mocked checkoutUrl sends the browser straight to our
    // own success return route -> bounce-through -> back to /onboarding ->
    // auto-resume effect refetches subscription (now credited by the real
    // webhook above) and shows the success/Proceed state (resume-sync fix
    // — no longer a silent auto-continue).
    await page.getByRole('button', { name: /upgrade plan/i }).click();
    await page.waitForURL(/\/onboarding/, { timeout: 15000 });

    await expect(page.getByText(/subscription activated successfully/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /proceed/i }).click();
    await page.waitForTimeout(2000);
    expect(createProjectCalled).toBe(true);
  });
});
