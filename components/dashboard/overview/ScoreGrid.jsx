"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import ScoreRing from "@/components/ui/ScoreRing";

// ── Delta badge pinned to bottom-right corner of the card ────────────────────

function DeltaCorner({ delta }) {
  if (!delta || delta.change == null) return null;

  if (delta.direction === 'unchanged') {
    return (
      <div style={{
        position: 'absolute', top: 10, right: 12,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 600, color: 'var(--color-text-tertiary)',
          background: 'rgba(132,148,176,0.10)', borderRadius: 20,
          padding: '2px 8px',
        }}>
          → No change
        </span>
      </div>
    );
  }

  const improved  = delta.direction === 'improved';
  const color     = improved ? 'var(--color-status-success)' : 'var(--color-status-error)';
  const bg        = improved ? 'rgba(16,255,160,0.10)' : 'rgba(255,56,96,0.10)';
  const arrow     = improved ? '↑' : '↓';
  const absChange = Math.round(Math.abs(delta.change) * 10) / 10;
  const sign      = delta.change > 0 ? '+' : '−';
  const pct       = delta.percentage != null
    ? Math.round(Math.abs(delta.percentage) * 10) / 10
    : null;

  return (
    <div style={{
      position: 'absolute', top: 10, right: 12,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2,
    }}>
      <span style={{
        fontSize: 11, fontWeight: 700, color,
        background: bg, borderRadius: 20, padding: '2px 8px',
      }}>
        {arrow} {sign}{absChange} pts
      </span>
      {pct != null && (
        <span style={{ fontSize: 10, fontWeight: 600, color, opacity: 0.8 }}>
          {sign}{pct}%
        </span>
      )}
    </div>
  );
}

// ── Score Grid ────────────────────────────────────────────────────────────────

function ScoreGrid({ seoHealth = 0, aiVisibility = 0, performance = 0, technicalHealth = 0, deltas = null }) {
  const router = useRouter();

  const handleCardClick = (cardType) => {
    switch (cardType) {
      case 'seo':  router.push('/onpage');          break;
      case 'ai':   router.push('/ai-search-audit'); break;
      case 'perf': router.push('/pagespeed');       break;
      case 'tech': router.push('/technicalchecks'); break;
      default: break;
    }
  };

  const scores = {
    seo:  { val: seoHealth,      label: "SEO Health",       delta: deltas?.websiteScore,      color: "#7c3aed", color2: "#a855f7" },
    ai:   { val: aiVisibility,   label: "AI Visibility",    delta: deltas?.aiVisibilityScore, color: "#00e5ff", color2: "#0ea5e9" },
    perf: { val: performance,    label: "Performance",      delta: null,                      color: "#10ffa0", color2: "#059669" },
    tech: { val: technicalHealth,label: "Technical Health", delta: null,                      color: "#ff6b6b", color2: "#ee5a24" },
  };

  return (
    <div className="score-grid">
      {Object.entries(scores).map(([k, s]) => (
        <div
          key={k}
          className="score-card"
          style={{
            "--grad": `linear-gradient(90deg, ${s.color}, ${s.color2})`,
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          }}
          onClick={() => handleCardClick(k)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <div className="score-label">{s.label}</div>

          {/* Ring + number overlaid */}
          <div style={{ position: "relative" }}>
            <ScoreRing val={s.val} color={s.color} color2={s.color2} />
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 28,
                color: s.color,
              }}>
                {s.val}
              </div>
              <div style={{ fontSize: 10, color: "var(--text3)" }}>/100</div>
            </div>
          </div>

          {/* Delta — pinned to bottom-right corner */}
          <DeltaCorner delta={s.delta} />
        </div>
      ))}
    </div>
  );
}

export default memo(ScoreGrid);
