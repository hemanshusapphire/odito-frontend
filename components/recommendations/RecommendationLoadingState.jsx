"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const LOADING_STEPS = [
  { label: "Analyzing page structure", icon: "🔍", duration: 1200 },
  { label: "Evaluating AI visibility signals", icon: "🧠", duration: 1800 },
  { label: "Generating implementation strategy", icon: "✦", duration: 2400 },
]

export default function RecommendationLoadingState({ isLoading }) {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setActiveStep(0)
      return
    }

    let stepIndex = 0
    const timers = []

    LOADING_STEPS.forEach((step, i) => {
      const timer = setTimeout(() => {
        setActiveStep(i)
      }, step.duration * i * 0.6)
      timers.push(timer)
    })

    return () => timers.forEach(clearTimeout)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      {LOADING_STEPS.map((step, i) => (
        <motion.div
          key={step.label}
          initial={{ opacity: 0, x: -12 }}
          animate={{ 
            opacity: i <= activeStep ? 1 : 0.3,
            x: 0,
          }}
          transition={{ duration: 0.4, delay: i * 0.3 }}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300
            ${i <= activeStep 
              ? 'bg-[rgba(119,48,237,0.06)] border-[rgba(119,48,237,0.2)]' 
              : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)]'
            }
          `}
        >
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 transition-all duration-300
            ${i <= activeStep 
              ? 'bg-gradient-to-br from-[#7730ed] to-[#00dfff] shadow-[0_0_12px_rgba(119,48,237,0.3)]' 
              : 'bg-[rgba(255,255,255,0.05)]'
            }
          `}>
            {i < activeStep ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                ✓
              </motion.span>
            ) : i === activeStep ? (
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {step.icon}
              </motion.span>
            ) : (
              <span className="opacity-40">{step.icon}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className={`text-[12.5px] font-semibold transition-colors duration-300 ${
              i <= activeStep ? 'text-[var(--t)]' : 'text-[var(--t3)]'
            }`}>
              {step.label}
            </div>
            {i === activeStep && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                className="h-[2px] mt-2 rounded-full bg-gradient-to-r from-[#7730ed] to-[#00dfff]"
              />
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
