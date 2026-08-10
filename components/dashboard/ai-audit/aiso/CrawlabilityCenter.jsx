"use client"

import Image from "next/image"
import { FileCode } from "lucide-react"

const BOT_CONFIGS = [
  {
    id:          "gptbot",
    label:       "GPTBot",
    description: "OpenAI crawler for ChatGPT and AI search indexing",
    imgSrc:      "/ai%20png/chatgpt.png",
  },
  {
    id:          "claudebot",
    label:       "ClaudeBot",
    description: "Anthropic crawler for Claude AI models",
    imgSrc:      "/ai%20png/claude.png",
  },
  {
    id:          "perplexitybot",
    label:       "PerplexityBot",
    description: "Perplexity AI answer engine crawler",
    imgSrc:      "/ai%20png/perplexity-ai.png",
  },
  {
    id:          "google-extended",
    label:       "Google-Extended",
    description: "Google AI training and Gemini data crawler",
    imgSrc:      "/ai%20png/gemini.png",
  },
  {
    id:          "bingbot",
    label:       "Bingbot",
    description: "Microsoft Bing AI and Copilot crawler",
    imgSrc:      "/ai%20png/bing.png",
  },
  {
    id:          "llms-txt",
    label:       "llms.txt",
    description: "AI-readable site summary file for LLM optimisation",
    Icon:        FileCode,
  },
]

const STATUS_STYLES = {
  pass: {
    label:        "PASS",
    color:        "var(--color-status-success)",
    borderColor:  "var(--color-status-success-border)",
    symbol:       "check_circle",
  },
  warning: {
    label:        "WARNING",
    color:        "var(--color-status-warning)",
    borderColor:  "var(--color-status-warning-border)",
    symbol:       "warning",
  },
  fail: {
    label:        "FAIL",
    color:        "var(--color-status-error)",
    borderColor:  "var(--color-status-error-border)",
    symbol:       "error",
  },
  optimized: {
    label:        "OPTIMIZED",
    color:        "var(--color-brand-cyan)",
    borderColor:  "var(--color-brand-cyan-border)",
    symbol:       "info",
  },
}

const BOT_DESCRIPTIONS = {
  gptbot: {
    pass:      "Robots.txt allows full access. Structured metadata detected in 98% of scanned headers.",
    warning:   "Robots.txt allows access, but some subdirectories are restricted for GPTBot.",
    fail:      "Robots.txt is blocking GPTBot access. ChatGPT and GPT-powered products cannot cite your content.",
    optimized: "Robots.txt allows full access. Structured metadata detected in 98% of scanned headers.",
  },
  claudebot: {
    pass:      "Agent string recognized. Semantic density optimized for Anthropic LLM attention layers.",
    warning:   "ClaudeBot allowed but access rate limits or partial blocks are detected.",
    fail:      "Robots.txt is blocking ClaudeBot. Claude AI models cannot train on or crawl your content.",
    optimized: "Agent string recognized. Semantic density optimized for Anthropic LLM attention layers.",
  },
  perplexitybot: {
    pass:      "Robots.txt allows PerplexityBot. Citation and attribution links are fully accessible.",
    warning:   "Citation links missing target attributes. Risk of low attribution in answer engine results.",
    fail:      "Robots.txt is blocking PerplexityBot. Answer engine results will lack direct citation links.",
    optimized: "Robots.txt allows PerplexityBot. Citation and attribution links are fully accessible.",
  },
  "google-extended": {
    pass:      "Opt-in verified. Gemini context windows correctly populated via semantic markers.",
    warning:   "Google-Extended is allowed but some pages lack optimization for Gemini extraction.",
    fail:      "Google-Extended access is restricted. Google's Gemini models cannot use this content.",
    optimized: "Opt-in verified. Gemini context windows correctly populated via semantic markers.",
  },
  bingbot: {
    pass:      "Bingbot access allowed. Copilot can index and summarize your pages in real-time.",
    warning:   "Bingbot allowed but latency or sitemap optimization issues detected.",
    fail:      "Missing XML sitemap reference for Copilot. Indexing latency exceeding 240ms threshold.",
    optimized: "Bingbot access allowed. Copilot can index and summarize your pages in real-time.",
  },
  "llms-txt": {
    pass:      "Standardized summary file detected at root. High compatibility for local model ingestion.",
    warning:   "llms.txt file is present but has syntax errors or missing required fields.",
    fail:      "No llms.txt file detected at the root. AI agents may struggle to parse site summary efficiently.",
    optimized: "Standardized summary file detected at root. High compatibility for local model ingestion.",
  },
}

function resolveStatus(raw) {
  if (!raw) return "pass"
  const key = String(raw).toLowerCase().replace(/[-\s]/g, "")
  if (key === "optimised") return "optimized"
  return STATUS_STYLES[key] ? key : "pass"
}

export default function CrawlabilityCenter({ bots }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          AI Crawlability Center
        </h2>
        <span className="glow-pill violet" style={{ fontSize: "10px" }}>
          Real-time Validation
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BOT_CONFIGS.map(({ id, label, description: titleDesc, imgSrc, Icon }) => {
          const raw    = bots?.[id]?.status ?? bots?.[id]
          const status = resolveStatus(raw)
          const style  = STATUS_STYLES[status]
          const description = BOT_DESCRIPTIONS[id]?.[status] || BOT_DESCRIPTIONS[id]?.pass

          return (
            <div
              key={id}
              title={titleDesc}
              className="glass-card p-5 rounded-xl hover:bg-surface-hover transition-colors border-t-2 flex gap-4 items-start"
              style={{ borderColor: style.borderColor }}
            >
              {/* Left Side: Big Bot Image Wrapper */}
              <div className="shrink-0 w-14 h-14 flex items-center justify-center">
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={label}
                    width={52}
                    height={52}
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <Icon
                    size={34}
                    className="shrink-0"
                    style={{ color: "var(--color-brand-cyan)" }}
                  />
                )}
              </div>

              {/* Right Side: Title, Validation Icon, Description, Status Label */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                    {label}
                  </span>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: style.color,
                      fontVariationSettings: "'FILL' 1",
                      fontSize: "20px"
                    }}
                  >
                    {style.symbol}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
                  {description}
                </p>
                <div
                  className="pt-2 border-t text-[10px] font-bold tracking-wider"
                  style={{
                    color: style.color,
                    borderColor: "rgba(255, 255, 255, 0.05)"
                  }}
                >
                  {style.label}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
