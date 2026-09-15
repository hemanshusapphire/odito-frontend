"use client"

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import {
  useCreateAiCampaignAutomationPolicy, useUpdateAiCampaignAutomationPolicy,
} from '@/hooks/useAiCampaign'
import {
  RULE_METRICS, ruleMetricLabel, RULE_OPERATORS, ruleOperatorLabel, AUTOMATION_OPERATIONS,
  optimizationOperationLabel, isHighRiskAutomationOperation, AUTOMATION_FREQUENCIES, automationFrequencyLabel,
  AUTOMATION_WALL_CLOCK_FREQUENCIES, AUTOMATION_DAYS_OF_WEEK, COMMON_TIMEZONES, AUTOMATION_DATE_RANGE_PRESETS,
  friendlyErrorMessage,
} from '@/lib/aiCampaignConstants'

/**
 * Phase 8 — the structured automation policy builder (spec §55-§58).
 *
 * Every field here is a plain dropdown/number/text control assembled into a
 * closed-shape payload — there is NO free-text rule expression, no JSON
 * editor, no code, no GAQL exposed anywhere in this form (spec explicit
 * requirement). `allowedOperations` is derived automatically from the
 * operations actually used across the rules, so the user never has to
 * separately manage a second "which operations are allowed" list that could
 * drift from the rules themselves.
 */

const MAX_RULES = 10

function blankRule() {
  return { operation: 'PAUSE_KEYWORD', metric: 'cost', operator: 'gte', threshold: 500, minimumClicks: 30 }
}

function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

