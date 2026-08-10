import React from 'react';
import theme from '../theme';

export default function SectionLabel({ text }) {
  return (
    <span
      style={{
        fontFamily: theme.font.display,
        fontWeight: 600,
        fontSize: 13,
        letterSpacing: '0.1em',
        color: theme.color.cyan,
        textTransform: 'uppercase',
      }}
    >
      {text}
    </span>
  );
}
