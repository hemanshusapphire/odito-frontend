"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useProject } from "@/contexts/ProjectContext"
import { usePreAudit } from "@/hooks/useDashboardQueries"
import QuickAuditResult from "@/components/dashboard/QuickAuditResult"
import { Button } from "@/components/ui/button"
import { Loader2, Play } from "lucide-react"
import apiService from "@/lib/apiService"

export default function PreAuditPageContent() {
  const { activeProject } = useProject()
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)

  const { data: response, isLoading, isError } = usePreAudit(activeProject?._id)

  const preAudit = response?.data

  const handleRunFullAudit = async () => {
    if (!activeProject?._id || isStarting) return
    setIsStarting(true)
    try {
      const result = await apiService.startAudit(activeProject._id)
      if (result.success) {
        router.push(`/projects/${activeProject._id}`)
      } else {
        throw new Error(result.message || "Failed to start audit")
      }
    } catch (error) {
      console.error("Full audit start failed:", error)
      alert(error.message || "Failed to start audit. Please try again.")
      setIsStarting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 skeleton-fade-in">
        <div className="border-b pb-4">
          <div className="w-48 h-8 skeleton-base skeleton-shimmer rounded" />
          <div className="w-72 h-4 skeleton-base skeleton-shimmer rounded mt-2" />
        </div>
        <div className="rounded-xl border p-6 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border p-5 space-y-3">
                <div className="w-16 h-8 skeleton-base skeleton-shimmer rounded" />
                <div className="w-24 h-3 skeleton-base skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Pre Audit</h1>
        </div>
        <div className="rounded-xl border p-8 text-center space-y-2">
          <p className="text-muted-foreground">Something went wrong loading the pre-audit. Please refresh.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">Pre Audit</h1>
            <p className="text-muted-foreground">Homepage audit snapshot taken before the full site audit</p>
          </div>
          <Button
            onClick={handleRunFullAudit}
            disabled={isStarting || activeProject?.crawl_status === "running"}
            size="default"
            className="gap-2 rounded-full text-base"
          >
            {isStarting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Run Full Audit
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      {!preAudit?.exists ? (
        <div className="rounded-xl border p-8 text-center space-y-3">
          <p className="text-muted-foreground text-base">No pre-audit available for this project.</p>
          <p className="text-muted-foreground text-sm">
            Run a{" "}
            <a href="/" className="underline underline-offset-2">
              Homepage Audit
            </a>{" "}
            for{" "}
            <span className="font-medium text-foreground">{activeProject?.main_url}</span>{" "}
            before creating a project to generate one.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Audited on{" "}
            <span className="font-medium text-foreground">
              {new Date(preAudit.audited_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
          <QuickAuditResult data={preAudit.snapshot} />
        </div>
      )}
    </div>
  )
}
