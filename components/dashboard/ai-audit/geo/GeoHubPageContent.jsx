"use client"

import { useRouter }              from "next/navigation"
import { useProject }             from "@/contexts/ProjectContext"
import { useGEOHub, useGEOHubIssues } from "@/hooks/useDashboardQueries"
import GeoScoreHero               from "./GeoScoreHero"
import GeoValidationCenter        from "./GeoValidationCenter"
import GeoKnowledgeGraph          from "./GeoKnowledgeGraph"
import GeoIssueDistribution       from "./GeoIssueDistribution"
import GeoOpportunitiesCenter     from "./GeoOpportunitiesCenter"
import GeoOptimizationPipeline    from "./GeoOptimizationPipeline"
import GeoSchemaCoverageSection   from "./GeoSchemaCoverageSection"

export default function GeoHubPageContent() {
  const router = useRouter()
  const { activeProject } = useProject()
  const projectId = activeProject?._id

  const { data: hubResponse,    isLoading: hubLoading    } = useGEOHub(projectId)
  const { data: issuesResponse, isLoading: issuesLoading } = useGEOHubIssues(projectId)

  const handleFix = (ruleId) => {
    router.push(`/app/geo-hub?issue=${encodeURIComponent(ruleId)}`)
  }

  if (hubLoading || issuesLoading) {
    return (
      <div className="space-y-6 skeleton-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-24 h-7 skeleton-base skeleton-shimmer rounded" />
          <div className="w-56 h-6 skeleton-base skeleton-shimmer rounded-full" />
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7 h-72 skeleton-base skeleton-shimmer rounded-xl" />
          <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-32 skeleton-base skeleton-shimmer rounded-xl" />)}
          </div>
        </div>
        <div className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 skeleton-base skeleton-shimmer rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 skeleton-base skeleton-shimmer rounded-xl" />)}
        </div>
        <div className="h-72 skeleton-base skeleton-shimmer rounded-xl" />
        <div className="h-48 skeleton-base skeleton-shimmer rounded-xl" />
      </div>
    )
  }

  const data   = hubResponse?.data
  const issues = issuesResponse?.data?.issues ?? []

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-3">
        <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
          No GEO Hub data found for this project. Run an audit to generate results.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          GEO Hub
        </h1>
        <span className="glow-pill violet">Generative Engine Optimization</span>
      </div>

      {/* Section 1 — Hero */}
      <GeoScoreHero
        geoScore={data.hero?.geo_score ?? data.geo_score}
        scoreTrend={data.score_trend ?? null}
        cards={data.hero?.cards ?? {}}
      />

      {/* Section 2 — Schema Coverage */}
      <GeoSchemaCoverageSection coverage={data.schema_coverage ?? []} />

      {/* Section 3 — Entity Validation */}
      <GeoValidationCenter signals={data.validation ?? []} />

      {/* Section 4 — KG Intelligence */}
      <GeoKnowledgeGraph cards={data.knowledge_graph_cards ?? []} />

      {/* Section 5 — Issue Distribution */}
      <GeoIssueDistribution distribution={data.issue_distribution ?? { total: 0, critical: 0, high: 0, medium: 0, low: 0 }} />

      {/* Section 6 — Entity Opportunities */}
      <GeoOpportunitiesCenter
        entityTrustScore={data.entity_trust_score}
        validatedEntities={data.validated_entities}
        missingLinks={data.missing_links}
        opportunities={data.opportunities ?? []}
        onFix={handleFix}
      />

      {/* Section 7 — Optimization Pipeline */}
      <GeoOptimizationPipeline issues={issues} onFix={handleFix} />
    </div>
  )
}
