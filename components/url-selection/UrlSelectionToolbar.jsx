"use client";

const UrlSelectionToolbar = ({
  search,
  onSearchChange,
  pageTypeFilter,
  onPageTypeFilterChange,
  pageTypes,
  onSelectAll,
  onDeselectAllFiltered,
  onDeselectAll,
  totalDiscovered,
  totalQualified,
  totalSelected,
  selectionLimit
}) => {
  // selectionLimit is null unless this project has an explicit
  // admin-configured override — there is no platform-wide cap.
  const hasLimit = selectionLimit != null;
  const overLimit = hasLimit && totalSelected > selectionLimit;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 10 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search URLs..."
          style={{
            flex: "1 1 240px",
            padding: "9px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
            color: "var(--text)",
            fontSize: 13.5
          }}
        />

        <select
          value={pageTypeFilter}
          onChange={(e) => onPageTypeFilterChange(e.target.value)}
          style={{
            padding: "9px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
            color: "var(--text)",
            fontSize: 13.5
          }}
        >
          {pageTypes.map(t => (
            <option key={t} value={t}>{t === 'all' ? 'All page types' : t}</option>
          ))}
        </select>

        <button onClick={onSelectAll} style={btnStyle()}>Select All</button>
        <button onClick={onDeselectAllFiltered} style={btnStyle()}>Deselect Filtered</button>
        <button onClick={onDeselectAll} style={btnStyle()}>Deselect All</button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--text3)" }}>
        <span>Total discovered: {totalDiscovered}</span>
        <span style={{ color: overLimit ? "var(--destructive)" : "var(--text3)", fontWeight: overLimit ? 600 : 400 }}>
          {hasLimit
            ? `Selected: ${totalSelected} / ${selectionLimit} max`
            : `Selected: ${totalSelected} / ${totalQualified} Total Qualified`}
        </span>
      </div>
    </div>
  );
};

const btnStyle = () => ({
  padding: "9px 14px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--text)",
  fontSize: 12.5,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap"
});

export default UrlSelectionToolbar;
