"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Plus, Sparkles, ExternalLink, FolderOpen } from 'lucide-react'

/**
 * "Create Campaign" entry on the Google Ads dashboard (spec §4).
 *
 * Odito has no in-app manual campaign builder — the dashboard is
 * read/analytics only — so "Manual campaign" links out to Google Ads,
 * while "AI Campaign" opens the isolated Phase 3 builder. Neither touches
 * the existing dashboard code paths.
 */
export default function CreateCampaignMenu({ basePath, disabled }) {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-2" disabled={disabled} data-testid="create-campaign">
          <Plus className="h-4 w-4" />
          Create Campaign
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Create a campaign</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2" onSelect={() => router.push(`${basePath}/ai-campaigns/new`)}>
          <Sparkles className="h-4 w-4 text-primary" />
          <div className="flex flex-col">
            <span className="text-sm">AI Campaign</span>
            <span className="text-[11px] text-muted-foreground">Draft with Claude, then edit</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onSelect={() => router.push(`${basePath}/ai-campaigns`)}>
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm">Continue a draft</span>
            <span className="text-[11px] text-muted-foreground">Open a saved AI campaign draft</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2"
          onSelect={() => window.open('https://ads.google.com/aw/campaigns/new', '_blank', 'noopener,noreferrer')}
        >
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm">Manual campaign</span>
            <span className="text-[11px] text-muted-foreground">Build directly in Google Ads</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
