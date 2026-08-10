"use client"

import { useProject } from "@/contexts/ProjectContext"
import RecrawlCard from "@/components/settings/RecrawlCard"
import WeeklyRecrawlCard from "@/components/settings/WeeklyRecrawlCard"
import DangerZoneCard from "@/components/settings/DangerZoneCard"
import SettingsTabs from "@/components/settings/SettingsTabs"

export default function SettingsPageContent() {
  const { activeProject } = useProject()

  return (
    <div className="space-y-6">
      <SettingsTabs />

      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">Project Settings</h1>
        <p className="text-muted-foreground">
          {activeProject?.project_name || activeProject?.name || "Manage recrawl and scheduling for this project"}
        </p>
      </div>

      {!activeProject ? (
        <div className="rounded-xl border p-8 text-center space-y-2">
          <p className="text-muted-foreground">Select a project to manage its settings.</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl">
          <RecrawlCard project={activeProject} />
          <WeeklyRecrawlCard project={activeProject} />
          <DangerZoneCard project={activeProject} />
        </div>
      )}
    </div>
  )
}
