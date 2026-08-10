import React from 'react';
import theme from '../theme';

// Icon + label + trailing divider, all in one row (structurally distinct
// from Page 1's SectionHeader, which stacks a separate full-width divider
// below the icon+label row).
//
// Every sizing rule is made explicit here (width, nowrap, flexShrink,
// minWidth) rather than relying on browser flex defaults — html2canvas's
// synthetic iframe rendering has, elsewhere on this page, resolved implicit
// flex defaults differently than a normal browser, so this row is
// defensively pinned to guarantee a single line regardless.
export default function InlineSectionHeader({ label }) {
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          border: `2px solid ${theme.color.white}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: theme.color.white,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 25,
          lineHeight: 1,
          color: theme.color.white,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: '1 1 auto',
          minWidth: 0,
          height: 1,
          background: theme.color.border,
        }}
      />
    </div>
  );
}
