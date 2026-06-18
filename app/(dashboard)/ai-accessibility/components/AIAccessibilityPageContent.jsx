"use client"

import { useAIAccessibility } from "@/hooks/useDashboardQueries"

// ── Design-token status config ────────────────────────────────────────────────

const STATUS = {
  explicit_allow: { label:"Explicitly Allowed", color:"var(--gr)", bg:"var(--color-status-success-surface)", border:"var(--color-status-success-border)", icon:"✓" },
  configured:     { label:"Configured",          color:"var(--gr)", bg:"var(--color-status-success-surface)", border:"var(--color-status-success-border)", icon:"✓" },
  present:        { label:"Present",             color:"var(--gr)", bg:"var(--color-status-success-surface)", border:"var(--color-status-success-border)", icon:"✓" },
  wildcard:       { label:"Accessible via Wildcard", color:"var(--am)", bg:"var(--color-status-warning-surface)", border:"var(--color-status-warning-border)", icon:"~" },
  default_access: { label:"Default Access",      color:"var(--am)", bg:"var(--color-status-warning-surface)", border:"var(--color-status-warning-border)", icon:"~" },
  blocked:        { label:"Blocked",             color:"var(--re)", bg:"var(--color-status-error-surface)",   border:"var(--color-status-error-border)",   icon:"✗" },
  not_present:    { label:"Not Present",         color:"var(--re)", bg:"var(--color-status-error-surface)",   border:"var(--color-status-error-border)",   icon:"✗" },
  unknown:        { label:"Unknown",             color:"var(--t3)", bg:"var(--s2)",                           border:"var(--b)",                           icon:"?" },
}

const BOT_LOGOS = {
  gptbot:         "🤖",
  claudebot:      "🔮",
  deepseek:       "🐋",
  perplexitybot:  "🔍",
  googleExtended: "✦",
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectionMethod(bot, robotsExists) {
  if (bot.explicitlyBlocked) return "Explicit block declaration"
  if (bot.explicitlyAllowed) return "Explicit allow declaration"
  if (bot.mentioned)         return "Named with path restrictions"
  if (robotsExists === false) return "No robots.txt (implicit allow)"
  if (bot.inheritsWildcard)  return "Wildcard rule inheritance"
  return "Unknown"
}

function confidence(bot, robotsExists) {
  if (bot.explicitlyBlocked || bot.explicitlyAllowed) return { label:"High", color:"var(--gr)" }
  if (bot.mentioned)         return { label:"High",   color:"var(--gr)" }
  if (robotsExists === false) return { label:"Low",   color:"var(--am)" }
  if (bot.inheritsWildcard)  return { label:"Medium", color:"var(--am)" }
  return { label:"Low", color:"var(--re)" }
}

function buildRecommendations(crawlerStatus, llms, robotsExists) {
  const recs = []
  const blocked = crawlerStatus.filter(b => b.explicitlyBlocked)
  const wildcardOnly = crawlerStatus.filter(b => b.status === "wildcard" || b.status === "default_access")
  const hasExplicit = crawlerStatus.some(b => b.explicitlyAllowed)

  blocked.forEach(b => recs.push({
    priority: "critical",
    title:    `${b.label} is blocked`,
    detail:   `Remove or modify the "Disallow: /" directive under "User-agent: ${b.ua}" in your robots.txt to restore access.`,
    color:    "var(--re)",
    bg:       "var(--color-status-error-surface)",
    border:   "var(--color-status-error-border)",
  }))

  if (!llms.exists) recs.push({
    priority: "recommended",
    title:    "Add llms.txt",
    detail:   "Create an /llms.txt file to signal AI-specific content permissions. This emerging standard may improve future AI ecosystem compatibility.",
    color:    "var(--am)",
    bg:       "var(--color-status-warning-surface)",
    border:   "var(--color-status-warning-border)",
  })

  if (wildcardOnly.length > 0 && !hasExplicit) recs.push({
    priority: "suggested",
    title:    "Add explicit AI crawler declarations",
    detail:   `${wildcardOnly.length} crawler${wildcardOnly.length > 1 ? "s rely" : " relies"} on wildcard rules. Adding named User-agent sections signals deliberate AI access and scores higher.`,
    color:    "var(--am)",
    bg:       "var(--color-status-warning-surface)",
    border:   "var(--color-status-warning-border)",
  })

  if (robotsExists === false) recs.push({
    priority: "info",
    title:    "robots.txt not found",
    detail:   "No robots.txt was detected. Creating one with explicit AI bot declarations is recommended for clarity and future-proofing.",
    color:    "var(--t2)",
    bg:       "var(--s2)",
    border:   "var(--b)",
  })

  if (recs.length === 0) recs.push({
    priority: "good",
    title:    "AI accessibility is well configured",
    detail:   "All monitored AI crawlers are explicitly allowed. Consider adding llms.txt for maximum future compatibility.",
    color:    "var(--gr)",
    bg:       "var(--color-status-success-surface)",
    border:   "var(--color-status-success-border)",
  })

  return recs
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Badge({ status }) {
  const cfg = STATUS[status] || STATUS.unknown
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20,
      color:cfg.color, background:cfg.bg, border:`1px solid ${cfg.border}`,
      whiteSpace:"nowrap",
    }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontFamily:"var(--font-display)", fontSize:14, fontWeight:700,
      color:"var(--t)", marginBottom:6, letterSpacing:"-0.01em",
    }}>
      {children}
    </div>
  )
}

