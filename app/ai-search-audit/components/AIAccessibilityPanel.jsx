"use client"

import { useAIAccessibility } from "@/hooks/useDashboardQueries"

// ── Status config — uses the Odito design token system ───────────────────────
const STATUS_CONFIG = {
  explicit_allow: {
    label: "Explicitly Allowed",
    color: "var(--gr)",
    bg:    "var(--color-status-success-surface)",
    border:"var(--color-status-success-border)",
    icon:  "✓",
  },
  configured: {
    label: "Configured",
    color: "var(--gr)",
    bg:    "var(--color-status-success-surface)",
    border:"var(--color-status-success-border)",
    icon:  "✓",
  },
  present: {
    label: "Present",
    color: "var(--gr)",
    bg:    "var(--color-status-success-surface)",
    border:"var(--color-status-success-border)",
    icon:  "✓",
  },
  wildcard: {
    label: "Accessible via Wildcard",
    color: "var(--am)",
    bg:    "var(--color-status-warning-surface)",
    border:"var(--color-status-warning-border)",
    icon:  "~",
  },
  default_access: {
    label: "Default Access",
    color: "var(--am)",
    bg:    "var(--color-status-warning-surface)",
    border:"var(--color-status-warning-border)",
    icon:  "~",
  },
  blocked: {
    label: "Blocked",
    color: "var(--re)",
    bg:    "var(--color-status-error-surface)",
    border:"var(--color-status-error-border)",
    icon:  "✗",
  },
  not_present: {
    label: "Not Present",
    color: "var(--re)",
    bg:    "var(--color-status-error-surface)",
    border:"var(--color-status-error-border)",
    icon:  "✗",
  },
  unknown: {
    label: "Unknown",
    color: "var(--t3)",
    bg:    "var(--s2)",
    border:"var(--b)",
    icon:  "?",
  },
}

