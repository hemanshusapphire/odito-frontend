"use client"

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X, Trash2 } from 'lucide-react'
import { RSA_LIMITS } from '@/lib/aiCampaignConstants'

function CharCounter({ value, max }) {
  const len = (value || '').length
  const over = len > max
  return (
    <span className={`text-[11px] tabular-nums ${over ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
      {len}/{max}
    </span>
  )
}

function AssetList({ label, variant, items, min, max, maxChars, errors, errorPrefix, onAdd, onUpdate, onRemove }) {
  const filled = (items || []).filter((a) => (a.text || '').trim()).length
  const listError = errors?.[`${errorPrefix}.${variant}`]
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
          <span className={`ml-1.5 font-mono text-[11px] ${filled < min ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground/70'}`}>
            {filled}/{max} · min {min}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={onAdd}
          disabled={(items?.length || 0) >= max}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {listError && <p className="text-[11px] text-amber-600 dark:text-amber-400">{listError}</p>}

      <ul className="space-y-1.5">
        {(items || []).map((a, i) => {
          const err = errors?.[`${errorPrefix}.${variant}[${i}]`]
          return (
            <li key={a._key} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-right text-[11px] font-mono text-muted-foreground">{i + 1}</span>
              <div className="flex-1">
                <Input
                  aria-label={`${label} ${i + 1}`}
                  value={a.text}
                  maxLength={maxChars + 20}
                  onChange={(e) => onUpdate(a._key, e.target.value)}
                  className={err ? 'border-destructive' : undefined}
                />
              </div>
              <CharCounter value={a.text} max={maxChars} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${label} ${i + 1}`}
                onClick={() => onRemove(a._key)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          )
        })}
        {(!items || items.length === 0) && (
          <li className="rounded-lg border border-dashed border-border/60 px-3 py-2 text-xs text-muted-foreground">
            No {label.toLowerCase()} yet — add at least {min}.
          </li>
        )}
      </ul>
    </div>
  )
}

/**
 * Editor for one Responsive Search Ad. Character limits mirror Google Ads'
 * RSA limits for immediate feedback; the backend strict validator remains
 * authoritative on save.
 *
 * Memoized on its `ad` prop reference — the workspace reducer preserves the
 * reference of any ad that wasn't touched.
 */
function ResponsiveSearchAdEditor({ adGroupId, ad, index, canRemove, errors, errorPrefix, dispatch }) {
  const up = (variant) => (key, value) => dispatch({ type: 'asset/update', adGroupId, adId: ad.id, variant, key, value })
  const add = (variant) => () => dispatch({ type: 'asset/add', adGroupId, adId: ad.id, variant })
  const rm = (variant) => (key) => dispatch({ type: 'asset/remove', adGroupId, adId: ad.id, variant, key })
  const setField = (field, value) => dispatch({ type: 'ad/setField', adGroupId, adId: ad.id, field, value })

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Responsive Search Ad {index + 1}</div>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => dispatch({ type: 'ad/remove', adGroupId, adId: ad.id })}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove ad
          </Button>
        )}
      </div>

      <AssetList
        label="Headlines"
        variant="headlines"
        items={ad.headlines}
        min={RSA_LIMITS.HEADLINES_MIN}
        max={RSA_LIMITS.HEADLINES_MAX}
        maxChars={RSA_LIMITS.HEADLINE_MAX_CHARS}
        errors={errors}
        errorPrefix={`${errorPrefix}.ads[${index}]`}
        onAdd={add('headlines')}
        onUpdate={up('headlines')}
        onRemove={rm('headlines')}
      />

      <AssetList
        label="Descriptions"
        variant="descriptions"
        items={ad.descriptions}
        min={RSA_LIMITS.DESCRIPTIONS_MIN}
        max={RSA_LIMITS.DESCRIPTIONS_MAX}
        maxChars={RSA_LIMITS.DESCRIPTION_MAX_CHARS}
        errors={errors}
        errorPrefix={`${errorPrefix}.ads[${index}]`}
        onAdd={add('descriptions')}
        onUpdate={up('descriptions')}
        onRemove={rm('descriptions')}
      />

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="space-y-1.5">
          <Label htmlFor={`finalUrl-${ad.id}`} className="text-xs">Final URL</Label>
          <Input
            id={`finalUrl-${ad.id}`}
            value={ad.finalUrl}
            placeholder="https://example.com/landing"
            onChange={(e) => setField('finalUrl', e.target.value)}
            className={errors?.[`${errorPrefix}.ads[${index}].finalUrl`] ? 'border-destructive' : undefined}
          />
          {errors?.[`${errorPrefix}.ads[${index}].finalUrl`] && (
            <p className="text-[11px] text-destructive">{errors[`${errorPrefix}.ads[${index}].finalUrl`]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`path1-${ad.id}`} className="text-xs">Path 1</Label>
          <Input
            id={`path1-${ad.id}`}
            value={ad.path1}
            maxLength={RSA_LIMITS.PATH_MAX_CHARS + 5}
            placeholder="services"
            onChange={(e) => setField('path1', e.target.value)}
            className="w-28"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`path2-${ad.id}`} className="text-xs">Path 2</Label>
          <Input
            id={`path2-${ad.id}`}
            value={ad.path2}
            maxLength={RSA_LIMITS.PATH_MAX_CHARS + 5}
            placeholder="nashik"
            onChange={(e) => setField('path2', e.target.value)}
            className="w-28"
          />
        </div>
      </div>
    </div>
  )
}

export default memo(ResponsiveSearchAdEditor)
