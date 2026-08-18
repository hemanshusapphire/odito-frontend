import API_BASE_URL from "@/lib/apiConfig";

class ApiService {

  constructor() {

    this.baseURL = API_BASE_URL;

  }


  // Helper method to handle API responses

  async handleResponse(response) {

    const data = await response.json();

    if (!response.ok) {

      // .code/.details are preserved (not just .message) so callers can
      // branch on a specific backend error code — e.g. onboarding's
      // INSUFFICIENT_CREDITS check — instead of string-matching a message.
      // .status is ALSO preserved (F4-001) — some endpoints (e.g.
      // start-url-verification) don't set a .code field on their error
      // responses, so the HTTP status is the only reliable way for a caller
      // to distinguish e.g. 403 (forbidden) from 409 (already running).
      const error = new Error(data.message || 'Something went wrong');
      error.code = data.code;
      error.details = data.details;
      error.status = response.status;
      throw error;

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



  async updateProfile(payload) {

    return this.request('/auth/profile', {

      method: 'PUT',

      body: JSON.stringify(payload),

    });

  }



  async changePassword(payload) {

    return this.request('/auth/change-password', {

      method: 'POST',

      body: JSON.stringify(payload),

    });

  }



  // Uses XMLHttpRequest instead of this.request()/fetch — fetch has no

  // upload-progress event, and this.request() always sets

  // 'Content-Type: application/json', which would break a multipart

  // FormData body (the browser must set that header itself, boundary

  // included). onProgress(percent) is optional.

  uploadAvatar(file, onProgress) {

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const formData = new FormData();

    formData.append('avatar', file);



    return new Promise((resolve, reject) => {

      const xhr = new XMLHttpRequest();

      xhr.open('POST', `${this.baseURL}/auth/avatar`);

      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);



      xhr.upload.onprogress = (e) => {

        if (onProgress && e.lengthComputable) {

          onProgress(Math.round((e.loaded / e.total) * 100));

        }

      };



      xhr.onload = () => {

        let data;

        try {

          data = JSON.parse(xhr.responseText);

        } catch {

          data = {};

        }

        if (xhr.status >= 200 && xhr.status < 300) {

          resolve(data);

        } else {

          const error = new Error(data.message || 'Failed to upload avatar');

          error.code = data.code;

          reject(error);

        }

      };



      xhr.onerror = () => reject(new Error('Network error while uploading avatar.'));



      xhr.send(formData);

    });

  }



  async removeAvatar() {

    return this.request('/auth/avatar', {

      method: 'DELETE',

    });

  }



  async requestAccountDeletion() {

    return this.request('/auth/account/delete/request', {

      method: 'POST',

    });

  }



  async verifyAccountDeletion(payload) {

    return this.request('/auth/account/delete/verify', {

      method: 'POST',

      body: JSON.stringify(payload),

    });

  }



  async deleteAccount(deletionToken) {

    return this.request('/auth/account', {

      method: 'DELETE',

      body: JSON.stringify({ deletionToken }),

    });

  }



  async getSubscription() {

    return this.request('/subscription');

  }



  async getPlans() {

    return this.request('/plans');

  }



  async createCheckoutSession(plan) {

    return this.request('/subscription/checkout', {

      method: 'POST',

      body: JSON.stringify({ plan }),

    });

  }



  async createBillingPortalSession() {

    return this.request('/subscription/portal', {

      method: 'POST',

    });

  }



  async changePlan(plan) {

    return this.request('/subscription/change-plan', {

      method: 'POST',

      body: JSON.stringify({ plan }),

    });

  }



  async submitCustomPlanRequest(payload) {

    return this.request('/subscription/custom-request', {

      method: 'POST',

      body: JSON.stringify(payload),

    });

  }



  async getMyCustomPlanRequest() {

    return this.request('/subscription/custom-request/me');

  }



  async createPagePurchaseCheckout({ pages, projectId, returnPath }) {

    return this.request('/page-purchases/checkout', {

      method: 'POST',

      body: JSON.stringify({ pages, projectId, returnPath }),

    });

  }



  async createCreditPurchaseCheckout({ credits, returnPath }) {

    return this.request('/credit-purchases/checkout', {

      method: 'POST',

      body: JSON.stringify({ credits, returnPath }),

    });

  }



  async getBillingHistory(page = 1, limit = 20) {

    return this.request(`/subscription/history?page=${page}&limit=${limit}`);

  }



  async getSystemAdminDashboard() {

    return this.request('/system-admin/dashboard');

  }



  async getSystemAdminUsers(params = {}) {

    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {

      if (value !== undefined && value !== null && value !== '') {

        query.set(key, value);

      }

    });

    const qs = query.toString();

    return this.request(`/system-admin/users${qs ? `?${qs}` : ''}`);

  }



  async getSystemAdminUserDetail(userId) {

    return this.request(`/system-admin/users/${userId}`);

  }



  async suspendSystemAdminUser(userId, reason) {

    return this.request(`/system-admin/users/${userId}/suspend`, {

      method: 'POST',

      body: JSON.stringify({ reason }),

    });

  }



