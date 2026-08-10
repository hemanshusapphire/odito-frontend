import React from 'react';
import theme from '../theme';

// Page 2's brand header: text wordmark + full-width divider, no logo icon
// (visually distinct from Page 1's BrandHeader). No props — fixed template
// text.
export default function BrandNameHeader() {
  return (
    <div>
      <span
        style={{
          fontFamily: theme.font.display,
          fontWeight: 500,
          fontSize: 34,
          color: theme.color.white,
        }}
      >
        Brand Name
      </span>
      <div
        style={{
          marginTop: 18,
          height: 2,
          background: theme.color.white,
        }}
      />
    </div>
  );
}
