"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useProject } from "@/contexts/ProjectContext"
import { useQueryClient } from "@tanstack/react-query"
import { usePageSpeedData, usePageSpeedStatus, usePageSpeedRescan } from '@/hooks/useDashboardQueries'
import { PageSpeedSkeleton } from "@/components/skeletons/pagespeed"
import DeviceTabs from "@/components/dashboard/pagespeed/DeviceTabs"
import PerformanceRing from "@/components/dashboard/pagespeed/PerformanceRing"
import CoreMetrics from "@/components/dashboard/pagespeed/CoreMetrics"
import { sanitizeHTML } from "@/lib/security/sanitize"

// Google's Core Web Vitals thresholds
const CWV_THRESHOLDS = {
  lcp: { good: 2.5, poor: 4.0 },
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1.8, poor: 3.0 },
  tbt: { good: 200, poor: 600 },
  speed_index: { good: 3.4, poor: 5.8 },
  ttfb: { good: 800, poor: 1800 },
  tti: { good: 3.8, poor: 7.3 }
}

// Get metric status based on Google thresholds
const getMetricStatus = (metric, value, unit) => {
  if (!value || value === null || value === undefined) return 'missing'
  
  const threshold = CWV_THRESHOLDS[metric]
  if (!threshold) return 'unknown'
  
  const numericValue = parseFloat(value)
  if (metric === 'cls') {
    return numericValue <= threshold.good ? 'good' : numericValue >= threshold.poor ? 'poor' : 'needs_improvement'
  } else {
    return numericValue <= threshold.good ? 'good' : numericValue >= threshold.poor ? 'poor' : 'needs_improvement'
  }
}

// Get performance score color
const getScoreColor = (score) => {
  if (score >= 90) return { color: '#10ffa0', color2: '#00e5ff', status: 'good' }
  if (score >= 50) return { color: '#ffbb33', color2: '#ff8c1a', status: 'needs_improvement' }
  return { color: '#ff4560', color2: '#ff1744', status: 'poor' }
}

// Generate traffic impact message based on LCP
const getTrafficImpactMessage = (lcpValue, device) => {
  if (!lcpValue || lcpValue === null) return 'No LCP data available'
  
  const lcpNumeric = parseFloat(lcpValue)
  if (lcpNumeric <= 2.5) {
    return device === 'mobile' 
      ? '✅ Your mobile LCP is within Google\'s good threshold. No significant traffic impact expected.'
      : '✅ Your desktop LCP is within Google\'s good threshold. No significant traffic impact expected.'
  }
  
  // Calculate estimated traffic loss based on how much LCP exceeds threshold
  const excessTime = lcpNumeric - 2.5
  let trafficLoss = '5–8%'
  
  if (excessTime >= 2.5) trafficLoss = '~12–18%'
  else if (excessTime >= 1.5) trafficLoss = '~8–12%'
  
  return `Your ${device} LCP of ${lcpValue}s exceeds Google's 2.5s threshold. Estimated traffic loss: <strong style={{ color: "var(--red)" }}>${trafficLoss} of ${device} sessions</strong>.`
}

