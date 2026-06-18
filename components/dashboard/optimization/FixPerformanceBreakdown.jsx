"use client"

const ORIGIN_META = {
  ai_fix:    { label: 'AI Fix',   icon: '✦', color: '#b580ff', border: 'rgba(157,78,221,0.25)' },
  diy_guide: { label: 'DIY Guide',icon: '🛠', color: '#00dfff', border: 'rgba(0,223,255,0.25)' },
  auditiq:   { label: 'AuditIQ',  icon: '🤝', color: '#f5c518', border: 'rgba(245,197,24,0.25)' },
  manual:    { label: 'Manual',   icon: '✎',  color: '#a0a0b0', border: 'rgba(160,160,176,0.25)' },
}

function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
      <div style={{ width: 60, height: 9, background: 'var(--s2)', borderRadius: 3 }} />
      <div style={{ flex: 1, height: 6, background: 'var(--s2)', borderRadius: 3 }} />
      <div style={{ width: 24, height: 9, background: 'var(--s2)', borderRadius: 3 }} />
    </div>
  )
}

export default function FixPerformanceBreakdown({ originBreakdown, isLoading }) {
  if (isLoading) {
    return (
      <div style={{
        background: 'var(--s)',
        border: '1px solid var(--b)',
        borderRadius: 16,
        padding: '20px 24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        height: '100%',
      }}>
        <div style={{ width: '50%', height: 10, background: 'var(--s2)', borderRadius: 4, marginBottom: 18 }} />
        {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
      </div>
    )
  }

  const origins = (originBreakdown ?? []).filter(o => o.total > 0)
  const maxVerified = Math.max(...origins.map(o => o.verified_fixed), 1)
  const hasData = origins.length > 0

  // Sort: most verified first, with ai_fix always first when tied
  const ORDER = ['ai_fix', 'diy_guide', 'auditiq', 'manual']
  const sorted = [...origins].sort((a, b) => {
    const vDiff = (b.verified_fixed || 0) - (a.verified_fixed || 0)
    if (vDiff !== 0) return vDiff
    return ORDER.indexOf(a.origin) - ORDER.indexOf(b.origin)
  })

  return (
    <div style={{
      background: 'var(--s)',
      border: '1px solid var(--b)',
      borderRadius: 16,
      padding: '20px 24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00f5a0', flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Fix Performance by Source
        </span>
      </div>

      {!hasData ? (
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>🎯</div>
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>No fix data yet.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sorted.map(origin => {
            const meta = ORIGIN_META[origin.origin] || {
              label: origin.origin, icon: '●', color: 'var(--t3)', border: 'var(--b)',
            }
            const verified = origin.verified_fixed || 0
            const total    = origin.total || 0
            const pct      = maxVerified > 0 ? Math.round((verified / maxVerified) * 100) : 0
            const rate     = total > 0 ? Math.round((verified / total) * 100) : 0

            return (
              <div key={origin.origin}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                      background: `${meta.color}18`,
                      color: meta.color,
                      border: `1px solid ${meta.border}`,
                      whiteSpace: 'nowrap',
                    }}>
                      {meta.icon} {meta.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 9.5, color: 'var(--t3)' }}>{rate}% rate</span>
                    <span style={{ fontFamily: 'var(--font-metric)', fontSize: 18, fontWeight: 800, color: meta.color }}>
                      {verified}
                    </span>
                    <span style={{ fontSize: 9.5, color: 'var(--t3)' }}>verified</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: 5, background: 'var(--s2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: meta.color,
                    borderRadius: 3,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                {/* Sub-stats */}
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  {[
                    { label: 'total', value: total },
                    { label: 'pending', value: origin.implemented || 0, color: '#b580ff' },
                    { label: 'reopened', value: origin.reopened || 0, color: '#ff6080' },
                  ].map(s => (
                    <span key={s.label} style={{ fontSize: 9.5, color: s.color || 'var(--t3)' }}>
                      {s.value} {s.label}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
