"use client"

import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { Star, ArrowRight, Layout } from 'lucide-react'
import ThemeStatusBadge from './ThemeStatusBadge'
import ThemeActions from './ThemeActions'

/**
 * One theme row: checkbox, large thumbnail, name/description, badges,
 * version, actions menu. No real screenshot assets exist for mock themes,
 * so the thumbnail is a tinted gradient placeholder with a layout icon.
 */
export default function ThemeCard({ theme, selected, onToggleSelect, onToggleFavorite, onOpenDetails, ...actionHandlers }) {
  return (
    <motion.div
      whileHover={{ backgroundColor: 'var(--muted)' }}
      className="flex items-center gap-4 px-4 py-4 border-b last:border-b-0 transition-colors"
    >
      <Checkbox checked={selected} onCheckedChange={() => onToggleSelect(theme.id)} onClick={(e) => e.stopPropagation()} />

      <button
        onClick={() => onOpenDetails(theme)}
        className="w-20 h-14 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${theme.tint}33, ${theme.tint}0d)` }}
      >
        <Layout className="h-5 w-5" style={{ color: `${theme.tint}99` }} />
      </button>

      <div className="min-w-0 flex-1">
        <button onClick={() => onOpenDetails(theme)} className="flex items-center gap-2 flex-wrap text-left">
          <span className="text-sm font-semibold hover:underline">{theme.name}</span>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(theme.id) }}
            aria-label="Toggle favorite"
          >
            <Star className={`h-3.5 w-3.5 ${theme.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/50'}`} />
          </span>
        </button>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{theme.description}</p>
        <div className="mt-1.5"><ThemeStatusBadge theme={theme} /></div>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono shrink-0 w-28 justify-end">
        <span className={theme.hasUpdate ? 'text-muted-foreground' : 'font-semibold'}>{theme.currentVersion}</span>
        {theme.hasUpdate && (
          <>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-semibold text-primary">{theme.latestVersion}</span>
          </>
        )}
      </div>

      <ThemeActions theme={theme} onViewDetails={onOpenDetails} {...actionHandlers} />
    </motion.div>
  )
}
