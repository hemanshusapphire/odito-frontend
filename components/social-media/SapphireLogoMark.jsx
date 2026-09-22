/**
 * Two-tone "gem" mark for Sapphire Digital Agency - the mock client
 * workspace's brand identity. Colors are props (not hardcoded) so the
 * Brand Kit preview can react live to Primary/Accent color edits.
 */
export function SapphireLogoMark({ primary = '#0F2D6B', accent = '#7C3AED', size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="4" y="14" width="16" height="16" rx="4" transform="rotate(-45 12 22)" fill={accent} />
      <rect x="18" y="8" width="16" height="16" rx="4" transform="rotate(-45 26 16)" fill={primary} />
    </svg>
  )
}

export default SapphireLogoMark