export default function AutomationPolicyForm({ draftId, policy = null, onClose }) {
  const isEdit = !!policy
  const [name, setName] = useState(policy?.name || 'New automation policy')
  const [rules, setRules] = useState(policy?.rules?.length ? policy.rules.map((r) => ({ ...r })) : [blankRule()])
  const [highRiskOperationsEnabled, setHighRiskOperationsEnabled] = useState(policy?.highRiskOperationsEnabled || false)
  const [limits, setLimits] = useState(policy?.limits || { maxActionsPerRun: 5, cooldownHours: 24, maxBudgetChangePercent: 15 })
  const [schedule, setSchedule] = useState(policy?.schedule || { frequency: 'daily', hourOfDay: 9, dayOfWeek: 1, timezone: detectTimezone() })
  const [dateRangePreset, setDateRangePreset] = useState(policy?.dateRangePreset || '30d')
  const [formError, setFormError] = useState(null)

  const createMutation = useCreateAiCampaignAutomationPolicy(draftId)
  const updateMutation = useUpdateAiCampaignAutomationPolicy(draftId)
  const mutation = isEdit ? updateMutation : createMutation
  const usesHighRisk = rules.some((r) => isHighRiskAutomationOperation(r.operation))

  function updateRule(index, patch) {
    setRules((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }
  function addRule() {
    setRules((prev) => (prev.length >= MAX_RULES ? prev : [...prev, blankRule()]))
  }
  function removeRule(index) {
    setRules((prev) => prev.filter((_, i) => i !== index))
  }

  function validate() {
    if (!name.trim()) return 'Give this policy a name.'
    if (rules.length === 0) return 'Add at least one rule.'
    for (const r of rules) {
      if (!Number.isFinite(Number(r.threshold))) return 'Every rule needs a numeric threshold.'
      if (!Number.isFinite(Number(r.minimumClicks)) || Number(r.minimumClicks) < 5) return 'Minimum clicks must be at least 5 for every rule.'
    }
    if (!Number.isFinite(Number(limits.maxActionsPerRun)) || Number(limits.maxActionsPerRun) < 1) return 'Max actions per run must be a positive number.'
    if (!Number.isFinite(Number(limits.cooldownHours)) || Number(limits.cooldownHours) < 1) return 'Cooldown hours must be a positive number.'
    if (!Number.isFinite(Number(limits.maxBudgetChangePercent)) || Number(limits.maxBudgetChangePercent) < 1) return 'Max budget change % must be a positive number.'
    return null
  }

  function handleSubmit() {
    const error = validate()
    if (error) { setFormError(error); return }
    setFormError(null)

    const allowedOperations = [...new Set(rules.map((r) => r.operation))]
    const payload = {
      name: name.trim(),
      rules: rules.map((r) => ({
        operation: r.operation, metric: r.metric, operator: r.operator,
        threshold: Number(r.threshold), minimumClicks: Number(r.minimumClicks),
      })),
      allowedOperations,
      highRiskOperationsEnabled,
      limits: {
        maxActionsPerRun: Number(limits.maxActionsPerRun),
        cooldownHours: Number(limits.cooldownHours),
        maxBudgetChangePercent: Number(limits.maxBudgetChangePercent),
      },
      schedule,
      dateRangePreset,
    }

    const onSuccess = () => onClose?.()
    if (isEdit) updateMutation.mutate({ policyId: policy._id, patch: payload }, { onSuccess })
    else createMutation.mutate(payload, { onSuccess })
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose?.() }}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit automation policy' : 'New automation policy'}</DialogTitle>
          <DialogDescription>
            Define the conditions and the action to take. This policy is created disabled and in observe-only mode — you turn it on separately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="policy-name">Name</Label>
            <Input id="policy-name" data-testid="policy-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={150} />
          </div>

          <div className="space-y-3">
            <Label>Rules</Label>
            {rules.map((rule, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 rounded-lg border border-border/60 p-3 sm:grid-cols-6" data-testid={`rule-row-${i}`}>
                <select
                  aria-label={`Rule ${i + 1} metric`}
                  className="col-span-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm sm:col-span-1"
                  value={rule.metric}
                  onChange={(e) => updateRule(i, { metric: e.target.value })}
                >
                  {RULE_METRICS.map((m) => <option key={m} value={m}>{ruleMetricLabel(m)}</option>)}
                </select>
                <select
                  aria-label={`Rule ${i + 1} operator`}
                  className="col-span-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                  value={rule.operator}
                  onChange={(e) => updateRule(i, { operator: e.target.value })}
                >
                  {RULE_OPERATORS.map((op) => <option key={op} value={op}>{ruleOperatorLabel(op)}</option>)}
                </select>
                <Input
                  aria-label={`Rule ${i + 1} threshold`}
                  type="number"
                  className="col-span-1 h-8"
                  value={rule.threshold}
                  onChange={(e) => updateRule(i, { threshold: e.target.value })}
                />
                <select
                  aria-label={`Rule ${i + 1} action`}
                  className="col-span-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm sm:col-span-2"
                  value={rule.operation}
                  onChange={(e) => updateRule(i, { operation: e.target.value })}
                >
                  {AUTOMATION_OPERATIONS.map((op) => <option key={op} value={op}>{optimizationOperationLabel(op)}</option>)}
                </select>
                <Button
                  type="button" variant="ghost" size="icon" className="col-span-2 justify-self-end sm:col-span-1"
                  onClick={() => removeRule(i)} disabled={rules.length <= 1}
                  data-testid={`remove-rule-${i}`}
                  aria-label={`Remove rule ${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground sm:col-span-6">
                  Only when at least
                  <Input
                    aria-label={`Rule ${i + 1} minimum clicks`}
                    type="number" className="h-7 w-20"
                    value={rule.minimumClicks}
                    onChange={(e) => updateRule(i, { minimumClicks: e.target.value })}
                  />
                  clicks of data exist for this
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addRule} disabled={rules.length >= MAX_RULES} data-testid="add-rule">
              <Plus className="h-3.5 w-3.5" />
              Add rule
            </Button>
          </div>

          {usesHighRisk && (
            <div className="flex items-start justify-between gap-3 rounded-lg border border-amber-300/60 bg-amber-50/50 p-3 dark:border-amber-700/50 dark:bg-amber-950/20">
              <div>
                <p className="text-sm font-medium text-foreground">Allow high-risk actions</p>
                <p className="text-xs text-muted-foreground">Re-enabling a keyword/ad or changing budget is a higher-impact action than pausing or excluding. Required for at least one of your rules above.</p>
              </div>
              <Switch checked={highRiskOperationsEnabled} onCheckedChange={setHighRiskOperationsEnabled} data-testid="high-risk-toggle" />
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="limit-actions">Max actions / run</Label>
              <Input id="limit-actions" data-testid="limit-max-actions" type="number" value={limits.maxActionsPerRun} onChange={(e) => setLimits((l) => ({ ...l, maxActionsPerRun: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="limit-cooldown">Cooldown (hours)</Label>
              <Input id="limit-cooldown" data-testid="limit-cooldown" type="number" value={limits.cooldownHours} onChange={(e) => setLimits((l) => ({ ...l, cooldownHours: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="limit-budget">Max budget change %</Label>
              <Input id="limit-budget" data-testid="limit-budget-percent" type="number" value={limits.maxBudgetChangePercent} onChange={(e) => setLimits((l) => ({ ...l, maxBudgetChangePercent: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="schedule-frequency">Frequency</Label>
              <select id="schedule-frequency" data-testid="schedule-frequency" className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm" value={schedule.frequency} onChange={(e) => setSchedule((s) => ({ ...s, frequency: e.target.value }))}>
                {AUTOMATION_FREQUENCIES.map((f) => <option key={f} value={f}>{automationFrequencyLabel(f)}</option>)}
              </select>
            </div>
            {AUTOMATION_WALL_CLOCK_FREQUENCIES.includes(schedule.frequency) && (
              <div className="space-y-1.5">
                <Label htmlFor="schedule-hour">Hour of day</Label>
                <Input id="schedule-hour" data-testid="schedule-hour" type="number" min={0} max={23} value={schedule.hourOfDay} onChange={(e) => setSchedule((s) => ({ ...s, hourOfDay: e.target.value }))} />
              </div>
            )}
            {schedule.frequency === 'weekly' && (
              <div className="space-y-1.5">
                <Label htmlFor="schedule-day">Day of week</Label>
                <select id="schedule-day" data-testid="schedule-day" className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm" value={schedule.dayOfWeek} onChange={(e) => setSchedule((s) => ({ ...s, dayOfWeek: Number(e.target.value) }))}>
                  {AUTOMATION_DAYS_OF_WEEK.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            )}
            {AUTOMATION_WALL_CLOCK_FREQUENCIES.includes(schedule.frequency) && (
              <div className="space-y-1.5">
                <Label htmlFor="schedule-timezone">Timezone</Label>
                <select id="schedule-timezone" data-testid="schedule-timezone" className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm" value={schedule.timezone} onChange={(e) => setSchedule((s) => ({ ...s, timezone: e.target.value }))}>
                  {COMMON_TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="date-range">Performance window</Label>
              <select id="date-range" data-testid="date-range-preset" className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm" value={dateRangePreset} onChange={(e) => setDateRangePreset(e.target.value)}>
                {AUTOMATION_DATE_RANGE_PRESETS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {formError && <p className="text-xs text-destructive" data-testid="form-error">{formError}</p>}
          {mutation.isError && <p className="text-xs text-destructive">{friendlyErrorMessage(mutation.error, 'Could not save this policy.')}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onClose?.()} disabled={mutation.isPending}>Cancel</Button>
          <Button type="button" onClick={handleSubmit} disabled={mutation.isPending} data-testid="save-policy" className="gap-1.5">
            {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEdit ? 'Save changes' : 'Create policy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
