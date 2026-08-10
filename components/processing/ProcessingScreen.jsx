"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StepList from './StepList';
import apiService from '@/lib/apiService';

// Derive a stage's status purely from its own job-type bucket. No shared
// "current step" concept — every stage is independent.
//
// A stage's bucket can represent either a single job (most stages) or N
// sibling chunk jobs sharing one JobGroup (PAGE_SCRAPING, HEADLESS_ACCESSIBILITY
// in a full audit). Either way, the stage is NOT done just because
// `completed > 0` — that's only true once every job in the bucket has
// reached a terminal state (nothing left pending or processing). For a
// single-job stage this is equivalent to the old completed>0 check (there's
// only one job, so once it's terminal, pending/processing are already 0);
// for a chunked stage it correctly waits for every chunk.
//
// Failure semantics match the backend JobGroup states: if every resolved
// job/chunk failed (completed===0), the stage truly failed. If some
// succeeded and some failed (partial), the stage is treated as completed —
// matching the backend's 'partial' JobGroup status, which still lets the
// pipeline continue rather than stopping the audit.
function deriveStatusFromJobData(jobData) {
  if (!jobData) return 'pending';

  const pending = jobData.pending || 0;
  const processing = jobData.processing || 0;
  const completed = jobData.completed || 0;
  const failed = jobData.failed || 0;

  if (pending > 0 || processing > 0) return 'running';
  if (completed === 0 && failed === 0) return 'pending';
  if (failed > 0 && completed === 0) return 'failed';
  return 'completed';
}

// True stage failure only: every job/chunk in the bucket resolved and NONE
// succeeded. A partially-successful chunked stage (some completed, some
// failed) is not a stage failure — see deriveStatusFromJobData above.
function isStageFullyFailed(jobData) {
  if (!jobData) return false;
  const pending = jobData.pending || 0;
  const processing = jobData.processing || 0;
  const completed = jobData.completed || 0;
  const failed = jobData.failed || 0;

  if (pending > 0 || processing > 0) return false;
  return failed > 0 && completed === 0;
}

