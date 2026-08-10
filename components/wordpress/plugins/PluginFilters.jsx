"use client"

import { motion } from 'framer-motion'

const CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'updates', label: 'Updates Available' },
  { key: 'favorites', label: 'Favorites' },
]

/** Filter chip row - All / Active / Inactive / Updates Available / Favorites, each with a live count. */
export default function PluginFilters({ active, onChange, counts }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CHIPS.map((chip) => {
        const isActive = active === chip.key
        return (
          <motion.button
            key={chip.key}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(chip.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            {chip.label}
            <span className={`text-[10px] rounded-full px-1.5 ${isActive ? 'bg-primary-foreground/20' : 'bg-foreground/10'}`}>
              {counts[chip.key] ?? 0}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
