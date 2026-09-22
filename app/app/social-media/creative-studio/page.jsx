"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { ApprovedContentBanner } from '@/components/social-media/ApprovedContentBanner'
import { DesignGrid } from '@/components/social-media/DesignGrid'
import { RegenerateControls } from '@/components/social-media/RegenerateControls'
import { AIChangePanel } from '@/components/social-media/AIChangePanel'
import { BrandSettingsPanel } from '@/components/social-media/BrandSettingsPanel'
import { WorkflowStepper } from '@/components/social-media/WorkflowStepper'
import { CreativeStudioActions } from '@/components/social-media/CreativeStudioActions'
import SocialMediaToastStack from '@/components/social-media/SocialMediaToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'
import {
  CREATIVE_APPROVED_CONTENT,
  CREATIVE_DESIGNS,
  CREATIVE_DESIGN_VARIANTS,
  CREATIVE_BRAND_SETTINGS,
  CREATIVE_WORKFLOW_STEPS,
} from '@/lib/socialMediaAIDummyData'

function pickVariant(brandStyle) {
  const variants = CREATIVE_DESIGN_VARIANTS[brandStyle] || []
  return variants[Math.floor(Math.random() * variants.length)] || {}
}

/**
 * Social Media AI - Creative Studio. Entirely frontend-only, same as the
 * rest of the module: every design comes from lib/socialMediaAIDummyData.js,
 * no image-generation API, no backend. Regenerating or applying an AI
 * change just swaps in another mock variant from the same brandStyle
 * "slot" - see CREATIVE_DESIGN_VARIANTS.
 */
export default function CreativeStudioPage() {
  const [designs, setDesigns] = useState(CREATIVE_DESIGNS)
  const [selectedDesignId, setSelectedDesignId] = useState(
    () => CREATIVE_DESIGNS.find((d) => d.selected)?.id ?? CREATIVE_DESIGNS[0]?.id
  )
  const [font, setFont] = useState(CREATIVE_BRAND_SETTINGS.defaultFont)
  const [format, setFormat] = useState(CREATIVE_BRAND_SETTINGS.defaultFormat)
  const [regenerating, setRegenerating] = useState(null) // null | 'all' | 'selected'
  const [designApproved, setDesignApproved] = useState(false)
  const { toasts, notify, dismiss } = useToastQueue()

  const currentStepId = designApproved ? 'schedule' : 'design-review'

  const selectedDesign = useMemo(
    () => designs.find((d) => d.id === selectedDesignId) || null,
    [designs, selectedDesignId]
  )

  function handleRegenerateAll() {
    if (regenerating) return
    setRegenerating('all')
    setTimeout(() => {
      setDesigns((prev) => prev.map((d) => ({ ...d, ...pickVariant(d.brandStyle) })))
      setRegenerating(null)
      notify('Generated 3 new design variations.', 'success')
    }, 900)
  }

  function handleRegenerateSelected() {
    if (regenerating || !selectedDesign) return
    setRegenerating('selected')
    setTimeout(() => {
      setDesigns((prev) =>
        prev.map((d) => (d.id === selectedDesignId ? { ...d, ...pickVariant(d.brandStyle) } : d))
      )
      setRegenerating(null)
      notify('Regenerated the selected design.', 'success')
    }, 900)
  }

  function handleApplyChange(instruction) {
    if (!selectedDesign) return
    setDesigns((prev) =>
      prev.map((d) => (d.id === selectedDesignId ? { ...d, ...pickVariant(d.brandStyle) } : d))
    )
    notify(`Applied: "${instruction}"`, 'success')
  }

  function handleSaveDraft() {
    notify('Draft saved.', 'default')
  }

  function handleApproveDesign() {
    setDesignApproved(true)
    notify('Design approved. Moving to Schedule.', 'success')
  }

  return (
    <div className="flex-1 space-y-6 pb-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Creative Studio</h1>
          <p className="mt-1 text-sm text-slate-500">Choose the visual that fits your brand</p>
        </div>
        <Link
          href="/app/social-media/content-approvals"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition-colors hover:bg-violet-100"
        >
          <FileText className="h-4 w-4" />
          View content details
        </Link>
      </div>

      <ApprovedContentBanner content={CREATIVE_APPROVED_CONTENT} />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Choose from 3 AI designs</h2>
            <div className="mt-4">
              <DesignGrid designs={designs} selectedDesignId={selectedDesignId} onSelect={setSelectedDesignId} />
            </div>
          </div>

          <RegenerateControls
            regenerating={regenerating}
            onRegenerateAll={handleRegenerateAll}
            onRegenerateSelected={handleRegenerateSelected}
          />

          <AIChangePanel onApply={handleApplyChange} />
        </div>

        <aside className="w-full shrink-0 lg:w-[300px]">
          <BrandSettingsPanel
            settings={CREATIVE_BRAND_SETTINGS}
            font={font}
            onFontChange={setFont}
            format={format}
            onFormatChange={setFormat}
          />
        </aside>
      </div>

      <div className="flex flex-col gap-5 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <WorkflowStepper steps={CREATIVE_WORKFLOW_STEPS} currentStepId={currentStepId} />
        </div>
        <CreativeStudioActions approved={designApproved} onSaveDraft={handleSaveDraft} onApprove={handleApproveDesign} />
      </div>

      <SocialMediaToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
