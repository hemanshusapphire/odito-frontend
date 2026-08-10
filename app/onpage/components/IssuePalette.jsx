export default function IssuePalette({ counts = {}, active, onChange }) {
  const isFiveCard = counts.high !== undefined;

  const paletteItems = isFiveCard
    ? [
        {
          id: "all",
          label: "All Issues",
          color: "#8494b0",
          count: (counts.critical || 0) + (counts.high || 0) + (counts.medium || 0) + (counts.low || 0),
        },
        { id: "critical", label: "Critical", color: "#ff3860", count: counts.critical || 0 },
        { id: "high", label: "High", color: "#ff8800", count: counts.high || 0 },
        { id: "medium", label: "Medium", color: "#ffb703", count: counts.medium || 0 },
        { id: "low", label: "Low", color: "#00dfff", count: counts.low || 0 },
      ]
    : [
        { id: "all", label: "All Issues", color: "#8494b0", count: (counts.crit || 0) + (counts.warn || 0) + (counts.low || 0) },
        { id: "crit", label: "Critical", color: "#ff3860", count: counts.crit || 0 },
        { id: "warn", label: "Medium", color: "#ffb703", count: counts.warn || 0 },
        { id: "low", label: "Low", color: "#00dfff", count: counts.low || 0 },
      ];

  return (
    <div className="palette-row">
      {paletteItems.map(item => (
        <div
          key={item.id}
          className={`pal-card${active === item.id ? " on" : ""}`}
          onClick={() => onChange(item.id)}
        >
          <div className="pal-dot" style={{ background: item.color }}></div>
          <div className="pal-count" style={{ color: item.color }}>{item.count}</div>
          <div className="pal-label">{item.label}</div>
          <div className="pal-stripe" style={{ background: item.color }}></div>
        </div>
      ))}
    </div>
  )
}