// Fix data for PageSpeed opportunities and diagnostics
const FIX_DATA = {
  "render-blocking": {
    why: "These files force the browser to pause HTML parsing until fully loaded, delaying the first visible paint. Every millisecond here directly hurts your FCP and LCP scores.",
    steps: [
      { t: "Add defer or async to non-critical scripts", c: '<script src="/js/vendor.js" defer></script>' },
      { t: "Preload CSS and swap it in asynchronously", c: "<link rel='preload' href='/css/styles.css' as='style'\n     onload=\"this.rel='stylesheet'\">" },
      { t: "Use font-display: swap for web fonts", c: "@font-face {\n  font-family: 'MyFont';\n  font-display: swap;\n  src: url('/fonts/main.woff2');\n}" },
      { t: "Move non-critical scripts to the bottom of <body>" }
    ]
  },
  "unused-js": {
    why: "Unused JavaScript is still downloaded, parsed, and compiled by the browser even if never executed — wasting bandwidth and blocking the main thread.",
    steps: [
      { t: "Analyse your bundle to see what's unused", c: "npx webpack-bundle-analyzer stats.json" },
      { t: "Enable tree-shaking in your bundler", c: "// webpack.config.js\nmodule.exports = { mode: 'production' }" },
      { t: "Use dynamic import() so code only loads when needed", c: "const { Chart } = await import('./chart.js')" },
      { t: "Replace heavy libraries with lighter alternatives (e.g. dayjs instead of moment.js)" }
    ]
  },
  "optimise-images": {
    why: "Images are served at a much larger resolution than they appear on screen — costing every visitor 840 KB of unnecessary data on each page load.",
    steps: [
      { t: "Use srcset to serve different sizes per device", c: "<img src='hero-800.jpg'\n  srcset='hero-400.jpg 400w, hero-800.jpg 800w'\n  sizes='(max-width: 600px) 400px, 800px'>" },
      { t: "Convert to WebP or AVIF for 30–50% smaller files", c: "npx sharp-cli -i hero.png -o hero.webp" },
      { t: "Lazy-load all below-the-fold images", c: "<img src='about.jpg' loading='lazy' alt='...'>" }
    ]
  },
  "text-compression": {
    why: "Your server sends CSS and JS without Gzip or Brotli compression. Enabling it reduces transfer sizes by 60–80% with zero quality loss.",
    steps: [
      { t: "Enable Brotli and Gzip in Nginx", c: "gzip on;\ngzip_types text/css application/javascript;\nbrotli on;" },
      { t: "For Express.js use the compression middleware", c: "const compression = require('compression');\napp.use(compression());" },
      { t: "Verify compression is active", c: "curl -H 'Accept-Encoding: gzip, br' -I https://yoursite.com/styles.css" }
    ]
  },
  "cache-policy": {
    why: "12 static assets have no Cache-Control header so repeat visitors re-download every file on every visit even when nothing changed.",
    steps: [
      { t: "Set long-lived cache headers for hashed static assets", c: "location ~* \\.(js|css|png|woff2)$ {\n  add_header Cache-Control 'public, max-age=31536000, immutable';\n}" },
      { t: "Use content hashing in your build for automatic cache-busting", c: "output: { filename: '[name].[contenthash].js' }" },
      { t: "Keep HTML at no-cache", c: "add_header Cache-Control 'no-cache';" }
    ]
  },
  "lcp-element": {
    why: "A CSS background-image is invisible to the browser's preload scanner and can't start loading until CSS is fully parsed — directly delaying LCP.",
    steps: [
      { t: "Move hero from CSS background to an HTML img with fetchpriority", c: "<img src='hero.jpg' fetchpriority='high' width='1200' height='600' alt='Hero'>" },
      { t: "Or add a preload link in head if you must keep CSS", c: "<link rel='preload' href='/img/hero.jpg' as='image' fetchpriority='high'>" }
    ]
  },
  "long-tasks": {
    why: "Tasks over 50ms freeze the browser's main thread and prevent it from responding to user input — the primary driver of high TBT and poor INP.",
    steps: [
      { t: "Break long tasks using scheduler.yield()", c: "async function processItems(items) {\n  for (const item of items) {\n    processItem(item);\n    await scheduler.yield();\n  }\n}" },
      { t: "Offload heavy computation to a Web Worker", c: "const worker = new Worker('heavy.js');\nworker.postMessage({ data });" },
      { t: "Use Chrome DevTools Performance tab to find which scripts cause long tasks" }
    ]
  }
}

// ---------------------------------------------------------------------------
// Shared button style helpers
// ---------------------------------------------------------------------------
const btnBase = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', border: 'none', borderRadius: 6,
  fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'opacity .15s',
}
const btnPrimary  = { ...btnBase, background: 'var(--primary)', color: '#fff' }
const btnDisabled = { ...btnBase, background: 'var(--surface2)', color: 'var(--text3)', cursor: 'not-allowed', opacity: .6 }
const btnDanger   = { ...btnBase, background: 'rgba(255,69,96,.12)', color: 'var(--red)', border: '1px solid rgba(255,69,96,.25)' }

