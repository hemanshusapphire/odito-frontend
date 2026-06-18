"use client"

const STAGES = [
  {
    key: 'task_created',
    label: 'Active',
    sub: 'Needs action',
    color: '#00dfff',
    bg: 'rgba(0,223,255,0.08)',
    border: 'rgba(0,223,255,0.2)',
    icon: '📋',
  },
  {
    key: 'implemented',
    label: 'Pending Crawl',
    sub: 'Fix applied',
    color: '#b580ff',
    bg: 'rgba(157,78,221,0.08)',
    border: 'rgba(157,78,221,0.2)',
    icon: '⏳',
  },
  {
    key: 'verified_fixed',
    label: 'Verified Fixed',
    sub: 'Confirmed removed',
    color: '#00f5a0',
    bg: 'rgba(0,245,160,0.08)',
    border: 'rgba(0,245,160,0.2)',
    icon: '✅',
  },
  {
    key: 'reopened',
    label: 'Reopened',
    sub: 'Issue reappeared',
    color: '#ff6080',
    bg: 'rgba(255,56,96,0.08)',
    border: 'rgba(255,56,96,0.2)',
    icon: '⚠️',
  },
]

function Arrow() {
  return (
    <div style={{
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      color: 'var(--t3)',
      fontSize: 16,
      opacity: 0.4,
      padding: '0 4px',
    }}>
      →
    </div>
  )
}

function SkeletonStage() {
  return (
    <div style={{
      flex: 1,
      background: 'var(--s2)',
      border: '1px solid var(--b)',
      borderRadius: 12,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      <div style={{ width: '50%', height: 8, background: 'var(--b)', borderRadius: 4 }} />
      <div style={{ width: '35%', height: 24, background: 'var(--b)', borderRadius: 5 }} />
    </div>
  )
}

export default function VerificationFunnel({ taskSummary, isLoading }) {
  const summary = taskSummary ?? { task_created: 0, implemented: 0, verified_fixed: 0, reopened: 0, total: 0 }
  const total = summary.total || 0

  if (isLoading) {
    return (
      <div style={{
        background: 'var(--s)',
        border: '1px solid var(--b)',
        borderRadius: 16,
        padding: '20px 24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      }}>
        <div style={{ width: '40%', height: 10, background: 'var(--s2)', borderRadius: 4, marginBottom: 18 }} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <SkeletonStage />
          <div style={{ width: 16 }} />
          <SkeletonStage />
          <div style={{ width: 16 }} />
          <SkeletonStage />
          <div style={{ width: 16 }} />
          <SkeletonStage />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--s)',
      border: '1px solid var(--b)',
      borderRadius: 16,
      padding: '20px 24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#b580ff',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Fix Verification Pipeline
        </span>
        {total > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--t3)' }}>
            {total} total tasks
          </span>
        )}
      </div>

      {/* Funnel stages */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, overflowX: 'auto' }}>
        {STAGES.map((stage, i) => {
          const count = summary[stage.key] ?? 0
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={stage.key} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 'none', minWidth: 0 }}>
              <div style={{
                flex: 1,
                background: stage.bg,
                border: `1px solid ${stage.border}`,
                borderRadius: 12,
                padding: '14px 16px',
                minWidth: 90,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  <span style={{ fontSize: 12 }}>{stage.icon}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: stage.color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {stage.label}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-metric)', fontSize: 26, fontWeight: 800, color: stage.color, lineHeight: 1 }}>
                  {count}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <div style={{ fontSize: 9.5, color: 'var(--t3)' }}>{stage.sub}</div>
                  <div style={{ fontSize: 9, color: stage.color, fontWeight: 700, opacity: 0.7 }}>
                    {pct}%
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ marginTop: 8, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: stage.color,
                    borderRadius: 2,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
              {i < STAGES.length - 1 && <Arrow />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
