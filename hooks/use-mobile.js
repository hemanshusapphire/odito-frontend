import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange);
  }, [])

  return !!isMobile
}

// The dashboard sidebar is 260px wide. At the standard 768px "mobile"
// breakpoint above it still rendered inline, leaving ~508px of content on a
// portrait tablet. The dashboard shell (ElevenSidebar + SiteHeader) therefore
// switches to the overlay drawer below this wider breakpoint instead.
// `useIsMobile` is left untouched for every other consumer.
// Keep in sync with the `lg:` (1024px) classes in ElevenSidebar.
const COMPACT_NAV_BREAKPOINT = 1024

export function useIsCompactNav() {
  const [isCompact, setIsCompact] = React.useState(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${COMPACT_NAV_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsCompact(window.innerWidth < COMPACT_NAV_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsCompact(window.innerWidth < COMPACT_NAV_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange);
  }, [])

  return !!isCompact
}
