"use client"

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2 } from 'lucide-react'
import KeywordEditorTable from './KeywordEditorTable'
import ResponsiveSearchAdEditor from './ResponsiveSearchAdEditor'
import { adGroupSummary } from '@/lib/aiCampaignConstants'

/**
 * Editor for a single ad group — name, keywords, negative keywords, ads.
 *
 * Isolation (spec §24 / §25): memoized so editing another ad group never
 * re-renders this one. The custom comparator ignores the `errors` object's
 * identity (validateWorkspace returns a fresh object on every keystroke)
 * and instead compares this group's error subset by `errorsHash`, so a
 * validation change elsewhere doesn't cascade here.
 */
function AdGroupEditorImpl({ adGroup, adGroupIndex, errors, defaultFinalUrl, dispatch }) {
  const errorPrefix = `adGroups[${adGroupIndex}]`
  const nameError = errors?.[`${errorPrefix}.name`]

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5 space-y-5" data-testid={`ad-group-${adGroupIndex}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-[220px] space-y-1.5">
          <Label htmlFor={`ag-name-${adGroup.id}`} className="text-xs">Ad group name</Label>
          <Input
            id={`ag-name-${adGroup.id}`}
            value={adGroup.name}
            onChange={(e) => dispatch({ type: 'adGroup/rename', id: adGroup.id, name: e.target.value })}
            className={nameError ? 'border-destructive' : undefined}
          />
          {nameError && <p className="text-[11px] text-destructive">{nameError}</p>}
          <p className="text-[11px] text-muted-foreground">{adGroupSummary(adGroup)}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-muted-foreground hover:text-destructive"
          onClick={() => dispatch({ type: 'adGroup/remove', id: adGroup.id })}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove ad group
        </Button>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-2">
        <KeywordEditorTable
          variant="keywords"
          items={adGroup.keywords}
          errors={errors}
          errorPrefix={errorPrefix}
          onAdd={() => dispatch({ type: 'keyword/add', adGroupId: adGroup.id, variant: 'keywords' })}
          onUpdate={(key, field, value) => dispatch({ type: 'keyword/update', adGroupId: adGroup.id, variant: 'keywords', key, field, value })}
          onRemove={(key) => dispatch({ type: 'keyword/remove', adGroupId: adGroup.id, variant: 'keywords', key })}
        />
        <KeywordEditorTable
          variant="negativeKeywords"
          items={adGroup.negativeKeywords}
          errors={errors}
          errorPrefix={errorPrefix}
          onAdd={() => dispatch({ type: 'keyword/add', adGroupId: adGroup.id, variant: 'negativeKeywords' })}
          onUpdate={(key, field, value) => dispatch({ type: 'keyword/update', adGroupId: adGroup.id, variant: 'negativeKeywords', key, field, value })}
          onRemove={(key) => dispatch({ type: 'keyword/remove', adGroupId: adGroup.id, variant: 'negativeKeywords', key })}
        />
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ads <span className="ml-1.5 font-mono text-[11px] text-muted-foreground/70">{adGroup.ads?.length || 0}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => dispatch({ type: 'ad/add', adGroupId: adGroup.id, finalUrl: defaultFinalUrl })}
          >
            <Plus className="h-3.5 w-3.5" />
            Add ad
          </Button>
        </div>
        {errors?.[`${errorPrefix}.ads`] && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400">{errors[`${errorPrefix}.ads`]}</p>
        )}
        <div className="space-y-3">
          {(adGroup.ads || []).map((ad, ai) => (
            <ResponsiveSearchAdEditor
              key={ad.id}
              adGroupId={adGroup.id}
              ad={ad}
              index={ai}
              canRemove={(adGroup.ads?.length || 0) > 1}
              errors={errors}
              errorPrefix={errorPrefix}
              dispatch={dispatch}
            />
          ))}
          {(!adGroup.ads || adGroup.ads.length === 0) && (
            <p className="rounded-lg border border-dashed border-border/60 px-3 py-3 text-xs text-muted-foreground">
              No ads in this ad group yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function areEqual(prev, next) {
  return (
    prev.adGroup === next.adGroup &&
    prev.adGroupIndex === next.adGroupIndex &&
    prev.defaultFinalUrl === next.defaultFinalUrl &&
    prev.dispatch === next.dispatch &&
    prev.errorsHash === next.errorsHash
  )
}

export default memo(AdGroupEditorImpl, areEqual)