  async activateSystemAdminUser(userId, reason) {

    return this.request(`/system-admin/users/${userId}/activate`, {

      method: 'POST',

      body: JSON.stringify({ reason }),

    });

  }



  async getSystemAdminSubscriptions(params = {}) {

    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {

      if (value !== undefined && value !== null && value !== '') {

        query.set(key, value);

      }

    });

    const qs = query.toString();

    return this.request(`/system-admin/subscriptions${qs ? `?${qs}` : ''}`);

  }



  async getSystemAdminSubscriptionDetail(userId) {

    return this.request(`/system-admin/subscriptions/${userId}`);

  }



  // The three calls below hit the EXISTING admin subscription-override

  // routes (subscriptionRoutes.js -> adminSubscriptionController.js),

  // reused as-is per Phase 2D's "do not duplicate admin actions" — this is

  // the first frontend code to ever call them, not a new backend endpoint.

  async adminAssignPlan(userId, planId, reason) {

    return this.request(`/subscription/admin/users/${userId}/plan`, {

      method: 'POST',

      body: JSON.stringify({ planId, reason }),

    });

  }



  async adminAdjustQuota(userId, { credits, pages } = {}, reason) {

    return this.request(`/subscription/admin/users/${userId}/quota`, {

      method: 'POST',

      body: JSON.stringify({ credits, pages, reason }),

    });

  }



  async adminUpdateSubscriptionStatus(userId, status, reason) {

    return this.request(`/subscription/admin/users/${userId}/status`, {

      method: 'POST',

      body: JSON.stringify({ status, reason }),

    });

  }



  async getSystemAdminCustomPlanRequests(params = {}) {

    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {

      if (value !== undefined && value !== null && value !== '') {

        query.set(key, value);

      }

    });

    const qs = query.toString();

    return this.request(`/system-admin/custom-plan-requests${qs ? `?${qs}` : ''}`);

  }



  async getSystemAdminCustomPlanRequestDetail(id) {

    return this.request(`/system-admin/custom-plan-requests/${id}`);

  }



  // Writes go through the subscription module's own admin routes (not
  // system-admin) — matching the existing adminAssignPlan/adminAdjustQuota/
  // adminUpdateSubscriptionStatus split above.

  async adminUpdateCustomPlanRequestStatus(id, status) {

    return this.request(`/subscription/admin/custom-plan-requests/${id}/status`, {

      method: 'POST',

      body: JSON.stringify({ status }),

    });

  }



  async adminAddCustomPlanRequestNote(id, note) {

    return this.request(`/subscription/admin/custom-plan-requests/${id}/notes`, {

      method: 'POST',

      body: JSON.stringify({ note }),

    });

  }



  async getSystemAdminPayments(params = {}) {

    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {

      if (value !== undefined && value !== null && value !== '') {

        query.set(key, value);

      }

    });

    const qs = query.toString();

    return this.request(`/system-admin/payments${qs ? `?${qs}` : ''}`);

  }



  async getSystemAdminPaymentsSummary() {

    return this.request('/system-admin/payments/summary');

  }



  async getSystemAdminPaymentDetail(paymentId) {

    return this.request(`/system-admin/payments/${encodeURIComponent(paymentId)}`);

  }



  async getSystemAdminJobs(params = {}) {

    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {

      if (value !== undefined && value !== null && value !== '') {

        query.set(key, value);

      }

    });

    const qs = query.toString();

    return this.request(`/system-admin/jobs${qs ? `?${qs}` : ''}`);

  }



  async getSystemAdminJobsSummary() {

    return this.request('/system-admin/jobs/summary');

  }



  async getSystemAdminJobDetail(jobId) {

    return this.request(`/system-admin/jobs/${jobId}`);

  }



  async getSystemAdminWebhooks(params = {}) {

    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {

      if (value !== undefined && value !== null && value !== '') {

        query.set(key, value);

      }

    });

    const qs = query.toString();

    return this.request(`/system-admin/webhooks${qs ? `?${qs}` : ''}`);

  }



  async getSystemAdminWebhooksSummary() {

    return this.request('/system-admin/webhooks/summary');

  }



  async getSystemAdminWebhookDetail(id) {

    return this.request(`/system-admin/webhooks/${id}`);

  }



  async getSystemAdminAuditLogs(params = {}) {

    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {

      if (value !== undefined && value !== null && value !== '') {

        query.set(key, value);

      }

    });

    const qs = query.toString();

    return this.request(`/system-admin/audit-logs${qs ? `?${qs}` : ''}`);

  }



  async getSystemAdminAuditLogsSummary() {

    return this.request('/system-admin/audit-logs/summary');

  }



  async getSystemAdminAuditLogDetail(id) {

    return this.request(`/system-admin/audit-logs/${id}`);

  }



  // ODITO-OPS-001: Verification Operations Dashboard — read-only, same
  // URLSearchParams-filter pattern every other System Admin list method
  // above already uses.

  async getSystemAdminVerificationBatches(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, value);
      }
    });
    const qs = query.toString();
    return this.request(`/system-admin/verification/batches${qs ? `?${qs}` : ''}`);
  }

  async getSystemAdminVerificationBatchesSummary() {
    return this.request('/system-admin/verification/batches/summary');
  }

  async getSystemAdminVerificationBatchDetail(batchId) {
    return this.request(`/system-admin/verification/batches/${batchId}`);
  }

  async getSystemAdminVerificationQueueSummary() {
    return this.request('/system-admin/verification/queue/summary');
  }

  async getSystemAdminVerificationRecoveryEvents(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, value);
      }
    });
    const qs = query.toString();
    return this.request(`/system-admin/verification/recovery${qs ? `?${qs}` : ''}`);
  }

  async getSystemAdminVerificationRecoverySummary() {
    return this.request('/system-admin/verification/recovery/summary');
  }

  async getSystemAdminVerificationWorkerHealth() {
    return this.request('/system-admin/verification/workers');
  }



  async getSystemAdminProjects(params = {}) {

    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {

      if (value !== undefined && value !== null && value !== '') {

        query.set(key, value);

      }

    });

    const qs = query.toString();

    return this.request(`/system-admin/projects${qs ? `?${qs}` : ''}`);

  }



  async getSystemAdminProjectsSummary() {

    return this.request('/system-admin/projects/summary');

  }



  async getSystemAdminProjectDetail(id) {

    return this.request(`/system-admin/projects/${id}`);

  }



  async startSystemAdminProjectAudit(id, reason) {

    return this.request(`/system-admin/projects/${id}/start-audit`, {

      method: 'POST',

      body: JSON.stringify({ reason }),

    });

  }



  async deleteSystemAdminProject(id, reason) {

    return this.request(`/system-admin/projects/${id}`, {

      method: 'DELETE',

      body: JSON.stringify({ reason }),

    });

  }



  async restoreSystemAdminProject(id, reason) {

    return this.request(`/system-admin/projects/${id}/restore`, {

      method: 'POST',

      body: JSON.stringify({ reason }),

    });

  }



  async permanentlyDeleteSystemAdminProject(id, reason) {

    return this.request(`/system-admin/projects/${id}/permanent`, {

      method: 'DELETE',

      body: JSON.stringify({ reason }),

    });

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



  async forgotPassword(email) {

    return this.request('/auth/forgot-password', {

      method: 'POST',

      body: JSON.stringify({ email }),

    });

  }



  // Step 2 of the reset flow — verifies the OTP and returns a short-lived
  // resetToken. This is the ONLY thing that authorizes step 3; the OTP
  // itself is never sent to /reset-password.

  async verifyResetOtp(email, otp) {

    return this.request('/auth/verify-reset-otp', {

      method: 'POST',

      body: JSON.stringify({ email, otp }),

    });

  }



  // Step 3a — read-only, safe to call on every reset-password page
  // load/refresh. Never sent an email — only the opaque token.

  async validateResetToken(token) {

    return this.request(`/auth/validate-reset-token?token=${encodeURIComponent(token)}`);

  }



  // Step 3b — token + new password only. confirmPassword is still sent so
  // the backend can independently verify the match (never trust the
  // frontend's own check).

  async resetPassword(token, newPassword, confirmPassword) {

    return this.request('/auth/reset-password', {

      method: 'POST',

      body: JSON.stringify({ token, newPassword, confirmPassword }),

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



  // Project Trash & Restore

  async getTrashedProjects(page = 1, limit = 10) {

    return this.request(`/app_user/projects/trash?page=${page}&limit=${limit}`);

  }



  async restoreProject(projectId) {

    return this.request(`/app_user/projects/trash/${projectId}/restore`, {

      method: 'POST'

    });

  }



  async permanentlyDeleteProject(projectId) {

    return this.request(`/app_user/projects/trash/${projectId}/permanent`, {

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



  // F4-001: single-page URL Verification — distinct from startVerification
  // above (legacy, project-wide Quick Recheck). Hits the URL Verification
  // Engine's own endpoint (backend Phase 3 / hardening work), which takes a
  // specific page URL rather than operating on the whole project.
  async verifyUrl(projectId, url) {

    const endpoint = '/seo/start-url-verification';

    const payload = { projectId, url };

    console.log('🔎 Starting URL verification request:', { endpoint, payload });

    try {

      const response = await this.request(endpoint, {

        method: 'POST',

        body: JSON.stringify(payload)

      });

      console.log('✅ URL verification start response:', response);

      return response;

    } catch (error) {

      console.error('❌ URL verification start error:', error);

      throw error;

    }

  }



  // F4-019: Verification Batch — one request starts every selected URL's
  // pipeline (backend-orchestrated), replacing N individual verifyUrl()
  // calls when NEXT_PUBLIC_ENABLE_BATCH_VERIFICATION is on. Response shape
  // is flat (no `data` wrapper) per this endpoint's own contract, matching
  // the backend controller's documented behavior — unlike most other
  // endpoints here, do not read `.data` off the resolved value.
  async startVerificationBatch(projectId, urls) {
    return this.request('/seo/start-verification-batch', {
      method: 'POST',
      body: JSON.stringify({ projectId, urls }),
    });
  }

  // F4-019: read-only Verification Batch status — used for recovery after a
  // websocket reconnect or a full browser reload, never for polling.
  async getVerificationBatch(batchId) {
    return this.request(`/seo/verification-batches/${batchId}`);
  }

  // F4-019: every PageVerificationRun belonging to a batch — same recovery
  // use as getVerificationBatch above.
  async getVerificationBatchRuns(batchId) {
    return this.request(`/seo/verification-batches/${batchId}/runs`);
  }

  // F4-002: latest URL Verification result for this page, used by the
  // in-page result panel. Hits the existing (frozen) verification history
  // endpoint — no new backend route.
  async getLatestVerification(projectId, url) {
    const encodedUrl = encodeURIComponent(url);
    return this.request(`/seo/projects/${projectId}/pages/${encodedUrl}/latest-verification`);
  }

  // F4-003: project-wide URL Verification history (frozen backend has no
  // page-scoped list route — only a project-wide one and a page-scoped
  // "latest" one). useVerificationHistory filters this down to one page
  // client-side. limit defaults to the endpoint's own max (50); no
  // pagination UI is implemented yet, so only this first page is consumed.
  async getVerificationHistory(projectId, { limit = 50 } = {}) {
    return this.request(`/seo/projects/${projectId}/verification-history?limit=${limit}`);
  }

  // F4-004: single verification run by id, for the Run Detail Drawer.
  // Deliberately NOT the latest-verification endpoint — this always fetches
  // the exact run the user clicked in history, not "whatever is newest".
  async getVerificationRun(runId) {
    return this.request(`/seo/verification-runs/${runId}`);
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



  // ── AEO Hub V2 ────────────────────────────────────────────────────────────

  async getAEOHubData(projectId) {
    return this.request(`/aeo-hub/${projectId}`);
  }

  async getAEOHubIssues(projectId) {
    return this.request(`/aeo-hub/${projectId}/issues`);
  }

  async getAEOHubIssueDetail(projectId, ruleId) {
    return this.request(`/aeo-hub/${projectId}/issues/${encodeURIComponent(ruleId)}`);
  }

  // ── AI Pages (URL-level AI issue detail) ─────────────────────────────────

  async getPageAIIssues(projectId, url) {
    return this.request(`/ai-pages/${projectId}/issues?url=${encodeURIComponent(url)}`);
  }

  // ── GEO Hub V2 ────────────────────────────────────────────────────────────

  async getGEOHubData(projectId) {
    return this.request(`/geo-hub/${projectId}`);
  }

  async getGEOHubIssues(projectId) {
    return this.request(`/geo-hub/${projectId}/issues`);
  }

  async getGEOHubIssueDetail(projectId, ruleId) {
    return this.request(`/geo-hub/${projectId}/issues/${encodeURIComponent(ruleId)}`);
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

  async getUrlPool(projectId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/app_user/projects/${projectId}/url-pool${queryString ? '?' + queryString : ''}`;
    return this.request(endpoint);
  }

  async submitUrlSelection(projectId, selectedUrls) {
    return this.request(`/app_user/projects/${projectId}/url-selection`, {
      method: 'POST',
      body: JSON.stringify({ selectedUrls })
    });
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

  async rescanPageSpeed(projectId) {
    const endpoint = `/pagespeed/rescan/${projectId}`;
    try {
      const response = await this.request(endpoint, { method: 'POST' });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getPageSpeedStatus(projectId) {
    const endpoint = `/pagespeed/status/${projectId}`;
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

  async generateKeywords(subType, location, country = 'US', language = 'en', lat = null, lng = null, city = null) {
    const endpoint = '/seo/generate-keywords';
    const payload = { subType, location, country, language, lat, lng, city };
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

  async checkRanking(domain, keywords, location, country = null, language = 'en', businessLocation = null, seoScope = null, cityName = null, businessName = null) {
    const endpoint = '/seo/check-ranking';
    const payload = {
      domain,
      keywords,
      location,
      country,
      language,
      businessLocation,
      seoScope,
      cityName,
      businessName,
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

  async rescanKeyword(projectId, keyword) {
    const endpoint = `/seo/keywords/${projectId}/rescan`;

    try {
      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({ keyword })
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async addKeyword(projectId, keyword) {
    const endpoint = `/seo/keywords/${projectId}`;

    try {
      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({ keyword })
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteKeyword(projectId, keyword) {
    const endpoint = `/seo/keywords/${projectId}/${encodeURIComponent(keyword)}`;

    try {
      const response = await this.request(endpoint, {
        method: 'DELETE'
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

  /**
   * Resolve city/country from extracted website metadata (Local SEO fallback).
   * Called when Google Places failed and user selected Local SEO — before asking
   * the user for a city we first try to auto-detect it from website data.
   *
   * @param {{ address?: string, extractedMetadata?: object }} params
   * @returns {Promise<{ success: boolean, data: { city, country, locationCode, source, confidence }|null }>}
   */
  async resolveWebsiteLocation({ address = null, extractedMetadata = null } = {}) {
    return this.post('/seo/resolve-website-location', { address, extractedMetadata });
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

  // ── Homepage Audit PDF ──────────────────────────────────────────────────
  // Public endpoint — no auth required, same opaque-ObjectId pattern as the
  // rest of the Homepage Audit API. Returns the PDF data contract only;
  // actual PDF generation happens client-side (see pdfGeneratorService.js).

  async getHomepageAuditPdfData(auditId) {
    return this.request(`/homepage-audit-pdf/${auditId}/data`);
  }

  async generateHomepageAuditPdf(auditId) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`${this.baseURL}/homepage-audit-pdf/${auditId}/generate`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      let msg = 'Failed to generate PDF';
      try {
        const errJson = await response.json();
        msg = errJson.message || msg;
      } catch (_) {}
      throw new Error(msg);
    }

    return response.blob();
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

  /**
   * Older fixHistory attempts for one task (Optimization Center View Details
   * "Show earlier attempts") — excludes the latest attempt, which is already
   * included in getTaskById's response.
   */
  async getTaskHistory(taskId, params = {}) {
    const queryString = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString();
    return this.request(`/tasks/${taskId}/history${queryString ? '?' + queryString : ''}`);
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

  // ── AISO Hub V2 ────────────────────────────────────────────────────────────

  async getAISOHubData(projectId) {
    return this.request(`/aiso-hub/${projectId}`);
  }

  async getAISOHubIssues(projectId) {
    return this.request(`/aiso-hub/${projectId}/issues`);
  }

  async getAISOHubIssueDetail(projectId, ruleId) {
    return this.request(`/aiso-hub/${projectId}/issues/${encodeURIComponent(ruleId)}`);
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

  // ── Google Visibility / Business Profile ────────────────────────────────

  /**
   * Get the Google consent URL for connecting Search Console / Analytics /
   * Business Profile to a project. The caller is expected to navigate the
   * browser to `data.url` (a bare <a href> can't carry the Authorization
   * header this endpoint requires, so we fetch it first).
   */
  async getGoogleConnectUrl(projectId, returnTo) {
    const params = new URLSearchParams({ projectId });
    if (returnTo) params.set('returnTo', returnTo);
    return this.request(`/auth/oauth/google/start?${params.toString()}`);
  }

  // Settings → Connected Accounts (account-level, not project-scoped —
  // distinct from getGoogleConnectUrl/getBusinessProfileStatus above, which
  // are per-project).
  async getGoogleAccountStatus() {
    return this.request('/auth/oauth/google/status');
  }

  async disconnectGoogleAccount() {
    return this.request('/auth/oauth/google/disconnect', { method: 'POST' });
  }

  async getBusinessProfileStatus(projectId) {
    return this.request(`/projects/${projectId}/business-profile/status`);
  }

  async getBusinessProfileAccounts(projectId) {
    return this.request(`/projects/${projectId}/business-profile/accounts`);
  }

  async getBusinessProfileLocations(projectId, accountId) {
    return this.request(`/projects/${projectId}/business-profile/locations?accountId=${encodeURIComponent(accountId)}`);
  }

  async selectBusinessProfile(projectId, accountId, locationId) {
    return this.request(`/projects/${projectId}/business-profile/select`, {
      method: 'POST',
      body: JSON.stringify({ accountId, locationId })
    });
  }

  async syncBusinessProfile(projectId) {
    return this.request(`/projects/${projectId}/business-profile/sync`, {
      method: 'POST'
    });
  }

  async getBusinessProfileRating(projectId) {
    return this.request(`/projects/${projectId}/business-profile/rating`);
  }

  async getBusinessProfileReviews(projectId, { page = 1, limit = 20, search = '' } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    return this.request(`/projects/${projectId}/business-profile/reviews?${params.toString()}`);
  }

  async syncBusinessProfileReviews(projectId) {
    return this.request(`/projects/${projectId}/business-profile/sync-reviews`, {
      method: 'POST'
    });
  }

  async getBusinessProfileData(projectId) {
    return this.request(`/projects/${projectId}/business-profile/data`);
  }

  async getBusinessProfileDetails(projectId) {
    return this.request(`/projects/${projectId}/business-profile/profile`);
  }

  async getBusinessProfileTrends(projectId, range = '30') {
    return this.request(`/projects/${projectId}/business-profile/trends?range=${encodeURIComponent(range)}`);
  }

  async getBusinessProfileMedia(projectId, { page = 1, limit = 24, category = '' } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (category) params.set('category', category);
    return this.request(`/projects/${projectId}/business-profile/media?${params.toString()}`);
  }

  async syncBusinessProfileMedia(projectId) {
    return this.request(`/projects/${projectId}/business-profile/sync-media`, {
      method: 'POST'
    });
  }

  // ── Brand Asset Resolver ────────────────────────────────────
  // Platform-wide "what logo should we show" resolver - see
  // odito_backend/src/services/brandAssetService.js. Reused anywhere a
  // project's branding is displayed (Business Profile, Dashboard, Project
  // List, ...).
  async getProjectBrandAsset(projectId, { force = false } = {}) {
    const params = force ? '?force=true' : ''
    return this.request(`/projects/${projectId}/brand-asset${params}`);
  }

  // ── Search Console ───────────────────────────────────────────
  async getSearchConsoleStatus(projectId) {
    return this.request(`/projects/${projectId}/search-console/status`);
  }

  async getSearchConsoleSites(projectId) {
    return this.request(`/projects/${projectId}/search-console/sites`);
  }

  async selectSearchConsoleSite(projectId, siteUrl) {
    return this.request(`/projects/${projectId}/search-console/select-site`, {
      method: 'POST',
      body: JSON.stringify({ siteUrl })
    });
  }

  async syncSearchConsole(projectId) {
    return this.request(`/projects/${projectId}/search-console/sync`, {
      method: 'POST'
    });
  }

  async getSearchConsoleData(projectId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/projects/${projectId}/search-console/data${query ? `?${query}` : ''}`);
  }

  async getSearchConsoleTrends(projectId, range = '30') {
    return this.request(`/projects/${projectId}/search-console/trends?range=${range}`);
  }

  async getSearchConsoleBreakdown(projectId, dimension) {
    return this.request(`/projects/${projectId}/search-console/breakdown?dimension=${dimension}`);
  }

  async getSearchConsoleSitemaps(projectId) {
    return this.request(`/projects/${projectId}/search-console/sitemaps`);
  }

  async inspectSearchConsoleUrl(projectId, url) {
    return this.request(`/projects/${projectId}/search-console/inspect-url`, {
      method: 'POST',
      body: JSON.stringify({ url })
    });
  }

  // ── Analytics (GA4) ──────────────────────────────────────────
  async getAnalyticsStatus(projectId) {
    return this.request(`/projects/${projectId}/analytics/status`);
  }

  async getAnalyticsProperties(projectId) {
    return this.request(`/projects/${projectId}/analytics/properties`);
  }

  async selectAnalyticsProperty(projectId, propertyId) {
    return this.request(`/projects/${projectId}/analytics/select-property`, {
      method: 'POST',
      body: JSON.stringify({ propertyId })
    });
  }

  async syncAnalytics(projectId) {
    return this.request(`/projects/${projectId}/analytics/sync`, {
      method: 'POST'
    });
  }

  async getAnalyticsData(projectId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/projects/${projectId}/analytics/data${query ? `?${query}` : ''}`);
  }

  async getAnalyticsTrends(projectId, range = '30') {
    return this.request(`/projects/${projectId}/analytics/trends?range=${encodeURIComponent(range)}`);
  }

  async getAnalyticsPropertyDetails(projectId) {
    return this.request(`/projects/${projectId}/analytics/property`);
  }

  async getAnalyticsBreakdowns(projectId, range = '30') {
    return this.request(`/projects/${projectId}/analytics/breakdowns?range=${encodeURIComponent(range)}`);
  }

  async getAnalyticsEventsList(projectId, range = '30') {
    return this.request(`/projects/${projectId}/analytics/events?range=${encodeURIComponent(range)}`);
  }

  async getAnalyticsConversionsList(projectId, range = '30') {
    return this.request(`/projects/${projectId}/analytics/conversions?range=${encodeURIComponent(range)}`);
  }

  async getAnalyticsRealtime(projectId) {
    return this.request(`/projects/${projectId}/analytics/realtime`);
  }

  async getAnalyticsHealth(projectId, range = '30') {
    return this.request(`/projects/${projectId}/analytics/health?range=${encodeURIComponent(range)}`);
  }

  async getAnalyticsActivity(projectId) {
    return this.request(`/projects/${projectId}/analytics/activity`);
  }

  // ── Google Ads ───────────────────────────────────────────────
  // Separate OAuth purpose from Business Profile/Search Console/Analytics
  // above (its own consent screen, its own GoogleConnection row - see
  // odito_backend oauth.routes.js's "google_ads" branch) - hence its own
  // /google-ads/start endpoint rather than reusing getGoogleConnectUrl.
  async getGoogleAdsConnectUrl(projectId, returnTo) {
    const params = new URLSearchParams({ projectId });
    if (returnTo) params.set('returnTo', returnTo);
    return this.request(`/auth/oauth/google-ads/start?${params.toString()}`);
  }

  async getGoogleAdsSyncStatus(projectId) {
    return this.request(`/projects/${projectId}/google-ads/sync-status`);
  }

  async getGoogleAdsAccounts(projectId) {
    return this.request(`/projects/${projectId}/google-ads/accounts`);
  }

  async selectGoogleAdsAccount(projectId, customerId, loginCustomerId) {
    return this.request(`/projects/${projectId}/google-ads/select`, {
      method: 'POST',
      body: JSON.stringify({ customerId, loginCustomerId: loginCustomerId || undefined })
    });
  }

  async refreshGoogleAdsSync(projectId) {
    return this.request(`/projects/${projectId}/google-ads/refresh`, {
      method: 'POST'
    });
  }

  // ── Google Ads dashboard reads (Phase 7.2 / Phase 2 Enterprise Historical Sync) ──
  // All read from MongoDB server-side (never call Google directly) - see
  // googleAdsController.js. Every function here is a thin, uniform wrapper
  // over the shared `this.request()` helper - no request logic is
  // duplicated, only the endpoint path + query-string construction differs
  // per call, matching every other section of this file (e.g. getAnalyticsTrends above).

  /**
   * Turns a GoogleAdsDateRangeSelector value ({preset, startDate, endDate})
   * into the query params the backend's resolveGoogleAdsDateRange expects -
   * `range=7d|30d|90d|12m|all` for presets, `startDate`/`endDate` for
   * 'custom'. The ONE place this translation happens, so every range-aware
   * Google Ads call below builds an identical query string for the same
   * selector value instead of five slightly-different implementations.
   */
  _googleAdsRangeParams(dateRange) {
    const dr = dateRange || { preset: '30d' };
    if (dr.preset === 'custom' && dr.startDate && dr.endDate) {
      return { startDate: dr.startDate, endDate: dr.endDate };
    }
    return { range: dr.preset || '30d' };
  }

  async getGoogleAdsOverview(projectId, dateRange) {
    const params = new URLSearchParams(this._googleAdsRangeParams(dateRange));
    return this.request(`/projects/${projectId}/google-ads/overview?${params.toString()}`);
  }

  async getGoogleAdsTrends(projectId, dateRange, granularity = 'daily') {
    const params = new URLSearchParams({ ...this._googleAdsRangeParams(dateRange), granularity });
    return this.request(`/projects/${projectId}/google-ads/trends?${params.toString()}`);
  }

  async getGoogleAdsCampaigns(projectId, { page = 1, limit = 25, status, search, includeRemoved, dateRange } = {}) {
    const params = new URLSearchParams({ page, limit, ...this._googleAdsRangeParams(dateRange) });
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    if (includeRemoved) params.set('includeRemoved', 'true');
    return this.request(`/projects/${projectId}/google-ads/campaigns?${params.toString()}`);
  }

  async getGoogleAdsCampaignDetail(projectId, campaignId, dateRange) {
    const params = new URLSearchParams(this._googleAdsRangeParams(dateRange));
    return this.request(`/projects/${projectId}/google-ads/campaigns/${campaignId}?${params.toString()}`);
  }

  async getGoogleAdsCampaignHealth(projectId) {
    return this.request(`/projects/${projectId}/google-ads/campaigns/health`);
  }

  async getGoogleAdsCampaignHealthSummary(projectId) {
    return this.request(`/projects/${projectId}/google-ads/campaigns/health/summary`);
  }

  async getGoogleAdsKeywords(projectId, { page = 1, limit = 25, campaignId, matchType, status, search, sortBy = 'cost', sortOrder = -1, startDate, endDate } = {}) {
    const params = new URLSearchParams({ page, limit, sortBy, sortOrder });
    if (campaignId) params.set('campaignId', campaignId);
    if (matchType) params.set('matchType', matchType);
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return this.request(`/projects/${projectId}/google-ads/keywords?${params.toString()}`);
  }

  async getGoogleAdsKeywordDetail(projectId, adGroupId, criterionId) {
    return this.request(`/projects/${projectId}/google-ads/keywords/${adGroupId}/${criterionId}`);
  }

  async refreshGoogleAdsKeywords(projectId) {
    return this.request(`/projects/${projectId}/google-ads/keywords/refresh`, { method: 'POST' });
  }

  async getGoogleAdsSearchTerms(projectId, { page = 1, limit = 25, campaignId, suggestedAction, search, sortBy = 'cost', sortOrder = -1, startDate, endDate } = {}) {
    const params = new URLSearchParams({ page, limit, sortBy, sortOrder });
    if (campaignId) params.set('campaignId', campaignId);
    if (suggestedAction) params.set('suggestedAction', suggestedAction);
    if (search) params.set('search', search);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return this.request(`/projects/${projectId}/google-ads/search-terms?${params.toString()}`);
  }

  async getGoogleAdsOptimizationScore(projectId, dateRange) {
    const params = new URLSearchParams(this._googleAdsRangeParams(dateRange));
    return this.request(`/projects/${projectId}/google-ads/optimization-score?${params.toString()}`);
  }

  async getGoogleAdsRecommendations(projectId, { page = 1, limit = 25, status, type, campaignId, includeResolved } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.set('status', status);
    if (type) params.set('type', type);
    if (campaignId) params.set('campaignId', campaignId);
    if (includeResolved) params.set('includeResolved', 'true');
    return this.request(`/projects/${projectId}/google-ads/recommendations?${params.toString()}`);
  }

  async refreshGoogleAdsRecommendations(projectId) {
    return this.request(`/projects/${projectId}/google-ads/recommendations/refresh`, { method: 'POST' });
  }

  async getGoogleAdsDevicePerformance(projectId, dateRange) {
    const params = new URLSearchParams(this._googleAdsRangeParams(dateRange));
    return this.request(`/projects/${projectId}/google-ads/device-performance?${params.toString()}`);
  }

  async getGoogleAdsGeoPerformance(projectId, { level = 'country', page = 1, limit = 25, search, sortBy = 'cost', sortOrder = -1 } = {}) {
    const params = new URLSearchParams({ level, page, limit, sortBy, sortOrder });
    if (search) params.set('search', search);
    return this.request(`/projects/${projectId}/google-ads/geo-performance?${params.toString()}`);
  }

  async getGoogleAdsAudiencePerformance(projectId) {
    return this.request(`/projects/${projectId}/google-ads/audience-performance`);
  }

  async getGoogleAdsAdPerformance(projectId, { page = 1, limit = 25, campaignId, adType, includeRemoved, sortBy = 'cost', sortOrder = -1, groupBy } = {}) {
    const params = new URLSearchParams({ page, limit, sortBy, sortOrder });
    if (campaignId) params.set('campaignId', campaignId);
    if (adType) params.set('adType', adType);
    if (includeRemoved) params.set('includeRemoved', 'true');
    if (groupBy) params.set('groupBy', groupBy);
    return this.request(`/projects/${projectId}/google-ads/ads?${params.toString()}`);
  }

  async getGoogleAdsBudgetOverview(projectId) {
    return this.request(`/projects/${projectId}/google-ads/budget/overview`);
  }

  async getGoogleAdsBudgetForecast(projectId) {
    return this.request(`/projects/${projectId}/google-ads/budget/forecast`);
  }

  async getGoogleAdsAttribution(projectId) {
    return this.request(`/projects/${projectId}/google-ads/attribution`);
  }

  async getGoogleAdsCapabilities(projectId) {
    return this.request(`/projects/${projectId}/google-ads/capabilities`);
  }

  async getGoogleAdsActivity(projectId, { limit = 20, lookbackDays = 14 } = {}) {
    const params = new URLSearchParams({ limit, lookbackDays });
    return this.request(`/projects/${projectId}/google-ads/activity?${params.toString()}`);
  }

  // ── WordPress Connection (Phase 2 — connect/verify/status/disconnect
  // only; not the mock /app/wordpress dashboard) ──────────────────────────

  async connectWordPress(projectId, { siteUrl, username, applicationPassword }) {
    return this.request('/wordpress/connect', {
      method: 'POST',
      body: JSON.stringify({ projectId, siteUrl, username, applicationPassword }),
    });
  }

  async getWordPressStatus(projectId) {
    const params = new URLSearchParams({ projectId });
    return this.request(`/wordpress/status?${params.toString()}`);
  }

  async verifyWordPressConnection(projectId) {
    return this.request('/wordpress/verify', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    });
  }

  async disconnectWordPress(projectId) {
    const params = new URLSearchParams({ projectId });
    return this.request(`/wordpress/disconnect?${params.toString()}`, { method: 'DELETE' });
  }

  // ── WordPress Plugin (Phase 3A — pairing, plugin status, detected
  // forms; not form submission capture, which is Phase 3B) ───────────────

  async generateWordPressPairingToken(projectId) {
    return this.request('/wordpress/plugin/pairing-token', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    });
  }

  async getWordPressPluginStatus(projectId) {
    const params = new URLSearchParams({ projectId });
    return this.request(`/wordpress/plugin/status?${params.toString()}`);
  }

  async getWordPressForms(projectId) {
    const params = new URLSearchParams({ projectId });
    return this.request(`/wordpress/plugin/forms?${params.toString()}`);
  }

  /**
   * Triggers a browser download of the plugin .zip. A bare <a href> can't
   * carry the Authorization header this endpoint requires (same reasoning
   * as getGoogleConnectUrl above), so this fetches the file as a blob first
   * and drives the download via a temporary object URL.
   */
  async downloadWordPressPlugin() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`${this.baseURL}/wordpress/plugin/download`, {
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });
    if (!response.ok) {
      throw new Error('Failed to download the Odito plugin package.');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'odito-lead-capture.zip';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  // ── Leads (Phase 3B — real backend, replaces the /app/leads mock) ──────

  async getLeads(projectId, { status, priority, search, page = 1, limit = 20, sort, sortOrder } = {}) {
    const params = new URLSearchParams({ projectId, page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    if (priority) params.set('priority', priority);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    if (sortOrder) params.set('sortOrder', sortOrder);
    return this.request(`/leads?${params.toString()}`);
  }

  async getLeadStats(projectId) {
    const params = new URLSearchParams({ projectId });
    return this.request(`/leads/stats?${params.toString()}`);
  }

  async getLead(leadId) {
    return this.request(`/leads/${leadId}`);
  }

  async createLead(projectId, payload) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify({ projectId, ...payload }),
    });
  }

  async updateLead(leadId, updates) {
    return this.request(`/leads/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteLead(leadId) {
    return this.request(`/leads/${leadId}`, { method: 'DELETE' });
  }

}



// Create and export a singleton instance

const apiService = new ApiService();

export default apiService;

