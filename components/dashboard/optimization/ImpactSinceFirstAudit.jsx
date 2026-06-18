"use client"

function formatDelta(value, isLowerBetter = false) {
  if (value == null) return { display: '—', color: 'var(--t3)', prefix: '' }
  const improved = isLowerBetter ? value < 0 : value > 0
  const neutral  = value === 0
  const color    = neutral ? 'var(--t2)' : improved ? '#00f5a0' : '#ff6080'
  const prefix   = value > 0 ? '+' : ''
  return { display: `${prefix}${value}`, color, prefix }
}

function Stat({ label, value, color, sub }) {
  return (
    <div style={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
      <div style={{ fontFamily: 'var(--font-metric)', fontSize: 28, fontWeight: 800, color: color || 'var(--t)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 9.5, color: 'var(--t3)', marginTop: 2, opacity: 0.7 }}>{sub}</div>
      )}
    </div>
  )
}

function Divider() {
  return (
    <div style={{ width: 1, background: 'var(--b)', alignSelf: 'stretch', margin: '0 4px', flexShrink: 0 }} />
  )
}

export default function ImpactSinceFirstAudit({ trends, isLoading }) {
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
        <div style={{ display: 'flex', gap: 16 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ width: '70%', height: 28, background: 'var(--s2)', borderRadius: 6, margin: '0 auto 6px' }} />
              <div style={{ width: '90%', height: 8, background: 'var(--s2)', borderRadius: 3, margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const available = trends?.available && trends?.totalAudits >= 2
  const growth = trends?.growth ?? {}

  // Website score delta (higher = better)
  const scoreDelta    = formatDelta(growth.websiteScore?.change,      false)
  // AI visibility delta (higher = better)
  const aiDelta       = formatDelta(growth.aiVisibilityScore?.change, false)
  // Issues removed (lower = better → invert sign for display)
  const issueChange   = growth.totalIssues?.change
  const issuesRemoved = issueChange != null ? Math.abs(issueChange) : null
  const issueDir      = growth.totalIssues?.direction
  const issueColor    = issueDir === 'improved' ? '#00f5a0' : issueDir === 'declined' ? '#ff6080' : 'var(--t2)'

  // Critical issues: first vs last from raw arrays
  const critArr = trends?.criticalIssues ?? []
  const critRemoved = critArr.length >= 2
    ? critArr[0] - critArr[critArr.length - 1]
    : null
  const critColor = critRemoved != null
    ? (critRemoved > 0 ? '#00f5a0' : critRemoved < 0 ? '#ff6080' : 'var(--t2)')
    : 'var(--t3)'

  const totalAudits = trends?.totalAudits ?? 0

  if (!available) {
    return (
      <div style={{
        background: 'var(--s)',
        border: '1px solid var(--b)',
        borderRadius: 16,
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: 8,
      }}>
        <div style={{ fontSize: 24 }}>📊</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)' }}>Not enough audit history</div>
        <div style={{ fontSize: 11, color: 'var(--t3)' }}>
          {totalAudits === 0 ? 'Run your first audit to begin tracking progress.' : 'Run a second audit to see growth trends.'}
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
      height: '100%',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'linear-gradient(135deg, #00dfff, #7730ed)',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Since First Audit
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--t3)' }}>
          {totalAudits} audit{totalAudits !== 1 ? 's' : ''} total
        </span>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <Stat
          label="Website Score"
          value={scoreDelta.display}
          color={scoreDelta.color}
        />
        <Divider />
        <Stat
          label="AI Visibility"
          value={growth.aiVisibilityScore?.first != null ? aiDelta.display : '—'}
          color={aiDelta.color}
        />
        <Divider />
        <Stat
          label="Issues Removed"
          value={issuesRemoved != null ? (issueDir === 'improved' ? issuesRemoved : `-${issuesRemoved}`) : '—'}
          color={issueColor}
        />
        <Divider />
        <Stat
          label="Critical Removed"
          value={critRemoved != null ? (critRemoved >= 0 ? `+${critRemoved}` : critRemoved) : '—'}
          color={critColor}
        />
        <Divider />
        <Stat
          label="Audits Completed"
          value={totalAudits}
          color="var(--t)"
        />
      </div>

      {/* Insights */}
      {trends?.insights?.length > 0 && (
        <div style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: '1px solid var(--b)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
        }}>
          {trends.insights.map((ins, i) => (
            <span key={i} style={{
              fontSize: 10,
              color: 'var(--t3)',
              background: 'var(--s2)',
              border: '1px solid var(--b)',
              borderRadius: 20,
              padding: '3px 9px',
            }}>
              {ins}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
