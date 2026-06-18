import API_BASE_URL from "@/lib/apiConfig";

class ApiService {

  constructor() {

    this.baseURL = API_BASE_URL;

  }


  // Helper method to handle API responses

  async handleResponse(response) {

    const data = await response.json();

    if (!response.ok) {

      throw new Error(data.message || 'Something went wrong');

    }



    // Return the response as-is — callers are responsible for reading their own shape
    if (data.success) {
      return data;
    }



    return data;

  }



  // Generic request method with authentication

  async request(endpoint, options = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const config = {

      headers: {

        'Content-Type': 'application/json',

        ...(token && { Authorization: `Bearer ${token}` }),

        ...options.headers,

      },

      ...options,

    };



    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    return this.handleResponse(response);

  }



  // Generic POST method for axios-like compatibility

  async post(endpoint, data = {}) {

    return this.request(endpoint, {

      method: 'POST',

      body: JSON.stringify(data)

    });

  }



  // Generic GET method for axios-like compatibility

  async get(endpoint) {

    return this.request(endpoint, {

      method: 'GET'

    });

  }



  // Authentication endpoints

  async register(userData) {

    return this.request('/auth/register', {

      method: 'POST',

      body: JSON.stringify(userData),

    });

  }



  async login(email, password, rememberMe = false) {

    return this.request('/auth/login', {

      method: 'POST',

      body: JSON.stringify({ email, password, rememberMe }),

    });

  }



  async logout() {

    return this.request('/auth/logout', {

      method: 'POST',

    });

  }



  async getProfile() {

    return this.request('/auth/profile');

  }



  async verifyEmailOTP(email, otp) {

    return this.request('/auth/verify-email-otp', {

      method: 'POST',

      body: JSON.stringify({ email, otp }),

    });

  }



  async generateEmailOTP(email) {

    return this.request('/auth/generate-email-otp', {

      method: 'POST',

      body: JSON.stringify({ email }),

    });

  }



  async resendVerificationEmail(email) {

    return this.request('/auth/resend-verification', {

      method: 'POST',

      body: JSON.stringify({ email }),

    });

  }



  // Project endpoints

  async getProjects(page = 1, limit = 10) {

    return this.request(`/app_user/projects?page=${page}&limit=${limit}`);

  }



  async getProjectById(projectId) {

    const endpoint = `/app_user/projects/${projectId}`;

    return this.request(endpoint);

  }



  async createProject(projectData) {

    return this.request('/app_user/projects', {

      method: 'POST',

      body: JSON.stringify(projectData)

    });

  }



  async updateProject(projectId, projectData) {

    return this.request(`/app_user/projects/${projectId}`, {

      method: 'PUT',

      body: JSON.stringify(projectData)

    });

  }



  async deleteProject(projectId) {

    return this.request(`/app_user/projects/${projectId}`, {

      method: 'DELETE'

    });

  }



  // Audit endpoints

  async startAudit(projectId) {

    const endpoint = '/seo/start-scraping';

    const payload = { project_id: projectId };

    console.log('🚀 Starting audit request:', { endpoint, payload });



    try {

      const response = await this.request(endpoint, {

        method: 'POST',

        body: JSON.stringify(payload)

      });

      console.log('✅ Audit start response:', response);

      return response;

    } catch (error) {

      console.error('❌ Audit start error:', error);

      throw error;

    }

  }



  async startVerification(projectId) {

    const endpoint = '/seo/start-verification';

    const payload = { project_id: projectId };

    console.log('⚡ Starting Quick Recheck request:', { endpoint, payload });

    try {

      const response = await this.request(endpoint, {

        method: 'POST',

        body: JSON.stringify(payload)

      });

      console.log('✅ Quick Recheck start response:', response);

      return response;

    } catch (error) {

      console.error('❌ Quick Recheck start error:', error);

      throw error;

    }

  }



  async getAuditStatus(projectId) {

    return this.request(`/seo/scraping-status/${projectId}`);

  }



  async cancelAudit(projectId, jobId) {

    return this.request('/seo/cancel-audit', {

      method: 'POST',

      body: JSON.stringify({ project_id: projectId, job_id: jobId })

    });

  }



