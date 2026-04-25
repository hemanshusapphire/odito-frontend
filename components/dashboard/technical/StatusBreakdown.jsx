"use client"

import { useState, useEffect } from 'react'
import { useProject } from '@/contexts/ProjectContext'

export default function StatusBreakdown({ technicalData, error }) {
  const { activeProject } = useProject()
  const [summary, setSummary] = useState({ passing: 0, warnings: 0, critical: 0 })

  // Process technical data when received from parent
  useEffect(() => {
    if (!technicalData) return

    setSummary(technicalData.summary || { passing: 0, warnings: 0, critical: 0 })
  }, [technicalData])

  if (error) {
    return (
      <div>
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>
            Status Breakdown
          </div>
          <div className="text-center text-red-500">
            {error}
          </div>
        </div>
      </div>
    )
  }

  const { passing, warnings, critical } = summary

  return (
    <div>
      <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>
          Status Breakdown
        </div>
        <div className="breakdown-row">
          <span style={{ color: "var(--green)" }}>
            ✓ Passing
          </span>
          <span className="breakdown-count" style={{ color: "var(--green)" }}>
            {passing}
          </span>
        </div>
        <div className="breakdown-row">
          <span style={{ color: "var(--amber)" }}>
            ⚠ Warnings
          </span>
          <span className="breakdown-count" style={{ color: "var(--amber)" }}>
            {warnings}
          </span>
        </div>
        <div className="breakdown-row">
          <span style={{ color: "var(--red)" }}>
            ✗ Critical
          </span>
          <span className="breakdown-count" style={{ color: "var(--red)" }}>
            {critical}
          </span>
        </div>
      </div>
      
      <div className="ai-card">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="ai-card-label">✦ ARIA Technical Insight</div>
          <span style={{ color: "var(--cyan)", fontSize: 14 }}>✦</span>
        </div>
        <div className="ai-card-text">
          {critical > 0 && (
            <>
              {critical} critical issue{critical > 1 ? 's' : ''} require{critical > 1 ? '' : 's'} immediate attention. 
            </>
          )}
          {warnings > 0 && (
            <>
              {critical > 0 && ' Additionally, '}
              {warnings} warning{warnings > 1 ? 's' : ''} need{warnings > 1 ? '' : 's'} review.
            </>
          )}
          {critical === 0 && warnings === 0 && (
            <>Great technical health! All checks are passing.</>
          )}
          {critical > 0 && (
            <>
              {" "}These fix{critical > 1 ? 'es' : ''} alone can recover an estimated{" "}
              <strong style={{ color: "var(--cyan)", cursor: "pointer" }}>
                +{critical * 3 + warnings * 1} SEO Health points.
              </strong>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
