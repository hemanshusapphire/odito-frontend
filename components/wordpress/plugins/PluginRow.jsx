"use client"

import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { Star, ArrowRight } from 'lucide-react'
import PluginStatusBadge from './PluginStatusBadge'
import PluginActions from './PluginActions'

/** One plugin row: checkbox, icon, name/description, status badges, version, favorite, actions menu. */
export default function PluginRow({ plugin, selected, onToggleSelect, onToggleFavorite, ...actionHandlers }) {
  return (
    <motion.div
      whileHover={{ backgroundColor: 'var(--muted)' }}
      className="flex items-center gap-4 px-4 py-4 border-b last:border-b-0 transition-colors"
    >
      <Checkbox checked={selected} onCheckedChange={() => onToggleSelect(plugin.id)} />

      <span
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs"
        style={{ background: `${plugin.tint}18`, color: plugin.tint }}
      >
        {plugin.initials}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">{plugin.name}</span>
          <button onClick={() => onToggleFavorite(plugin.id)} aria-label="Toggle favorite">
            <Star className={`h-3.5 w-3.5 ${plugin.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/50'}`} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{plugin.description}</p>
        <div className="mt-1.5"><PluginStatusBadge plugin={plugin} /></div>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono shrink-0 w-32 justify-end">
        <span className={plugin.hasUpdate ? 'text-muted-foreground' : 'font-semibold'}>{plugin.currentVersion}</span>
        {plugin.hasUpdate && (
          <>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-semibold text-primary">{plugin.latestVersion}</span>
          </>
        )}
      </div>

      <PluginActions plugin={plugin} {...actionHandlers} />
    </motion.div>
  )
}
