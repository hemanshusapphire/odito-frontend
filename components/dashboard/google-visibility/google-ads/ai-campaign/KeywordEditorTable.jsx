"use client"

import { memo, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Plus, X, AlertCircle } from 'lucide-react'
import { MATCH_TYPES, MATCH_TYPE_LABELS } from '@/lib/aiCampaignConstants'

/**
 * Editable keyword list — reused for positive keywords and negative
 * keywords (`variant`). Rows keyed by the client-only `_key` so editing
 * text never remounts the input. Duplicate rows (same text + match type)
 * are flagged inline, not blocked (backend is authoritative).
 *
 * Memoized: re-renders only when its own `items` array identity changes —
 * the workspace reducer preserves the array reference for untouched ad
 * groups, so typing in ad group B never re-renders ad group A's tables.
 */
function KeywordEditorTable({ variant, items, errors, errorPrefix, onAdd, onUpdate, onRemove }) {
  const isNegative = variant === 'negativeKeywords'

  const dupKeys = useMemo(() => {
    const seen = new Map()
    const dups = new Set()
    ;(items || []).forEach((k) => {
      const norm = `${(k.text || '').trim().toLowerCase()}|${k.matchType}`
      if (!k.text?.trim()) return
      if (seen.has(norm)) dups.add(k._key)
      else seen.set(norm, k._key)
    })
    return dups
  }, [items])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {isNegative ? 'Negative keywords' : 'Keywords'}
          <span className="ml-1.5 font-mono text-[11px] text-muted-foreground/70">{items?.length || 0}</span>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onAdd} className="h-7 gap-1 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Add {isNegative ? 'negative' : 'keyword'}
        </Button>
      </div>

      {(!items || items.length === 0) ? (
        <p className="rounded-lg border border-dashed border-border/60 px-3 py-3 text-xs text-muted-foreground">
          {isNegative
            ? 'Add negative keywords to stop your ads showing for irrelevant searches.'
            : 'No keywords yet. Add the search terms you want to target.'}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((k, i) => {
            const textError = errors?.[`${errorPrefix}.${variant}[${i}].text`]
            const typeError = errors?.[`${errorPrefix}.${variant}[${i}].matchType`]
            const isDup = dupKeys.has(k._key)
            return (
              <li key={k._key} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    aria-label={`${isNegative ? 'Negative keyword' : 'Keyword'} ${i + 1}`}
                    value={k.text}
                    onChange={(e) => onUpdate(k._key, 'text', e.target.value)}
                    placeholder={isNegative ? 'e.g. free, jobs, cheap' : 'e.g. digital marketing agency'}
                    className={textError ? 'border-destructive' : undefined}
                  />
                  {textError && <p className="mt-0.5 text-[11px] text-destructive">{textError}</p>}
                  {isDup && !textError && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-3 w-3" /> Duplicate keyword
                    </p>
                  )}
                </div>
                <div className="w-[116px] shrink-0">
                  <Select value={k.matchType} onValueChange={(v) => onUpdate(k._key, 'matchType', v)}>
                    <SelectTrigger className={typeError ? 'border-destructive' : undefined} aria-label="Match type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MATCH_TYPES.map((m) => (
                        <SelectItem key={m} value={m}>{MATCH_TYPE_LABELS[m]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove keyword ${i + 1}`}
                  onClick={() => onRemove(k._key)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default memo(KeywordEditorTable)