function Card({ children, style }) {
  return (
    <div style={{
      background:"var(--s)", border:"1px solid var(--b)",
      borderRadius:14, padding:"18px 20px", ...style,
    }}>
      {children}
    </div>
  )
}

// ── Bot Card ─────────────────────────────────────────────────────────────────

function BotCard({ bot, robotsExists }) {
  const cfg  = STATUS[bot.status] || STATUS.unknown
  const conf = confidence(bot, robotsExists)
  const det  = detectionMethod(bot, robotsExists)

  return (
    <div style={{
      background:"var(--s)", borderRadius:12, padding:"16px 18px",
      border:`1px solid ${cfg.border}`,
      display:"flex", flexDirection:"column", gap:10,
    }}>
      {/* Top row */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:22, lineHeight:1 }}>{BOT_LOGOS[bot.key] || "🤖"}</span>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:"var(--t)", lineHeight:1.2 }}>{bot.label}</div>
            <div style={{ fontSize:11, color:"var(--t2)" }}>{bot.desc}</div>
          </div>
        </div>
        <Badge status={bot.status} />
      </div>

      {/* Meta row */}
      <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
        <MetaPair label="Detection" value={det} />
        <MetaPair label="Confidence" value={conf.label} valueColor={conf.color} />
      </div>

      {/* Recommendation */}
      {bot.message && (
        <div style={{
          fontSize:11, color:"var(--t2)", lineHeight:1.5,
          paddingTop:8, borderTop:"1px solid var(--b)",
        }}>
          {bot.message}
        </div>
      )}
    </div>
  )
}

