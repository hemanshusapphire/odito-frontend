"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { useProject } from "@/contexts/ProjectContext"
import { useUpdateScrapeFrequency } from "@/hooks/useDashboardQueries"

/**
 * Weekly Recrawl card — toggles scrape_frequency ('manual' | 'weekly') on
 * the existing SeoProject document via the existing project update
 * endpoint. The Weekly Recrawl scheduler and credit policy already run
 * server-side (Project Trash & Restore's sibling Weekly Recrawl work) — this
 * card only reflects and edits the stored preference, unchanged.
 */
export default function WeeklyRecrawlCard({ project }) {
  const { refreshProjects } = useProject()
  const [isWeekly, setIsWeekly] = useState(project?.scrape_frequency === "weekly")
  const mutation = useUpdateScrapeFrequency(project?._id)

  // Keep local toggle in sync if the active project changes.
  useEffect(() => {
    setIsWeekly(project?.scrape_frequency === "weekly")
  }, [project?._id, project?.scrape_frequency])

  const handleToggle = async (checked) => {
    const previous = isWeekly
    setIsWeekly(checked) // optimistic
    try {
      await mutation.mutateAsync(checked ? "weekly" : "manual")
      await refreshProjects()
    } catch (error) {
      console.error("Failed to update weekly recrawl setting:", error)
      setIsWeekly(previous) // rollback
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Weekly Recrawl</CardTitle>
            <Badge variant={isWeekly ? "success" : "secondary"}>
              {isWeekly ? "ON" : "OFF"}
            </Badge>
          </div>
          <CardDescription>
            When enabled, ODITO automatically performs a project recrawl every 7 days.
          </CardDescription>
        </div>
        <Switch
          checked={isWeekly}
          onCheckedChange={handleToggle}
          disabled={mutation.isPending || !project?._id}
          aria-label="Toggle weekly recrawl"
        />
      </CardHeader>

      {mutation.isError && (
        <CardContent>
          <p className="text-sm text-destructive">Failed to save. Please try again.</p>
        </CardContent>
      )}
    </Card>
  )
}