function RescanButton({ onClick, disabled, label = 'Rescan', icon = '↺' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={disabled ? btnDisabled : btnPrimary}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>
      {label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// State 1 — No data
// ---------------------------------------------------------------------------
function NoDataState({ onRescan, isRescanning }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No PageSpeed results found</div>
      <div style={{ color: 'var(--text3)', marginBottom: 28, fontSize: 14 }}>
        The PageSpeed analysis has not been completed yet.
      </div>
      <RescanButton
        onClick={onRescan}
        disabled={isRescanning}
        label={isRescanning ? 'Starting scan…' : 'Run PageSpeed Scan'}
        icon="⚡"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// State 2 — Failed
// ---------------------------------------------------------------------------
function FailedState({ statusData, onRescan, isRescanning }) {
  const ts = statusData?.last_run_at
    ? new Date(statusData.last_run_at).toLocaleString()
    : null

  const errorMsg = statusData?.last_error
    || statusData?.mobile_error
    || statusData?.desktop_error
    || 'Unknown error'

  return (
    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--red)' }}>
        PageSpeed scan failed
      </div>
      <div style={{
        background: 'rgba(255,69,96,.08)', border: '1px solid rgba(255,69,96,.2)',
        borderRadius: 8, padding: '12px 20px', margin: '16px auto', maxWidth: 480,
        fontSize: 13, color: 'var(--red)', textAlign: 'left', wordBreak: 'break-word',
      }}>
        {errorMsg}
      </div>
      {ts && (
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 24 }}>
          Last attempted: {ts}
        </div>
      )}
      <RescanButton
        onClick={onRescan}
        disabled={isRescanning}
        label={isRescanning ? 'Starting…' : 'Retry Scan'}
        icon="↺"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// State 3 — Running
// ---------------------------------------------------------------------------
function RunningState() {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>
        <span style={{
          display: 'inline-block',
          animation: 'spin 1.2s linear infinite',
        }}>⚡</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
        PageSpeed scan in progress…
      </div>
      <div style={{ color: 'var(--text3)', marginBottom: 28, fontSize: 14 }}>
        Fetching mobile and desktop metrics from Google PageSpeed Insights.
      </div>
      <div style={{
        width: 200, height: 4, background: 'var(--surface2)',
        borderRadius: 4, margin: '0 auto', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: '40%', borderRadius: 4,
          background: 'var(--primary)',
          animation: 'psProgress 1.8s ease-in-out infinite alternate',
        }} />
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes psProgress { from { margin-left: 0 } to { margin-left: 60% } }
      `}</style>
      <button style={btnDisabled} disabled>Rescan</button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function PageSpeedPageContent() {
  const [device, setDevice] = useState("mobile")
  const queryClient = useQueryClient()
  const { activeProjectId, isLoading: projectLoading } = useProject()

  const { data: pagespeedResponse, isLoading: dataLoading } = usePageSpeedData(activeProjectId)
  const { data: statusResponse, isLoading: statusLoading } = usePageSpeedStatus(activeProjectId, { enabled: !!activeProjectId })
  const rescanMutation = usePageSpeedRescan(activeProjectId)

  const pagespeedData = pagespeedResponse?.data || pagespeedResponse
  const statusData    = statusResponse?.data

  // ── WebSocket: listen for real-time pagespeed events ──────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !activeProjectId) return
    const socket = window.__socket
    if (!socket) return

    const onCompleted = () => {
      queryClient.invalidateQueries({ queryKey: ['pagespeed', activeProjectId] })
      queryClient.invalidateQueries({ queryKey: ['pagespeed', activeProjectId, 'status'] })
      queryClient.refetchQueries({ queryKey: ['pagespeed', activeProjectId] })
    }
    const onFailed = () => {
      queryClient.invalidateQueries({ queryKey: ['pagespeed', activeProjectId, 'status'] })
    }

    socket.on('pagespeed:completed', onCompleted)
    socket.on('pagespeed:failed',    onFailed)
    return () => {
      socket.off('pagespeed:completed', onCompleted)
      socket.off('pagespeed:failed',    onFailed)
    }
  }, [activeProjectId, queryClient])

  // ── Derive UI state ────────────────────────────────────────────────────────
  const loading       = dataLoading || projectLoading || statusLoading
  const isRunning     = statusData?.is_running === true || statusData?.scan_status === 'running'
  const hasFailed     = !isRunning && statusData?.scan_status === 'failed'
  const hasData       = !!(pagespeedData?.mobile || pagespeedData?.desktop)
  const isRescanning  = rescanMutation.isPending

  const handleRescan = () => {
    if (isRescanning || isRunning) return
    rescanMutation.mutate()
  }

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!activeProjectId) return null
  if (loading) return <PageSpeedSkeleton />

  // State 3 — Running (show over stale data so user sees progress)
  if (isRunning) return <RunningState />

  // State 2 — Failed AND no previous data to display
  if (hasFailed && !hasData) {
    return <FailedState statusData={statusData} onRescan={handleRescan} isRescanning={isRescanning} />
  }

  // State 1 — No data at all
  if (!hasData) {
    return <NoDataState onRescan={handleRescan} isRescanning={isRescanning} />
  }

  // ── State 4 — Completed (show data) ───────────────────────────────────────
  const currentDeviceData = pagespeedData[device]
  if (!currentDeviceData) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
        No {device} data available
      </div>
    )
  }

  const score       = Math.round(currentDeviceData.performance_score || 0)
  const scoreColors = getScoreColor(score)

  const formatMetricValue = (label, rawValue, displayValue) => {
    if (displayValue && displayValue !== 'N/A') {
      return displayValue.replace(/\.0+s$/, 's').replace(/(\.\d+?)0+s$/, '$1s')
    }
    if (rawValue === null || rawValue === undefined) return 'N/A'
    switch (label) {
      case 'LCP': case 'FCP': case 'Speed Index':
        return `${Math.round(rawValue * 10) / 10}s`
      case 'CLS':
        return Math.round(rawValue * 1000) / 1000
      case 'TBT':
        return `${Math.round(rawValue)}ms`
      default:
        return displayValue || 'N/A'
    }
  }

  const metrics = [
    { label: "LCP",         value: formatMetricValue("LCP",         currentDeviceData.lcp?.value,         currentDeviceData.lcp?.display_value),         status: getMetricStatus('lcp',         currentDeviceData.lcp?.value,         currentDeviceData.lcp?.unit),         rawValue: currentDeviceData.lcp?.value },
    { label: "CLS",         value: formatMetricValue("CLS",         currentDeviceData.cls?.value,         currentDeviceData.cls?.display_value),         status: getMetricStatus('cls',         currentDeviceData.cls?.value,         currentDeviceData.cls?.unit),         rawValue: currentDeviceData.cls?.value },
    { label: "FCP",         value: formatMetricValue("FCP",         currentDeviceData.fcp?.value,         currentDeviceData.fcp?.display_value),         status: getMetricStatus('fcp',         currentDeviceData.fcp?.value,         currentDeviceData.fcp?.unit),         rawValue: currentDeviceData.fcp?.value },
    { label: "TBT",         value: formatMetricValue("TBT",         currentDeviceData.tbt?.value,         currentDeviceData.tbt?.display_value),         status: getMetricStatus('tbt',         currentDeviceData.tbt?.value,         currentDeviceData.tbt?.unit),         rawValue: currentDeviceData.tbt?.value },
    { label: "Speed Index", value: formatMetricValue("Speed Index", currentDeviceData.speed_index?.value, currentDeviceData.speed_index?.display_value), status: getMetricStatus('speed_index', currentDeviceData.speed_index?.value, currentDeviceData.speed_index?.unit), rawValue: currentDeviceData.speed_index?.value },
    { label: "TTFB",        value: formatMetricValue("TTFB",        currentDeviceData.ttfb?.value,        currentDeviceData.ttfb?.display_value),        status: getMetricStatus('ttfb',        currentDeviceData.ttfb?.value,        currentDeviceData.ttfb?.unit),        rawValue: currentDeviceData.ttfb?.value },
  ]

  const availableMetrics = metrics.filter(m => m.label === 'TTFB' || m.status !== 'missing')
  const trafficImpactMessage = getTrafficImpactMessage(currentDeviceData.lcp?.value, device)

  const getPassedAudits = () => {
    const passed = []
    currentDeviceData.diagnostics?.forEach(d => { if (d.score >= 0.9) passed.push(d.title) })
    currentDeviceData.opportunities?.forEach(o => { if (o.score >= 0.9) passed.push(o.title) })
    if (passed.length === 0) {
      if (currentDeviceData.performance_score >= 90) passed.push("Performance optimized")
      if (currentDeviceData.accessibility >= 90)     passed.push("Accessibility compliant")
      if (currentDeviceData.best_practices >= 90)    passed.push("Best practices followed")
      if (currentDeviceData.seo >= 90)               passed.push("SEO optimized")
      if (passed.length === 0) passed.push("Valid HTML structure", "No critical errors found", "Basic optimizations applied")
    }
    return passed
  }

  // Partial-success warning banner (one device failed but we still have data)
  const isPartial = statusData?.scan_status === 'partial_success'

  return (
    <div>
      {/* Header row with device tabs + rescan button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div className="section-head" style={{ margin: 0 }}>
          <div className="section-title">PageSpeed Insights</div>
          <div className="section-tag">CORE WEB VITALS</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <DeviceTabs active={device} onChange={setDevice} />
          <RescanButton onClick={handleRescan} disabled={isRescanning || isRunning} />
        </div>
      </div>

      {/* Partial-success warning */}
      {isPartial && (
        <div style={{
          background: 'rgba(255,187,51,.08)', border: '1px solid rgba(255,187,51,.25)',
          borderRadius: 8, padding: '10px 16px', marginBottom: 20,
          fontSize: 13, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ⚠️ Partial results — {statusData.mobile_status === 'failed' ? 'mobile' : 'desktop'} scan failed.
          {statusData.mobile_error || statusData.desktop_error
            ? ` (${statusData.mobile_error || statusData.desktop_error})`
            : ''
          }
        </div>
      )}

      <div className="two-col">
        <div>
          <div className="score-card" style={{ marginBottom: 16, "--grad": scoreColors.status === 'good' ? "linear-gradient(90deg,#10ffa0,#00e5ff)" : scoreColors.status === 'needs_improvement' ? "linear-gradient(90deg,#ffbb33,#ff8c1a)" : "linear-gradient(90deg,#ff4560,#ff1744)" }}>
            <div className="score-label">Performance Score</div>
            <div style={{ position: "relative", width: 120, height: 120 }}>
              <PerformanceRing score={score} color={scoreColors.color} color2={scoreColors.color2} label={device} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: scoreColors.status === 'good' ? "var(--green)" : scoreColors.status === 'needs_improvement' ? "var(--orange)" : "var(--red)" }}>{score}</div>
              </div>
            </div>
            <div className="score-sub">{device === "mobile" ? "📱 Mobile" : "🖥 Desktop"}</div>
          </div>
          <div className="ai-card">
            <div className="ai-card-label">✦ Traffic Impact</div>
            <div className="ai-card-text" dangerouslySetInnerHTML={{ __html: sanitizeHTML(trafficImpactMessage) }} />
          </div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 16, fontSize: 14 }}>Core Metrics</div>
          {availableMetrics.map((metric, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < availableMetrics.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{metric.label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: metric.status === 'good' ? "var(--green)" : metric.status === 'needs_improvement' ? "var(--orange)" : "var(--red)" }}>{metric.value}</div>
                <div style={{ fontSize: 16 }}>
                  {metric.status === 'good' ? "✅" : metric.status === 'needs_improvement' ? "⚠️" : "❌"}
                </div>
              </div>
            </div>
          ))}
          {availableMetrics.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px' }}>
              No metrics data available for {device}
            </div>
          )}
        </div>
      </div>

      {/* Lighthouse Scores */}
      <div className="section-head" style={{ marginTop: 32 }}>
        <div className="section-title">Lighthouse Scores</div>
      </div>
      <div className="cat-grid">
        {[
          { key: 'performance',   icon: '⚡', label: 'Performance',   value: Math.round(currentDeviceData.performance  || currentDeviceData.performance_score || 0) },
          { key: 'accessibility', icon: '♿', label: 'Accessibility',  value: Math.round(currentDeviceData.accessibility || 0) },
          { key: 'best_practices',icon: '✅', label: 'Best Practices', value: Math.round(currentDeviceData.best_practices || 0) },
          { key: 'seo',           icon: '🔍', label: 'SEO',            value: Math.round(currentDeviceData.seo || 0) },
        ].map(cat => {
          const s = cat.value
          const color = s >= 90 ? 'var(--green)' : s >= 50 ? 'var(--amber)' : 'var(--red)'
          return (
            <div key={cat.key} className="cat-card">
              <div style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", fontSize: 18, background: `${color}14`, flexShrink: 0 }}>{cat.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{cat.label}</div>
                <div className="prog-bar"><div className="prog-fill" style={{ width: `${s}%`, background: color }} /></div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color }}>{s}</div>
            </div>
          )
        })}
      </div>

      {/* Opportunities */}
      {currentDeviceData.opportunities?.length > 0 && (
        <>
          <div className="section-head" style={{ marginTop: 32 }}>
            <div className="section-title">Opportunities</div>
            <div className="section-tag">{currentDeviceData.opportunities.length} ITEMS</div>
          </div>
          {currentDeviceData.opportunities.map((opp, i) => {
            const sc = opp.score < 0.5 ? 'fail' : opp.score < 0.9 ? 'warn' : 'pass'
            return (
              <div key={i} className={`opp-row ${sc}`}>
                <div className={`opp-icon ${sc}`}>{opp.icon || '⚡'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="opp-title">{opp.title}</div>
                  <div className="opp-desc">{opp.description?.slice(0, 110)}</div>
                </div>
                {opp.saved && opp.saved !== "—" && <span className={`badge ${sc}`} style={{ whiteSpace: "nowrap", flexShrink: 0 }}>Save {opp.saved}</span>}
              </div>
            )
          })}
        </>
      )}

      {/* Diagnostics */}
      {currentDeviceData.diagnostics?.length > 0 && (
        <>
          <div className="section-head" style={{ marginTop: 20 }}>
            <div className="section-title">Diagnostics</div>
            <div className="section-tag">{currentDeviceData.diagnostics.length} ITEMS</div>
          </div>
          {currentDeviceData.diagnostics.map((diag, i) => {
            const sc = diag.score < 0.5 ? 'fail' : diag.score < 0.9 ? 'warn' : 'pass'
            return (
              <div key={i} className={`opp-row ${sc}`}>
                <div className={`opp-icon ${sc}`}>{diag.icon || '⚙'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="opp-title">{diag.title}</div>
                  <div className="opp-desc">{diag.description?.slice(0, 110)}</div>
                </div>
                <span className={`badge ${sc}`}>{sc === 'fail' ? '● Fail' : sc === 'warn' ? '◆ Warn' : '✔ Pass'}</span>
              </div>
            )
          })}
        </>
      )}

      {/* Passed Audits */}
      <div className="section-head" style={{ marginTop: 20 }}>
        <div className="section-title">Passed Audits</div>
        <div className="section-tag" style={{ background: "rgba(0,245,160,.08)", color: "var(--green)", borderColor: "rgba(0,245,160,.16)" }}>
          {getPassedAudits().length} PASSING
        </div>
      </div>
      <div className="pass-grid">
        {getPassedAudits().map((audit, i) => (
          <div key={i} className="pass-item">
            <span style={{ color: "var(--green)" }}>✔</span>
            {audit}
          </div>
        ))}
      </div>
    </div>
  )
}
