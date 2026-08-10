import React from 'react';
import theme from '../theme';
import GeoChecklistRow from './GeoChecklistRow';

export default function GeoChecklistTable({ rows }) {
  const items = rows || [];

  return (
    <div
      style={{
        border: `1px solid ${theme.color.border}`,
        borderRadius: 11,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 160px 140px',
          alignItems: 'center',
          padding: '14px 20px',
          background: 'rgba(180,120,40,0.18)',
        }}
      >
        <span
          style={{
            fontFamily: theme.font.display,
            fontWeight: 600,
            fontSize: 12,
            letterSpacing: '0.06em',
            color: theme.color.white,
            textTransform: 'uppercase',
          }}
        >
          Task
        </span>
        <span
          style={{
            fontFamily: theme.font.display,
            fontWeight: 600,
            fontSize: 12,
            letterSpacing: '0.06em',
            color: theme.color.white,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Priority
        </span>
        <span
          style={{
            fontFamily: theme.font.display,
            fontWeight: 600,
            fontSize: 12,
            letterSpacing: '0.06em',
            color: theme.color.white,
            textTransform: 'uppercase',
            textAlign: 'right',
          }}
        >
          Status
        </span>
      </div>

      {items.map((row, idx) => (
        <GeoChecklistRow
          key={row.id || row.task || idx}
          task={row.task}
          priority={row.priority}
          status={row.status}
          isLast={idx === items.length - 1}
        />
      ))}
    </div>
  );
}
