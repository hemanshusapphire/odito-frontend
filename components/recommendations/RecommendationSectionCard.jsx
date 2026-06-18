"use client"

import { motion } from "framer-motion"

export default function RecommendationSectionCard({ 
  icon, 
  label, 
  children, 
  index = 0,
  variant = "default" 
}) {
  const variants = {
    default: "bg-[rgba(255,255,255,0.025)] border-[rgba(255,255,255,0.07)]",
    accent: "bg-[rgba(119,48,237,0.05)] border-[rgba(119,48,237,0.18)]",
    success: "bg-[rgba(0,245,160,0.04)] border-[rgba(0,245,160,0.14)]",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className={`
        rounded-xl border p-4 transition-all duration-200
        hover:border-[rgba(255,255,255,0.12)]
        ${variants[variant] || variants.default}
      `}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-xs opacity-70">{icon}</span>
        <span className="text-[9.5px] font-bold text-[#4e5f7a] uppercase tracking-[0.08em]">
          {label}
        </span>
      </div>
      <div className="text-[12.5px] text-[#8494b0] leading-[1.65]">
        {children}
      </div>
    </motion.div>
  )
}
