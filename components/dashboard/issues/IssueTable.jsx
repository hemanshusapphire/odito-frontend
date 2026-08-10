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
const IssueRow = memo(function IssueRow({ iss, index, isSelected, onSelect }) {
  return (
    <tr
      onClick={() => onSelect?.(isSelected ? null : index)}
      style={{
        cursor: "pointer",
        background: isSelected ? "rgba(124,58,237,0.08)" : ""
      }}
    >
      <td style={{ fontWeight: 500, maxWidth: 220 }}>{iss.title || iss.issue_message}</td>
      <td><SevBadge sev={iss.severity} /></td>
      <td style={{ color: "var(--text2)" }}>{iss.pages_affected}</td>
      <td>
        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          color: iss.impact_percentage > 15 ? "var(--red)" : iss.impact_percentage > 8 ? "var(--amber)" : "var(--text2)"
        }}>
          +{iss.impact_percentage}%
        </span>
      </td>
      <td>
        <DifficultyPill difficulty={iss.difficulty} />
      </td>
      <td>
        <button
          className="fix-ai-btn"
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
    <table className="issue-table" style={{ width: "100%" }}>
      <thead>
        <tr>
          <th>Issue</th>
          <th>Severity</th>
          <th>Pages</th>
          <th>Impact %</th>
          <th>Difficulty</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
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
  )
}
