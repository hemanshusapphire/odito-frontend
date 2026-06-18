"use client";

import { useState, useEffect, useRef } from "react";
import apiService from "@/lib/apiService";

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch {
    return null;
  }
}

async function pollJobStatus(jobId) {
  const res = await apiService.request(`/jobs/${jobId}/status`);
  return res;
}

// ─── component ────────────────────────────────────────────────────────────────

/**
 * Lazy-loaded Homepage Audit Video CTA.
 * Renders below the hero score cards on the Quick Audit Results page.
 * Only creates a video job when the user explicitly clicks the CTA.
 *
 * States: idle → pending → processing → rendered | failed
 * State survives page refresh via localStorage (key: homepageVideoJob_<auditId>).
 */
export default function HomepageVideoSection({ auditId }) {
  const [status, setStatus]             = useState("idle");   // idle|pending|processing|rendered|failed
  const [jobId, setJobId]               = useState(null);
  const [videoUrl, setVideoUrl]         = useState(null);
  const [generatedAt, setGeneratedAt]   = useState(null);
  const [progress, setProgress]         = useState(0);
  const [currentStep, setCurrentStep]   = useState("");
  const [error, setError]               = useState("");
  const [initializing, setInitializing] = useState(true);
  const [copySuccess, setCopySuccess]   = useState(false);
  const [downloadLoading, setDownload]  = useState(false);

  const pollingRef  = useRef(null);
  const videoRef    = useRef(null);
  const storageKey  = auditId ? `homepageVideoJob_${auditId}` : null;

  // ── on mount: restore state from backend + localStorage ─────────────────
  useEffect(() => {
    if (!auditId) { setInitializing(false); return; }
    restoreState();
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [auditId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function restoreState() {
    setInitializing(true);
    try {
      const res = await apiService.getHomepageAuditVideoStatus(auditId);
      if (res?.success && res?.data) {
        const { status: vs, jobId: vj, videoUrl: vu, generatedAt: vd } = res.data;

        if (vs === "RENDERED" && vu) {
          setStatus("rendered");
          setVideoUrl(vu);
          setGeneratedAt(vd);
          if (storageKey) localStorage.removeItem(storageKey);
          return;
        }
        if ((vs === "PENDING" || vs === "PROCESSING") && vj) {
          setJobId(vj);
          setStatus("processing");
          if (storageKey) localStorage.setItem(storageKey, vj);
          startPolling(vj);
          return;
        }
        if (vs === "FAILED") {
          setStatus("failed");
          if (storageKey) localStorage.removeItem(storageKey);
          return;
        }
      }

      // No backend state — check localStorage for an orphaned job
      const stored = storageKey ? localStorage.getItem(storageKey) : null;
      if (stored) {
        try {
          const jr = await pollJobStatus(stored);
          if (jr?.success && jr?.data) {
            const { status: js, result_data } = jr.data;
            if (js === "completed" && result_data?.videoUrl) {
              setStatus("rendered");
              setVideoUrl(result_data.videoUrl);
              if (storageKey) localStorage.removeItem(storageKey);
              return;
            }
            if (["pending", "processing", "retrying"].includes(js)) {
              setJobId(stored);
              setStatus("processing");
              startPolling(stored);
              return;
            }
          }
        } catch {
          // job gone — clear
        }
        if (storageKey) localStorage.removeItem(storageKey);
      }

      setStatus("idle");
    } catch {
      setStatus("idle");
    } finally {
      setInitializing(false);
    }
  }

  // ── polling ──────────────────────────────────────────────────────────────
  function startPolling(jId) {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      // Primary: check the audit's video status (always public, no auth needed)
      try {
        const auditRes = await apiService.getHomepageAuditVideoStatus(auditId);
        if (auditRes?.success && auditRes?.data) {
          const { status: vs, videoUrl: vu, generatedAt: vd } = auditRes.data;
          if (vs === "RENDERED" && vu) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            setStatus("rendered");
            setVideoUrl(vu);
            setGeneratedAt(vd);
            setProgress(100);
            if (storageKey) localStorage.removeItem(storageKey);
            return;
          }
          if (vs === "FAILED") {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            setStatus("failed");
            setError("Video generation failed. Please try again.");
            if (storageKey) localStorage.removeItem(storageKey);
            return;
          }
        }
      } catch {
        // silent — audit status poll failure is not fatal
      }

      // Secondary: enrich with progress % from job status (best-effort)
      if (!jId) return;
      try {
        const jr = await pollJobStatus(jId);
        if (!jr?.success || !jr?.data) return;
        const { status: js, progress: jp = 0, currentStep: jStep = "", result_data } = jr.data;

        setProgress(Math.max(0, Math.min(100, jp)));
        if (jStep) setCurrentStep(jStep);

        if (js === "completed" && result_data?.videoUrl) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setStatus("rendered");
          setVideoUrl(result_data.videoUrl);
          setProgress(100);
          if (storageKey) localStorage.removeItem(storageKey);
        } else if (js === "failed") {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setStatus("failed");
          setError("Video generation failed. Please try again.");
          if (storageKey) localStorage.removeItem(storageKey);
        }
      } catch {
        // 401 / 404 on job endpoint — continue polling audit status only
      }
    }, 3000);
  }

  // ── actions ──────────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!auditId) return;
    setStatus("pending");
    setError("");
    setProgress(0);
    setCurrentStep("");
    if (pollingRef.current) clearInterval(pollingRef.current);

    try {
      const res = await apiService.generateHomepageAuditVideo(auditId);

      if (!res?.success) throw new Error(res?.message || "Server error");

      const { status: vs, jobId: vj, videoUrl: vu } = res.data ?? {};

      if (vs === "RENDERED" && vu) {
        setStatus("rendered");
        setVideoUrl(vu);
        if (storageKey) localStorage.removeItem(storageKey);
        return;
      }

      if (vj) {
        setJobId(vj);
        setStatus("processing");
        if (storageKey) localStorage.setItem(storageKey, vj);
        startPolling(vj);
        return;
      }

      throw new Error("Invalid response from server");
    } catch (err) {
      setStatus("failed");
      setError(err.message || "Failed to start video generation");
    }
  }

  function handleRetry() {
    setStatus("idle");
    setError("");
    setProgress(0);
    setCurrentStep("");
    setJobId(null);
    if (storageKey) localStorage.removeItem(storageKey);
    handleGenerate();
  }

  function handleCopyLink() {
    if (!videoUrl) return;
    navigator.clipboard.writeText(videoUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }

  async function handleDownload() {
    if (!videoUrl) return;
    setDownload(true);
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `homepage-video-report.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download video");
    } finally {
      setDownload(false);
    }
  }

  function handleFullscreen() {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen();
      else if (videoRef.current.webkitRequestFullscreen) videoRef.current.webkitRequestFullscreen();
    }
  }

  // ── guards ────────────────────────────────────────────────────────────────
  if (!auditId) return null;
  if (initializing) return (
    <div className="mt-8 bg-[#111827] border border-[#263244] rounded-[28px] p-10 animate-pulse">
      <div className="h-6 w-48 bg-slate-700 rounded" />
      <div className="h-4 w-80 bg-slate-800 rounded mt-3" />
    </div>
  );

  const isActive = status === "pending" || status === "processing";

  // ── step labels ───────────────────────────────────────────────────────────
  const stepLabel = currentStep || (
    status === "pending"    ? "Queued — preparing audit data…" :
    status === "processing" ? "Generating video…"              : ""
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="mt-8">

      {/* ── rendered: video player ───────────────────────────────────────── */}
      {status === "rendered" && videoUrl && (
        <div
          className="bg-[#111827] rounded-2xl overflow-hidden relative"
          style={{ border: "1px solid rgba(16,255,160,0.18)" }}
        >
          {/* green ambient glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/3 via-transparent to-transparent pointer-events-none" />

          <div className="relative">
            {/* header */}
            <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{ background: "rgba(16,255,160,0.1)", border: "1px solid rgba(16,255,160,0.2)" }}
                >
                  ▶
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">Homepage Audit Video Report</h3>
                  {generatedAt && (
                    <p className="text-[11px] text-slate-500">Generated {fmtDate(generatedAt)}</p>
                  )}
                </div>
              </div>
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                style={{ background: "rgba(16,255,160,0.08)", color: "#10ffa0", border: "1px solid rgba(16,255,160,0.18)" }}
              >
                ✔ COMPLETED
              </span>
            </div>

            {/* video player — full width, height-capped so card stays compact */}
            <div className="bg-black w-full" style={{ maxHeight: "320px" }}>
              <video
                ref={videoRef}
                controls
                className="w-full"
                style={{ maxHeight: "320px", display: "block" }}
                src={videoUrl}
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* action bar */}
            <div className="flex flex-wrap gap-2 px-5 py-4">
              <button
                onClick={handleDownload}
                disabled={downloadLoading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {downloadLoading ? (
                  <>
                    <span className="inline-block w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    Downloading…
                  </>
                ) : (
                  <>⬇ Download</>
                )}
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {copySuccess ? "✔ Copied!" : "🔗 Copy Link"}
              </button>

              <button
                onClick={handleFullscreen}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                ⛶ Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── idle / pending / processing / failed: CTA card ──────────────── */}
      {status !== "rendered" && (
        <div
          className="bg-[#111827] rounded-[28px] p-8 lg:p-10 relative overflow-hidden"
          style={{ border: "1px solid #263244" }}
        >
          {/* ambient glow */}
          <div className="absolute top-0 right-0 w-[480px] h-[320px] bg-gradient-to-bl from-purple-500/5 via-cyan-400/3 to-transparent pointer-events-none rounded-[28px]" />

          <div className="relative">
            {/* ── header row ─────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-8">

              {/* left: icon + copy */}
              <div className="flex items-start gap-5 flex-1 min-w-0">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(0,229,255,0.12))",
                    border: "1px solid rgba(124,58,237,0.25)",
                  }}
                >
                  🎬
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <h3 className="text-xl font-bold text-white">Homepage Audit Video Report</h3>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: "rgba(124,58,237,0.1)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}
                    >
                      AI Generated
                    </span>
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed max-w-[560px]">
                    Generate a narrated AI-powered video summary of this homepage audit including performance,
                    accessibility, SEO, AI visibility, technical health, and key recommendations.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      ⏱️ Estimated Duration: 45–60 seconds
                    </span>
                    <span className="text-slate-700 hidden sm:inline">·</span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      🎙️ AI Voice Narration
                    </span>
                    <span className="text-slate-700 hidden sm:inline">·</span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      📊 6 Slide Summary
                    </span>
                  </div>
                </div>
              </div>

              {/* right: CTA button */}
              <div className="flex-shrink-0 self-start lg:self-center">
                {status === "idle" && (
                  <button
                    onClick={handleGenerate}
                    className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                      boxShadow: "0 0 24px rgba(124,58,237,0.3)",
                    }}
                  >
                    ▶ Generate Video Report
                  </button>
                )}

                {isActive && (
                  <button
                    disabled
                    className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-slate-400 cursor-not-allowed"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <span className="inline-block w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    Generating Video…{progress > 0 ? ` ${progress}%` : ""}
                  </button>
                )}

                {status === "failed" && (
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                    style={{
                      background: "linear-gradient(135deg, #dc2626, #f97316)",
                      boxShadow: "0 0 18px rgba(220,38,38,0.25)",
                    }}
                  >
                    ↺ Retry Video Generation
                  </button>
                )}
              </div>
            </div>

            {/* ── progress area (active jobs only) ────────────────────── */}
            {isActive && (
              <div
                className="mt-6 rounded-2xl p-5"
                style={{ background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.12)" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-block w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <p className="text-sm font-semibold text-cyan-400">
                    Narrated Video is being generated…
                  </p>
                </div>

                {stepLabel && (
                  <p className="text-xs text-slate-400 mb-3 pl-7">{stepLabel}</p>
                )}

                {/* progress bar */}
                <div className="pl-7">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Rendering Stages</span>
                    {progress > 0 && <span className="font-mono text-cyan-400">{progress}%</span>}
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    {progress > 0 ? (
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          background: "linear-gradient(90deg, #7c3aed, #00e5ff)",
                        }}
                      />
                    ) : (
                      /* indeterminate stripe when no % available */
                      <div
                        className="h-full rounded-full w-1/3 animate-[progress_1.5s_ease-in-out_infinite]"
                        style={{ background: "linear-gradient(90deg, transparent, #00e5ff, transparent)" }}
                      />
                    )}
                  </div>
                </div>

                <div className="mt-3 pl-7 text-[11px] text-slate-600 font-mono truncate">
                  {jobId ? `Job: ${jobId}` : "Initializing job…"}
                </div>
              </div>
            )}

            {/* ── error banner ─────────────────────────────────────────── */}
            {error && status === "failed" && (
              <div
                className="mt-5 flex items-start gap-3 p-4 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.18)" }}
              >
                <span className="text-red-400 text-base flex-shrink-0">⚠</span>
                <div>
                  <p className="text-red-400 font-semibold text-xs">Generation Error</p>
                  <p className="text-slate-400 text-xs mt-0.5">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
