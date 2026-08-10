"use client"

import { BarChart2, Brain, List, Mic } from "lucide-react"

export default function ContentStructureSection({ structure }) {
  const { question_coverage, faq_intelligence, snippet_readiness, voice_readiness } = structure

  return (
    <section className="space-y-4">
      <h2 className="section-title">Content Structure Intelligence</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Question Coverage */}
        <div className="glass-card rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
              Question Coverage
            </span>
            <BarChart2 size={16} style={{ color: "var(--color-brand-violet)" }} />
          </div>

          <div className="flex items-end justify-between">
            <span
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-metric)", color: "var(--color-text-primary)" }}
            >
              {question_coverage.ratio}
            </span>
            <span className="text-xs mb-1" style={{ color: "var(--color-text-tertiary)" }}>Q:H Ratio</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              <span>Question H2s</span>
              <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{question_coverage.question_h2s}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-score-ring-track)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round((question_coverage.question_h2s / question_coverage.total_h2s) * 100)}%`,
                  background: "var(--color-brand-violet)",
                }}
              />
            </div>
            <div className="flex justify-between text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
              <span>Total H2 Count</span>
              <span>{question_coverage.total_h2s}</span>
            </div>
          </div>
        </div>

        {/* FAQ Intelligence */}
        <div className="glass-card rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
              FAQ Intelligence
            </span>
            <Brain size={16} style={{ color: "var(--color-brand-cyan)" }} />
          </div>

          <div className="flex items-end justify-between">
            <span
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-metric)", color: "var(--color-text-primary)" }}
            >
              {faq_intelligence.schema_match_pct}%
            </span>
            <span className="text-xs mb-1" style={{ color: "var(--color-text-tertiary)" }}>Schema Match</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div
              className="rounded-lg p-2.5 space-y-0.5"
              style={{ background: "var(--color-score-ring-track)" }}
            >
              <span className="text-[10px] block" style={{ color: "var(--color-text-tertiary)" }}>Schema Qs</span>
              <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                {faq_intelligence.schema_qs}
              </span>
            </div>
            <div
              className="rounded-lg p-2.5 space-y-0.5"
              style={{ background: "var(--color-score-ring-track)" }}
            >
              <span className="text-[10px] block" style={{ color: "var(--color-text-tertiary)" }}>Visible Qs</span>
              <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                {faq_intelligence.visible_qs}
              </span>
            </div>
          </div>
        </div>

        {/* Snippet Readiness */}
        <div className="glass-card rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
              Snippet Readiness
            </span>
            <List size={16} style={{ color: "var(--color-brand-violet)" }} />
          </div>

          <div className="flex flex-col gap-2">
            {[
              { label: "Lists Found",      value: snippet_readiness.lists },
              { label: "Tables Indexed",   value: snippet_readiness.tables },
              { label: "Authority Links",  value: snippet_readiness.authority_links },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between items-center px-3 py-2 rounded-lg"
                style={{ background: "var(--color-score-ring-track)" }}
              >
                <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{label}</span>
                <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-metric)" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Voice Readiness */}
        <div className="glass-card rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
              Voice Readiness
            </span>
            <Mic size={16} style={{ color: "var(--color-status-success)" }} />
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: voice_readiness.speakable_active ? "var(--color-status-success)" : "var(--color-status-error)" }}
            />
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--color-text-primary)" }}>
              Speakable: {voice_readiness.speakable_active ? "Active" : "Inactive"}
            </span>
          </div>

          <div
            className="flex justify-between items-center pb-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Conversational Signal</span>
            <span
              className="text-sm font-bold"
              style={{ color: "var(--color-status-success)", fontFamily: "var(--font-metric)" }}
            >
              {voice_readiness.conversational_signal}
            </span>
          </div>

          <div className="flex justify-between items-end">
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Natural Signals</span>
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-metric)", color: "var(--color-text-primary)" }}
            >
              {voice_readiness.natural_signals_pct}%
            </span>
          </div>
        </div>

      </div>
    </section>
  )
}
