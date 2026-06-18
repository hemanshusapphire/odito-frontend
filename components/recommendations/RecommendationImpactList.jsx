"use client"

import { motion } from "framer-motion"

export default function RecommendationImpactList({ impacts = [], index = 0 }) {
  if (!impacts.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs opacity-70">📈</span>
        <span className="text-[9.5px] font-bold text-[#4e5f7a] uppercase tracking-[0.08em]">
          Expected Impact
        </span>
      </div>
      <div className="space-y-2">
        {impacts.map((impact, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: (index * 0.08) + (i * 0.06) }}
            className="flex items-start gap-2.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] mt-[7px] flex-shrink-0" />
            <span className="text-[12px] text-[#8494b0] leading-[1.6]">
              {impact}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
