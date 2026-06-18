"use client"

const CARDS = [
  {
    key: 'generated',
    label: 'Recommendations Generated',
    color: '#00dfff',
    bg: 'rgba(0, 223, 255, 0.06)',
    border: 'rgba(0, 223, 255, 0.15)',
    icon: '✦',
    sub: 'Total AI suggestions created',
  },
  {
    key: 'applied',
    label: 'Recommendations Applied',
    color: '#b580ff',
    bg: 'rgba(157, 78, 221, 0.06)',
    border: 'rgba(157, 78, 221, 0.15)',
    icon: '⚡',
    sub: 'Fixes actioned by your team',
  },
  {
    key: 'verified',
    label: 'Verified Fixed',
    color: '#00f5a0',
    bg: 'rgba(0, 245, 160, 0.06)',
    border: 'rgba(0, 245, 160, 0.15)',
    icon: '✓',
    sub: 'Confirmed removed by crawl',
  },
  {
    key: 'reopened',
    label: 'Reopened',
    color: '#ff6080',
    bg: 'rgba(255, 56, 96, 0.06)',
    border: 'rgba(255, 56, 96, 0.15)',
    icon: '↺',
    sub: 'Issues that reappeared',
  },
]

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--s)',
      border: '1px solid var(--b)',
      borderRadius: 14,
      padding: '18px 20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: 'var(--b)' }} />
      <div style={{ width: '60%', height: 9, background: 'var(--s2)', borderRadius: 4, marginBottom: 12 }} />
      <div style={{ width: '35%', height: 28, background: 'var(--s2)', borderRadius: 6 }} />
    </div>
  )
}

export default function AiImpactSummary({ data, isLoading }) {
  const recs = data?.recommendations ?? {}

  const successColor = recs.successRate >= 70
    ? '#00f5a0'
    : recs.successRate >= 40
      ? '#f5c518'
      : '#ff6080'

  if (isLoading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 14,
      }}>
        {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 14,
    }}>
      {CARDS.map(card => (
        <div key={card.key} style={{
          background: card.bg,
          border: `1px solid ${card.border}`,
          borderRadius: 14,
          padding: '18px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: 4, height: '100%',
            background: card.color,
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: card.color }}>{card.icon}</span>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {card.label}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-metric)', fontSize: 32, fontWeight: 800, color: 'var(--t)', lineHeight: 1 }}>
            {recs[card.key] ?? 0}
          </div>
          <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 5 }}>{card.sub}</div>
        </div>
      ))}

      {/* Success Rate — separate card with dynamic color */}
      <div style={{
        background: `rgba(${successColor === '#00f5a0' ? '0,245,160' : successColor === '#f5c518' ? '245,197,24' : '255,96,128'}, 0.06)`,
        border: `1px solid ${successColor}30`,
        borderRadius: 14,
        padding: '18px 20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: 4, height: '100%',
          background: successColor,
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: successColor }}>◎</span>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Success Rate
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-metric)', fontSize: 32, fontWeight: 800, color: successColor, lineHeight: 1 }}>
          {recs.successRate != null ? `${recs.successRate}%` : '—'}
        </div>
        <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 5 }}>
          Of applied fixes verified
        </div>
      </div>
    </div>
  )
}
