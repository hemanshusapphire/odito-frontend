import React from 'react';
import theme from '../theme';

const LEVEL_COLOR = {
  high: theme.color.red,
  medium: theme.color.amber,
  low: theme.color.green,
};

const STATUS_COLOR = {
  'not done': theme.color.red,
  partial: theme.color.amber,
  completed: theme.color.green,
};

function normalize(value) {
  return String(value || '').toLowerCase().replace(/_/g, ' ').trim();
}

export default function GeoChecklistRow({ task, priority, status, isLast }) {
  const priorityColor = LEVEL_COLOR[normalize(priority)] || theme.color.textMuted;
  const statusColor = STATUS_COLOR[normalize(status)] || theme.color.textMuted;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 160px 140px',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: isLast ? 'none' : `1px solid ${theme.color.border}`,
      }}
    >
      <span style={{ fontSize: 13.5, color: '#e2e8f0' }}>{task}</span>

      <span
        style={{
          fontFamily: theme.font.mono,
          fontSize: 12.5,
          color: priorityColor,
          textAlign: 'center',
          textTransform: 'capitalize',
        }}
      >
        {priority}
      </span>

      <span style={{ textAlign: 'right' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: 6,
            border: `1px solid ${statusColor}`,
            fontFamily: theme.font.mono,
            fontSize: 10.5,
            fontWeight: 600,
            color: statusColor,
            textTransform: 'uppercase',
          }}
        >
          {normalize(status)}
        </span>
      </span>
    </div>
  );
}
