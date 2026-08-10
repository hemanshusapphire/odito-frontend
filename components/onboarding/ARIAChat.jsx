"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/apiService';
import BusinessResultsList from '@/components/business/BusinessResultsList.jsx';
import ButtonGroup from './ButtonGroup';
import KeywordRecommendationCard from './KeywordRecommendationCard';
import { renderInlineMarkdown } from '@/lib/security/sanitize';
import { useSubscription } from '@/hooks/useDashboardQueries';
import { ONBOARDING_UPGRADE_PENDING_KEY, ONBOARDING_UPGRADE_RESUME_KEY } from '@/lib/onboardingResume';

// Phase 15.5 (updated Phase 3 of the Upgrade unification) — the Upgrade
// Plan CTA below now navigates to the Choose Plan page instead of calling
// checkout directly, so ONBOARDING_UPGRADE_PENDING_KEY carries the resume
// payload across that navigation; the Choose Plan page hands it off into
// ONBOARDING_UPGRADE_RESUME_KEY (this file's original mechanism, unchanged)
// at the exact moment it actually redirects to Stripe or completes a plan
// change. See lib/onboardingResume.js for the full handoff explanation.
// ONBOARDING_UPGRADE_RESUME_KEY itself is still read/cleared once on mount
// below — never written anywhere in this file anymore.

// Every backend error `code` that means "this project can't be created for
// a billing/subscription-lifecycle reason, not a real failure" — all of
// them route into the exact same Upgrade CTA (see the catch block in
// startProjectAndRankingFlow). This is deliberately only the two codes
// that actually exist in the backend today (grepped, not assumed):
// INSUFFICIENT_CREDITS (creditService.js's deductCredits) and
// SUBSCRIPTION_NOT_ACTIVE (subscriptionLifecycle.js's canConsumeQuota,
// returned for every non-'active' status alike — inactive, past_due,
// paused, canceled all collapse to this one code; there is no
// per-status code to add here, and none is invented).
const BILLING_LIFECYCLE_ERROR_CODES = new Set(['INSUFFICIENT_CREDITS', 'SUBSCRIPTION_NOT_ACTIVE']);