  // AI Visibility endpoints

  async startAiVisibility(projectId) {

    const endpoint = '/ai-visibility/start';

    const payload = { project_id: projectId };

    console.log('🚀 Starting AI Visibility request:', { endpoint, payload });



    try {

      const response = await this.request(endpoint, {

        method: 'POST',

        body: JSON.stringify(payload)

      });

      console.log('✅ AI Visibility start response:', response);

      return response;

    } catch (error) {

      console.error('❌ AI Visibility start error:', error);

      throw error;

    }

  }



  // Get AI visibility entity graph

  async getAIVisibilityEntityGraph(projectId) {

    const endpoint = `/app_user/projects/${projectId}/ai-visibility/entity-graph`;

    console.log('🔍 Getting AI visibility entity graph:', { endpoint, projectId });



    try {

      const response = await this.request(endpoint);

      console.log('✅ AI visibility entity graph response:', response);

      return response;

    } catch (error) {

      console.error('❌ AI visibility entity graph error:', error);

      throw error;

    }

  }



  // Get AI Search Audit metrics

  async getAISearchAudit(projectId) {

    const endpoint = `/ai-visibility/projects/${projectId}/ai-search-audit`;

    try {
      const response = await this.request(endpoint);
      return response;
    } catch (error) {
      throw error;

    }

  }



  // Get AI Search Audit issue details

  async getAISearchAuditIssue(projectId, issueId) {

    const endpoint = `/ai-visibility/projects/${projectId}/ai-search-audit/issues/${issueId}`;

    try {
      const response = await this.request(endpoint);
      return response;
    } catch (error) {
      throw error;

    }

  }



  // Get AI Search Audit issues list

  async getAISearchAuditIssues(projectId) {

    const endpoint = `/ai-visibility/projects/${projectId}/ai-search-audit/issues`;

    try {
      const response = await this.request(endpoint);
      return response;
    } catch (error) {
      throw error;

    }

  }



  // Get AI Search Audit issue affected pages

