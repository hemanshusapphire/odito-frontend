"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { Puzzle } from 'lucide-react'
import PluginRow from './PluginRow'

/** Plugin list - one PluginRow per plugin, or an empty state when filters/search leave zero results. */
export default function PluginTable({ plugins, selectedIds, onToggleSelect, onToggleFavorite, ...actionHandlers }) {
  if (plugins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-16">
        <Puzzle className="h-8 w-8 opacity-40" />
        <p className="text-sm">No plugins match your filters.</p>
      </div>
    )
  }

  return (
    <div>
      <AnimatePresence initial={false}>
        {plugins.map((plugin) => (
          <motion.div
            key={plugin.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <PluginRow
              plugin={plugin}
              selected={selectedIds.has(plugin.id)}
              onToggleSelect={onToggleSelect}
              onToggleFavorite={onToggleFavorite}
              {...actionHandlers}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
