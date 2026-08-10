// Homepage Audit PDF — dark-theme design tokens.
//
// Deliberately NOT reusing frontend/pdf/src/components/layout (that's the
// Full Audit's light theme). Values marked "confirmed" are copied verbatim
// from the live Homepage Audit dashboard (frontend/components/dashboard/
// quick-audit/*.jsx) — same product, same dark theme, real production hex
// values. Values marked "estimated" are visual approximations from the
// approved Figma screenshot (no Figma-file/color-picker access) and should
// be re-checked against the real design file before final sign-off.

const theme = {
  page: {
    width: 794, // A4 @ 96dpi
    height: 1123,
    marginX: 52,
    marginTop: 56,
  },
  color: {
    background: '#0a0a0f', // confirmed — dashboard page background
    card: '#111827', // confirmed — dashboard card background
    border: '#263244', // confirmed — dashboard card border
    white: '#ffffff',
    textSecondary: '#94a3b8', // slate-400, confirmed family used throughout dashboard
    textMuted: '#64748b', // slate-500
    orange: '#f97316', // estimated — matches dashboard's Performance/orange accent family
    red: '#ef4444', // confirmed — dashboard critical color
    amber: '#f59e0b', // confirmed — dashboard warning color
    green: '#22c55e', // confirmed — dashboard passed/optimized color
    cyan: '#22d3ee', // estimated — badge/title accent
    purple: '#a855f7', // estimated — Page 2 AI Visibility accent
  },
  font: {
    display: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Courier New', monospace",
  },
};

export default theme;
