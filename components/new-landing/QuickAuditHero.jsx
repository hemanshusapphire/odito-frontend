"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ArrowRight, Info } from "lucide-react";
import ThinProgressLoader from "@/components/ui/ThinProgressLoader";
import apiService from "@/lib/apiService";
import QuickAuditResult from "@/components/dashboard/QuickAuditResult";
import BusinessSearchStep from "@/components/dashboard/quick-audit/BusinessSearchStep";
import { getGrade } from "@/lib/homepageAudit/constants";

// Helper: normalize severity (matches backend mapper.py normalize_severity)
function normalizeSeverity(value) {
  if (!value) return 'low';
  const v = value.toLowerCase();
  if (['critical', 'high'].includes(v)) return 'critical';
  if (['medium', 'warning'].includes(v)) return 'medium';
  return 'low';
}

/**
 * Build canonical accessibility checks from accessibility_metrics.
 * Mirrors backend build_accessibility_checks() exactly.
 * This ensures accessibility follows the SAME section architecture as all other sections.
 */
function buildAccessibilityChecks(accessibilityMetrics) {
  if (!accessibilityMetrics || accessibilityMetrics.status === 'processing') return [];
  
  const issues = accessibilityMetrics.issues || {};
  const landmarks = accessibilityMetrics.landmarks || {};
  
  const checkDefs = [
    { name: 'Axe Violations', rule_id: 'axe_violations', count: issues.axe_violations || 0, fail_severity: 'critical', fail_msg: (c) => `Found ${c} axe-core accessibility violations`, pass_msg: 'No axe-core accessibility violations detected' },
    { name: 'Missing Labels', rule_id: 'missing_form_labels', count: issues.missing_labels || 0, fail_severity: 'critical', fail_msg: (c) => `Found ${c} form elements missing accessible labels`, pass_msg: 'All form elements have accessible labels' },
    { name: 'Focus Issues', rule_id: 'focus_issues', count: issues.focus_issues || 0, fail_severity: 'medium', fail_msg: (c) => `Found ${c} focus management issues affecting keyboard navigation`, pass_msg: 'Focus management is properly implemented' },
    { name: 'Clickable Divs', rule_id: 'clickable_divs', count: issues.clickable_divs || 0, fail_severity: 'medium', fail_msg: (c) => `Found ${c} clickable div elements that should be buttons or links`, pass_msg: 'All clickable elements use proper semantic HTML' },
    { name: 'Autoplay Media', rule_id: 'autoplay_media', count: issues.autoplay_media || 0, fail_severity: 'medium', fail_msg: (c) => `Found ${c} autoplaying media elements that may interfere with screen readers`, pass_msg: 'No autoplaying media detected' },
    { name: 'Main Landmark', rule_id: 'landmark_main', count: landmarks.main ? 0 : 1, fail_severity: 'medium', fail_msg: () => 'Missing main landmark. Screen readers cannot easily navigate to primary content', pass_msg: 'Main landmark detected' },
    { name: 'Navigation Landmark', rule_id: 'landmark_nav', count: landmarks.nav ? 0 : 1, fail_severity: 'medium', fail_msg: () => 'Missing navigation landmark. Screen reader users cannot easily access navigation menus', pass_msg: 'Navigation landmark detected' },
    { name: 'Header Landmark', rule_id: 'landmark_header', count: landmarks.header ? 0 : 1, fail_severity: 'low', fail_msg: () => 'Missing header landmark. Inconsistent page structure for screen reader users', pass_msg: 'Header landmark detected' },
    { name: 'Footer Landmark', rule_id: 'landmark_footer', count: landmarks.footer ? 0 : 1, fail_severity: 'low', fail_msg: () => 'Missing footer landmark. Inconsistent page structure for screen reader users', pass_msg: 'Footer landmark detected' },
  ];
  
  return checkDefs.map(def => {
    const status = def.count > 0 ? 'fail' : 'pass';
    return {
      name: def.name,
      rule_id: def.rule_id,
      status,
      severity: status === 'fail' ? def.fail_severity : 'low',
      message: status === 'fail' ? def.fail_msg(def.count) : def.pass_msg,
      category: 'accessibility'
    };
  });
}

/**
 * Recompute sections.summary from ALL visible section checks.
 * Mirrors backend generate_sections_summary() exactly.
 * Called whenever async sections update (accessibility, performance).
 * Ensures summary cards ALWAYS match visible issue cards.
 */