// ── Bot display metadata ──────────────────────────────────────────────────────
const BOT_DISPLAY = {
  gptbot:         { logo: "🤖", org: "OpenAI" },
  claudebot:      { logo: "🔮", org: "Anthropic" },
  deepseek:       { logo: "🐋", org: "DeepSeek" },
  perplexitybot:  { logo: "🔍", org: "Perplexity" },
  googleExtended: { logo: "✦",  org: "Google Gemini" },
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unknown
  return (
    <span style={{
      display:    "inline-flex",
      alignItems: "center",
      gap:        4,
      fontSize:   11,
      fontWeight: 700,
      padding:    "3px 10px",
      borderRadius: 20,
      color:      cfg.color,
      background: cfg.bg,
      border:     `1px solid ${cfg.border}`,
      whiteSpace: "nowrap",
    }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

function ScoreRing({ score }) {
  const size = 68, r = 27
  const circ = 2 * Math.PI * r
  const pct  = score == null ? 0 : Math.max(0, Math.min(100, score))
  const dash = (pct / 100) * circ
  const col  = pct >= 70 ? "var(--gr)" : pct >= 40 ? "var(--am)" : "var(--re)"
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
              stroke="var(--color-border-default)" strokeWidth={5} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={col} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray .9s cubic-bezier(.4,0,.2,1)" }}
      />
      <text x={size/2} y={size/2 + 5} textAnchor="middle"
            fontSize={14} fontWeight={800} fill={col}>
        {score == null ? "—" : Math.round(score)}
      </text>
    </svg>
  )
}

function BotRow({ bot }) {
  const display = BOT_DISPLAY[bot.key] || {}
  const cfg     = STATUS_CONFIG[bot.status] || STATUS_CONFIG.unknown
  return (
    <div style={{
      display:     "flex",
      flexWrap:    "wrap",
      alignItems:  "center",
      gap:         8,
      padding:     "10px 14px",
      borderRadius: 10,
      background:  "var(--s)",
      border:      `1px solid ${cfg.border}`,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
        <span style={{ fontSize:18, lineHeight:1, flexShrink:0 }}>{display.logo || "🤖"}</span>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"var(--t)" }}>{bot.label}</div>
          <div style={{ fontSize:11, color:"var(--t2)" }}>{bot.desc || display.org}</div>
        </div>
      </div>

      <StatusBadge status={bot.status} />

      {bot.message && (
        <div style={{
          width:"100%", fontSize:11,
          color: "var(--t2)",
          paddingTop:6, paddingLeft:28, lineHeight:1.5,
        }}>
          {bot.message}
        </div>
      )}
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function AIAccessibilityPanel({ projectId }) {
  const { data: response, isLoading } = useAIAccessibility(projectId)
  const data = response?.data

  if (isLoading) {
    return (
      <div style={card}>
        <PanelHeader score={null} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height:68, borderRadius:10, background:"var(--s2)" }}
                 className="skeleton-shimmer" />
          ))}
        </div>
      </div>
    )
  }

  if (!data?.available) {
    return (
      <div style={card}>
        <PanelHeader score={null} />
        <p style={{ color:"var(--t2)", fontSize:13, margin:0, lineHeight:1.6 }}>
          Domain technical report not yet generated. Run a full audit to see AI crawler accessibility.
        </p>
      </div>
    )
  }

  const crawlers = data.crawlerStatus || []
  const llms     = data.llmsTxt || {}
  const llmsStatus = llms.exists
    ? (llms.valid ? "present" : "configured")
    : "not_present"
  const llmsCfg = STATUS_CONFIG[llmsStatus]

  return (
    <div style={card}>
      <PanelHeader score={data.aiAccessibilityScore} />

      <p style={{ fontSize:12, color:"var(--t2)", margin:"0 0 12px", lineHeight:1.6 }}>
        Domain-level access gates for major AI crawlers. If AI systems cannot reach
        your site, content quality is irrelevant.
      </p>

      {/* Note */}
      <div style={{
        fontSize: 11,
        color: "var(--am)",
        background: "var(--color-status-warning-surface)",
        border: "1px solid var(--color-status-warning-border)",
        borderRadius: 8,
        padding: "8px 12px",
        lineHeight: 1.5,
        marginBottom: 14,
      }}>
        <span style={{ fontWeight:700 }}>Note:</span>
        {" "}Wildcard access and explicit configuration are scored differently.
        {" "}<strong style={{ color:"var(--gr)" }}>Explicitly Allowed</strong> scores higher
        than <strong style={{ color:"var(--am)" }}>Accessible via Wildcard</strong>.
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>

        {/* llms.txt — first row */}
        <div style={{
          display:"flex", flexWrap:"wrap", alignItems:"center", gap:8,
          padding:"10px 14px", borderRadius:10,
          background: "var(--s)",
          border: `1px solid ${llmsCfg.border}`,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, flex:1 }}>
            <span style={{ fontSize:18, lineHeight:1 }}>📄</span>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"var(--t)" }}>
                llms.txt
                <span style={{
                  fontSize:9, fontWeight:600, color:"var(--t3)",
                  marginLeft:6, letterSpacing:"0.5px", textTransform:"uppercase",
                }}>BONUS</span>
              </div>
              <div style={{ fontSize:11, color:"var(--t2)" }}>
                {llms.exists
                  ? `Present · ${llms.contentLength ? (llms.contentLength/1000).toFixed(1)+" KB" : "—"}`
                  : "AI content discovery file"}
              </div>
            </div>
          </div>

          <StatusBadge status={llmsStatus} />

          {llms.message && (
            <div style={{
              width:"100%", fontSize:11,
              color: llms.exists ? "var(--t2)" : "var(--re)",
              paddingTop:6, paddingLeft:28, lineHeight:1.5,
            }}>
              {llms.message}
            </div>
          )}
        </div>

        {/* Bot rows */}
        {crawlers.map(bot => <BotRow key={bot.key} bot={bot} />)}

      </div>
    </div>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────

function PanelHeader({ score }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontFamily:"var(--font-display)", fontSize:16, fontWeight:800, color:"var(--t)" }}>
          AI Accessibility
        </span>
        <span className="glow-pill violet">ACCESS GATE</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <ScoreRing score={score} />
        <div>
          <div style={{ fontSize:10, color:"var(--t2)", fontWeight:600,
                        letterSpacing:1, textTransform:"uppercase" }}>
            AI Access Score
          </div>
          <div style={{ fontSize:11, color:"var(--t2)" }}>
            {score == null ? "Pending" : `${Math.round(score)} / 100`}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Card shell ────────────────────────────────────────────────────────────────

const card = {
  background:   "var(--s)",
  border:       "1px solid var(--b)",
  borderRadius: 16,
  padding:      "20px 24px",
  marginBottom: 12,
}