const ProcessingScreen = ({ projectId, onDone }) => {
  const router = useRouter();

  // Complete backend pipeline stages with icons and display names
  const steps = [
    { label: "Discover Links", icon: "🔗", key: 'LINK_DISCOVERY' },
    { label: "Technical Domain", icon: "⚙️", key: 'TECHNICAL_DOMAIN' },
    { label: "Crawl Pages", icon: "🕷", key: 'PAGE_SCRAPING' },
    { label: "Accessibility", icon: "♿", key: 'HEADLESS_ACCESSIBILITY' },
    { label: "Crawl Graph", icon: "🗺️", key: 'CRAWL_GRAPH' },
    { label: "Mobile Performance", icon: "📱", key: 'PERFORMANCE_MOBILE' },
    { label: "Desktop Performance", icon: "💻", key: 'PERFORMANCE_DESKTOP' },
    { label: "Page Analysis", icon: "📊", key: 'PAGE_ANALYSIS' },
    { label: "SEO Scoring", icon: "🎯", key: 'SEO_SCORING' },
    { label: "AI Visibility", icon: "🧠", key: 'AI_VISIBILITY' },
  ];

  const [jobStatus, setJobStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setError('Project ID is required to track audit progress');
      return;
    }

    // Real job polling logic - backend as source of truth
    const pollJobStatus = async () => {
      try {
        const response = await apiService.getAuditStatus(projectId);
        if (response.success) {
          // URL Selection gate: URL_QUALIFICATION has completed and the
          // pipeline is parked waiting for the user to review/approve
          // discovered URLs — no PAGE_SCRAPING/HEADLESS_ACCESSIBILITY job
          // exists yet, so the job-bucket polling below would otherwise sit
          // frozen forever. Redirect instead of rendering the spinner.
          if (response.crawl_status === 'awaiting_url_selection') {
            router.push(`/projects/${projectId}/url-selection`);
            return;
          }

          setJobStatus(response.data);

          const hasFailedJobs = Object.values(response.data).some(isStageFullyFailed);

          // Audit completion is a single, canonical signal owned by the
          // backend: SeoProject.crawl_status only becomes 'completed' once
          // chainingEngine's _finalizeAuditCompletion() has verified every
          // required terminal job type (SEO_SCORING AND AI_VISIBILITY, not
          // either alone) has actually resolved for this run — see
          // AuditHistoryService.allTerminalsResolved(). The frontend does not
          // reconstruct pipeline state to make this decision; it just reads
          // the backend's answer.
          const auditComplete = response.crawl_status === 'completed';

          if (hasFailedJobs) {
            setError('One or more jobs failed during the audit');
          } else if (auditComplete) {
            setIsCompleted(true);
            setTimeout(onDone, 1000);
          } else {
            // Clear any error a previous poll set (e.g. a transient job
            // failure that later self-recovered) — error state must reflect
            // the current poll, not the worst historical one, otherwise a
            // single transient failure permanently poisons the screen even
            // while the audit goes on to complete successfully.
            setError(null);
          }
        }
      } catch (err) {
        console.error('Error polling job status:', err);
        setError(err.message || 'Failed to check job status');
      }
    };

    // Start polling immediately and then every 2 seconds
    pollJobStatus();
    const interval = setInterval(pollJobStatus, 2000);

    return () => clearInterval(interval);
  }, [projectId, onDone]);

  // Independent per-stage status model: pending | running | completed | failed.
  // Every stage derives its own status from its own backend job-type bucket —
  // there is no shared "current active step" scalar, and any number of stages
  // can be `running` (or `completed`) at the same time. This matches the
  // pipeline's actual execution: LINK_DISCOVERY, TECHNICAL_DOMAIN and
  // DOMAIN_PERFORMANCE all run concurrently from audit start.
  const getStepStatus = (stepIndex) => {
    if (!jobStatus) return 'pending';

    const step = steps[stepIndex];
    const jobData = jobStatus[step.key.toLowerCase()];

    // DOMAIN_PERFORMANCE is a standalone job seeded at audit start — it is
    // not part of the CRAWL_GRAPH -> PERFORMANCE_MOBILE/PERFORMANCE_DESKTOP
    // chain and has no row of its own in `steps`. While it's processing, it
    // gives early "Running" feedback on the Mobile/Desktop Performance rows,
    // before their own per-page jobs even exist yet. Only its *processing*
    // signal is borrowed, never `completed` — DOMAIN_PERFORMANCE finishing
    // does not mean per-page performance analysis is done.
    if (step.key === 'PERFORMANCE_MOBILE' || step.key === 'PERFORMANCE_DESKTOP') {
      const ownStatus = deriveStatusFromJobData(jobData);
      if (ownStatus === 'pending' && jobStatus['domain_performance']?.processing > 0) {
        return 'running';
      }
      return ownStatus;
    }

    return deriveStatusFromJobData(jobData);
  };

  const completedSteps = steps
    .map((_, index) => index)
    .filter(index => getStepStatus(index) === 'completed');

  const runningSteps = steps
    .map((_, index) => index)
    .filter(index => getStepStatus(index) === 'running');

  // Calculate progress based on pipeline stage completion (not job counts)
  // Each stage counts as 1 unit regardless of how many jobs it spawns
  const calculateProgress = () => {
    if (!jobStatus) return 0;
    const totalStages = steps.length;
    return totalStages > 0 ? Math.round((completedSteps.length / totalStages) * 100) : 0;
  };

  const progress = calculateProgress();

  // Navigation away from this screen happens ONLY from the single
  // `auditComplete` check inside pollJobStatus above (driven by the
  // backend's canonical crawl_status field) — see the `onDone` call there.
  // There is intentionally no second, independently-computed "are all steps
  // done" redirect here: this component's own per-step status derivation
  // (getStepStatus/completedSteps, used for the progress bar) is a display
  // concern only and must never itself decide when to navigate away.

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div className="glass-card" style={{ width: "100%", maxWidth: 480, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Something went wrong</div>
          <div style={{ fontSize: 14, color: "var(--text3)", marginBottom: 24 }}>{error}</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px",
              backgroundColor: "var(--grad1)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: 480, padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="url(#proc-grad)" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - progress / 100)}`}
                strokeLinecap="round"
                style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.5s" }}
              />
              <defs>
                <linearGradient id="proc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#00e5ff" />
                </linearGradient>
              </defs>
              <text x="40" y="44" textAnchor="middle" fill="white" fontSize="16" fontWeight="700" fontFamily="var(--font-metric), sans-serif">{Math.round(progress)}%</text>
            </svg>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
            Analyzing Your Site
          </div>
          <div style={{ fontSize: 13, color: "var(--text3)" }}>
            {jobStatus
              ? `${completedSteps.length}/${steps.length} stages completed${runningSteps.length > 0 ? ` · ${runningSteps.length} running` : ''}`
              : 'Initializing audit...'
            }
          </div>
        </div>

        <StepList steps={steps} jobStatus={jobStatus} getStepStatus={getStepStatus} />
      </div>
    </div>
  );
};

export default ProcessingScreen;
