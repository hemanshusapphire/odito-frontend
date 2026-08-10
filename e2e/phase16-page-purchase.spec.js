import { test, expect } from '@playwright/test';
import Stripe from 'stripe';

const stripeSigner = new Stripe('sk_test_dummy_local_signing_only', { apiVersion: '2024-06-20' });

async function grantPagesViaRealWebhook({ userId, pages, sessionId }) {
  const session = {
    id: sessionId,
    object: 'checkout.session',
    mode: 'payment',
    payment_status: 'paid',
    amount_total: pages * 5,
    currency: 'usd',
    payment_intent: `pi_test_${sessionId}`,
    metadata: { userId, pagesPurchased: String(pages), purchaseType: 'page_pack', projectId: '' },
  };
  const event = {
    id: `evt_test_${sessionId}`,
    object: 'event',
    type: 'checkout.session.completed',
    livemode: false,
    data: { object: session },
  };
  const payloadString = JSON.stringify(event);
  const header = stripeSigner.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret: process.env.PHASE16_WEBHOOK_SECRET,
  });
  const res = await fetch('http://localhost:5000/api/subscription/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'stripe-signature': header },
    body: payloadString,
  });
  if (res.status !== 200) {
    throw new Error(`Webhook call failed: ${res.status} ${await res.text()}`);
  }
}

// Verifies the "Buy More Pages" Stripe Checkout wiring on the URL
// Selection screen: Continue -> real POST /page-purchases/checkout ->
// redirect to a real Stripe test-mode Checkout URL, plus the
// return-from-Stripe flow (success/cancel query params -> toast +
// subscription query invalidation, no page-reload hacks). The webhook
// path itself (checkout.session.completed -> pages granted, idempotency,
// regression on normal subscription checkout) is covered by
// odito_backend/_phase16_verify_tmp.mjs, which talks to the real backend
// directly with signed Stripe events — not duplicated here.

const EMAIL = 'phase16.fixture@odito.test';
const PASSWORD = 'FixturePass123!';
const PROJECT_ID = process.env.PHASE16_PROJECT_ID;

async function login(page) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(EMAIL);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });
}

// Serial: all three tests share one fixture user/project, and the third
// test permanently raises that user's pages.limit via a real webhook call
// — running these out of order or in parallel would make test 2's
// "banner still visible" assertion flaky depending on execution order.
test.describe.configure({ mode: 'serial' });

test('Continue posts to the real checkout endpoint and redirects to a live Stripe Checkout session', async ({ page }) => {
  await login(page);
  await page.goto(`/projects/${PROJECT_ID}/url-selection`);
  await expect(page.getByText('Review Discovered URLs')).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: 'Buy More Pages' }).click();
  await expect(page.getByText('Buy Additional Pages')).toBeVisible();

  // Pick a specific pack via the numeric input (250 pages).
  await page.getByPlaceholder('Enter pages').fill('250');
  await expect(page.getByText('+250 Pages')).toBeVisible();
  await expect(page.getByText('$12.50')).toBeVisible();

  // The app calls window.location.href = checkoutUrl the instant the
  // response arrives, which races (and reliably wins against) Playwright
  // re-fetching the response body afterward — so capture the request/
  // response bodies ourselves via route interception before letting the
  // real request continue to the real backend.
  let capturedStatus = null;
  let capturedBody = null;
  let capturedRequestBody = null;
  await page.route('**/api/page-purchases/checkout', async (route) => {
    capturedRequestBody = route.request().postDataJSON();
    const response = await route.fetch();
    capturedStatus = response.status();
    capturedBody = await response.json();
    await route.fulfill({ response });
  });

  await page.getByRole('button', { name: 'Continue' }).click();

  // Real full-page navigation to Stripe's hosted Checkout follows
  // (window.location.href = checkoutUrl) — confirm it actually lands on
  // checkout.stripe.com, without submitting a test card (that path is
  // exercised at the backend/webhook level instead).
  await page.waitForURL(/^https:\/\/checkout\.stripe\.com\//, { timeout: 15000 });

  expect(capturedStatus).toBe(200);
  expect(capturedBody.data.checkoutUrl).toMatch(/^https:\/\/checkout\.stripe\.com\//);

  // The request body sent only a page count + return context — never a
  // price.
  expect(capturedRequestBody).toEqual({
    pages: 250,
    projectId: PROJECT_ID,
    returnPath: `/projects/${PROJECT_ID}/url-selection`,
  });
  expect(capturedRequestBody).not.toHaveProperty('price');
  expect(capturedRequestBody).not.toHaveProperty('priceCents');
});

test('cancelled return: toast shown, modal remains available, no quota change', async ({ page }) => {
  await login(page);
  await page.goto(`/projects/${PROJECT_ID}/url-selection?pagesPurchaseCancelled=true`);
  await expect(page.getByText('Review Discovered URLs')).toBeVisible({ timeout: 15000 });

  await expect(page.getByText('Purchase cancelled — no changes were made.')).toBeVisible();

  // The query param is stripped from the URL (router.replace).
  await expect(page).toHaveURL(new RegExp(`/projects/${PROJECT_ID}/url-selection$`));

  // Banner + Buy More Pages CTA is still there — the purchase flow remains
  // fully available for a retry.
  await expect(page.getByRole('button', { name: 'Buy More Pages' })).toBeVisible();
});

test('successful return: banner still shows pre-purchase, then disappears via query invalidation once webhook grants pages — no manual reload', async ({ page }) => {
  await login(page);

  // Pre-purchase: quota is exceeded (limit=100 < 300 qualified), banner visible.
  await page.goto(`/projects/${PROJECT_ID}/url-selection`);
  await expect(page.getByText('Review Discovered URLs')).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: 'Buy More Pages' })).toBeVisible();

  // Grant 250 pages via a REAL signed webhook call to the real backend —
  // exactly what Stripe would do after a completed payment (100 -> 350,
  // now >= the 300 qualified URLs).
  await grantPagesViaRealWebhook({
    userId: process.env.PHASE16_USER_ID,
    pages: 250,
    sessionId: `cs_test_playwright_${Date.now()}`,
  });

  // Simulate Stripe's redirect back to the exact URL Selection page.
  const gotoAndWaitForSubscription = page.waitForResponse((res) =>
    res.url().includes('/api/subscription') && res.request().method() === 'GET'
  );
  await page.goto(`/projects/${PROJECT_ID}/url-selection?pagesPurchased=true`);
  await gotoAndWaitForSubscription;

  await expect(page.getByText('Review Discovered URLs')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Pages added to your account!')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/projects/${PROJECT_ID}/url-selection$`));

  // The banner is gone (300 qualified <= 350 remaining) purely from the
  // subscription query being invalidated/refetched on this fresh
  // navigation — no window.location.reload(), no manual refetch call
  // beyond the one invalidateQueries() in the return-flow effect.
  await expect(page.getByRole('button', { name: 'Buy More Pages' })).toHaveCount(0);
});