const ARIAChat = ({ onComplete }) => {
  // ── Flow states ──────────────────────────────────────────────────────
  const FLOW_STATES = {
    // Phase 1: Business verification
    ASK_BUSINESS_NAME: 'ASK_BUSINESS_NAME',
    ASK_BUSINESS_LOCATION: 'ASK_BUSINESS_LOCATION',
    SEARCHING_BUSINESS: 'SEARCHING_BUSINESS',
    SHOW_BUSINESS_RESULTS: 'SHOW_BUSINESS_RESULTS',
    CONFIRM_BUSINESS: 'CONFIRM_BUSINESS',

    // Phase 1.5: Website Manual Fallback (NEW)
    WEBSITE_MANUAL_MODE: 'WEBSITE_MANUAL_MODE',
    ASK_MANUAL_WEBSITE: 'ASK_MANUAL_WEBSITE',
    SCRAPING_WEBSITE: 'SCRAPING_WEBSITE',
    CONFIRM_EXTRACTED_DATA: 'CONFIRM_EXTRACTED_DATA',

    // Phase 2: Website (conditional — only if business has no website)
    ASK_WEBSITE_URL: 'ASK_WEBSITE_URL',

    // Phase 3: SEO Onboarding
    ASK_BUSINESS_TYPE: 'ASK_BUSINESS_TYPE',
    ASK_SUB_TYPE: 'ASK_SUB_TYPE',
    ASK_TARGET_LEVEL: 'ASK_TARGET_LEVEL',
    ASK_TARGET_COUNTRY: 'ASK_TARGET_COUNTRY',
    ASK_LOCAL_CITY: 'ASK_LOCAL_CITY',
    GENERATING_KEYWORDS: 'GENERATING_KEYWORDS',
    CONFIRM_KEYWORDS: 'CONFIRM_KEYWORDS',
    ASK_CUSTOM_KEYWORDS: 'ASK_CUSTOM_KEYWORDS',

    // Phase 4: Project creation → Ranking → Save
    CREATING_PROJECT: 'CREATING_PROJECT',
    CHECKING_RANKINGS: 'CHECKING_RANKINGS',
    SAVING_RANKINGS: 'SAVING_RANKINGS',
    SHOW_RANKING_RESULTS: 'SHOW_RANKING_RESULTS',

    // Phase 15.5: zero-credit upgrade CTA, entered instead of attempting
    // project creation when the user has no credits remaining.
    NEEDS_UPGRADE: 'NEEDS_UPGRADE',
    // Resume-sync fix: the subscription is confirmed active with credits
    // available (via a fresh refetchSubscription() check), but the user
    // hasn't confirmed they're ready to continue yet — see the
    // subscriptionData-watching effect below for why this is a distinct
    // state from silently auto-continuing straight into CREATING_PROJECT.
    SUBSCRIPTION_ACTIVATED: 'SUBSCRIPTION_ACTIVATED',
  };

  // ── Country options for National SEO targeting ──────────────────────
  const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'IN', name: 'India' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'JP', name: 'Japan' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'KR', name: 'South Korea' },
    { code: 'RU', name: 'Russia' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'SG', name: 'Singapore' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'PH', name: 'Philippines' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'BD', name: 'Bangladesh' },
  ];

  // ── Business type options ────────────────────────────────────────────
  const BUSINESS_TYPES = [
    { label: 'Service-based', icon: '🛠️' },
    { label: 'Product-based', icon: '📦' },
    { label: 'E-commerce', icon: '🛒' },
    { label: 'Agency', icon: '🏢' },
  ];

  // ── State ────────────────────────────────────────────────────────────
  const [flowState, setFlowState] = useState(FLOW_STATES.ASK_BUSINESS_NAME);
  const [messages, setMessages] = useState([
    { type: "ai", text: "👋 Hey! I'm ODITO, your AI SEO co-pilot. Let's uncover what's holding your site back — and what's possible. First, what's your business name?" }
  ]);
  const [input, setInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);
  const [isSearchingBusiness, setIsSearchingBusiness] = useState(false);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [isCheckingRankings, setIsCheckingRankings] = useState(false);
  const [isScrapingWebsite, setIsScrapingWebsite] = useState(false);
  const [isResolvingCity, setIsResolvingCity] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [projectData, setProjectData] = useState({
    businessName: '',
    businessLocation: '',
    businessSearchResults: [],
    verifiedBusiness: null,
    websiteUrl: '',
    businessType: '',
    subType: '',
    targetLevel: '',
    selectedKeywords: [],
    rankingResults: [],
    keywords: [],
    industry: '',
    location: '',
    country: null,
    countryName: '',
    language: 'en',
    // Website Manual Fallback fields
    onboardingMode: 'google_places',
    extractedMetadata: null,
    resolvedCity: null
  });

  const chatEndRef = useRef(null);
  const router = useRouter();

  // ── Phase 15.5: zero-credit Upgrade CTA ──────────────────────────────
  // Reuses the exact same hook Settings → Subscription already uses — no
  // second subscription query. The checkout/plan mutation itself now lives
  // on the Choose Plan page (Phase 3 of the Upgrade unification) — this
  // component only navigates there and, on return, reacts to fresh
  // subscription data exactly as before.
  const { data: subscriptionData, refetch: refetchSubscription } = useSubscription();
  // Where to return via the "Back" button — whatever flowState was active
  // right before a credit check redirected into NEEDS_UPGRADE.
  const previousFlowStateRef = useRef(FLOW_STATES.ASK_BUSINESS_NAME);
  // The exact {overrideKeywords, projectData} for the attempt that was
  // blocked by a zero-credit result — read by handleUpgradeClick() when
  // persisting resume state right before navigating to the Choose Plan page.
  const pendingAttemptRef = useRef(null);
  // Synchronous double-click guard for the Upgrade Plan button — a fast
  // double-click can fire the navigation twice before React re-renders a
  // disabled attribute.
  const upgradeInFlightRef = useRef(false);
  // Reactive echo of upgradeInFlightRef, for the button's visual disabled/
  // loading state only — the ref above is the actual guarantee.
  const [isNavigatingToPlans, setIsNavigatingToPlans] = useState(false);
  // Same guard, for the Proceed button (SUBSCRIPTION_ACTIVATED state) —
  // prevents a fast double-click from calling startProjectAndRankingFlow()
  // twice and creating two projects.
  const proceedInFlightRef = useRef(false);
  // Set once, on mount, if we're returning from a Stripe Checkout redirect
  // that started from this zero-credit CTA — triggers the auto-resume
  // effect below once projectData has been restored.
  const [autoResumeAttempt, setAutoResumeAttempt] = useState(null);

  // Restore state persisted right before an Upgrade-triggered redirect to
  // Stripe Checkout. Runs once, on mount. A normal onboarding session (one
  // that never hit the zero-credit CTA) finds nothing here — a no-op.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem(ONBOARDING_UPGRADE_RESUME_KEY);
    if (!raw) return;
    sessionStorage.removeItem(ONBOARDING_UPGRADE_RESUME_KEY);
    try {
      const parsed = JSON.parse(raw);
      setProjectData(prev => ({ ...prev, ...parsed.projectData }));
      previousFlowStateRef.current = parsed.previousFlowState || FLOW_STATES.ASK_BUSINESS_NAME;
      setMessages(m => [...m, { type: 'ai', text: 'Welcome back! Checking your account...' }]);
      // Carries the ORIGINAL {overrideKeywords, projectData} explicitly —
      // the effect below passes these straight through to
      // startProjectAndRankingFlow() rather than relying on `projectData`
      // React state having already re-rendered, which a same-tick read
      // cannot guarantee.
      setAutoResumeAttempt({ overrideKeywords: parsed.overrideKeywords, projectData: parsed.projectData });
    } catch (e) {
      console.error('Failed to restore onboarding resume state', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fires once autoResumeAttempt is set — refetches subscription fresh
  // (never trusts a cached value) and either shows the "you're ready"
  // success/Proceed state or re-shows the Upgrade CTA if credits are still
  // 0 (e.g. checkout was cancelled, or the webhook hasn't landed yet —
  // see the subscriptionData-watching effect below for that second case).
  // Deliberately does NOT auto-continue straight into project creation —
  // the user confirms via the Proceed button, which is what actually
  // calls startProjectAndRankingFlow() (the single continuation path,
  // reused, not duplicated).
  useEffect(() => {
    if (!autoResumeAttempt) return;
    const attempt = autoResumeAttempt;
    setAutoResumeAttempt(null);
    (async () => {
      const fresh = await refetchSubscription();
      const status = fresh.data?.data?.status;
      const remaining = fresh.data?.data?.credits?.remaining ?? 0;
      pendingAttemptRef.current = attempt;
      if (status === 'active' && remaining > 0) {
        setMessages(m => [...m, {
          type: 'ai',
          text: '✅ Subscription activated successfully!\n\nYou\'re ready to continue creating your first project.',
          showProceedCTA: true,
        }]);
        setFlowState(FLOW_STATES.SUBSCRIPTION_ACTIVATED);
      } else {
        setMessages(m => [...m, {
          type: 'ai',
          text: 'You still have no project credits remaining.\n\nUpgrade to continue creating projects.',
          showUpgradeCTA: true,
        }]);
        setFlowState(FLOW_STATES.NEEDS_UPGRADE);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoResumeAttempt]);

  // Resume-sync fix — the state-machine invariant: it must never be true
  // that the subscription is active with credits available while the UI
  // still shows NEEDS_UPGRADE. The resume effect above makes one check at
  // mount time, which can race the webhook (Stripe's redirect back can
  // beat webhook delivery/processing). Rather than polling or timing out,
  // this effect makes leaving NEEDS_UPGRADE a standing, reactive
  // consequence of subscriptionData itself — it re-evaluates every time
  // subscriptionData changes for ANY reason (the resume effect's own
  // refetch above, or any other refetch of the same shared useSubscription()
  // query elsewhere in the app), and self-corrects the instant fresher data
  // says the subscription is really active. No new fetch is triggered here.
  useEffect(() => {
    if (flowState !== FLOW_STATES.NEEDS_UPGRADE) return;
    const status = subscriptionData?.data?.status;
    const remaining = subscriptionData?.data?.credits?.remaining;
    if (status === 'active' && typeof remaining === 'number' && remaining > 0) {
      setMessages(m => [...m, {
        type: 'ai',
        text: '✅ Subscription activated successfully!\n\nYou\'re ready to continue creating your first project.',
        showProceedCTA: true,
      }]);
      setFlowState(FLOW_STATES.SUBSCRIPTION_ACTIVATED);
    }
  }, [subscriptionData, flowState]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, flowState]);

  // Debug: Log when custom keyword input UI is rendered
  useEffect(() => {
    if (flowState === FLOW_STATES.ASK_CUSTOM_KEYWORDS) {
      // Custom keywords state active
    }
  }, [flowState]);

  // ── Sub-type prompt per business type ────────────────────────────────
  const subTypePrompts = {
    'Service-based': 'Which type of service do you offer? (e.g., IT services, marketing, consulting)',
    'Product-based': 'What type of products do you sell? (e.g., electronics, clothing, furniture)',
    'E-commerce': 'What does your online store specialize in? (e.g., fashion, gadgets, home goods)',
    'Local Business': 'What type of local business is it? (e.g., restaurant, salon, gym)',
    'Agency': 'What kind of agency? (e.g., digital marketing, design, PR)',
    'SaaS / Tech': 'What does your software/product do? (e.g., project management, CRM, analytics)',
  };

  // ── Helpers ──────────────────────────────────────────────────────────
  const generateProjectName = (url) => {
    try {
      const urlObj = new URL(url);
      let hostname = urlObj.hostname.replace('www.', '');
      hostname = hostname.replace(/\./g, '-').replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '-').toLowerCase();
      return hostname.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-') || 'SEO Project';
    } catch {
      return 'SEO Project';
    }
  };

  // ── Business search (UNCHANGED) ─────────────────────────────────────
  const searchBusiness = async (businessName, businessLocation) => {
    setIsSearchingBusiness(true);
    setFlowState(FLOW_STATES.SEARCHING_BUSINESS);

    try {
      const response = await apiService.searchBusiness(businessName, businessLocation);
      if (response.success && response.data) {
        setProjectData(prev => ({ ...prev, businessSearchResults: response.data.results || [] }));
        if (response.data.results?.length > 0) {
          setFlowState(FLOW_STATES.SHOW_BUSINESS_RESULTS);
          setMessages(m => [...m, {
            type: "ai",
            text: `I found ${response.data.results.length} business${response.data.results.length !== 1 ? 'es' : ''}. Is one of these yours?`,
            businessResults: response.data.results
          }]);
        } else {
          // No results → trigger Website Manual Fallback
          setMessages(m => [...m, {
            type: "ai",
            text: "😕 I couldn't find your business in local listings.\n\nNo worries — you can continue by entering your **website URL** instead, and I'll extract your business information from there.",
            showWebsiteFallbackCTA: true
          }]);
          setFlowState(FLOW_STATES.WEBSITE_MANUAL_MODE);
        }
      } else {
        throw new Error(response.message || 'Failed to search');
      }
    } catch (error) {
      setMessages(m => [...m, { type: "ai", text: `I had trouble searching: ${error.message}. What's your business name?` }]);
      setFlowState(FLOW_STATES.ASK_BUSINESS_NAME);
    } finally {
      setIsSearchingBusiness(false);
    }
  };

  // ── Business selection → go to business type (MODIFIED) ─────────────
  const handleBusinessSelection = (business) => {
    // Normalize: ensure verifiedBusiness always has location.{lat,lng}
    const normalizedBusiness = {
      ...business,
      location: business.location || {
        lat: business.lat ?? null,
        lng: business.lng ?? null
      }
    };
    setProjectData(prev => ({
      ...prev,
      verifiedBusiness: normalizedBusiness,
      websiteUrl: normalizedBusiness.website || '',
      location: normalizedBusiness.address || prev.location,
      // Capture country from Google Places so Local SEO path has it
      country: normalizedBusiness.countryCode || prev.country,
      countryName: normalizedBusiness.country || prev.countryName
    }));

    if (business.website) {
      // Has website → skip website step, go straight to business type
      setMessages(m => [...m, {
        type: "ai",
        text: `Great! I found **${business.name}**${business.website ? ` with website ${business.website}` : ''}. Now let's understand your business better.\n\n**What type of business is it?**`
      }]);
      setFlowState(FLOW_STATES.ASK_BUSINESS_TYPE);
    } else {
      // No website → ask for it
      setMessages(m => [...m, {
        type: "ai",
        text: `Great! I found **${business.name}**. I couldn't find a website for your business. What's your website URL?`
      }]);
      setFlowState(FLOW_STATES.ASK_WEBSITE_URL);
    }
  };

  const handleNoneOfThese = () => {
    // "None of these" → trigger Website Manual Fallback
    setMessages(m => [...m, {
      type: "ai",
      text: "No problem! You can continue by entering your **website URL** instead, and I'll extract your business details from there.",
      showWebsiteFallbackCTA: true
    }]);
    setFlowState(FLOW_STATES.WEBSITE_MANUAL_MODE);
  };

  // ── Website Manual Fallback: Enter manual mode ──────────────────────
  const handleContinueWithWebsite = () => {
    setMessages(m => [...m, {
      type: "user", text: "Continue with website"
    }, {
      type: "ai", text: "Great! What's your website URL? (e.g., https://yourbusiness.com)"
    }]);
    setFlowState(FLOW_STATES.ASK_MANUAL_WEBSITE);
  };

  const handleTrySearchAgain = () => {
    setMessages(m => [...m, { type: "ai", text: "Sure! What's your business name?" }]);
    setFlowState(FLOW_STATES.ASK_BUSINESS_NAME);
  };

  // ── Website Manual Fallback: Scrape and extract ─────────────────────
  const handleWebsiteExtraction = async (websiteUrl) => {
    setIsScrapingWebsite(true);
    setFlowState(FLOW_STATES.SCRAPING_WEBSITE);
    setMessages(m => [...m, {
      type: "ai",
      text: "🔍 Analyzing your website...",
      isScrapingProgress: true
    }]);

    try {
      const response = await apiService.extractFromWebsite(websiteUrl);

      if (response.success && response.data) {
        const data = response.data;
        setExtractedData(data);

        // Store the website URL
        setProjectData(prev => ({
          ...prev,
          websiteUrl: websiteUrl,
          businessName: data.businessName || prev.businessName,
          onboardingMode: 'website_manual'
        }));

        setMessages(m => [...m, {
          type: "ai",
          text: `✨ Here's what I found on your website:`,
          extractedDataConfirmation: data
        }]);
        setFlowState(FLOW_STATES.CONFIRM_EXTRACTED_DATA);
      } else {
        throw new Error(response.message || 'Extraction failed');
      }
    } catch (error) {
      console.error('Website extraction failed:', error);
      setMessages(m => [...m, {
        type: "ai",
        text: `⚠️ I had trouble analyzing that website: ${error.message}\n\nPlease check the URL and try again, or enter a different website.`
      }]);
      setFlowState(FLOW_STATES.ASK_MANUAL_WEBSITE);
    } finally {
      setIsScrapingWebsite(false);
    }
  };

  // ── Website Manual Fallback: Confirm extracted data ─────────────────
  const handleConfirmExtractedData = (editedData = null) => {
    const data = editedData || extractedData;
    if (!data) return;

    // Populate projectData with extracted info
    setProjectData(prev => ({
      ...prev,
      businessName: data.businessName || prev.businessName,
      location: data.address || prev.location,
      websiteUrl: data.website || prev.websiteUrl,
      onboardingMode: 'website_manual',
      extractedMetadata: {
        title: data.title,
        description: data.description,
        og_tags: data.ogTags,
        schema_org: data.schemaOrg,
        social_links: data.socialLinks,
        contact_info: {
          email: data.email,
          phone: data.phone,
          address: data.address
        },
        confidence: data.confidence,
        extracted_at: new Date().toISOString()
      }
    }));

    setMessages(m => [...m, {
      type: "user", text: "Confirmed!"
    }, {
      type: "ai",
      text: `Great! I've got **${data.businessName}** set up. Now let's understand your business better.\n\n**What type of business is it?**`
    }]);
    setFlowState(FLOW_STATES.ASK_BUSINESS_TYPE);
  };

  const handleShowMore = () => {
    setMessages(m => [...m, { type: "ai", text: "Let me search for more options..." }]);
  };

  // ── Business type selection handler ─────────────────────────────────
  const handleBusinessTypeSelect = (type) => {
    setProjectData(prev => ({ ...prev, businessType: type, industry: type }));
    setMessages(m => [
      ...m,
      { type: "user", text: type },
      { type: "ai", text: subTypePrompts[type] || 'What specific type of business is it?' }
    ]);
    setFlowState(FLOW_STATES.ASK_SUB_TYPE);
  };

  // ── Priority 2: auto-resolve city from website data (website manual path) ──
  const tryResolveLocalCity = async () => {
    setIsResolvingCity(true);
    // Switch away from ASK_TARGET_LEVEL immediately so its buttons disappear
    setFlowState(FLOW_STATES.GENERATING_KEYWORDS);

    try {
      const address = projectData.location || projectData.businessLocation || null;
      const response = await apiService.resolveWebsiteLocation({
        address,
        extractedMetadata: projectData.extractedMetadata,
      });

      if (response.success && response.data?.city) {
        // Priority 2: city extracted from website metadata / address
        const { city, country } = response.data;
        console.log(`[LOCAL_LOCATION] Website Location Found | city=${city}`);
        setProjectData(prev => ({
          ...prev,
          resolvedCity: city,
          location: prev.location || city,
          ...(country && !prev.country && { country }),
        }));
        generateKeywordsFlow(projectData.subType, address, null, null, null, city);
      } else {
        // Priority 3: ask the user for the city
        console.log('[LOCAL_LOCATION] Website Location Not Found');
        setMessages(m => [...m, {
          type: 'ai',
          text: "I couldn't determine your business location from your website.\n\nSince you've selected **Local SEO**, which city would you like to target?\n\n_Examples: Nashik · New York · London · Sydney_"
        }]);
        setFlowState(FLOW_STATES.ASK_LOCAL_CITY);
      }
    } catch {
      console.log('[LOCAL_LOCATION] Website Location Not Found');
      setMessages(m => [...m, {
        type: 'ai',
        text: "Which city would you like to target for Local SEO?\n\n_Examples: Nashik, New York, London, Sydney_"
      }]);
      setFlowState(FLOW_STATES.ASK_LOCAL_CITY);
    } finally {
      setIsResolvingCity(false);
    }
  };

  // ── Target level selection handler ──────────────────────────────────
  const handleTargetLevelSelect = (level) => {
    setProjectData(prev => ({ ...prev, targetLevel: level }));
    setMessages(m => [
      ...m,
      { type: "user", text: level === 'local' ? 'Local (city-level)' : 'Country level' }
    ]);

    if (level === 'local') {
      if (projectData.verifiedBusiness) {
        // Priority 1: Google Places verified — use confirmed address and coordinates
        console.log('[LOCAL_LOCATION] Google Places Found');
        const location = projectData.verifiedBusiness.address || projectData.businessLocation || null;
        const lat = projectData.verifiedBusiness.location?.lat ?? null;
        const lng = projectData.verifiedBusiness.location?.lng ?? null;
        setFlowState(FLOW_STATES.GENERATING_KEYWORDS);
        generateKeywordsFlow(projectData.subType, location, lat, lng, null, projectData.verifiedBusiness.city || null);
      } else {
        // Website manual fallback — no verified business; try auto-resolution first
        tryResolveLocalCity();
      }
    } else {
      // National SEO: ask user to select target country before generating keywords
      setMessages(m => [...m, {
        type: "ai",
        text: "Which country do you want to target nationally?"
      }]);
      setFlowState(FLOW_STATES.ASK_TARGET_COUNTRY);
    }
  };

  // ── Country selection handler (National SEO) ─────────────────────────
  const [countrySearch, setCountrySearch] = useState('');

  const handleCountrySelect = (code, name) => {
    setProjectData(prev => ({ ...prev, country: code, countryName: name }));
    setMessages(m => [
      ...m,
      { type: "user", text: name }
    ]);
    setCountrySearch('');
    setFlowState(FLOW_STATES.GENERATING_KEYWORDS);
    // Pass code directly to avoid stale closure — setProjectData is async
    generateKeywordsFlow(projectData.subType, null, null, null, code);
  };

  // ── Keyword generation flow ─────────────────────────────────────────
  const generateKeywordsFlow = async (subType, location, lat = null, lng = null, countryOverride = null, city = null) => {
    setIsGeneratingKeywords(true);
    setMessages(m => [...m, { type: "ai", text: "🔍 Finding the best keywords for your business..." }]);

    try {
      const response = await apiService.generateKeywords(
        subType,
        location,
        countryOverride || projectData.country,
        projectData.language,
        lat,
        lng,
        city
      );

      if (response.success && response.data?.keywords?.length > 0) {
        // API returns [{keyword, volume}] objects — extract strings for display and project creation
        const keywords = response.data.keywords.map(k => (typeof k === 'string' ? k : k.keyword));
        setProjectData(prev => ({ ...prev, selectedKeywords: keywords, keywords }));
        setMessages(m => [...m, {
          type: "ai",
          text: `Here are the top keywords I found for your business:`,
          keywordConfirmation: true,
          keywordList: keywords
        }]);
        setFlowState(FLOW_STATES.CONFIRM_KEYWORDS);
      } else {
        throw new Error('No keywords returned');
      }
    } catch (error) {
      console.error('Keyword generation failed:', error);
      setMessages(m => [...m, {
        type: "ai",
        text: `⚠️ I couldn't auto-generate keywords: ${error.message}\n\nPlease enter up to 5 target keywords (comma-separated):`
      }]);
      setFlowState(FLOW_STATES.ASK_CUSTOM_KEYWORDS);
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  // ── Keyword confirmation handler ────────────────────────────────────
  const handleKeywordConfirm = (confirmed) => {
    console.log("🚨 KEYWORD CONFIRM CALLED with:", { confirmed, currentFlowState: flowState });
    
    if (confirmed) {
      console.log("🚨 USER ACCEPTED GENERATED KEYWORDS");
      setMessages(m => [
        ...m,
        { type: "user", text: "Yes, let's go with these!" },
        { type: "ai", text: "✅ Perfect! Setting up your project..." }
      ]);
      // ✅ Pass generated keywords directly to avoid async state issues
      startProjectAndRankingFlow(projectData.selectedKeywords);
    } else {
      console.log("🚨 USER REJECTED GENERATED KEYWORDS - SWITCHING TO CUSTOM INPUT");
      setMessages(m => [
        ...m,
        { type: "user", text: "No, I want different keywords" },
        { type: "ai", text: "No problem! Enter up to 5 target keywords (comma-separated):" }
      ]);
      console.log("🚨 FLOW STATE CHANGING TO:", FLOW_STATES.ASK_CUSTOM_KEYWORDS);
      setFlowState(FLOW_STATES.ASK_CUSTOM_KEYWORDS);
    }
  };

  // ── Phase 3 (Upgrade unification): zero-credit Upgrade CTA handler ────
  // Navigates to the shared Choose Plan page instead of calling checkout
  // directly. The resume payload is written to a STAGING key (not the final
  // ONBOARDING_UPGRADE_RESUME_KEY) — the Choose Plan page is what copies it
  // into the final key, at the exact moment it actually redirects to Stripe
  // or completes a plan change, preserving the original guarantee that the
  // resume flag only ever exists right before a real return-to-onboarding
  // is imminent. See lib/onboardingResume.js.
  const handleUpgradeClick = () => {
    // Synchronous guard — a fast double-click can fire the navigation twice
    // before React re-renders a disabled attribute.
    if (upgradeInFlightRef.current) return;
    upgradeInFlightRef.current = true;
    setIsNavigatingToPlans(true);

    if (typeof window !== 'undefined' && pendingAttemptRef.current) {
      sessionStorage.setItem(ONBOARDING_UPGRADE_PENDING_KEY, JSON.stringify({
        projectData: pendingAttemptRef.current.projectData,
        overrideKeywords: pendingAttemptRef.current.overrideKeywords,
        previousFlowState: previousFlowStateRef.current,
      }));
    }
    router.push('/subscription/plans');
    // No need to reset the ref — the page is navigating away.
  };

  const handleUpgradeBack = () => {
    setMessages(m => [...m, { type: "user", text: "Back" }]);
    setFlowState(previousFlowStateRef.current || FLOW_STATES.ASK_BUSINESS_NAME);
  };

  // ── NON-BLOCKING: Create project → trigger background tasks → redirect ─────
  // projectDataOverride lets the post-checkout auto-resume path (see the
  // autoResumeAttempt effect above) pass the EXACT restored data explicitly,
  // rather than depending on `projectData` React state having already
  // re-rendered by the time this runs — the same stale-closure-avoidance
  // idiom already used elsewhere in this file (e.g. handleCountrySelect).
  const startProjectAndRankingFlow = async (overrideKeywords = null, projectDataOverride = null) => {
    const activeProjectData = projectDataOverride || projectData;
    const cameFromFlowState = flowState;
    const finalKeywords = overrideKeywords || activeProjectData.selectedKeywords || [];

    setIsCreating(true); // disable input immediately, same as before

    // Phase 15.5: fresh, authoritative credit check BEFORE attempting
    // project creation or showing the "Creating your project..." spinner —
    // never trust a cached value here, since this is the moment a credit
    // actually gets consumed. If the check itself fails (network hiccup),
    // fall through and let the backend's own atomic gate
    // (INSUFFICIENT_CREDITS, handled below) be the fallback.
    try {
      const freshSub = await refetchSubscription();
      const remaining = freshSub.data?.data?.credits?.remaining;
      if (typeof remaining === 'number' && remaining <= 0) {
        pendingAttemptRef.current = { overrideKeywords: finalKeywords, projectData: activeProjectData };
        previousFlowStateRef.current = cameFromFlowState;
        setIsCreating(false);
        setMessages(m => [...m, {
          type: 'ai',
          text: 'You have no project credits remaining.\n\nUpgrade to continue creating projects.',
          showUpgradeCTA: true,
        }]);
        setFlowState(FLOW_STATES.NEEDS_UPGRADE);
        return;
      }
    } catch (checkError) {
      console.error('Credit pre-check failed, proceeding to let the backend gate it', checkError);
    }

    setFlowState(FLOW_STATES.CREATING_PROJECT);

    try {
      // 🚨 SAFETY CHECK: Ensure we have keywords
      if (!finalKeywords || finalKeywords.length === 0) {
        console.warn("❌ No keywords found for project creation");
        setMessages(m => [...m, { type: "ai", text: "❌ No keywords available. Please start over." }]);
        setIsCreating(false);
        setFlowState(FLOW_STATES.ASK_BUSINESS_NAME);
        return;
      }

      console.log("🚨 API USING KEYWORDS:", finalKeywords);
      console.log("🚨 KEYWORDS SOURCE:", overrideKeywords ? "CUSTOM (override)" : "STATE (fallback)");

      // STEP 1: Validate & create the project
      const websiteUrl = activeProjectData.websiteUrl;
      try { new URL(websiteUrl); } catch {
        setMessages(m => [...m, { type: "ai", text: "❌ Invalid website URL. Please check and try again." }]);
        setIsCreating(false);
        setFlowState(FLOW_STATES.ASK_WEBSITE_URL);
        return;
      }

      const projectName = generateProjectName(websiteUrl);

      // ✅ FIXED: Use finalKeywords instead of stale state
      const keywordsBeforeAPI = finalKeywords.filter(k => k.trim()).slice(0, 5);
      console.log('🔍 DEBUG: Keywords before API call:', {
        selectedKeywords: activeProjectData.selectedKeywords,
        keywords: activeProjectData.keywords,
        keywordsBeforeAPI,
        keywordsLength: keywordsBeforeAPI.length,
        projectDataState: {
          selectedKeywords: activeProjectData.selectedKeywords,
          keywords: activeProjectData.keywords,
          subType: activeProjectData.subType,
          businessType: activeProjectData.businessType
        }
      });

      // VALIDATION: Final keywords being sent to API
      console.log('🚨 FINAL KEYWORDS SENT TO API:', keywordsBeforeAPI);

      const projectPayload = {
        project_name: projectName,
        main_url: websiteUrl,
        keywords: keywordsBeforeAPI,
        industry: activeProjectData.businessType || activeProjectData.industry,
        location: activeProjectData.verifiedBusiness?.address || activeProjectData.location || '',
        country: activeProjectData.country,
        language: activeProjectData.language,
        status: 'active',
        business_type: activeProjectData.businessType,
        seo_scope: activeProjectData.targetLevel === 'local' ? 'local' : 'national',
        // Website Manual Fallback fields
        onboarding_mode: activeProjectData.onboardingMode || 'google_places',
        discovery_source: activeProjectData.onboardingMode === 'website_manual' ? 'website_scrape' : 'google_places',
        source: activeProjectData.onboardingMode === 'website_manual' ? 'website_manual' : 'web',
        ...(activeProjectData.extractedMetadata && {
          extracted_metadata: activeProjectData.extractedMetadata
        }),
        ...(activeProjectData.verifiedBusiness ? {
          verified_business: {
            placeId: activeProjectData.verifiedBusiness.placeId,
            name: activeProjectData.verifiedBusiness.name,
            address: activeProjectData.verifiedBusiness.address,
            city: activeProjectData.verifiedBusiness.city || null,
            state: activeProjectData.verifiedBusiness.state || null,
            country: activeProjectData.verifiedBusiness.country || null,
            countryCode: activeProjectData.verifiedBusiness.countryCode || null,
            website: activeProjectData.verifiedBusiness.website,
            phone: activeProjectData.verifiedBusiness.phone,
            rating: activeProjectData.verifiedBusiness.rating,
            location: activeProjectData.verifiedBusiness.location,
            verifiedAt: new Date().toISOString()
          }
        } : (activeProjectData.targetLevel === 'local' && activeProjectData.resolvedCity ? {
          verified_business: { city: activeProjectData.resolvedCity }
        } : {}))
      };

      // 🚨 STEP 1: FRONTEND → BACKEND REQUEST
      console.log("🚨 FRONTEND SENDING TO BACKEND:", {
        apiUrl: '/api/projects',
        payloadKeywords: projectPayload.keywords,
        fullPayload: projectPayload,
        payloadString: JSON.stringify(projectPayload)
      });

      console.log('🔍 DEBUG: Project payload being sent:', {
        payloadKeywords: projectPayload.keywords,
        payloadKeywordsString: JSON.stringify(projectPayload.keywords)
      });

      const response = await apiService.createProject(projectPayload);
      if (!response.success) throw new Error(response.message || 'Failed to create project');

      const projectId = response.data?.projectId;
      if (!projectId) throw new Error('Project ID not found in response');

      // deductCredits() just consumed a credit server-side — refetch so the
      // cached subscription data (Settings → Subscription, header, etc.)
      // reflects the new remaining count instead of the pre-creation snapshot.
      refetchSubscription();

      // STEP 2: Trigger background tasks WITHOUT waiting
      // CRITICAL FIX: Pass the actual keywords used in API call to prevent stale closure data
      // Local SEO: pass business coordinates → backend does city-level lookup
      // National SEO: intentionally null → backend falls through to country-level location_code
      // Website manual mode: verifiedBusiness is null; backend uses `location` address string instead (Priority 3 branch)
      const businessLocationData = activeProjectData.targetLevel === 'local' && activeProjectData.verifiedBusiness ? {
        address: activeProjectData.verifiedBusiness.address,
        lat: activeProjectData.verifiedBusiness.location?.lat,
        lng: activeProjectData.verifiedBusiness.location?.lng
      } : null;

      // City for Local SEO: Google Places city (Priority 1) or resolved/user-entered city (Priority 2/3)
      const localCity = activeProjectData.targetLevel === 'local'
        ? (activeProjectData.verifiedBusiness?.city || activeProjectData.resolvedCity || null)
        : null;

      // Log country fallback when Local SEO has no city (website manual + no address parseable)
      if (activeProjectData.targetLevel === 'local' && !localCity && !activeProjectData.verifiedBusiness) {
        console.log('[LOCAL_LOCATION] Country Fallback Used');
      }

      triggerBackgroundTasks(projectId, websiteUrl, keywordsBeforeAPI, businessLocationData, localCity, activeProjectData);

      // STEP 3: Immediate redirect to processing page
      const redirectUrl = `/processing/${projectId}`;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('skipAuthRedirect', 'true');
        sessionStorage.setItem('pendingRedirectUrl', redirectUrl);
      }

      // Redirect immediately
      router.push(redirectUrl);

    } catch (error) {
      // Every billing/subscription-lifecycle rejection the backend can
      // actually return from this endpoint funnels into the exact same
      // Upgrade flow — no separate UI, state, or handler per code.
      // INSUFFICIENT_CREDITS: seoProjectController.js's deductCredits() gate.
      // SUBSCRIPTION_NOT_ACTIVE: seoProjectController.js's canConsumeQuota()
      //   gate (subscriptionLifecycle.js) — this is the ONE code the backend
      //   returns for every non-'active' status (inactive, past_due, paused,
      //   canceled all collapse to it; there is no per-status code to
      //   distinguish them, so none is invented here either).
      if (BILLING_LIFECYCLE_ERROR_CODES.has(error.code)) {
        // Defensive fallback for cases the pre-check above can't fully
        // close — e.g. the last credit was consumed by another tab/session
        // in between the pre-check and this request landing, or the
        // pre-check only checks credits.remaining and can't see a
        // status-only rejection (a past_due/paused/canceled user can still
        // have unused credit balance). The backend's own gate is the real
        // authority here either way.
        pendingAttemptRef.current = { overrideKeywords: finalKeywords, projectData: activeProjectData };
        previousFlowStateRef.current = cameFromFlowState;
        setMessages(m => [...m, {
          type: 'ai',
          text: 'You have no project credits remaining.\n\nUpgrade to continue creating projects.',
          showUpgradeCTA: true,
        }]);
        setFlowState(FLOW_STATES.NEEDS_UPGRADE);
        setIsCreating(false);
        return;
      }
      console.error('Project creation error:', error);
      setMessages(m => [...m, {
        type: "ai",
        text: `❌ Error: ${error.message}. Please try again.`
      }]);
      setIsCreating(false);
    }
  };

  // Resume-sync fix — the Proceed button's handler. Calls
  // startProjectAndRankingFlow() directly: the single, existing
  // continuation path, not a second one. That function's own fresh
  // credit/status pre-check (already in place since Phase 15.5) runs
  // again here too, so if this click happens to still be ahead of the
  // webhook somehow, it correctly falls back to NEEDS_UPGRADE rather than
  // attempting a project creation that would fail server-side.
  const handleProceedClick = () => {
    if (proceedInFlightRef.current) return;
    proceedInFlightRef.current = true;
    const attempt = pendingAttemptRef.current;
    setMessages(m => [...m, { type: "user", text: "Proceed" }]);
    startProjectAndRankingFlow(attempt?.overrideKeywords, attempt?.projectData);
    // No need to reset the ref — startProjectAndRankingFlow immediately
    // sets isCreating(true) and moves flowState off SUBSCRIPTION_ACTIVATED,
    // so the Proceed button is gone on the very next render either way.
  };

  // ── Fire-and-forget background tasks ─────────────────────────────────────
  const triggerBackgroundTasks = async (projectId, websiteUrl, keywords, businessLocation = null, localCity = null, projectDataOverride = null) => {
    const activeProjectData = projectDataOverride || projectData;
    try {
      // STRICT VALIDATION: Ensure keywords are provided
      if (!keywords || keywords.length === 0) {
        throw new Error("Keywords missing in triggerBackgroundTasks");
      }

      // USE ONLY passed keywords - NO fallback logic
      const keywordsForTasks = keywords;

      // Background task 1: Check rankings (non-blocking)
      apiService.checkRanking(
        websiteUrl,
        keywordsForTasks,
        businessLocation || activeProjectData.verifiedBusiness?.address || activeProjectData.location,
        activeProjectData.country,
        activeProjectData.language,
        businessLocation,
        activeProjectData.targetLevel === 'local' ? 'local' : 'national',
        // City name for DataForSEO location resolution (Local SEO only)
        // City name for DataForSEO location resolution (Places city OR resolved/user-entered city)
        activeProjectData.targetLevel === 'local' ? (activeProjectData.verifiedBusiness?.city || localCity || null) : null,
        // Business name for Google Maps API matching (Local SEO only)
        activeProjectData.targetLevel === 'local' ? (activeProjectData.verifiedBusiness?.name || null) : null
      ).then(rankResponse => {
        if (rankResponse.success && rankResponse.data?.results) {
          // Save rankings — carry through all geo context for future refresh reproducibility
          apiService.saveRanking(
            projectId,
            websiteUrl,
            activeProjectData.verifiedBusiness?.address || activeProjectData.location,
            rankResponse.data.results,
            rankResponse.data.location_code ?? null,
            activeProjectData.country,
            activeProjectData.language,
            activeProjectData.targetLevel === 'local' ? 'local' : 'national'
          ).catch(saveError => {
            console.error('Background ranking save failed:', saveError);
          });
        }
      }).catch(rankError => {
        console.error('Background ranking check failed:', rankError);
      });

      // Background task 2: Start audit (non-blocking). The project credit was
      // already spent at project creation — starting an audit never checks
      // or consumes credits, so no credit-specific error can occur here.
      apiService.startAudit(projectId).then(auditResponse => {
        console.log('🔍 DEBUG: Audit start response:', {
          projectId,
          success: auditResponse.success
        });
      }).catch(auditError => {
        console.error('Background audit start failed:', auditError);
      });

    } catch (error) {
      console.error('Background task trigger failed:', error);
    }
  };

  // ── Main send handler ───────────────────────────────────────────────
  function send() {
    if (!input.trim() || isCreating || isStartingAnalysis || isSearchingBusiness || isGeneratingKeywords || isCheckingRankings || isScrapingWebsite) return;

    const userResponse = input.trim();
    const newMsgs = [...messages, { type: "user", text: userResponse }];
    setMessages(newMsgs);
    setInput("");

    setTimeout(() => {
      switch (flowState) {
        case FLOW_STATES.ASK_BUSINESS_NAME:
          setProjectData(prev => ({ ...prev, businessName: userResponse }));
          setMessages(m => [...m, { type: "ai", text: "What's your business location? (city or area)" }]);
          setFlowState(FLOW_STATES.ASK_BUSINESS_LOCATION);
          break;

        case FLOW_STATES.ASK_BUSINESS_LOCATION:
          setProjectData(prev => ({ ...prev, businessLocation: userResponse }));
          searchBusiness(projectData.businessName, userResponse);
          break;

        case FLOW_STATES.ASK_WEBSITE_URL:
          setProjectData(prev => ({ ...prev, websiteUrl: userResponse }));
          setMessages(m => [...m, {
            type: "ai",
            text: "Got it! Now let's understand your business better.\n\n**What type of business is it?**"
          }]);
          setFlowState(FLOW_STATES.ASK_BUSINESS_TYPE);
          break;

        case FLOW_STATES.ASK_MANUAL_WEBSITE: {
          // Validate URL format
          let cleanUrl = userResponse;
          if (!/^https?:\/\//i.test(cleanUrl)) {
            cleanUrl = `https://${cleanUrl}`;
          }
          try {
            new URL(cleanUrl);
          } catch {
            setMessages(m => [...m, { type: "ai", text: "That doesn't look like a valid URL. Please enter a full website address (e.g., https://yourbusiness.com)" }]);
            return;
          }
          handleWebsiteExtraction(cleanUrl);
          break;
        }

        case FLOW_STATES.ASK_SUB_TYPE:
          setProjectData(prev => ({ ...prev, subType: userResponse }));
          setMessages(m => [...m, {
            type: "ai",
            text: `Great — "${userResponse}"! What level of SEO targeting do you need?`
          }]);
          setFlowState(FLOW_STATES.ASK_TARGET_LEVEL);
          break;

        case FLOW_STATES.ASK_CUSTOM_KEYWORDS: {
          console.log("🚨 PROCESSING CUSTOM KEYWORDS - USER RESPONSE:", userResponse);
          
          const keywords = userResponse.split(',').map(k => k.trim()).filter(k => k);
          console.log("🚨 PARSED KEYWORDS (RAW):", keywords);
          
          // Deduplicate
          const unique = [...new Set(keywords.map(k => k.toLowerCase()))].map(k =>
            keywords.find(orig => orig.toLowerCase() === k) || k
          );
          console.log("🚨 PARSED KEYWORDS (UNIQUE):", unique);
          
          if (unique.length === 0) {
            console.log("🚨 NO KEYWORDS ENTERED - SHOWING ERROR");
            setMessages(m => [...m, { type: "ai", text: "Please enter at least one keyword. (comma-separated)" }]);
            return;
          }
          
          const finalKws = unique.slice(0, 5);
          console.log("🚨 SETTING CUSTOM KEYWORDS TO PROJECT DATA:", finalKws);
          
          setProjectData(prev => ({ 
            ...prev, 
            selectedKeywords: finalKws, 
            keywords: finalKws 
          }));
          
          setMessages(m => [...m, {
            type: "ai",
            text: `✅ Got it! Using these keywords:\n\n${finalKws.map((k, i) => `${i + 1}. **${k}**`).join('\n')}\n\nSetting up your project...`
          }]);
          
          console.log("🚨 STARTING PROJECT AND RANKING FLOW WITH CUSTOM KEYWORDS");
          console.log("🚨 PASSING KEYWORDS DIRECTLY TO AVOID ASYNC STATE BUG:", finalKws);
          startProjectAndRankingFlow(finalKws);  // ✅ PASS KEYWORDS DIRECTLY
          break;
        }

        case FLOW_STATES.ASK_LOCAL_CITY: {
          const city = userResponse.trim();
          if (!city) {
            setMessages(m => [...m, { type: 'ai', text: 'Please enter a valid city name.' }]);
            return;
          }
          console.log(`[LOCAL_LOCATION] User Selected City | city=${city}`);
          setProjectData(prev => ({ ...prev, resolvedCity: city, location: prev.location || city }));
          const address = projectData.location || projectData.businessLocation || null;
          setFlowState(FLOW_STATES.GENERATING_KEYWORDS);
          generateKeywordsFlow(projectData.subType, address, null, null, null, city);
          break;
        }

        default:
          break;
      }
    }, 600);
  }

  // ── Render helpers ──────────────────────────────────────────────────

  // Business type selector cards
  const renderBusinessTypeSelector = () => (
    <div className="chat-selector-grid">
      {BUSINESS_TYPES.map(({ label, icon }) => (
        <button
          key={label}
          onClick={() => handleBusinessTypeSelect(label)}
          className="chat-selector-option"
        >
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );

  // Target level selector
  const renderTargetLevelSelector = () => (
    <div className="chat-selector-grid">
      {[
        { key: 'local', label: '📍 Local (city-level)', desc: 'Target your city area' },
        { key: 'country', label: '🌐 Country level', desc: 'Target entire country' }
      ].map(({ key, label, desc }) => (
        <button
          key={key}
          onClick={() => handleTargetLevelSelect(key)}
          className="chat-selector-option"
          style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}
        >
          <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>{desc}</div>
        </button>
      ))}
    </div>
  );

  // Country selector for National SEO targeting
  const renderCountrySelector = () => {
    const filtered = countrySearch.trim()
      ? COUNTRIES.filter(c =>
          c.name.toLowerCase().includes(countrySearch.trim().toLowerCase()) ||
          c.code.toLowerCase().includes(countrySearch.trim().toLowerCase())
        )
      : COUNTRIES;

    return (
      <div style={{ marginTop: 10, width: '100%', minWidth: 0 }}>
        <input
          type="text"
          className="chat-input"
          placeholder="Search country..."
          value={countrySearch}
          onChange={e => setCountrySearch(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
          {filtered.map(({ code, name }) => (
            <button
              key={code}
              onClick={() => handleCountrySelect(code, name)}
              className="chat-selector-option"
            >
              {name} <span style={{ opacity: 0.5, fontSize: 11 }}>({code})</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Loading indicator
  const renderLoadingIndicator = (message) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, opacity: 0.8 }}>
      <div style={{
        width: 20, height: 20,
        border: '2px solid rgba(255,255,255,0.2)',
        borderTop: '2px solid #10b981',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{message}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── Website Manual Fallback: CTA buttons ────────────────────────────
  const renderWebsiteFallbackCTA = () => (
    <div className="chat-selector-grid">
      <button className="chat-selector-option" onClick={handleContinueWithWebsite}>
        <span style={{ fontSize: 16 }}>🌐</span>
        <span>Continue with Website</span>
      </button>
      <button className="chat-selector-option" onClick={handleTrySearchAgain}>
        <span style={{ fontSize: 16 }}>🔄</span>
        <span>Try searching again</span>
      </button>
    </div>
  );

  // ── Phase 15.5: zero-credit Upgrade CTA — same primary/secondary button
  // pair pattern as renderWebsiteFallbackCTA() above, reusing this file's
  // established visual language rather than importing Settings' shadcn
  // Button/Loader2 into a component that otherwise never uses them.
  const renderUpgradeCTA = () => (
    isNavigatingToPlans ? (
      renderLoadingIndicator('Redirecting to plans...')
    ) : (
      <ButtonGroup
        stack
        buttons={[
          { key: 'upgrade', label: 'Upgrade Plan', icon: '⚡', variant: 'primary', onClick: handleUpgradeClick, disabled: isNavigatingToPlans },
          { key: 'back', label: 'Back', icon: '←', variant: 'secondary', onClick: handleUpgradeBack },
        ]}
      />
    )
  );

  // Resume-sync fix — the success/Proceed CTA shown once the subscription
  // is confirmed active with credits available. Single primary button,
  // same visual pattern as the Upgrade Plan button above (and
  // renderWebsiteFallbackCTA before it) — no new button style invented.
  const renderSubscriptionActivatedCTA = () => (
    isCreating ? (
      renderLoadingIndicator('Creating your project...')
    ) : (
      <ButtonGroup
        stack
        buttons={[
          { key: 'proceed', label: 'Proceed', icon: '✅', variant: 'success', onClick: handleProceedClick, disabled: isCreating },
        ]}
      />
    )
  );

  // ── Website Manual Fallback: Scraping progress ─────────────────────
  const renderScrapingProgress = () => (
    <div style={{ marginTop: 12, padding: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 22, height: 22,
          border: '2px solid rgba(255,255,255,0.15)',
          borderTop: '2px solid #8b5cf6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>Analyzing your website...</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          <span style={{ color: '#10b981' }}>✅</span> Connected to website
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          <span style={{ color: '#10b981' }}>✅</span> Reading page metadata
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
          <span>⏳</span> Extracting business information...
        </div>
      </div>
    </div>
  );

  // ── Website Manual Fallback: Extracted data confirmation ────────────
  const renderExtractedDataConfirmation = (data) => {
    if (!data) return null;
    const rows = [
      ['Business', data.businessName, { fontSize: 14, color: '#fff', fontWeight: 500 }],
      ['Address', data.address],
      ['Phone', data.phone],
      ['Email', data.email],
      ['Category', data.category],
    ];
    return (
      <div style={{ marginTop: 12, padding: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(([label, value, valueStyle]) => value && (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, minWidth: 0 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', minWidth: 80, flexShrink: 0 }}>{label}</span>
              <span style={{
                fontSize: 13, color: 'rgba(255,255,255,0.8)', flex: 1, minWidth: 0,
                overflowWrap: 'anywhere', wordBreak: 'break-word',
                ...valueStyle
              }}>{value}</span>
            </div>
          ))}
          {/* Confidence indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Confidence:</span>
            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${data.confidence || 0}%`, height: '100%', background: data.confidence >= 60 ? '#10b981' : data.confidence >= 30 ? '#f59e0b' : '#ef4444', borderRadius: 2, transition: 'width 0.5s ease' }} />
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{data.confidence || 0}%</span>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <ButtonGroup
            buttons={[
              { key: 'confirm', label: 'Looks good!', icon: '✅', variant: 'success', onClick: () => handleConfirmExtractedData() },
              {
                key: 'retry', label: 'Try another URL', icon: '🔄', variant: 'secondary', onClick: () => {
                  setMessages(m => [...m, { type: "ai", text: "No problem! Let me try a different approach. What's your website URL?" }]);
                  setFlowState(FLOW_STATES.ASK_MANUAL_WEBSITE);
                }
              },
            ]}
          />
        </div>
      </div>
    );
  };

  // ── Determine which states hide the text input ──────────────────────
  const hideInputStates = [
    FLOW_STATES.SEARCHING_BUSINESS,
    FLOW_STATES.SHOW_BUSINESS_RESULTS,
    FLOW_STATES.ASK_BUSINESS_TYPE,
    FLOW_STATES.ASK_TARGET_LEVEL,
    FLOW_STATES.ASK_TARGET_COUNTRY,
    FLOW_STATES.GENERATING_KEYWORDS,
    FLOW_STATES.CONFIRM_KEYWORDS,
    FLOW_STATES.CREATING_PROJECT,
    // Website Manual Fallback states
    FLOW_STATES.WEBSITE_MANUAL_MODE,
    FLOW_STATES.SCRAPING_WEBSITE,
    FLOW_STATES.CONFIRM_EXTRACTED_DATA,
    // Phase 15.5
    FLOW_STATES.NEEDS_UPGRADE,
    // Resume-sync fix
    FLOW_STATES.SUBSCRIPTION_ACTIVATED,
  ];

  // ── Render ──────────────────────────────────────────────────────────
  const showInput = !hideInputStates.includes(flowState);

  return (
    <div className="glass-card chat-shell">
      <div className="chat-scroll-area">
        {messages.map((m, i) => (
          <div key={i} className={`chat-message-row ${m.type}`}>
            {m.type === "ai" && <div className="chat-avatar">✦</div>}
            <div className="chat-bubble-group">
              <div
                className={`chat-bubble ${m.type}`}
                dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(m.text) }}
              />

              {/* Action button (currently unused by any flow branch, kept for forward-compat) */}
              {m.action && (
                <ButtonGroup buttons={[{ key: 'action', label: m.action.text, variant: 'primary', onClick: m.action.onClick }]} />
              )}

              {/* Business results (UNCHANGED) */}
              {m.businessResults && flowState === FLOW_STATES.SHOW_BUSINESS_RESULTS && (
                <BusinessResultsList
                  results={m.businessResults}
                  onSelect={handleBusinessSelection}
                  onShowMore={handleShowMore}
                  onNone={handleNoneOfThese}
                  searchQuery={`${projectData.businessName} in ${projectData.businessLocation}`}
                  isLoading={false}
                />
              )}

              {/* Keyword recommendation card */}
              {m.keywordConfirmation && flowState === FLOW_STATES.CONFIRM_KEYWORDS && (
                <KeywordRecommendationCard
                  keywords={m.keywordList || []}
                  onConfirm={() => handleKeywordConfirm(true)}
                  onEnterOwn={() => handleKeywordConfirm(false)}
                />
              )}

              {/* Website fallback CTA buttons (NEW) */}
              {m.showWebsiteFallbackCTA && flowState === FLOW_STATES.WEBSITE_MANUAL_MODE && renderWebsiteFallbackCTA()}

              {/* Zero-credit Upgrade CTA (Phase 15.5) */}
              {m.showUpgradeCTA && flowState === FLOW_STATES.NEEDS_UPGRADE && renderUpgradeCTA()}

              {/* Resume-sync fix */}
              {m.showProceedCTA && flowState === FLOW_STATES.SUBSCRIPTION_ACTIVATED && renderSubscriptionActivatedCTA()}

              {/* Scraping progress indicator (NEW) */}
              {m.isScrapingProgress && flowState === FLOW_STATES.SCRAPING_WEBSITE && renderScrapingProgress()}

              {/* Extracted data confirmation card (NEW) */}
              {m.extractedDataConfirmation && flowState === FLOW_STATES.CONFIRM_EXTRACTED_DATA && renderExtractedDataConfirmation(m.extractedDataConfirmation)}
            </div>
          </div>
        ))}

        {/* Business search loading (UNCHANGED) */}
        {flowState === FLOW_STATES.SEARCHING_BUSINESS && (
          <div className="chat-message-row ai">
            <div className="chat-avatar">✦</div>
            <div className="chat-bubble-group">
              <BusinessResultsList
                results={[]}
                onSelect={handleBusinessSelection}
                onShowMore={handleShowMore}
                onNone={handleNoneOfThese}
                searchQuery={`${projectData.businessName} in ${projectData.businessLocation}`}
                isLoading={true}
              />
            </div>
          </div>
        )}

        {/* Business type selector */}
        {flowState === FLOW_STATES.ASK_BUSINESS_TYPE && renderBusinessTypeSelector()}

        {/* Target level selector */}
        {flowState === FLOW_STATES.ASK_TARGET_LEVEL && renderTargetLevelSelector()}

        {/* Country selector (National SEO) */}
        {flowState === FLOW_STATES.ASK_TARGET_COUNTRY && renderCountrySelector()}

        {/* Loading states */}
        {flowState === FLOW_STATES.GENERATING_KEYWORDS && renderLoadingIndicator('Finding keywords...')}
        {flowState === FLOW_STATES.CREATING_PROJECT && renderLoadingIndicator('Creating your project...')}
        {/* REMOVED: CHECKING_RANKINGS, SAVING_RANKINGS loading indicators (now non-blocking) */}

        <div ref={chatEndRef} />
      </div>

      {/* Text input — hidden during button/loading states, always below the scroll area */}
      {showInput && (
        <div className="chat-input-row">
          <input
            className="chat-input"
            placeholder={
              flowState === FLOW_STATES.ASK_BUSINESS_NAME ? "Enter your business name..." :
              flowState === FLOW_STATES.ASK_BUSINESS_LOCATION ? "Enter city or area..." :
              flowState === FLOW_STATES.ASK_WEBSITE_URL ? "https://yourwebsite.com" :
              flowState === FLOW_STATES.ASK_MANUAL_WEBSITE ? "https://yourbusiness.com" :
              flowState === FLOW_STATES.ASK_SUB_TYPE ? "e.g., IT services, digital marketing..." :
              flowState === FLOW_STATES.ASK_LOCAL_CITY ? "e.g., Nashik, New York, London..." :
              flowState === FLOW_STATES.ASK_CUSTOM_KEYWORDS ? "keyword1, keyword2, keyword3..." :
              "Type your answer..."
            }
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                send();
              }
            }}
            disabled={isCreating || isStartingAnalysis || isSearchingBusiness || isGeneratingKeywords || isCheckingRankings || isScrapingWebsite || isResolvingCity}
          />
          <button
            onClick={send}
            disabled={!input.trim() || isCreating || isStartingAnalysis || isSearchingBusiness || isGeneratingKeywords || isCheckingRankings || isScrapingWebsite}
            className="chat-send"
          >
            {isCheckingRankings ? '📊' : isGeneratingKeywords ? '🔍' : isStartingAnalysis ? '🔄' : isCreating ? '⏳' : isSearchingBusiness ? '🔍' : '➤'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ARIAChat;
