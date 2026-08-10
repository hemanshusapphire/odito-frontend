"use client"

import { useEffect, useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import { useProject } from '@/contexts/ProjectContext'
import { useProjectTrends } from '@/hooks/useDashboardQueries'
import TrendChart from '@/components/dashboard/overview/TrendChart'
import DeltaBadge from '@/components/dashboard/overview/DeltaBadge'

// ── Color system ──────────────────────────────────────────────────────────────

const C = {
  websiteScore:           '#a855f7',
  aiVisibilityScore:      '#00e5ff',
  performanceScore:       '#00f5a0',
  technicalHealthScore:   '#ff9640',
  totalIssues:            '#ff3860',
  aiVisibilityIssueCount: '#ff6090',
  good: '#00f5a0',
  bad:  '#ff6080',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function dirColor(direction) {
  if (direction === 'improved') return C.good
  if (direction === 'declined') return C.bad
  return 'var(--t3)'
}

function fmt(n, showSign = false) {
  if (n == null) return '—'
  const num = Number(n)
  const rounded = Math.round(num * 10) / 10
  const display = Number.isInteger(rounded) ? rounded : rounded.toFixed(1)
  const sign = showSign && num > 0 ? '+' : ''
  return `${sign}${display}`
}

// ── Metric & chart config ─────────────────────────────────────────────────────

const HERO_METRICS = [
  { key: 'websiteScore',           label: 'Website Score',     unit: 'pts', isLowerBetter: false },
  { key: 'aiVisibilityScore',      label: 'AI Visibility',     unit: 'pts', isLowerBetter: false },
  { key: 'performanceScore',       label: 'Performance',       unit: 'pts', isLowerBetter: false },
  { key: 'technicalHealthScore',   label: 'Technical Health',  unit: 'pts', isLowerBetter: false },
  { key: 'totalIssues',            label: 'Issues Removed',    unit: '',    isLowerBetter: true  },
  { key: 'aiVisibilityIssueCount', label: 'AI Issues Removed', unit: '',    isLowerBetter: true  },
]

const CHART_CONFIGS = [
  { key: 'websiteScore',           label: 'Website Score',        unit: 'pts', isScore: true,  isLowerBetter: false, gradId: 'anl-ws' },
  { key: 'aiVisibilityScore',      label: 'AI Visibility',        unit: 'pts', isScore: true,  isLowerBetter: false, gradId: 'anl-ai' },
  { key: 'performanceScore',       label: 'Performance Score',    unit: 'pts', isScore: true,  isLowerBetter: false, gradId: 'anl-pf' },
  { key: 'technicalHealthScore',   label: 'Technical Health',     unit: 'pts', isScore: true,  isLowerBetter: false, gradId: 'anl-th' },
  { key: 'totalIssues',            label: 'Total Issues',         unit: '',    isScore: false, isLowerBetter: true,  gradId: 'anl-is' },
  { key: 'aiVisibilityIssueCount', label: 'AI Visibility Issues', unit: '',    isScore: false, isLowerBetter: true,  gradId: 'anl-av' },
]

// ── GrowthKpi — one tile in the hero row ──────────────────────────────────────

function GrowthKpi({ label, growth }) {
  const g = growth ?? {}
  const hasData = g.first != null && g.last != null
  const color = hasData ? dirColor(g.direction) : 'var(--t3)'

  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '0 18px', minWidth: 108 }}>
      {/* first → last */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 9 }}>
        <span style={{ fontFamily: 'var(--font-metric)', fontSize: 13, fontWeight: 700, color: 'var(--t3)' }}>
          {g.first ?? '—'}
        </span>
        <span style={{ fontSize: 9, color: 'var(--t3)' }}>→</span>
        <span style={{ fontFamily: 'var(--font-metric)', fontSize: 17, fontWeight: 900, color: hasData ? color : 'var(--t3)' }}>
          {g.last ?? '—'}
        </span>
      </div>

      {/* absolute delta */}
      <div style={{
        fontFamily: 'var(--font-metric)', fontSize: 32, fontWeight: 900, letterSpacing: '-0.025em',
        color, lineHeight: 1, marginBottom: 3,
      }}>
        {g.change != null ? fmt(g.change, true) : '—'}
      </div>

      {/* percentage */}
      {g.percentage != null && (
        <div style={{ fontSize: 11, fontWeight: 600, color, marginBottom: 8 }}>
          {fmt(g.percentage, true)}%
        </div>
      )}

      {/* label */}
      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </div>
    </div>
  )
}

