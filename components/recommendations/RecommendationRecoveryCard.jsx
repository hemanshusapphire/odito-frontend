"use client"

import { motion } from "framer-motion"

const METRICS = [
  { key: "aiVisibility", label: "AI Visibility", color: "#00dfff" },
  { key: "semanticTrust", label: "Semantic Trust", color: "#7730ed" },
  { key: "freshness", label: "Freshness", color: "#00f5a0" },
  { key: "accessibility", label: "Accessibility", color: "#ffb703" },
]

export default function RecommendationRecoveryCard({ recovery = {}, index = 0 }) {
  const hasData = Object.values(recovery).some(v => v > 0)
  if (!hasData) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] p-4"
    >
      <div className="flex items-center gap-2 mb-3.5">
        <span className="text-xs opacity-70">🎯</span>
        <span className="text-[9.5px] font-bold text-[#4e5f7a] uppercase tracking-[0.08em]">
          Estimated Recovery
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {METRICS.map((metric, i) => {
          const value = recovery[metric.key] || 0
          if (value === 0) return null

          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: (index * 0.08) + (i * 0.06) }}
              className="rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-3"
            >
              <div className="text-[9px] font-bold text-[#4e5f7a] uppercase tracking-[0.06em] mb-1.5">
                {metric.label}
              </div>
              <div className="flex items-end gap-1.5">
                <span 
                  className="text-xl font-extrabold leading-none"
                  style={{ color: metric.color }}
                >
                  +{value}
                </span>
                <span className="text-[9px] text-[#4e5f7a] mb-0.5">pts</span>
              </div>
              {/* Mini progress bar */}
              <div className="h-[3px] rounded-full bg-[rgba(255,255,255,0.05)] mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(value, 100)}%` }}
                  transition={{ duration: 0.8, delay: (index * 0.08) + (i * 0.1) + 0.3 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: metric.color }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
