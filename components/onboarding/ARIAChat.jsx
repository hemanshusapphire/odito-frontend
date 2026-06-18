"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/apiService';
import BusinessResultsList from '@/components/business/BusinessResultsList.jsx';
import { renderInlineMarkdown } from '@/lib/security/sanitize';

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
    GENERATING_KEYWORDS: 'GENERATING_KEYWORDS',
    CONFIRM_KEYWORDS: 'CONFIRM_KEYWORDS',
    ASK_CUSTOM_KEYWORDS: 'ASK_CUSTOM_KEYWORDS',

    // Phase 4: Project creation → Ranking → Save
    CREATING_PROJECT: 'CREATING_PROJECT',
    CHECKING_RANKINGS: 'CHECKING_RANKINGS',
    SAVING_RANKINGS: 'SAVING_RANKINGS',
    SHOW_RANKING_RESULTS: 'SHOW_RANKING_RESULTS',
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
    { label: 'Local Business', icon: '📍' },
    { label: 'Agency', icon: '🏢' },
    { label: 'SaaS / Tech', icon: '💻' },
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
    extractedMetadata: null
  });

  const chatEndRef = useRef(null);
  const router = useRouter();

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

  // ── Target level selection handler ──────────────────────────────────
  const handleTargetLevelSelect = (level) => {
    setProjectData(prev => ({ ...prev, targetLevel: level }));
    setMessages(m => [
      ...m,
      { type: "user", text: level === 'local' ? 'Local (city-level)' : 'Country level' }
    ]);

    if (level === 'local') {
      // Local SEO: use business coordinates for city-level DataForSEO location code
      const location = projectData.verifiedBusiness?.address || projectData.businessLocation || null;
      const lat = projectData.verifiedBusiness?.location?.lat ?? null;
      const lng = projectData.verifiedBusiness?.location?.lng ?? null;
      setFlowState(FLOW_STATES.GENERATING_KEYWORDS);
      generateKeywordsFlow(projectData.subType, location, lat, lng);
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
  const generateKeywordsFlow = async (subType, location, lat = null, lng = null, countryOverride = null) => {
    setIsGeneratingKeywords(true);
    setMessages(m => [...m, { type: "ai", text: "🔍 Finding the best keywords for your business..." }]);

    try {
      const response = await apiService.generateKeywords(
        subType,
        location,
        countryOverride || projectData.country,
        projectData.language,
        lat,
        lng
      );

      if (response.success && response.data?.keywords?.length > 0) {
        const keywords = response.data.keywords;
        setProjectData(prev => ({ ...prev, selectedKeywords: keywords, keywords }));
        setMessages(m => [...m, {
          type: "ai",
          text: `Here are the top keywords I found:\n\n${keywords.map((k, i) => `${i + 1}. **${k}**`).join('\n')}\n\nDo you want to go with these?`,
          keywordConfirmation: true
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

  // ── NON-BLOCKING: Create project → trigger background tasks → redirect ─────
  const startProjectAndRankingFlow = async (overrideKeywords = null) => {
    setFlowState(FLOW_STATES.CREATING_PROJECT);
    setIsCreating(true);

    try {
      // ✅ STEP 0: Use override keywords or fall back to state
      const finalKeywords = overrideKeywords || projectData.selectedKeywords || [];
      
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
      const websiteUrl = projectData.websiteUrl;
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
        selectedKeywords: projectData.selectedKeywords,
        keywords: projectData.keywords,
        keywordsBeforeAPI,
        keywordsLength: keywordsBeforeAPI.length,
        projectDataState: {
          selectedKeywords: projectData.selectedKeywords,
          keywords: projectData.keywords,
          subType: projectData.subType,
          businessType: projectData.businessType
        }
      });

      // VALIDATION: Final keywords being sent to API
      console.log('🚨 FINAL KEYWORDS SENT TO API:', keywordsBeforeAPI);

      const projectPayload = {
        project_name: projectName,
        main_url: websiteUrl,
        keywords: keywordsBeforeAPI,
        industry: projectData.businessType || projectData.industry,
        location: projectData.verifiedBusiness?.address || projectData.location || '',
        country: projectData.country,
        language: projectData.language,
        status: 'active',
        business_type: projectData.businessType,
        seo_scope: projectData.targetLevel === 'local' ? 'local' : 'national',
        // Website Manual Fallback fields
        onboarding_mode: projectData.onboardingMode || 'google_places',
        discovery_source: projectData.onboardingMode === 'website_manual' ? 'website_scrape' : 'google_places',
        source: projectData.onboardingMode === 'website_manual' ? 'website_manual' : 'web',
        ...(projectData.extractedMetadata && {
          extracted_metadata: projectData.extractedMetadata
        }),
        ...(projectData.verifiedBusiness && {
          verified_business: {
            placeId: projectData.verifiedBusiness.placeId,
            name: projectData.verifiedBusiness.name,
            address: projectData.verifiedBusiness.address,
            city: projectData.verifiedBusiness.city || null,
            state: projectData.verifiedBusiness.state || null,
            country: projectData.verifiedBusiness.country || null,
            countryCode: projectData.verifiedBusiness.countryCode || null,
            website: projectData.verifiedBusiness.website,
            phone: projectData.verifiedBusiness.phone,
            rating: projectData.verifiedBusiness.rating,
            location: projectData.verifiedBusiness.location,
            verifiedAt: new Date().toISOString()
          }
        })
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

      console.log('🔍 DEBUG: Project created successfully:', {
        projectId,
        responseKeywords: response.data?.project?.keywords
      });

      // STEP 2: Trigger background tasks WITHOUT waiting
      // CRITICAL FIX: Pass the actual keywords used in API call to prevent stale closure data
      console.log('🚨 API KEYWORDS (CALLER):', keywordsBeforeAPI);
      
      // Local SEO: pass business coordinates → backend does Haversine city-level lookup
      // National SEO: intentionally null → backend falls through to country-level location_code
      const businessLocationData = projectData.targetLevel === 'local' && projectData.verifiedBusiness ? {
        address: projectData.verifiedBusiness.address,
        lat: projectData.verifiedBusiness.location?.lat,
        lng: projectData.verifiedBusiness.location?.lng
      } : null;
      
      console.log('🚨 BUSINESS LOCATION FOR MAPPING:', businessLocationData);
      triggerBackgroundTasks(projectId, websiteUrl, keywordsBeforeAPI, businessLocationData);

      // STEP 3: Immediate redirect to processing page
      const redirectUrl = `/processing/${projectId}`;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('skipAuthRedirect', 'true');
        sessionStorage.setItem('pendingRedirectUrl', redirectUrl);
      }

      // Redirect immediately
      router.push(redirectUrl);

    } catch (error) {
      console.error('Project creation error:', error);
      setMessages(m => [...m, {
        type: "ai",
        text: `❌ Error: ${error.message}. Please try again.`
      }]);
      setIsCreating(false);
    }
  };

  // ── Fire-and-forget background tasks ─────────────────────────────────────
  const triggerBackgroundTasks = async (projectId, websiteUrl, keywords, businessLocation = null) => {
    try {
      // STRICT VALIDATION: Ensure keywords are provided
      if (!keywords || keywords.length === 0) {
        throw new Error("Keywords missing in triggerBackgroundTasks");
      }

      // USE ONLY passed keywords - NO fallback logic
      const keywordsForTasks = keywords;
      
      console.log('🚨 API KEYWORDS:', keywords);
      console.log('🚨 TASK KEYWORDS:', keywordsForTasks);
      console.log('🔍 DEBUG: Keywords at background task start:', {
        projectId,
        keywordsForTasks,
        keywordsString: JSON.stringify(keywordsForTasks),
        source: 'passed_parameter_only'
      });

      // Background task 1: Check rankings (non-blocking)
      console.log('🚨 CALLING CHECK RANKING WITH BUSINESS LOCATION:', businessLocation);
      
      apiService.checkRanking(
        websiteUrl,
        keywordsForTasks,
        businessLocation || projectData.verifiedBusiness?.address || projectData.location,
        projectData.country,
        projectData.language,
        businessLocation,
        projectData.targetLevel === 'local' ? 'local' : 'national',
        // City name for keyword city-suffix (Local SEO only); from Google Places addressComponents
        projectData.targetLevel === 'local' ? (projectData.verifiedBusiness?.city || null) : null
      ).then(rankResponse => {
        console.log('🔍 DEBUG: Ranking check response:', {
          projectId,
          success: rankResponse.success,
          keywordsUsed: keywordsForTasks,
          results: rankResponse.data?.results
        });
        
        if (rankResponse.success && rankResponse.data?.results) {
          // Save rankings — carry through all geo context for future refresh reproducibility
          apiService.saveRanking(
            projectId,
            websiteUrl,
            projectData.verifiedBusiness?.address || projectData.location,
            rankResponse.data.results,
            rankResponse.data.location_code ?? null,
            projectData.country,
            projectData.language,
            projectData.targetLevel === 'local' ? 'local' : 'national'
          ).then(saveResponse => {
            console.log('🔍 DEBUG: Ranking save response:', {
              projectId,
              success: saveResponse.success,
              keywordsSaved: keywordsForTasks
            });
          }).catch(saveError => {
            console.error('Background ranking save failed:', saveError);
          });
        }
      }).catch(rankError => {
        console.error('Background ranking check failed:', rankError);
      });

      // Background task 2: Start audit (non-blocking, 1 credit per audit)
      apiService.startAudit(projectId).then(auditResponse => {
        console.log('🔍 DEBUG: Audit start response:', {
          projectId,
          success: auditResponse.success
        });
      }).catch(auditError => {
        // Surface credit errors clearly — don't silently swallow
        const errorMessage = auditError?.message || '';
        if (errorMessage.includes('credits') || errorMessage.includes('INSUFFICIENT')) {
          console.warn('⚠️ Audit start failed due to insufficient credits:', { projectId, error: errorMessage });
        } else {
          console.error('Background audit start failed:', auditError);
        }
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

        default:
          break;
      }
    }, 600);
  }

  // ── Render helpers ──────────────────────────────────────────────────

  // Business type selector cards
  const renderBusinessTypeSelector = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 10, maxWidth: '100%' }}>
      {BUSINESS_TYPES.map(({ label, icon }) => (
        <button
          key={label}
          onClick={() => handleBusinessTypeSelect(label)}
          style={{
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            color: '#fff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            textAlign: 'left',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );

  // Target level selector
  const renderTargetLevelSelector = () => (
    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
      {[
        { key: 'local', label: '📍 Local (city-level)', desc: 'Target your city area' },
        { key: 'country', label: '🌐 Country level', desc: 'Target entire country' }
      ].map(({ key, label, desc }) => (
        <button
          key={key}
          onClick={() => handleTargetLevelSelect(key)}
          style={{
            flex: 1,
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            color: '#fff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            textAlign: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{desc}</div>
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
      <div style={{ marginTop: 10 }}>
        <input
          type="text"
          placeholder="Search country..."
          value={countrySearch}
          onChange={e => setCountrySearch(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            color: '#fff',
            fontSize: 13,
            marginBottom: 8,
            boxSizing: 'border-box'
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
          {filtered.map(({ code, name }) => (
            <button
              key={code}
              onClick={() => handleCountrySelect(code, name)}
              style={{
                padding: '9px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                color: '#fff',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
            >
              {name} <span style={{ opacity: 0.5, fontSize: 11 }}>({code})</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Keyword confirm buttons
  const renderKeywordConfirmButtons = () => (
    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
      <button
        onClick={() => handleKeywordConfirm(true)}
        style={{
          flex: 1, padding: '10px 16px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#fff', border: 'none', borderRadius: 8,
          cursor: 'pointer', fontWeight: 600, fontSize: 14,
          transition: 'all 0.2s ease'
        }}
      >
        ✅ Yes, use these
      </button>
      <button
        onClick={() => {
          console.log("🚨 ENTER MY OWN BUTTON CLICKED!");
          handleKeywordConfirm(false);
        }}
        style={{
          flex: 1, padding: '10px 16px',
          background: 'rgba(255,255,255,0.08)',
          color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
          cursor: 'pointer', fontWeight: 500, fontSize: 14,
          transition: 'all 0.2s ease'
        }}
      >
        ✏️ Enter my own
      </button>
    </div>
  );

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
      <button
        onClick={handleContinueWithWebsite}
        style={{
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff', border: 'none', borderRadius: 10,
          cursor: 'pointer', fontWeight: 600, fontSize: 14,
          transition: 'all 0.2s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <span style={{ fontSize: 16 }}>🌐</span> Continue with Website
      </button>
      <button
        onClick={handleTrySearchAgain}
        style={{
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
          cursor: 'pointer', fontWeight: 500, fontSize: 13,
          transition: 'all 0.2s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
      >
        🔄 Try searching again
      </button>
    </div>
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
    return (
      <div style={{ marginTop: 12, padding: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.businessName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', minWidth: 80 }}>Business</span>
              <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{data.businessName}</span>
            </div>
          )}
          {data.address && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', minWidth: 80 }}>Address</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{data.address}</span>
            </div>
          )}
          {data.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', minWidth: 80 }}>Phone</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{data.phone}</span>
            </div>
          )}
          {data.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', minWidth: 80 }}>Email</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{data.email}</span>
            </div>
          )}
          {data.category && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', minWidth: 80 }}>Category</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{data.category}</span>
            </div>
          )}
          {/* Confidence indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Confidence:</span>
            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${data.confidence || 0}%`, height: '100%', background: data.confidence >= 60 ? '#10b981' : data.confidence >= 30 ? '#f59e0b' : '#ef4444', borderRadius: 2, transition: 'width 0.5s ease' }} />
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{data.confidence || 0}%</span>
          </div>
        </div>
        {/* Confirm / Edit buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button
            onClick={() => handleConfirmExtractedData()}
            style={{
              flex: 1, padding: '10px 16px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff', border: 'none', borderRadius: 8,
              cursor: 'pointer', fontWeight: 600, fontSize: 13,
              transition: 'all 0.2s ease'
            }}
          >
            ✅ Looks good!
          </button>
          <button
            onClick={() => {
              setMessages(m => [...m, { type: "ai", text: "No problem! Let me try a different approach. What's your website URL?" }]);
              setFlowState(FLOW_STATES.ASK_MANUAL_WEBSITE);
            }}
            style={{
              flex: 1, padding: '10px 16px',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
              cursor: 'pointer', fontWeight: 500, fontSize: 13,
              transition: 'all 0.2s ease'
            }}
          >
            🔄 Try another URL
          </button>
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
  ];

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="glass-card" style={{ width: "100%", maxWidth: 520, padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.type === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            {m.type === "ai" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--grad1)", display: "grid", placeItems: "center", fontSize: 12, marginRight: 8, flexShrink: 0, marginTop: 4 }}>✦</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", maxWidth: "80%" }}>
              <div 
                className={`chat-bubble ${m.type}`}
                style={{ 
                  whiteSpace: 'pre-line',
                  ...({}) 
                }}
                dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(m.text) }}
              />

              {/* Action button */}
              {m.action && (
                <button
                  onClick={m.action.onClick}
                  style={{
                    marginTop: 8, padding: "8px 16px",
                    backgroundColor: "var(--grad1)", color: "white",
                    border: "none", borderRadius: "6px",
                    cursor: "pointer", fontSize: "14px", fontWeight: "500",
                    alignSelf: "flex-start"
                  }}
                >
                  {m.action.text}
                </button>
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

              {/* Keyword confirmation buttons */}
              {m.keywordConfirmation && flowState === FLOW_STATES.CONFIRM_KEYWORDS && renderKeywordConfirmButtons()}

              {/* Website fallback CTA buttons (NEW) */}
              {m.showWebsiteFallbackCTA && flowState === FLOW_STATES.WEBSITE_MANUAL_MODE && renderWebsiteFallbackCTA()}

              {/* Scraping progress indicator (NEW) */}
              {m.isScrapingProgress && flowState === FLOW_STATES.SCRAPING_WEBSITE && renderScrapingProgress()}

              {/* Extracted data confirmation card (NEW) */}
              {m.extractedDataConfirmation && flowState === FLOW_STATES.CONFIRM_EXTRACTED_DATA && renderExtractedDataConfirmation(m.extractedDataConfirmation)}
            </div>
          </div>
        ))}

        {/* Business search loading (UNCHANGED) */}
        {flowState === FLOW_STATES.SEARCHING_BUSINESS && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--grad1)", display: "grid", placeItems: "center", fontSize: 12, marginRight: 8, flexShrink: 0, marginTop: 4 }}>✦</div>
            <div style={{ display: "flex", flexDirection: "column", maxWidth: "80%" }}>
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

      {/* Text input — hidden during button/loading states */}
      {(() => {
        return !hideInputStates.includes(flowState);
      })() && (
        <>
          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder={
                flowState === FLOW_STATES.ASK_BUSINESS_NAME ? "Enter your business name..." :
                flowState === FLOW_STATES.ASK_BUSINESS_LOCATION ? "Enter city or area..." :
                flowState === FLOW_STATES.ASK_WEBSITE_URL ? "https://yourwebsite.com" :
                flowState === FLOW_STATES.ASK_MANUAL_WEBSITE ? "https://yourbusiness.com" :
                flowState === FLOW_STATES.ASK_SUB_TYPE ? "e.g., IT services, digital marketing..." :
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
              disabled={isCreating || isStartingAnalysis || isSearchingBusiness || isGeneratingKeywords || isCheckingRankings || isScrapingWebsite}
            />
            <button
              onClick={send}
              disabled={!input.trim() || isCreating || isStartingAnalysis || isSearchingBusiness || isGeneratingKeywords || isCheckingRankings || isScrapingWebsite}
              className="chat-send-btn"
            >
              {isCheckingRankings ? '📊' : isGeneratingKeywords ? '🔍' : isStartingAnalysis ? '🔄' : isCreating ? '⏳' : isSearchingBusiness ? '🔍' : '➤'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ARIAChat;