function AuditsKpi({ count }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '0 18px', minWidth: 90 }}>
      <div style={{
        fontFamily: 'var(--font-metric)', fontSize: 46, fontWeight: 900, letterSpacing: '-0.03em',
        color: 'var(--t)', lineHeight: 1, marginBottom: 9,
      }}>
        {count}
      </div>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Audits Completed
      </div>
    </div>
  )
}

// ── HeroSection ───────────────────────────────────────────────────────────────

const HERO_GRADIENT = 'linear-gradient(90deg, #a855f7 0%, #00e5ff 30%, #00f5a0 60%, #ff9640 100%)'

function HeroSection({ trendData, isLoading }) {
  const totalAudits = trendData?.totalAudits ?? 0
  const growth = trendData?.growth ?? {}

  const topBar = <div style={{ height: 4, background: HERO_GRADIENT }} />

  if (isLoading) {
    return (
      <div style={{ background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
        {topBar}
        <div style={{ padding: '28px 24px 32px', display: 'flex', gap: 20, justifyContent: 'space-around' }}>
          {[...Array(7)].map((_, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ width: '70%', height: 10, background: 'var(--s2)', borderRadius: 4, margin: '0 auto 10px' }} />
              <div style={{ width: '50%', height: 30, background: 'var(--s2)', borderRadius: 6, margin: '0 auto 6px' }} />
              <div style={{ width: '55%', height: 9, background: 'var(--s2)', borderRadius: 4, margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!trendData?.available) {
    return (
      <div style={{ background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
        {topBar}
        <div style={{ padding: '52px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>📈</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t2)', marginBottom: 8 }}>
            {totalAudits === 0 ? 'No audits yet' : 'First audit complete'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--t3)', maxWidth: 380, margin: '0 auto' }}>
            {totalAudits === 0
              ? 'Complete your first audit to start tracking growth.'
              : 'Run another audit to unlock trend analytics.'}
          </div>
        </div>
      </div>
    )
  }

  // Build interleaved tiles + dividers
  const tiles = []
  HERO_METRICS.forEach((m, i) => {
    if (i > 0) tiles.push(
      <div key={`d${i}`} style={{ width: 1, height: 80, background: 'var(--b)', flexShrink: 0, alignSelf: 'center' }} />
    )
    tiles.push(<GrowthKpi key={m.key} label={m.label} growth={growth[m.key]} />)
  })
  tiles.push(<div key="d-last" style={{ width: 1, height: 80, background: 'var(--b)', flexShrink: 0, alignSelf: 'center' }} />)
  tiles.push(<AuditsKpi key="audits" count={totalAudits} />)

  return (
    <div style={{ background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
      {topBar}
      <div style={{ padding: '28px 20px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Website Growth Story · First Audit → Latest · {totalAudits} Audit{totalAudits !== 1 ? 's' : ''} Completed
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around', flexWrap: 'wrap', gap: 8 }}>
          {tiles}
        </div>
      </div>
    </div>
  )
}

// ── ChartCard ─────────────────────────────────────────────────────────────────

function ChartCard({ config, data, growth, height = 200 }) {
  const { key, label, unit, isScore, isLowerBetter, gradId } = config
  const color = C[key]
  const g = growth ?? {}
  const hasData = data.some(d => d.value != null)
  const showDelta = g.change != null && g.direction !== 'unchanged'

  return (
    <div style={{
      background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 16,
      padding: '22px 24px 20px', boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 5 }}>{label}</div>
          {g.first != null && g.last != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-metric)', fontSize: 19, fontWeight: 800, color: 'var(--t3)' }}>
                {g.first}
              </span>
              <span style={{ fontSize: 11, color: 'var(--t3)' }}>→</span>
              <span style={{
                fontFamily: 'var(--font-metric)', fontSize: 26, fontWeight: 900,
                color: dirColor(g.direction),
              }}>
                {g.last}
              </span>
              {unit && <span style={{ fontSize: 10, color: 'var(--t3)', marginLeft: 1 }}>{unit}</span>}
            </div>
          )}
        </div>
        {showDelta && (
          <DeltaBadge delta={g} suffix={unit} isLowerBetter={isLowerBetter} />
        )}
      </div>

      {hasData ? (
        <TrendChart
          data={data}
          colorHex={color}
          unit={unit}
          gradientId={gradId}
          height={height}
          isScore={isScore}
        />
      ) : (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--t3)' }}>
          No data available
        </div>
      )}
    </div>
  )
}

// ── TrendsSection ─────────────────────────────────────────────────────────────

function TrendsSection({ trendData, isLoading }) {
  const chartSeries = useMemo(() => {
    if (!trendData?.labels) return {}
    const base = (key) =>
      trendData.labels.map((_, i) => ({
        label: `A${trendData.auditNumbers?.[i] ?? i + 1}`,
        value: trendData[key]?.[i] ?? null,
      }))
    return CHART_CONFIGS.reduce((acc, c) => ({ ...acc, [c.key]: base(c.key) }), {})
  }, [trendData])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 16, padding: '22px 24px', height: 360 }}>
          <div style={{ width: '25%', height: 10, background: 'var(--s2)', borderRadius: 4, marginBottom: 14 }} />
          <div style={{ width: '100%', height: 260, background: 'var(--s2)', borderRadius: 8 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 16, padding: '22px 24px', height: 290 }}>
              <div style={{ width: '40%', height: 10, background: 'var(--s2)', borderRadius: 4, marginBottom: 14 }} />
              <div style={{ width: '100%', height: 200, background: 'var(--s2)', borderRadius: 8 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[0, 1].map(i => (
            <div key={i} style={{ background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 16, padding: '22px 24px', height: 290 }}>
              <div style={{ width: '35%', height: 10, background: 'var(--s2)', borderRadius: 4, marginBottom: 14 }} />
              <div style={{ width: '100%', height: 200, background: 'var(--s2)', borderRadius: 8 }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!trendData?.available) {
    return (
      <div style={{
        background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 16,
        padding: '52px 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 13, color: 'var(--t3)' }}>
          {(trendData?.totalAudits ?? 0) === 0
            ? 'Complete your first audit to start tracking growth.'
            : 'Run another audit to unlock trend analytics.'}
        </div>
      </div>
    )
  }

  const g = trendData.growth
  const [ws, ai, pf, th, is, av] = CHART_CONFIGS

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Primary: Website Score full width */}
      <ChartCard
        config={ws}
        data={chartSeries.websiteScore ?? []}
        growth={g.websiteScore}
        height={260}
      />

      {/* Secondary row: AI Visibility · Performance · Technical Health */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <ChartCard config={ai} data={chartSeries.aiVisibilityScore    ?? []} growth={g.aiVisibilityScore}    height={200} />
        <ChartCard config={pf} data={chartSeries.performanceScore     ?? []} growth={g.performanceScore}     height={200} />
        <ChartCard config={th} data={chartSeries.technicalHealthScore ?? []} growth={g.technicalHealthScore} height={200} />
      </div>

      {/* Issue row: Total Issues · AI Visibility Issues */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ChartCard config={is} data={chartSeries.totalIssues            ?? []} growth={g.totalIssues}            height={200} />
        <ChartCard config={av} data={chartSeries.aiVisibilityIssueCount ?? []} growth={g.aiVisibilityIssueCount} height={200} />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AuditAnalyticsPage() {
  const { activeProject } = useProject()
  const projectId = activeProject?._id

  const { data: trendsRes, isLoading } = useProjectTrends(projectId)
  const trendData = trendsRes?.data ?? null

  useEffect(() => { document.title = 'Audit Analytics | Odito' }, [])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 8px 48px' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(0,229,255,0.10))',
          border: '1px solid rgba(168,85,247,0.22)',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <BarChart3 size={20} style={{ color: C.websiteScore }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-metric)', fontSize: 24, fontWeight: 800, color: 'var(--t)', lineHeight: 1.1 }}>
            Audit Analytics
          </h1>
          <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>
            Historical growth — Website Score, AI Visibility, Performance, Technical Health, and Issues.
          </p>
        </div>
      </div>

      {/* Executive Summary */}
      <HeroSection trendData={trendData} isLoading={isLoading} />

      {/* Growth Trends */}
      <div style={{ marginTop: 40 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.11em', marginBottom: 16 }}>
          Growth Trends
        </div>
        <TrendsSection trendData={trendData} isLoading={isLoading} />
      </div>

    </div>
  )
}
