import React from 'react';
import theme from '../theme';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Presentation-only date formatting (ISO -> "Month YYYY"). Not a data
// transform — the mapper's metadata.auditedAt stays a raw ISO string;
// formatting for display belongs here, in the renderer.
function formatAuditDate(isoString) {
  if (!isoString) return 'Unknown date';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return 'Unknown date';
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default function AuditMetaLine({ auditedAt, domain }) {
  return (
    <p
      style={{
        fontFamily: theme.font.mono,
        fontSize: 17,
        color: theme.color.textSecondary,
        margin: 0,
      }}
    >
      Audit Date: {formatAuditDate(auditedAt)} &middot; {domain || 'unknown-domain'}
    </p>
  );
}
