"use client"

import { Plus, Minus, ArrowRight } from 'lucide-react'

const KIND_CONFIG = {
  add: { Icon: Plus, label: 'Add', badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  remove: { Icon: Minus, label: 'Remove', badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  replace: { Icon: ArrowRight, label: 'Change', badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
}

/**
 * One line of the diff review (spec §20). Never renders raw HTML — every
 * value here is plain text produced by lib/aiCampaignProposal.js from
 * already-validated backend data. Semantics are conveyed by icon + label,
 * not colour alone (spec §20 "do not rely only on color").
 */
export default function ChangeDiffItem({ change }) {
  const { Icon, label, badgeClass } = KIND_CONFIG[change.kind] || KIND_CONFIG.replace

  return (
    <li className="rounded-lg border border-border/60 bg-card/50 p-3">
      <div className="flex items-start gap-2.5">
        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${badgeClass}`}>
          <Icon className="h-3 w-3" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-baseline gap-x-1.5 text-sm">
            <span className="font-medium text-foreground">{label}</span>
            <span className="text-muted-foreground">{change.fieldLabel}</span>
          </div>

          {change.kind === 'replace' && (
            <div className="space-y-1 text-xs">
              {change.before && (
                <div className="rounded border border-red-200/60 bg-red-50/60 px-2 py-1 text-red-700 line-through decoration-red-400/60 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                  {change.before}
                </div>
              )}
              {change.after && (
                <div className="rounded border border-emerald-200/60 bg-emerald-50/60 px-2 py-1 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                  {change.after}
                </div>
              )}
            </div>
          )}

          {change.kind === 'add' && change.after && (
            <div className="rounded border border-emerald-200/60 bg-emerald-50/60 px-2 py-1 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
              {change.after}
            </div>
          )}

          {change.kind === 'remove' && change.before && (
            <div className="rounded border border-red-200/60 bg-red-50/60 px-2 py-1 text-xs text-red-700 line-through decoration-red-400/60 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              {change.before}
            </div>
          )}

          {change.reason && <p className="text-[11px] text-muted-foreground">{change.reason}</p>}
        </div>
      </div>
    </li>
  )
}
