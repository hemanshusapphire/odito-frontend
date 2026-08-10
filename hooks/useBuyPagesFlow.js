"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCreatePagePurchaseCheckout } from "@/hooks/useDashboardQueries";
import { queryKeys } from "@/lib/query/keys";

/**
 * The entire "Buy More Pages" purchase flow — modal open state, the
 * checkout-session call + redirect to Stripe, and the return-from-Stripe
 * handling (success/cancel toast + subscription query invalidation) — in
 * ONE place, so every entry point (URL Selection, Settings →
 * Subscription, and any future one) drives the same <BuyPagesModal>
 * through the same logic instead of each reimplementing it. This hook
 * renders nothing itself; the caller renders
 * `<BuyPagesModal open={open} onClose={() => setOpen(false)} onContinue={handleContinue} .../>`
 * and `<PurchaseToast .../>` (components/billing/) using the values
 * returned here.
 *
 * @param {Object} [params]
 * @param {string} [params.projectId] - attached to the purchase record and
 *   used to build the default returnPath when none is given
 * @param {string} [params.returnPath] - where Stripe sends the user back;
 *   defaults to the URL Selection page for `projectId`, or
 *   /settings/subscription when no projectId is given
 */
export function useBuyPagesFlow({ projectId = null, returnPath } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const createPagePurchaseCheckout = useCreatePagePurchaseCheckout();

  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  // Bumped only once the post-purchase subscription refetch has actually
  // landed in the query cache — callers that need to recompute their own
  // derived state (e.g. URL Selection's auto-selected count) watch this
  // rather than reacting to effectiveCap/pagesRemaining changes in general.
  const [subscriptionRefreshedAt, setSubscriptionRefreshedAt] = useState(0);

  const resolvedReturnPath = returnPath || (projectId ? `/projects/${projectId}/url-selection` : '/app/settings/subscription');

  const handleContinue = useCallback(async (pack) => {
    try {
      const response = await createPagePurchaseCheckout.mutateAsync({
        pages: pack.pages,
        projectId,
        returnPath: resolvedReturnPath,
      });
      const checkoutUrl = response?.data?.checkoutUrl;
      if (!checkoutUrl) {
        setToast({ message: 'Could not start checkout. Please try again.', type: 'error' });
        return;
      }
      // Full-page navigation to Stripe — mirrors the existing subscription
      // checkout flow (PlanSummaryCard.jsx). The page fully remounts on
      // return, so `open` starts back at its default `false` with no extra
      // state needed to make the modal "disappear."
      window.location.href = checkoutUrl;
    } catch (err) {
      // Modal deliberately stays open here (no setOpen(false)) so the user
      // can retry without losing their selected page count.
      setToast({ message: err.message || 'Could not start checkout. Please try again.', type: 'error' });
    }
  }, [createPagePurchaseCheckout, projectId, resolvedReturnPath]);

  // Return-from-Stripe handling. `pagesPurchased=true` / `pagesPurchaseCancelled=true`
  // are the query-param convention pagePurchaseController.js's
  // successUrl/cancelUrl build. No page reload: only the subscription
  // query is invalidated (TanStack Query), which is what lets every
  // value derived from it (usage cards, banners, etc.) update
  // automatically. The query params are stripped via router.replace so a
  // manual refresh never re-triggers this.
  useEffect(() => {
    const purchased = searchParams.get('pagesPurchased') === 'true';
    const cancelled = searchParams.get('pagesPurchaseCancelled') === 'true';
    if (!purchased && !cancelled) return;

    if (purchased) {
      // The webhook that actually raises pages.limit runs server-side,
      // asynchronously, after Stripe redirects the browser back here — it
      // can still be in flight at this exact moment (confirmed empirically:
      // webhook delivery has observable multi-second lag). A single
      // invalidate can land before that DB write completes and silently
      // "refresh" to the same stale number, with nothing left to ever
      // trigger a second look. This re-invalidates the same query a few
      // more times a few seconds apart — not open-ended polling, a small
      // fixed number of extra looks at the one existing query, giving the
      // webhook a realistic window to land before giving up. Each
      // successful round bumps subscriptionRefreshedAt again; the
      // consuming effect (URL Selection's selection-expansion) is already
      // idempotent (a no-op once effectiveCap/selected are already in
      // sync), so re-triggering it harmlessly is safe.
      const scheduleInvalidate = (delayMs) => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.subscription.mine() }).then(() => {
            setSubscriptionRefreshedAt(Date.now());
          });
        }, delayMs);
      };

      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.mine() }).then(() => {
        setSubscriptionRefreshedAt(Date.now());
      });
      scheduleInvalidate(3000);
      scheduleInvalidate(6000);

      setToast({ message: 'Pages added to your account!', type: 'success' });
    } else {
      setToast({ message: 'Purchase cancelled — no changes were made.', type: 'error' });
    }

    router.replace(resolvedReturnPath);
  }, [searchParams, queryClient, router, resolvedReturnPath]);

  return {
    open,
    setOpen,
    handleContinue,
    toast,
    clearToast: () => setToast(null),
    subscriptionRefreshedAt,
  };
}
