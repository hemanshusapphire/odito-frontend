import React from 'react';
import theme from '../theme';

export default function BusinessChecklistRow({ icon, label, status, isLast }) {
  const connected = String(status).toLowerCase() === 'connected';
  const color = connected ? theme.color.green : theme.color.red;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 20px',
        border: `1px solid ${theme.color.border}`,
        borderRadius: 10,
        marginBottom: isLast ? 0 : 12,
        background: theme.color.card,
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 26,
          height: 26,
          borderRadius: 6,
          background: 'rgba(34,197,94,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </span>

      <span
        style={{
          flex: 1,
          fontSize: 15,
          color: theme.color.white,
        }}
      >
        {label}
      </span>

      <span
        style={{
          display: 'inline-block',
          padding: '3px 10px',
          borderRadius: 6,
          border: `1px solid ${color}`,
          fontSize: 11,
          fontWeight: 600,
          color,
          textTransform: 'capitalize',
        }}
      >
        {status}
      </span>
    </div>
  );
}
