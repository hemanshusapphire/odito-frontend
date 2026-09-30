import { memo } from "react"
import ProgressBar from "@/components/ui/ProgressBar"

function SevBadge({ sev }) {
  const dot = sev === "high" ? "● "
    : sev === "medium" ? "◆ "
    : sev === "low" ? "▸ "
    : sev === "info" ? "▸ " : ""
  return (
    <span className={`sev-badge ${sev}`}>
      {dot}{sev ? sev.toUpperCase() : ''}
    </span>
  )
}

function DifficultyPill({ difficulty }) {
  const d = (difficulty || "medium").toLowerCase()

  // Use same dots and CSS class as severity badges
  const dot = d === "hard" ? "● "
    : d === "medium" ? "◆ " : "▸ "

  return (
    <span className={`sev-badge ${d === "hard" ? "high" : d === "medium" ? "medium" : "low"}`}>
      {dot}{d.charAt(0).toUpperCase() + d.slice(1)}
    </span>
  )
}

// Memoized row: only re-renders when its own issue/selection/handler change,
// so updating one selected row doesn't re-render the entire issue list.
//
// Cells carry `data-label` + an `it-*` class: on narrow containers the table
// reflows into stacked cards (see .issue-table in styles/components/tables.css)
// and the label is repeated per cell via CSS. ARIA roles are set explicitly
// because switching table parts to display:block/grid drops their native
// table semantics in some browsers.
const IssueRow = memo(function IssueRow({ iss, index, isSelected, onSelect }) {
  return (
    <tr
      role="row"
      onClick={() => onSelect?.(isSelected ? null : index)}
      style={{
        cursor: "pointer",
        background: isSelected ? "rgba(124,58,237,0.08)" : ""
      }}
    >
      <td role="cell" className="it-title" data-label="Issue" style={{ fontWeight: 500 }}>{iss.title || iss.issue_message}</td>
      <td role="cell" data-label="Severity"><SevBadge sev={iss.severity} /></td>
      <td role="cell" data-label="Pages" style={{ color: "var(--text2)" }}>{iss.pages_affected}</td>
      <td role="cell" data-label="Impact">
        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          color: iss.impact_percentage > 15 ? "var(--red)" : iss.impact_percentage > 8 ? "var(--amber)" : "var(--text2)"
        }}>
          +{iss.impact_percentage}%
        </span>
      </td>
      <td role="cell" data-label="Difficulty">
        <DifficultyPill difficulty={iss.difficulty} />
      </td>
      <td role="cell" className="it-action" data-label="Action">
        <button
          className="fix-ai-btn tap-target"
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.(index)
          }}
        >
          ✦ Fix with AI
        </button>
      </td>
    </tr>
  )
})

export default function IssueTable({ issues = [], selected, onSelect }) {
  if (issues.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No issues to display.</p>
  }

  return (
    <div className="issue-table-wrap">
      <table className="issue-table" role="table" style={{ width: "100%" }}>
        <thead role="rowgroup">
          <tr role="row">
            <th role="columnheader">Issue</th>
            <th role="columnheader">Severity</th>
            <th role="columnheader">Pages</th>
            <th role="columnheader">Impact %</th>
            <th role="columnheader">Difficulty</th>
            <th role="columnheader">Action</th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {issues.map((iss, i) => (
            <IssueRow
              key={`${iss.issue_code || 'issue'}-${i}`}
              iss={iss}
              index={i}
              isSelected={selected === i}
              onSelect={onSelect}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
