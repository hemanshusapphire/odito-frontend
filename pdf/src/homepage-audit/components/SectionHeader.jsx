import React from 'react';
import theme from '../theme';

// Pure icon+label+divider shell. `icon` is a React node supplied by the
// caller (see components/icons.jsx) so this component can be reused across
// pages that need different glyphs (bar chart, gear, lock, ...) without
// redefining this layout each time. Page 1 passes <BarChartIcon /> — its
// rendered output is unchanged by this generalization.
// `iconBg` optionally fills the icon box with a solid color instead of the
// default plain white outline (Page 7's "Local Business Presence" header
// uses a filled indigo box) — defaults to 'transparent' with the outline
// kept, so every prior page's rendered output is unaffected.
export default function SectionHeader({ icon, label, iconBg = 'transparent' }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: iconBg === 'transparent' ? `1.5px solid ${theme.color.white}` : 'none',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <span
          style={{
            // Root cause of the icon/title misalignment: no explicit
            // lineHeight meant the label's default (asymmetric) line box
            // didn't match the icon's symmetric 32px box, so the glyph sat
            // off the shared center axis even though flex align-items:
            // center was already centering both items' boxes correctly.
            fontFamily: theme.font.display,
            fontWeight: 600,
            fontSize: 20,
            lineHeight: 1,
            letterSpacing: '0.04em',
            color: theme.color.white,
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          marginTop: 18,
          height: 1,
          background: theme.color.border,
        }}
      />
    </div>
  );
}