function recomputeSectionsSummary(sections) {
  const allChecks = [];
  
  // Collect checks from all sections (except summary itself)
  Object.entries(sections).forEach(([key, section]) => {
    if (key === 'summary') return;  // Skip summary itself
    const checks = section?.checks || [];
    allChecks.push(...checks);
  });
  
  const total = allChecks.length;
  const passed = allChecks.filter(c => c.status === 'pass').length;
  const failed = total - passed;
  
  const critical = allChecks.filter(c => 
    c.status !== 'pass' && normalizeSeverity(c.severity) === 'critical'
  ).length;
  let warnings = failed - critical;
  
  // Safety: ensure counts add up
  if (critical + warnings !== failed) {
    warnings = failed - critical;
  }
  
  return { total, critical, warnings, passed };
}

export default function QuickAuditHero() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [auditResults, setAuditResults] = useState(null);
  const [error, setError] = useState(null);

  // Business search step state
  const [showDiscoveryStep, setShowDiscoveryStep] = useState(false);
  const [pendingUrl, setPendingUrl] = useState(null);
  const [businessContext, setBusinessContext] = useState(null);

  const progressIntervalRef = useRef(null);

  const startProgressAnimation = () => {
    setProgress(0);
    
    // Quick jump to 30% within 0.5s
    setTimeout(() => setProgress(30), 100);
    setTimeout(() => setProgress(35), 200);
    setTimeout(() => setProgress(40), 300);
    setTimeout(() => setProgress(45), 400);
    setTimeout(() => setProgress(50), 500);
    
    // Slowly increase to 70-85% range
    let currentProgress = 50;
    progressIntervalRef.current = setInterval(() => {
      if (currentProgress < 75) {
        currentProgress += Math.random() * 3 + 1; // Random increment between 1-4
        setProgress(Math.min(currentProgress, 75));
      } else if (currentProgress < 85) {
        currentProgress += Math.random() * 2; // Slower increment
        setProgress(Math.min(currentProgress, 85));
      }
    }, 800);
  };

  const completeProgress = () => {
    // Clear any ongoing intervals
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    // Jump to 100%
    setProgress(100);
    
    // Set completion state and hide loader after 300ms
    setTimeout(() => {
      setProgress(0);
      setIsLoading(false);
      setIsCompleted(true);
    }, 300);
  };

  // Step 1: URL submitted → reveal inline search step immediately (no API call)
  const handleAudit = () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please enter a valid URL');
      return;
    }

    setError(null);
    setAuditResults(null);
    setIsCompleted(false);
    setBusinessContext(null);
    setPendingUrl(trimmedUrl);
    setShowDiscoveryStep(true);
  };

  // Step 2a: User confirmed business → start audit with context
  const handleBusinessConfirmed = (context) => {
    setBusinessContext(context);
    setShowDiscoveryStep(false);
    startActualAudit(pendingUrl, context);
  };

  // Step 2b: User skipped → start audit without context
  const handleSkipDiscovery = () => {
    setShowDiscoveryStep(false);
    startActualAudit(pendingUrl, null);
  };

  // Step 3: Run the full homepage audit pipeline
  const startActualAudit = async (targetUrl, context) => {
    setIsLoading(true);

    // Start progress animation
    startProgressAnimation();

    try {
      console.log("🚀 Starting audit API call for URL:", targetUrl);
      const response = await apiService.performHomepageAudit(targetUrl);
      console.log("✅ API response received:", response);
      setAuditResults(response.data || response);

      // Store audit response in localStorage with timestamp, URL and business context
      const dataToStore = {
        data: response.data || response,
        timestamp: Date.now(),
        url: targetUrl,
        businessContext: context || null
      };
      
      localStorage.setItem(
        "homepage_audit_result",
        JSON.stringify(dataToStore)
      );
      
      console.log("💾 Audit stored in localStorage:", dataToStore);
      
      console.log("🚀 Homepage audit completed - showing UI immediately");
      
      // Complete progress and show UI immediately after homepage audit
      completeProgress();
      
      // Initialize with processing status for metrics
      // Use canonical `performance` object matching backend schema
      const initialData = {
        ...dataToStore.data,
        performance: {
          ...(dataToStore.data.performance || {}),
          status: "processing",
          score: null,
          mobile: null,
          desktop: null,
        },
        performance_metrics: {
          status: "processing",
          score: null,
          mobile: null,
          desktop: null,
        },
        accessibility_metrics: {
          status: "processing",
          message: "Accessibility analysis in progress..."
        }
      };
      
      // Update localStorage with initial processing state
      localStorage.setItem("homepage_audit_result", JSON.stringify({
        ...dataToStore,
        data: initialData
      }));
      
      // Update React state to show UI immediately
      setAuditResults(initialData);
      
      // Run PageSpeed and Accessibility in background (fire and forget)
      console.log("⚡ Triggering PageSpeed and Accessibility in background...");
      
      // PageSpeed background task
      apiService.performHomepagePageSpeed(targetUrl)
        .then((psRes) => {
          console.log("✅ PageSpeed SUCCESS:", psRes);
          
          // Merge PageSpeed response into existing audit data
          const existing = JSON.parse(localStorage.getItem("homepage_audit_result"));
          
          if (existing && psRes.success) {
            // Determine status based on available data
            const hasMobile = psRes.data.mobile !== null;
            const hasDesktop = psRes.data.desktop !== null;
            let status = "completed";
            
            if (hasMobile && hasDesktop) {
              status = "completed";
            } else if (hasMobile || hasDesktop) {
              status = "completed_partial";
            }
            
            // Calculate canonical score from PageSpeed response (backend-calculated)
            const psScore = psRes.data.score ?? null;
            
            const updated = {
              ...existing,
              data: {
                ...existing.data,
                // CANONICAL performance object — single source of truth
                performance: {
                  status: status,
                  score: psScore,
                  mobile: psRes.data.mobile,
                  desktop: psRes.data.desktop,
                  grade: psScore !== null ? getGrade(psScore) : null,
                  message: psRes.message || 'PageSpeed analysis completed'
                },
                // Legacy path kept for backward compat during migration
                performance_metrics: {
                  status: status,
                  score: psScore,
                  mobile: psRes.data.mobile,
                  desktop: psRes.data.desktop,
                  message: psRes.message || 'PageSpeed analysis completed'
                }
              }
            };
            
            // Update localStorage
            localStorage.setItem("homepage_audit_result", JSON.stringify(updated));

            // Update React state to trigger re-render
            setAuditResults(updated.data);

            // Persist performance data back to MongoDB snapshot
            const auditId = existing.data._audit_id;
            if (auditId) {
              apiService.updateHomepageAuditSnapshot(auditId, 'performance', {
                performance: updated.data.performance,
                performance_metrics: updated.data.performance_metrics,
                performance_score: psScore,
                sections_performance: {
                  ...(existing.data.sections?.performance || {}),
                  score: psScore
                }
              }).catch((err) => console.error('[SNAPSHOT] Performance update failed:', err.message));
            }

            console.log("📊 PageSpeed data merged into audit results:", updated);
            console.log(`📊 Status: ${status}, Mobile: ${hasMobile ? '✅' : '❌'}, Desktop: ${hasDesktop ? '✅' : '❌'}`);
          }
        })
        .catch((err) => {
          console.log("❌ PageSpeed FAILED:", err);
          
          // Check if it's a timeout error
          const isTimeout = err.message && err.message.includes('timed out');
          
          // Keep processing state for timeout, failed state for other errors
          const existing = JSON.parse(localStorage.getItem("homepage_audit_result"));
          if (existing) {
            const failedState = isTimeout ? "processing" : "failed";
            const updated = {
              ...existing,
              data: {
                ...existing.data,
                // CANONICAL performance object
                performance: {
                  ...(existing.data.performance || {}),
                  status: failedState,
                  score: null,
                  mobile: null,
                  desktop: null,
                  error: err.message || 'PageSpeed analysis failed',
                },
                // Legacy path
                performance_metrics: {
                  status: failedState,
                  score: null,
                  error: err.message || 'PageSpeed analysis failed',
                  mobile: null,
                  desktop: null,
                }
              }
            };
            
            localStorage.setItem("homepage_audit_result", JSON.stringify(updated));
            setAuditResults(updated.data);
            
            if (isTimeout) {
              console.log("⏰ PageSpeed timed out - keeping processing state for retry");
            }
          }
        });

      // Accessibility background task
      apiService.performAccessibilityAudit(targetUrl)
        .then((a11yRes) => {
          console.log("♿ Accessibility SUCCESS:", a11yRes);
          
          // Merge Accessibility response into existing audit data
          const existing = JSON.parse(localStorage.getItem("homepage_audit_result"));
          
          if (existing && a11yRes.success) {
            // Build canonical accessibility metrics
            const accessibilityMetrics = {
              status: "completed",
              score: a11yRes.data.accessibility_score,
              issues: a11yRes.data.issues,
              landmarks: a11yRes.data.landmarks,
              execution_time_ms: a11yRes.data.execution_time_ms,
              message: 'Accessibility analysis completed'
            };
            
            // Build canonical accessibility checks (same architecture as all other sections)
            const accessibilityChecks = buildAccessibilityChecks(accessibilityMetrics);
            const accessibilityScore = a11yRes.data.accessibility_score || 0;
            
            // Build updated sections with canonical accessibility section
            const updatedSections = {
              ...existing.data.sections,
              accessibility: {
                score: accessibilityScore,
                grade: getGrade(accessibilityScore),
                checks: accessibilityChecks,
                status: 'completed'
              }
            };
            
            // Recompute sections.summary from ALL visible section checks (including accessibility)
            updatedSections.summary = recomputeSectionsSummary(updatedSections);

            // Recompute top_issues from all failed checks across all sections
            // Mirrors mapper.py top_issues generation — single source of truth
            const _severityPriority = { critical: 3, medium: 2, low: 1 };
            const _allFailed = [];
            Object.entries(updatedSections).forEach(([key, section]) => {
              if (key === 'summary') return;
              (section?.checks || []).filter(c => c.status !== 'pass').forEach(c => _allFailed.push(c));
            });
            _allFailed.sort((a, b) =>
              (_severityPriority[normalizeSeverity(b.severity)] || 0) -
              (_severityPriority[normalizeSeverity(a.severity)] || 0)
            );
            const recomputedTopIssues = _allFailed.slice(0, 10).map((check, idx) => ({
              priority: idx + 1,
              rule_id: check.rule_id,
              severity: normalizeSeverity(check.severity),
              message: check.message,
              category: check.category
            }));

            const updatedRulesSummary = {
              total: updatedSections.summary.total,
              passed: updatedSections.summary.passed,
              failed: updatedSections.summary.total - updatedSections.summary.passed
            };

            const updated = {
              ...existing,
              data: {
                ...existing.data,
                accessibility_metrics: accessibilityMetrics,
                sections: updatedSections,
                rules_summary: updatedRulesSummary,
                top_issues: recomputedTopIssues
              }
            };

            // Update localStorage
            localStorage.setItem("homepage_audit_result", JSON.stringify(updated));

            // Update React state to trigger re-render
            setAuditResults(updated.data);

            // Persist accessibility data back to MongoDB snapshot
            const auditId = existing.data._audit_id;
            if (auditId) {
              apiService.updateHomepageAuditSnapshot(auditId, 'accessibility', {
                accessibility_metrics: accessibilityMetrics,
                sections_accessibility: updatedSections.accessibility,
                sections_summary: updatedSections.summary,
                rules_summary: updatedRulesSummary,
                top_issues: recomputedTopIssues
              }).catch((err) => console.error('[SNAPSHOT] Accessibility update failed:', err.message));
            }

            console.log("♿ Accessibility data merged into audit results:", updated);
            console.log(`♿ Summary recomputed: total=${updatedSections.summary.total}, critical=${updatedSections.summary.critical}, warnings=${updatedSections.summary.warnings}, passed=${updatedSections.summary.passed}`);
          }
        })
        .catch((a11yErr) => {
          console.log("❌ Accessibility FAILED:", a11yErr);
          
          // Keep processing with error state
          const existing = JSON.parse(localStorage.getItem("homepage_audit_result"));
          if (existing) {
            const failedMetrics = {
              status: "failed",
              error: a11yErr.message || 'Accessibility analysis failed',
              score: 0,
              issues: [],
              landmarks: [],
              execution_time_ms: 0
            };
            
            // Update sections.accessibility with failed status (no checks added)
            const updatedSections = {
              ...existing.data.sections,
              accessibility: {
                score: 0,
                grade: getGrade(0),
                checks: [],
                status: 'failed'
              }
            };
            
            // Recompute sections.summary (accessibility failed adds no checks, but keeps consistency)
            updatedSections.summary = recomputeSectionsSummary(updatedSections);
            
            const updated = {
              ...existing,
              data: {
                ...existing.data,
                accessibility_metrics: failedMetrics,
                sections: updatedSections
              }
            };
            
            localStorage.setItem("homepage_audit_result", JSON.stringify(updated));
            setAuditResults(updated.data);
          }
        });
      
    } catch (err) {
      console.error("❌ Audit API call failed:", err);
      setError(err.message || 'Failed to perform audit');
      completeProgress();
    }
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Expand layout (top-aligned) when step is showing OR results are ready
  const layoutExpanded = (isCompleted && !isLoading) || showDiscoveryStep;

  return (
    <main className={`min-h-screen flex flex-col items-center relative overflow-hidden px-6 bg-[#0a0a0f] transition-all duration-500 ${layoutExpanded ? 'justify-start pt-20 md:pt-28 pb-12' : 'justify-center py-20 md:py-32'}`}>
      {/* Dark Overlay */}
      <div className="absolute inset-0 dark-overlay -z-10"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-pattern -z-10 opacity-50"></div>

      {/* Decorative Background Elements - Cyan/Purple Theme */}
      <div className="absolute inset-0 -z-10 opacity-15">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] bg-cyan-500/10"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] bg-purple-500/10"></div>
      </div>

      {/* Bottom Decorative Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent -z-10"></div>

      <div className="max-w-4xl w-full text-center z-10 flex flex-col items-center">
        {/* Pill Badge */}
        <div className="mb-12">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold tracking-wider border border-cyan-500/20 backdrop-blur-sm">
            <span className="text-sm mr-1.5">⚡</span>
            Advanced Analytics Engine
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-[64px] font-extrabold text-white mb-12 leading-[1.1] tracking-tight">
          <span className="block">SEO Audit &</span>
          <span className="accent-underline text-cyan-400">AI Visibility Checker</span>
        </h1>

        {/* Subheading — fades out when discovery step is active */}
        <p
          style={{ transition: 'opacity 0.4s ease' }}
          className={`text-lg text-gray-400 mb-16 max-w-[600px] mx-auto text-center leading-relaxed font-light ${showDiscoveryStep ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          Simple, Affordable SEO / GEO Toolset for professionals aiming for high-velocity growth.
        </p>

        {/* Audit Input Section */}
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-md rounded-full p-1.5 soft-bloom border border-cyan-500/30 flex flex-col md:flex-row items-center gap-3 input-focus-glow transition-all duration-300">
          <div className="flex items-center w-full px-5">
            <Globe className="text-cyan-400 mr-3 text-lg" />
            <input
              className="w-full bg-transparent border-none focus:ring-0 text-base text-white placeholder-cyan-400/50 py-3 outline-none"
              placeholder="example.com"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading || showDiscoveryStep}
              onKeyDown={(e) => e.key === 'Enter' && handleAudit()}
            />
          </div>
          <button
            onClick={handleAudit}
            disabled={isLoading || showDiscoveryStep || !url.trim()}
            className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-cyan-400 text-white font-semibold px-8 py-3.5 rounded-full flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
          >
            <>
              <span>{isLoading ? 'Auditing...' : 'Continue'}</span>
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </>
          </button>
        </div>

        {/* Progress Loader */}
        {(isLoading || isCompleted) && (
          <div className="w-full max-w-2xl mt-4">
            {isLoading && (
              <div className="flex items-center gap-3">
                <ThinProgressLoader progress={progress} isVisible={true} />
                <span className="text-cyan-400 text-sm font-medium animate-pulse">
                  Processing...
                </span>
              </div>
            )}
            {isCompleted && !isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-full h-[3px] bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                <span className="text-green-400 text-sm font-medium">
                  Completed Successfully ✅
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-2xl mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Helper text — fades when step is active */}
        <div
          style={{ transition: 'opacity 0.4s ease' }}
          className={`mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 ${showDiscoveryStep ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <Info className="w-[18px] h-[18px] text-cyan-400" />
          <p>Enter a URL address and get a Free Website Analysis!</p>
        </div>

        {/* ── Inline Business Discovery Step ───────────────────────────────────
             Expands smoothly below the URL bar via CSS grid-rows animation.
             No modal, no overlay — pure in-page flow.
        ─────────────────────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateRows: showDiscoveryStep ? '1fr' : '0fr',
            opacity: showDiscoveryStep ? 1 : 0,
            transition: 'grid-template-rows 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease',
            width: '100%',
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <div className="pt-2 pb-2">
              <BusinessSearchStep
                url={pendingUrl}
                onConfirm={handleBusinessConfirmed}
                onSkip={handleSkipDiscovery}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Results Section */}
      {isCompleted && !isLoading && (
        <div className="w-full mt-16 md:mt-20 px-4 md:px-6 pb-16">
          <div className="max-w-7xl w-full mx-auto">
            <QuickAuditResult data={auditResults} businessContext={businessContext} />
          </div>
        </div>
      )}
    </main>
  );
}