function MetaPair({ label, value, valueColor }) {
  return (
    <div>
      <div style={{ fontSize:10, fontWeight:600, color:"var(--t3)", textTransform:"uppercase",
                    letterSpacing:"0.5px", marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:12, fontWeight:600, color: valueColor || "var(--t)" }}>{value}</div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AIAccessibilityPageContent({ projectId }) {
  const { data: response, isLoading } = useAIAccessibility(projectId)
  const data = response?.data

  if (isLoading) return <LoadingSkeleton />

  if (!data?.available) {
    return (
      <div style={{ padding:"24px 28px" }}>
        <PageHeader />
        <Card style={{ marginTop:16, textAlign:"center", padding:"40px 24px" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🔍</div>
          <div style={{ fontSize:15, fontWeight:600, color:"var(--t)", marginBottom:8 }}>
            No Domain Report Available
          </div>
          <div style={{ fontSize:13, color:"var(--t2)", maxWidth:400, margin:"0 auto", lineHeight:1.6 }}>
            Run a full project audit to generate the domain technical report.
            AI Accessibility data is collected during the Technical Domain scan.
          </div>
        </Card>
      </div>
    )
  }

  const { crawlerStatus = [], llmsTxt: llms = {}, robotsExists, robotsStatus, domain } = data
  const recs = buildRecommendations(crawlerStatus, llms, robotsExists)
  const llmsStatus = llms.exists ? (llms.valid ? "present" : "configured") : "not_present"

  // robots.txt analysis derived from signals
  const mentionedBots = crawlerStatus.filter(b => b.mentioned)
  const wildcardBots  = crawlerStatus.filter(b => b.inheritsWildcard)
  const blockedBots   = crawlerStatus.filter(b => b.explicitlyBlocked)
  const explicitBots  = crawlerStatus.filter(b => b.explicitlyAllowed)

  return (
    <div style={{ padding:"20px 24px", maxWidth:1400 }}>

      {/* ── Page Header ────────────────────────────────────────────── */}
      <Card style={{ marginBottom:4, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <span style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, color:"var(--t)" }}>
              AI Accessibility
            </span>
            <span className="glow-pill violet">INFRASTRUCTURE</span>
          </div>
          <div style={{ fontSize:13, color:"var(--t2)", lineHeight:1.6 }}>
            Domain-level access controls for major AI crawlers and future AI discovery systems
            {domain && <span style={{ color:"var(--t3)", marginLeft:6 }}>· {domain}</span>}
          </div>
        </div>
      </Card>

      {/* ── Recommendations ────────────────────────────────────────── */}
      {recs.length > 0 && (
        <div style={{ marginBottom:12 }}>
          <SectionTitle>Recommendations</SectionTitle>
          <Card style={{ padding:"14px 18px" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {recs.map((r, i) => (
                <div key={i} style={{
                  display:"flex", gap:12, alignItems:"flex-start",
                  background:r.bg, border:`1px solid ${r.border}`,
                  borderRadius:10, padding:"12px 16px",
                }}>
                  <div style={{
                    fontSize:11, fontWeight:700, color:r.color, minWidth:90,
                    letterSpacing:"0.4px",
                  }}>
                    {r.priority === "critical"    ? "CRITICAL"    :
                     r.priority === "recommended" ? "RECOMMENDED" :
                     r.priority === "suggested"   ? "SUGGESTED"   :
                     r.priority === "good"        ? "GOOD"        : "INFO"}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"var(--t)", marginBottom:3 }}>{r.title}</div>
                    <div style={{ fontSize:12, color:"var(--t2)", lineHeight:1.5 }}>{r.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── llms.txt ───────────────────────────────────────────────── */}
      <div style={{ marginBottom:12 }}>
        <SectionTitle>llms.txt</SectionTitle>
        <Card>
          <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <span style={{ fontSize:28, lineHeight:1 }}>📄</span>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <span style={{ fontSize:15, fontWeight:700, color:"var(--t)" }}>llms.txt</span>
                <span style={{ fontSize:9, fontWeight:700, color:"var(--t3)", letterSpacing:"0.5px",
                               textTransform:"uppercase" }}>BONUS SIGNAL</span>
                <Badge status={llmsStatus} />
              </div>
              <div style={{ fontSize:12, color:"var(--t2)", lineHeight:1.6, maxWidth:600 }}>
                {llms.exists
                  ? `Detected${llms.contentLength ? ` (${(llms.contentLength/1000).toFixed(1)} KB)` : ""}. ${llms.valid ? "File is valid." : "File may not be valid — verify the format."}`
                  : "llms.txt is not present. This experimental format is not yet required but may improve AI ecosystem compatibility when the standard matures."}
              </div>
            </div>
            <div style={{ display:"flex", gap:24 }}>
              <MetaPair label="Status" value={llms.exists ? "Found" : "Not found"} valueColor={llms.exists ? "var(--gr)" : "var(--re)"} />
              {llms.exists && <MetaPair label="Valid" value={llms.valid ? "Yes" : "No"} valueColor={llms.valid ? "var(--gr)" : "var(--am)"} />}
              {llms.exists && llms.contentLength > 0 && <MetaPair label="Size" value={`${(llms.contentLength/1000).toFixed(1)} KB`} />}
            </div>
          </div>
        </Card>
      </div>

      {/* ── AI Crawlers ─────────────────────────────────────────────── */}
      <div style={{ marginBottom:12 }}>
        <SectionTitle>AI Crawlers ({crawlerStatus.length})</SectionTitle>
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",
          gap:12,
        }}>
          {crawlerStatus.map(bot => (
            <BotCard key={bot.key} bot={bot} robotsExists={robotsExists} />
          ))}
        </div>
      </div>

      {/* ── robots.txt Analysis ─────────────────────────────────────── */}
      <div style={{ marginBottom:12 }}>
        <SectionTitle>robots.txt Analysis</SectionTitle>
        <Card>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:16, marginBottom:16 }}>
            <StatBlock
              label="robots.txt"
              value={robotsExists ? "Found" : "Not found"}
              sub={robotsExists ? `HTTP ${robotsStatus || "200"}` : "Implicit allow-all applies"}
              color={robotsExists ? "var(--gr)" : "var(--am)"}
            />
            <StatBlock
              label="Explicit AI declarations"
              value={mentionedBots.length}
              sub={mentionedBots.length > 0 ? mentionedBots.map(b => b.label).join(", ") : "None found"}
              color={mentionedBots.length > 0 ? "var(--gr)" : "var(--am)"}
            />
            <StatBlock
              label="Wildcard crawlers"
              value={wildcardBots.length}
              sub="Inherit User-agent: * rules"
              color={wildcardBots.length > 0 ? "var(--am)" : "var(--gr)"}
            />
            <StatBlock
              label="Blocked crawlers"
              value={blockedBots.length}
              sub={blockedBots.length > 0 ? blockedBots.map(b => b.label).join(", ") : "None"}
              color={blockedBots.length > 0 ? "var(--re)" : "var(--gr)"}
            />
            <StatBlock
              label="Explicitly allowed"
              value={explicitBots.length}
              sub={explicitBots.length > 0 ? explicitBots.map(b => b.label).join(", ") : "None"}
              color={explicitBots.length > 0 ? "var(--gr)" : "var(--t3)"}
            />
          </div>

          {/* robots.txt legend */}
          <div style={{
            fontSize:11, color:"var(--t2)", lineHeight:1.6,
            paddingTop:12, borderTop:"1px solid var(--b)",
          }}>
            <span style={{ fontWeight:600 }}>How scoring works:</span>
            {" "}Explicitly Allowed = 100 · Configured = 80 · Accessible via Wildcard = 60 · No robots.txt = 50 · Blocked = 0.
            {" "}llms.txt presence adds a +5–10 bonus to the final score.
          </div>
        </Card>
      </div>

    </div>
  )
}

// ── Stat block ────────────────────────────────────────────────────────────────

function StatBlock({ label, value, sub, color }) {
  return (
    <div>
      <div style={{ fontSize:10, fontWeight:700, color:"var(--t3)", textTransform:"uppercase",
                    letterSpacing:"0.5px", marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:20, fontWeight:800, color: color || "var(--t)", lineHeight:1.1, marginBottom:3 }}>
        {value}
      </div>
      <div style={{ fontSize:11, color:"var(--t2)" }}>{sub}</div>
    </div>
  )
}

// ── Page header (used in no-data state) ───────────────────────────────────────

function PageHeader() {
  return (
    <div>
      <div style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, color:"var(--t)", marginBottom:4 }}>
        AI Accessibility
      </div>
      <div style={{ fontSize:13, color:"var(--t2)" }}>
        Domain-level access controls for major AI crawlers and future AI discovery systems
      </div>
    </div>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div style={{ padding:"24px 28px" }} className="skeleton-fade-in">
      <div className="skeleton-base skeleton-shimmer rounded" style={{ width:200, height:28, marginBottom:8 }} />
      <div className="skeleton-base skeleton-shimmer rounded" style={{ width:340, height:16, marginBottom:24 }} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton-base skeleton-shimmer rounded-xl" style={{ height:130 }} />
        ))}
      </div>
    </div>
  )
}
