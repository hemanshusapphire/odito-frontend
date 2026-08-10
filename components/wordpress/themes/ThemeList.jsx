"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { Palette } from 'lucide-react'
import ThemeCard from './ThemeCard'

/** Theme list - one ThemeCard per theme, or an empty state when filters/search leave zero results. */
export default function ThemeList({ themes, selectedIds, onToggleSelect, onToggleFavorite, onOpenDetails, ...actionHandlers }) {
  if (themes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-16">
        <Palette className="h-8 w-8 opacity-40" />
        <p className="text-sm">No themes match your filters.</p>
      </div>
    )
  }

  return (
    <div>
      <AnimatePresence initial={false}>
        {themes.map((theme) => (
          <motion.div
            key={theme.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ThemeCard
              theme={theme}
              selected={selectedIds.has(theme.id)}
              onToggleSelect={onToggleSelect}
              onToggleFavorite={onToggleFavorite}
              onOpenDetails={onOpenDetails}
              {...actionHandlers}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
