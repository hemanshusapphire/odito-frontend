"use client"

const SOURCE_META = {
  claude:   { label: 'Claude AI',  color: '#b580ff', icon: '◆' },
  hybrid:   { label: 'Hybrid',     color: '#00dfff', icon: '⬡' },
  template: { label: 'Template',   color: '#f5c518', icon: '▦' },
  fallback: { label: 'Fallback',   color: '#a0a0b0', icon: '○' },
  unknown:  { label: 'Unknown',    color: 'var(--t3)', icon: '·' },
}

const TIER_META = {
  grounded:    { label: 'Grounded',    color: '#00f5a0', desc: 'Full page context' },
  contextual:  { label: 'Contextual',  color: '#00dfff', desc: 'Partial context' },
  generic:     { label: 'Generic',     color: '#f5c518', desc: 'No page context' },
  unknown:     { label: 'Unknown',     color: 'var(--t3)', desc: '' },
}

function Section({ title, items, colorKey }) {
  const total = items.reduce((s, r) => s + r.count, 0)

  return (
    <div>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        {title}
      </div>
      {items.length === 0 ? (
        <div style={{ fontSize: 11, color: 'var(--t3)' }}>No data yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(({ key, count }) => {
            const meta = colorKey === 'source' ? SOURCE_META[key] : TIER_META[key]
            const label = meta?.label || key
            const color = meta?.color || 'var(--t3)'
            const pct   = total > 0 ? Math.round((count / total) * 100) : 0
            const desc  = colorKey === 'tier' ? TIER_META[key]?.desc : null

            return (
              <div key={key}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {colorKey === 'source' && (
                      <span style={{ fontSize: 11, color }}>{SOURCE_META[key]?.icon || '●'}</span>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--t2)' }}>{label}</span>
                    {desc && <span style={{ fontSize: 9.5, color: 'var(--t3)' }}>— {desc}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 9.5, color: 'var(--t3)' }}>{pct}%</span>
                    <span style={{ fontFamily: 'var(--font-metric)', fontSize: 15, fontWeight: 700, color }}>{count}</span>
                  </div>
                </div>
                <div style={{ height: 4, background: 'var(--s2)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: color,
                    borderRadius: 2,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SkeletonSection() {
  return (
    <div>
      <div style={{ width: '40%', height: 8, background: 'var(--s2)', borderRadius: 3, marginBottom: 12 }} />
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ width: '45%', height: 8, background: 'var(--s2)', borderRadius: 3 }} />
            <div style={{ width: '15%', height: 8, background: 'var(--s2)', borderRadius: 3 }} />
          </div>
          <div style={{ height: 4, background: 'var(--s2)', borderRadius: 2 }} />
        </div>
      ))}
    </div>
  )
}

export default function RecommendationQualityInsights({ qualityBreakdown, isLoading }) {
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
        <div style={{ width: '55%', height: 10, background: 'var(--s2)', borderRadius: 4, marginBottom: 22 }} />
        <SkeletonSection />
        <div style={{ height: 1, background: 'var(--b)', margin: '18px 0' }} />
        <SkeletonSection />
      </div>
    )
  }

  const { bySource = {}, byTier = {} } = qualityBreakdown ?? {}

  const sourceItems = Object.entries(bySource)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)

  // Tier order: grounded first (highest quality)
  const TIER_ORDER = ['grounded', 'contextual', 'generic', 'unknown']
  const tierItems = Object.entries(byTier)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => TIER_ORDER.indexOf(a.key) - TIER_ORDER.indexOf(b.key))

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#b580ff', flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Recommendation Quality
        </span>
      </div>

      <Section
        title="Generation Method"
        items={sourceItems}
        colorKey="source"
      />

      <div style={{ height: 1, background: 'var(--b)', margin: '18px 0' }} />

      <Section
        title="Confidence Tier"
        items={tierItems}
        colorKey="tier"
      />
    </div>
  )
}
