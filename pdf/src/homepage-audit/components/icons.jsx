import React from 'react';
import theme from '../theme';

// Shared section-header icons — extracted here so SectionHeader stays a
// pure icon+label+divider shell, reusable across pages that need different
// glyphs (bar chart / gear / lock, etc.) without redefining the icon markup
// per page.

export function BarChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="12" width="3" height="8" fill={theme.color.white} />
      <rect x="10.5" y="8" width="3" height="12" fill={theme.color.white} />
      <rect x="17" y="4" width="3" height="16" fill={theme.color.white} />
    </svg>
  );
}

export function GearIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke={theme.color.white} strokeWidth="1.8" />
      <path
        d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.1 5.9l-1.55 1.55M7.45 16.55L5.9 18.1M18.1 18.1l-1.55-1.55M7.45 7.45L5.9 5.9"
        stroke={theme.color.white}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BrainIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 3.5a3 3 0 0 0-3 3 2.5 2.5 0 0 0-1.5 4.5A2.8 2.8 0 0 0 6 16.3V18a2.5 2.5 0 0 0 5 0V6.5A3 3 0 0 0 9 3.5Z"
        stroke={theme.color.white}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M15 3.5a3 3 0 0 1 3 3 2.5 2.5 0 0 1 1.5 4.5 2.8 2.8 0 0 1-1.5 5.3V18a2.5 2.5 0 0 1-5 0V6.5a3 3 0 0 1 2-2.83Z"
        stroke={theme.color.white}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg width="15" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="10" width="16" height="11" rx="2" stroke={theme.color.white} strokeWidth="1.8" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke={theme.color.white} strokeWidth="1.8" />
      <circle cx="12" cy="15" r="1.6" fill={theme.color.white} />
    </svg>
  );
}

export function LightningIcon() {
  return (
    <svg width="15" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
        stroke={theme.color.white}
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function LinkIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 15l6-6M8 16l-2.5 2.5a3.5 3.5 0 0 1-5-5L3 11M16 8l2.5-2.5a3.5 3.5 0 0 1 5 5L21 13"
        stroke={theme.color.white}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PinIcon({ color = theme.color.white }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.2" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

export function CheckIcon({ color = theme.color.white, size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 12.5l5 5L20 6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PhoneIcon({ color = theme.color.white }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 3h3l1.5 4.5L8 9c.8 2.4 2.6 4.2 5 5l1.5-2.5L19 13v3a2 2 0 0 1-2 2C10.4 18 6 13.6 6 7a2 2 0 0 1 0-4Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GlobeIcon({ color = theme.color.white }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.6" />
      <path d="M4 12h16M12 3.5c2.5 2.3 3.8 5.3 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.3-3.8-8.5S9.5 5.8 12 3.5Z" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

export function ShieldIcon({ color = theme.color.white }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ImageIcon({ color = theme.color.white }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth="1.6" />
      <circle cx="8.5" cy="9.5" r="1.5" stroke={color} strokeWidth="1.4" />
      <path d="M3 16l5-5 4 4 3-3 6 6" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function DocumentIcon({ color = theme.color.white }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h7l4 4v14H7z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3v4h4M9 13h6M9 17h6" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function MessageIcon({ color = theme.color.white }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M4 5h16v11H9l-5 4z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function AccessibilityIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke={theme.color.white} strokeWidth="1.6" />
      <circle cx="12" cy="8" r="1.6" fill={theme.color.white} />
      <path
        d="M12 10.5v4.5M8.5 12h7M9 19l3-4.5 3 4.5"
        stroke={theme.color.white}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
