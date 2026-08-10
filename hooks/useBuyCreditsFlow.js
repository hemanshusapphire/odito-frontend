"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateCreditPurchaseCheckout } from "@/hooks/useDashboardQueries";
import { queryKeys } from "@/lib/query/keys";

/**
 * The entire "Buy Credits" purchase flow — modal open state, the
 * checkout-session call + redirect to Stripe, and the return-from-Stripe
 * handling (success/cancel toast + subscription query invalidation).
 * Exact structural mirror of hooks/useBuyPagesFlow.js (Phase 16); credits
 * have no per-project entry point (unlike pages' URL Selection screen),
 * so this hook has no `projectId` concept — every caller returns to
 * `returnPath` (default /settings/subscription).
 *
 * @param {Object} [params]
 * @param {string} [params.returnPath] - where Stripe sends the user back;
 *   defaults to /settings/subscription
 */
export function useBuyCreditsFlow({ returnPath = '/app/settings/subscription' } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const createCreditPurchaseCheckout = useCreateCreditPurchaseCheckout();

  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [subscriptionRefreshedAt, setSubscriptionRefreshedAt] = useState(0);

  const handleContinue = useCallback(async (pack) => {
    try {
      const response = await createCreditPurchaseCheckout.mutateAsync({
        credits: pack.credits,
        returnPath,
      });
      const checkoutUrl = response?.data?.checkoutUrl;
      if (!checkoutUrl) {
        setToast({ message: 'Could not start checkout. Please try again.', type: 'error' });
        return;
      }
      // Full-page navigation to Stripe — mirrors the existing subscription
      // and page-purchase checkout flows. The page fully remounts on
      // return, so `open` starts back at its default `false` with no
      // extra state needed to make the modal "disappear."
      window.location.href = checkoutUrl;
    } catch (err) {
      // Modal deliberately stays open here (no setOpen(false)) so the user
      // can retry without losing their selected credit count.
      setToast({ message: err.message || 'Could not start checkout. Please try again.', type: 'error' });
    }
  }, [createCreditPurchaseCheckout, returnPath]);

  // Return-from-Stripe handling. `creditsPurchased=true` / `creditsPurchaseCancelled=true`
  // are the query-param convention creditPurchaseController.js's
  // successUrl/cancelUrl build. No page reload: only the subscription
  // query is invalidated (TanStack Query), which is what lets every value
  // derived from it (usage cards, etc.) update automatically. The query
  // params are stripped via router.replace so a manual refresh never
  // re-triggers this.
  useEffect(() => {
    const purchased = searchParams.get('creditsPurchased') === 'true';
    const cancelled = searchParams.get('creditsPurchaseCancelled') === 'true';
    if (!purchased && !cancelled) return;

    if (purchased) {
      // The webhook that actually raises credits.limit runs server-side,
      // asynchronously, after Stripe redirects the browser back here — it
      // can still be in flight at this exact moment (same confirmed
      // multi-second webhook lag as useBuyPagesFlow.js, its structural
      // mirror). A single invalidate can land before that DB write
      // completes and silently "refresh" to the same stale number, with
      // nothing left to ever trigger a second look. This re-invalidates
      // the same query a few more times a few seconds apart — not
      // open-ended polling, a small fixed number of extra looks at the one
      // existing query, giving the webhook a realistic window to land
      // before giving up.
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

      setToast({ message: 'Credits added to your account!', type: 'success' });
    } else {
      setToast({ message: 'Purchase cancelled — no changes were made.', type: 'error' });
    }

    router.replace(returnPath);
  }, [searchParams, queryClient, router, returnPath]);

  return {
    open,
    setOpen,
    handleContinue,
    toast,
    clearToast: () => setToast(null),
    subscriptionRefreshedAt,
  };
}
