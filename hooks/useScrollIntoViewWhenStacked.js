import { useEffect, useRef } from "react"

/**
 * Detail views lay the URL list and the Fix Assistant side by side on wide
 * content areas and stack them on narrow ones (styles/components/detail-view.css).
 * When stacked, the panel sits below the URL list, so picking a URL would
 * appear to do nothing - the recommendation renders off-screen.
 *
 * This scrolls the panel into view when `trigger` (the selected URL) changes
 * to a new value, but only while the layout is actually stacked (parent is a
 * column flex container). Side by side, nothing moves. Skipped on first
 * render so a deep-linked selection doesn't yank the page on load, and
 * honours prefers-reduced-motion.
 */
export function useScrollIntoViewWhenStacked(targetRef, trigger) {
  const previous = useRef(trigger)

  useEffect(() => {
    const changed = previous.current !== trigger
    previous.current = trigger
    if (!changed || !trigger) return

    const el = targetRef.current
    const parent = el?.parentElement
    if (!el || !parent) return
    if (getComputedStyle(parent).flexDirection !== "column") return

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  }, [trigger, targetRef])
}