  async getAISearchAuditIssuePages(projectId, issueId, options = {}) {

    const { page = 1, limit = 50 } = options;

    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });

    const endpoint = `/ai-visibility/projects/${projectId}/ai-search-audit/issues/${issueId}/affected-pages?${params}`;

    try {
      const response = await this.request(endpoint);
      return response;
    } catch (error) {
      throw error;

    }

  }



  // Get AEO Hub aggregated data (metrics + issues scoped to AEO categories)
  async getAEOHubData(projectId) {
    const endpoint = `/ai-visibility/projects/${projectId}/aeo-hub`;
    try {
      const response = await this.request(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get AI visibility page details

  async getAIVisibilityPage(projectId, url) {

    const encodedUrl = encodeURIComponent(url);

    const endpoint = `/app_user/projects/${projectId}/ai-visibility/page?url=${encodedUrl}`;



    console.log('🔍 Getting AI visibility page details:', { endpoint, projectId, url });



    try {

      const response = await this.request(endpoint);

      console.log('✅ AI visibility page response:', response);

      return response;

    } catch (error) {

      console.error('❌ AI visibility page error:', error);

      throw error;

    }

  }



  // Get AI visibility pages with pagination and filters

  async getAIVisibilityPages(projectId, params = {}) {

    const queryString = new URLSearchParams(params).toString();

    const endpoint = queryString

      ? `/app_user/projects/${projectId}/ai-visibility/pages?${queryString}`

      : `/app_user/projects/${projectId}/ai-visibility/pages`;



    console.log('🔍 Getting AI visibility pages:', { endpoint, projectId, params });



    try {

      const response = await this.request(endpoint);

      console.log('✅ AI visibility pages response:', response);

      return response;

    } catch (error) {

      console.error('❌ AI visibility pages error:', error);

      throw error;

    }

  }



  // Get AI visibility worst pages

  async getAIVisibilityWorstPages(projectId, limit = 5) {

    const endpoint = `/app_user/projects/${projectId}/ai-visibility/worst-pages?limit=${limit}`;

    console.log('🔍 Getting AI visibility worst pages:', { endpoint, projectId, limit });



    try {

      const response = await this.request(endpoint);

      console.log('✅ AI visibility worst pages response:', response);

      return response;

    } catch (error) {

      console.error('❌ AI visibility worst pages error:', error);

      throw error;

    }

  }



  // Project issues endpoints

  async getProjectIssues(projectId, filters = {}) {

    const { category, severity, search } = filters;

    const params = new URLSearchParams();



    if (category) params.append('category', category);

    if (severity) params.append('severity', severity);

    if (search) params.append('search', search);



    const queryString = params.toString();

    const endpoint = `/app_user/projects/${projectId}/issues${queryString ? '?' + queryString : ''}`;

    return this.request(endpoint);

  }



  // Project subpages endpoints

  async getProjectSubpages(projectId, filters = {}) {

    const { filter, search, sortBy, sortOrder, page = 1, limit = 50 } = filters;

    const params = new URLSearchParams();



    if (filter) params.append('filter', filter);

    if (search) params.append('search', search);

    if (sortBy) params.append('sortBy', sortBy);

    if (sortOrder) params.append('sortOrder', sortOrder);

    if (page) params.append('page', page);

    if (limit) params.append('limit', limit);



    const queryString = params.toString();

    const endpoint = `/app_user/projects/${projectId}/pages${queryString ? '?' + queryString : ''}`;

    return this.request(endpoint);

  }



  // Get AI visibility page issues

  async getAIVisibilityPageIssues(projectId, pageUrl) {

    const params = new URLSearchParams();

    if (pageUrl) params.append('page_url', pageUrl);



    const queryString = params.toString();

    const endpoint = `/ai-visibility/projects/${projectId}/page-issues${queryString ? '?' + queryString : ''}`;

    return this.request(endpoint);

  }



  // Page issues endpoints

  async getPageIssues(projectId, pageUrl) {

    const params = new URLSearchParams();

    if (pageUrl) params.append('page_url', pageUrl);



    const queryString = params.toString();

    const endpoint = `/app_user/projects/${projectId}/page-issues${queryString ? '?' + queryString : ''}`;

    return this.request(endpoint);

  }



  // Get raw HTML for a page from stored data

  async getPageRawHtml(url, projectId) {

    const encodedUrl = encodeURIComponent(url);

    if (!projectId) {
      throw new Error('projectId is required for getPageRawHtml');
    }

    const endpoint = `/seo/raw-html?url=${encodedUrl}&project_id=${projectId}`;

    try {
      const response = await this.request(endpoint);
      return response;
    } catch (error) {
      throw error;

    }

  }



  // On-page issues (aggregated by issue_code)

  async getOnPageIssues(projectId) {

    return this.request(`/app_user/projects/${projectId}/onpage-issues`);

  }



  // Get all URLs for a specific issue

  async getIssueUrls(projectId, issueCode) {

    return this.request(`/app_user/projects/${projectId}/onpage-issues/${issueCode}`);

  }



  // Technical checks endpoints

  async getTechnicalChecks(projectId) {

    const endpoint = `/app_user/projects/${projectId}/technical-checks`;

    try {
      const response = await this.request(endpoint);
      return response;
    } catch (error) {
      throw error;
    }

  }



  async getPreAudit(projectId) {
    return this.request(`/app_user/projects/${projectId}/pre-audit`);
  }

  async updateHomepageAuditSnapshot(auditId, type, data) {
    return this.request(`/homepage-audit/${auditId}`, {
      method: 'PATCH',
      body: JSON.stringify({ type, ...data })
    });
  }

  // NEW: Optimized API for project overview (combines project, performance, technical data)
  async getProjectOverview(projectId) {
    const endpoint = `/app_user/projects/${projectId}/overview`;

    try {
      const response = await this.request(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // NEW: Lightweight API for issue counts (single collection query)
  async getIssueCounts(projectId) {
    const endpoint = `/app_user/projects/${projectId}/issue-counts`;

    try {
      const response = await this.request(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }



  async getTechnicalCheckDetail(projectId, checkId) {

    const endpoint = `/app_user/projects/${projectId}/technical-checks/${checkId}`;



    try {

      const response = await this.request(endpoint);

      return response;

    } catch (error) {

      throw error;

    }

  }



  // PageSpeed endpoints

  async getPageSpeedData(projectId) {

    const endpoint = `/app_user/projects/${projectId}/performance`;

    try {
      const response = await this.request(endpoint);
      return response;
    } catch (error) {
      throw error;
    }

  }



  async performPageSpeedAnalysis(url) {
    const endpoint = '/pagespeed/';

    try {
      console.log("📡 Calling /api/pagespeed...");
      console.log("📡 PageSpeed request body:", JSON.stringify({ url: url.trim() }));

      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({ url: url.trim() })
      });

      console.log("📥 PageSpeed response received:", response);
      return response;
    } catch (error) {
      console.error("📡 PageSpeed request failed:", error);
      throw error;
    }
  }

  async performHomepagePageSpeed(url) {
    console.log("⚡ Calling homepage-pagespeed...");

    // Use the same base URL as other API calls
    const endpoint = '/homepage-pagespeed';

    // Create AbortController for 180-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 180 seconds

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url.trim() }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await this.handleResponse(response);
      console.log("📥 Homepage PageSpeed response received:", data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        console.error("⚡ Homepage PageSpeed request timed out after 180 seconds");
        throw new Error('PageSpeed analysis timed out after 180 seconds');
      } else {
        console.error("⚡ Homepage PageSpeed request failed:", error);
        throw error;
      }
    }
  }


  // PDF endpoints

  async getPDFPageData(projectId, page) {
    const endpoint = `/pdf/${projectId}/page${page}`;

    try {
      const response = await this.request(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Store authentication token

  setToken(token) {

    if (typeof window !== 'undefined') {

      localStorage.setItem('token', token);

    }

  }



  // Get authentication token

  getToken() {

    if (typeof window !== 'undefined') {

      return localStorage.getItem('token');

    }

    return null;

  }



  // Remove authentication token

  removeToken() {

    if (typeof window !== 'undefined') {

      localStorage.removeItem('token');

    }

  }



  // Check if user is authenticated

  isAuthenticated() {

    return !!this.getToken();

  }



  // Redirect to dashboard (or any specified route)

  redirectToDashboard(router, route = '/dashboard') {

    if (router) {

      router.push(route);

    } else if (typeof window !== 'undefined') {

      window.location.href = route;

    }

  }


  // ═══════════════════════════════════════════════════════════════════════
  //  SEO Onboarding endpoints (keyword generation + ranking)
  // ═══════════════════════════════════════════════════════════════════════

  async generateKeywords(subType, location, country = 'US', language = 'en', lat = null, lng = null) {
    const endpoint = '/seo/generate-keywords';
    const payload = { subType, location, country, language, lat, lng };
    console.log('🔍 Generating keywords:', { endpoint, payload });

    try {
      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      console.log('✅ Keywords generated:', response);
      return response;
    } catch (error) {
      console.error('❌ Keyword generation error:', error);
      throw error;
    }
  }

  async checkRanking(domain, keywords, location, country = null, language = 'en', businessLocation = null, seoScope = null, cityName = null) {
    const endpoint = '/seo/check-ranking';
    const payload = {
      domain,
      keywords,
      location,
      country,
      language,
      businessLocation,
      seoScope,
      cityName
    };

    try {
      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async saveRanking(projectId, domain, location, keywords, locationCode = null, country = null, language = 'en', seoScope = null) {
    const endpoint = '/seo/save-ranking';
    const payload = { projectId, domain, location, keywords, locationCode, country, language, seoScope };

    try {
      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getProjectRankings(projectId) {
    const endpoint = `/seo/rankings/${projectId}`;

    try {
      const response = await this.request(endpoint, {
        method: 'GET'
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getKeywordRankingAnalysis(projectId) {
    const endpoint = `/pdf/${projectId}/page16`;

    try {
      const response = await this.request(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Business search endpoints

  async searchBusiness(businessName, businessLocation) {
    const endpoint = '/app_user/business/search';

    try {

      const response = await this.request(endpoint, {

        method: 'POST',

        body: JSON.stringify({

          businessName: businessName.trim(),

          businessLocation: businessLocation.trim()

        })

      });

      return response;

    } catch (error) {

      console.error('❌ Business search error:', error);

      throw error;

    }

  }

  /**
   * Extract business data from a website URL (manual fallback flow)
   * @param {string} websiteUrl - URL to scrape and extract data from
   * @returns {Promise<Object>} Extracted business data
   */
  async extractFromWebsite(websiteUrl) {
    const endpoint = '/app_user/business/extract-from-website';

    try {
      console.log('🌐 Extracting business data from website:', websiteUrl);

      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({ url: websiteUrl.trim() })
      });

      console.log('✅ Website extraction response:', response);
      return response;
    } catch (error) {
      console.error('❌ Website extraction error:', error);
      throw error;
    }
  }

  async getBusinessDetails(placeId) {

    const endpoint = `/app_user/business/details/${placeId}`;

    console.log('🔍 Getting business details:', { endpoint, placeId });



    try {

      const response = await this.request(endpoint);

      console.log('✅ Business details response:', response);

      return response;

    } catch (error) {

      console.error('❌ Business details error:', error);

      throw error;

    }

  }

  async checkBusinessHealth() {

    const endpoint = '/app_user/business/health';

    console.log('🔍 Checking business service health:', { endpoint });



    try {

      const response = await this.request(endpoint);

      console.log('✅ Business health response:', response);

      return response;

    } catch (error) {

      console.error('❌ Business health error:', error);

      throw error;

    }

  }

  // Accessibility issues endpoints

  async getAccessibilityIssues(filters = {}) {

    const { projectId, seo_jobId, severity } = filters;

    const params = new URLSearchParams();

    if (projectId) params.append('projectId', projectId);

    if (seo_jobId) params.append('seo_jobId', seo_jobId);

    if (severity) params.append('severity', severity);

    const queryString = params.toString();

    const endpoint = `/accessibility/issues${queryString ? '?' + queryString : ''}`;

    try {
      const response = await this.request(endpoint);
      return response;
    } catch (error) {
      throw error;

    }

  }

  // Lightweight business discovery from URL (runs before audit starts)
  async discoverBusiness(url) {
    return this.request('/external/discover-business', {
      method: 'POST',
      body: JSON.stringify({ url: url.trim() })
    });
  }

  // Search-as-you-type: return up to 4 Google Places candidates. location is optional.
  async searchBusinessCandidates(query, location = '') {
    return this.request('/external/search-businesses', {
      method: 'POST',
      body: JSON.stringify({ query: query.trim(), location: location.trim() })
    });
  }

  // Local SEO Presence (Google Places) endpoint

  async searchLocalPresence(businessName, location, scrapedData = {}) {
    const endpoint = '/external/local-seo';

    try {
      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          businessName: businessName.trim(),
          location: location.trim(),
          scrapedData
        })
      });
      return response;
    } catch (error) {
      console.error('Local SEO search error:', error);
      throw error;
    }
  }

  // ── Issue Context Engine ────────────────────────────────────────────────

  /**
   * Resolve IssueContext for a specific issue + page.
   * Returns the full context object with currentState, expectedState, pageContext.
   */
  async getIssueContext(projectId, issueId, pageUrl) {
    const encodedUrl = encodeURIComponent(pageUrl);
    return this.request(`/issue-context/${projectId}/${issueId}?pageUrl=${encodedUrl}`);
  }

  /**
   * Batch resolve IssueContext for multiple pages of the same issue.
   */
  async batchIssueContext(projectId, issueId, pageUrls, concurrency = 10) {
    return this.request('/issue-context/batch', {
      method: 'POST',
      body: JSON.stringify({ projectId, issueId, pageUrls, concurrency }),
    });
  }

  async performHomepageAudit(url) {
    const endpoint = '/homepage-audit';

    try {
      console.log("🌐 ApiService: Making request to", `${this.baseURL}${endpoint}`);
      console.log("🌐 ApiService: Request body:", JSON.stringify({ url: url.trim() }));

      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({ url: url.trim() })
      });

      console.log("🌐 ApiService: Response received:", response);
      return response;
    } catch (error) {
      console.error("🌐 ApiService: Request failed:", error);
      throw error;
    }
  }

  async performAccessibilityAudit(url) {
    const endpoint = '/accessibility/fast-audit';

    try {
      console.log("♿ ApiService: Making accessibility request to", `${this.baseURL}${endpoint}`);
      console.log("♿ ApiService: Request body:", JSON.stringify({ url: url.trim() }));

      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({ url: url.trim() })
      });

      console.log("♿ ApiService: Accessibility response received:", response);
      return response;
    } catch (error) {
      console.error("♿ ApiService: Accessibility request failed:", error);
      throw error;
    }
  }

  // ── Homepage Audit Video ────────────────────────────────────────────────
  // Public endpoints — no auth required. These live under /external/ routes.

  async generateHomepageAuditVideo(auditId) {
    return this.request('/external/homepage-audit-video', {
      method: 'POST',
      body: JSON.stringify({ auditId }),
    });
  }

  async getHomepageAuditVideoStatus(auditId) {
    return this.request(`/external/homepage-audit-video/${auditId}`);
  }

  async getAIAccessibility(projectId) {
    return this.request(`/ai-visibility/projects/${projectId}/ai-accessibility`);
  }

  // ── Fix Logs ──────────────────────────────────────────────────────────────

  async markFixed(data) {
    return this.request('/fix-logs/fix', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async reopenFixLog(fixLogId) {
    return this.request('/fix-logs/reopen', {
      method: 'POST',
      body: JSON.stringify({ fixLogId }),
    });
  }

  async getFixLogs(params = {}) {
    const queryString = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString();
    return this.request(`/fix-logs${queryString ? '?' + queryString : ''}`);
  }

  async getFixedUrls(projectId, issueKey) {
    return this.request(
      `/fix-logs/fixed-urls?projectId=${encodeURIComponent(projectId)}&issueKey=${encodeURIComponent(issueKey)}`
    );
  }

  // ── Tasks (new lifecycle system) ──────────────────────────────────────

  async createTask(data) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTaskStatus(taskId, status) {
    return this.request(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getTasks(params = {}) {
    const queryString = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString();
    return this.request(`/tasks${queryString ? '?' + queryString : ''}`);
  }

  async getTaskById(taskId) {
    return this.request(`/tasks/${taskId}`);
  }

  async getTaskSummary(projectId) {
    return this.request(`/tasks/summary?projectId=${encodeURIComponent(projectId)}`);
  }

  async getActiveTaskUrls(projectId, issueKey) {
    return this.request(
      `/tasks/active-urls?projectId=${encodeURIComponent(projectId)}&issueKey=${encodeURIComponent(issueKey)}`
    );
  }

  async deleteTask(taskId) {
    return this.request(`/tasks/${taskId}`, { method: 'DELETE' });
  }

  // ── Audit History ─────────────────────────────────────────────────────────

  async getLatestComparison(projectId) {
    return this.request(`/projects/${encodeURIComponent(projectId)}/comparison/latest`);
  }

  async getAuditComparison(projectId, from, to) {
    return this.request(
      `/projects/${encodeURIComponent(projectId)}/comparison?from=${from}&to=${to}`
    );
  }

  async getAuditHistory(projectId, page = 1, limit = 10) {
    return this.request(
      `/projects/${encodeURIComponent(projectId)}/audits?page=${page}&limit=${limit}`
    );
  }

  async getProjectTrends(projectId, limit = 20) {
    return this.request(
      `/projects/${encodeURIComponent(projectId)}/trends?limit=${limit}`
    );
  }

  async getAiImpact(projectId) {
    return this.request(`/projects/${encodeURIComponent(projectId)}/ai-impact`);
  }

}



// Create and export a singleton instance

const apiService = new ApiService();

export default apiService;

