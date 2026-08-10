"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import apiService from '@/lib/apiService';
import { useSubscription } from '@/hooks/useDashboardQueries';
import { useBuyPagesFlow } from '@/hooks/useBuyPagesFlow';
import { queryKeys } from '@/lib/query/keys';
import UrlSelectionToolbar from '@/components/url-selection/UrlSelectionToolbar';
import UrlSelectionTable from '@/components/url-selection/UrlSelectionTable';
import UrlSelectionSummaryBar from '@/components/url-selection/UrlSelectionSummaryBar';
import PageQuotaBanner from '@/components/url-selection/PageQuotaBanner';
import BuyPagesModal from '@/components/billing/BuyPagesModal';
import PurchaseToast from '@/components/billing/PurchaseToast';

export default function UrlSelectionPageClient({ projectId }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [urls, setUrls] = useState([]);
  const [totalDiscovered, setTotalDiscovered] = useState(0);
  const [totalQualified, setTotalQualified] = useState(0);
  // null = no cap (the default for every project) — only set to a number
  // when the backend reports an explicit per-project admin override.
  const [selectionLimit, setSelectionLimit] = useState(null);

  const [selected, setSelected] = useState(() => new Set());
  const [search, setSearch] = useState('');
  const [pageTypeFilter, setPageTypeFilter] = useState('all');
  // Transient "you hit the cap" message from a manual checkbox click
  // (Case 6) — distinct from submitError (an Approve-time failure) and from
  // the overLimit message UrlSelectionSummaryBar already derives from
  // selectionLimit (the admin per-project override) — cleared on the next
  // successful toggle.
  const [limitMessage, setLimitMessage] = useState(null);

  // Page quota — reuses the exact same hook/query Settings → Subscription
  // and onboarding already use (no second subscription fetch invented).
  // `pages.remaining` (limit - used), not raw `pages.limit`, is what must
  // drive selection here: it's the same value the backend's own
  // deductPages() atomic gate (urlSelectionController.js) already treats as
  // authoritative, so the frontend can never auto-select more than the
  // backend will actually accept for a user who has already spent some of
  // their account-wide page quota on other projects.
  const { data: subscriptionResponse, isLoading: subscriptionLoading } = useSubscription();
  const pagesRemaining = subscriptionResponse?.data?.pages?.remaining ?? null;
  const pagesLimit = subscriptionResponse?.data?.pages?.limit ?? 0;

  // "Buy More Pages" — one-time (mode: 'payment') Stripe Checkout, not a
  // subscription change. Modal open state, the checkout call + redirect,
  // and the return-from-Stripe handling all live in this ONE shared hook
  // (also used by Settings → Subscription) rather than being reimplemented
  // per page — see hooks/useBuyPagesFlow.js. BuyPagesModal/PageSlider
  // themselves are untouched by any of this.
  const {
    open: buyPagesModalOpen,
    setOpen: setBuyPagesModalOpen,
    handleContinue: handleBuyPagesContinue,
    toast,
    clearToast,
    subscriptionRefreshedAt,
  } = useBuyPagesFlow({ projectId });

  // The ONE combined cap this whole screen honors — the more restrictive of
  // the (rare) per-project admin override and the account's real page
  // quota. Neither concept is duplicated or replaced; they're just
  // combined via min(), same as the task's own formula.
  const effectiveCap = useMemo(() => {
    const candidates = [selectionLimit, pagesRemaining].filter((v) => v != null);
    return candidates.length ? Math.min(...candidates) : null;
  }, [selectionLimit, pagesRemaining]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        // No limit param — the table paginates/virtualizes client-side, and
        // the backend now returns the entire pool in one round trip
        // whenever no explicit page/limit is requested (however many URLs
        // LINK_DISCOVERY actually found — no hardcoded ceiling).
        const response = await apiService.getUrlPool(projectId);
        if (cancelled) return;

        if (!response.success) {
          throw new Error(response.message || 'Failed to load URL pool');
        }

        const data = response.data;
        setUrls(data.urls || []);
        setTotalDiscovered(data.total_discovered || 0);
        setTotalQualified(data.total_qualified || 0);
        // null = unlimited; only a number when this project has an explicit
        // admin-configured override.
        setSelectionLimit(data.selection_limit ?? null);
        // Initial selection itself is set by the effect below, once the
        // subscription quota (fetched independently) is also ready — see
        // that effect's comment for why this can't be decided here.
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message || 'Failed to load URL pool');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [projectId]);

  // Every qualified URL, unfiltered by search/page-type — computed once
  // here and reused by both the initial-selection effect and
  // selectAllFiltered's cap check below, instead of each re-deriving it
  // from `urls` independently.
  const qualifiedUrlList = useMemo(
    () => urls.filter((u) => u.qualified).map((u) => u.url),
    [urls]
  );

  // Sets the INITIAL selection exactly once, capped at effectiveCap — not
  // in the fetch effect above, because effectiveCap depends on the
  // subscription quota, which loads via its own independent query and may
  // not be ready yet when the URL pool response lands. Waiting for both
  // (guarded by hasInitializedSelectionRef so it only ever runs once, and
  // never re-clobbers the user's own later selections/deselections if
  // subscriptionResponse happens to refetch in the background) is what
  // keeps the very first paint already correctly capped, rather than
  // briefly flashing "440 selected" before snapping down to 100.
  const hasInitializedSelectionRef = useRef(false);
  useEffect(() => {
    if (hasInitializedSelectionRef.current) return;
    if (loading || subscriptionLoading) return;
    hasInitializedSelectionRef.current = true;

    setSelected(new Set(
      effectiveCap != null ? qualifiedUrlList.slice(0, effectiveCap) : qualifiedUrlList
    ));
  }, [loading, subscriptionLoading, qualifiedUrlList, effectiveCap]);

  // Re-expands the selection up to the NEW effectiveCap once a page
  // purchase has actually landed (subscriptionRefreshedAt, set above only
  // after invalidateQueries's refetch resolves) — the one-time init effect
  // above deliberately never re-runs after mount, so without this, `selected`
  // (and therefore the selected count / Approve button / everything derived
  // from it) would stay frozen at the OLD limit until a manual page refresh,
  // even though effectiveCap/pagesRemaining/the banner already update
  // reactively from the refetched query on their own.
  //
  // Reuses the exact same "fill qualified URLs, in order, up to the cap"
  // algorithm as the initial selection / Select All — no new selection
  // logic. Only ever fires for this specific purchase-return signal, never
  // as a generic reaction to effectiveCap changing for some other reason,
  // so it can never silently override a user's own manual deselections
  // during normal use.
  useEffect(() => {
    if (subscriptionRefreshedAt === 0) return;
    setSelected(prev => {
      if (effectiveCap == null || prev.size >= effectiveCap) return prev;
      const next = new Set(prev);
      for (const url of qualifiedUrlList) {
        if (next.size >= effectiveCap) break;
        next.add(url);
      }
      return next;
    });
  }, [subscriptionRefreshedAt, effectiveCap, qualifiedUrlList]);

  const pageTypes = useMemo(() => {
    const types = new Set(urls.map(u => u.page_type || 'other'));
    return ['all', ...Array.from(types).sort()];
  }, [urls]);

  const filteredUrls = useMemo(() => {
    let result = urls;
    if (pageTypeFilter !== 'all') {
      result = result.filter(u => (u.page_type || 'other') === pageTypeFilter);
    }
    if (search.trim()) {
      const needle = search.trim().toLowerCase();
      result = result.filter(u => u.url.toLowerCase().includes(needle));
    }
    return result;
  }, [urls, pageTypeFilter, search]);

  // Case 6: a manual click that would push the selection past effectiveCap
  // is rejected outright — never silently truncated, never allowed through
  // then re-blocked at Approve time. Reads `selected` directly (rather than
  // via the functional updater form) specifically so the reject path can
  // surface limitMessage without a side effect inside the setState
  // reducer.
  const toggleUrl = useCallback((url) => {
    if (!selected.has(url) && effectiveCap != null && selected.size >= effectiveCap) {
      setLimitMessage('Page limit reached. Deselect another page or upgrade your subscription.');
      return;
    }
    setLimitMessage(null);
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }, [selected, effectiveCap]);

  const selectAllFiltered = useCallback(() => {
    setSelected(prev => {
      const next = new Set(prev);
      for (const u of filteredUrls) {
        if (effectiveCap != null && next.size >= effectiveCap) break;
        if (u.qualified) next.add(u.url);
      }
      return next;
    });
  }, [filteredUrls, effectiveCap]);

  const deselectAllFiltered = useCallback(() => {
    setLimitMessage(null);
    setSelected(prev => {
      const next = new Set(prev);
      for (const u of filteredUrls) next.delete(u.url);
      return next;
    });
  }, [filteredUrls]);

  const deselectAll = useCallback(() => {
    setLimitMessage(null);
    setSelected(new Set());
  }, []);

  const handleApprove = async () => {
    setSubmitError(null);
    if (selected.size === 0) {
      setSubmitError('Select at least one URL before approving.');
      return;
    }
    // effectiveCap (admin override AND/OR account page quota, whichever is
    // more restrictive) — the same single combined value toggleUrl/
    // selectAllFiltered/the initial selection already honor. This is a
    // client-side courtesy check only; deductPages() on the backend
    // (urlSelectionController.js) remains the actual authority and is
    // never bypassed by anything checked here.
    if (effectiveCap != null && selected.size > effectiveCap) {
      setSubmitError(`You can select at most ${effectiveCap} URLs.`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiService.submitUrlSelection(projectId, Array.from(selected));
      if (!response.success) {
        throw new Error(response.message || 'Failed to submit URL selection');
      }
      // deductPages() just consumed quota server-side — invalidate so
      // Settings → Subscription (and anywhere else reading this query)
      // reflects the new remaining count instead of the pre-approval snapshot.
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.mine() });
      router.push(`/processing/${projectId}`);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit URL selection. Please try again.');
      setSubmitting(false);
    }
  };

  if (authLoading || (loading && !loadError)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text)" }}>Loading discovered URLs...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (loadError) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div className="glass-card" style={{ maxWidth: 480, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
            Couldn't load URL selection
          </div>
          <div style={{ fontSize: 14, color: "var(--text3)", marginBottom: 20 }}>{loadError}</div>
          <button onClick={() => window.location.reload()} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "var(--grad1)", color: "white", fontWeight: 600, cursor: "pointer" }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "32px 24px 100px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          Review Discovered URLs
        </div>
        <div style={{ fontSize: 14, color: "var(--text3)" }}>
          {totalQualified} of {totalDiscovered} discovered URLs qualified for crawling. Choose which pages to include in this audit.
        </div>
      </div>

      <PageQuotaBanner
        totalQualified={totalQualified}
        pagesRemaining={pagesRemaining}
        onBuyMorePages={() => setBuyPagesModalOpen(true)}
      />

      <UrlSelectionToolbar
        search={search}
        onSearchChange={setSearch}
        pageTypeFilter={pageTypeFilter}
        onPageTypeFilterChange={setPageTypeFilter}
        pageTypes={pageTypes}
        onSelectAll={selectAllFiltered}
        onDeselectAllFiltered={deselectAllFiltered}
        onDeselectAll={deselectAll}
        totalDiscovered={totalDiscovered}
        totalQualified={totalQualified}
        totalSelected={selected.size}
        selectionLimit={selectionLimit}
      />

      <UrlSelectionTable
        urls={filteredUrls}
        selected={selected}
        onToggle={toggleUrl}
      />

      <UrlSelectionSummaryBar
        totalSelected={selected.size}
        selectionLimit={effectiveCap}
        limitMessage={limitMessage}
        submitting={submitting}
        error={submitError}
        onApprove={handleApprove}
      />

      <BuyPagesModal
        open={buyPagesModalOpen}
        onClose={() => setBuyPagesModalOpen(false)}
        currentPagesLimit={pagesLimit}
        onContinue={handleBuyPagesContinue}
      />

      {toast && (
        <PurchaseToast message={toast.message} type={toast.type} onClose={clearToast} />
      )}
    </div>
  );
}
