/**
 * Theme boundary that pins its subtree to the dark theme, regardless of the
 * global light/dark preference (next-themes toggles the class on <html>).
 *
 * How it works (see styles/themes/locked-dark.css for the CSS half):
 *  - `dark` re-applies every `.dark` token block (ShadCN vars, --color-*,
 *    shadows) on this element, so they beat the `:root:not(.dark)` light
 *    values inherited from <html>; Tailwind `dark:` variants also match.
 *  - `theme-locked-dark` re-declares the legacy `:root` aliases (--text,
 *    --cyan, --grad1, ...). Those are computed at <html> and would otherwise
 *    be inherited as their light values.
 *
 * Static markup only (no hooks, no theme subscription): it never re-renders on
 * a theme change and renders identically on server and client, so there is no
 * hydration mismatch or flash.
 *
 * Portalled UI (Radix dropdowns, dialogs, toasts) renders on <body>, outside
 * this boundary, and follows the global theme.
 */
export function LockedDarkTheme({ children }) {
  return <div className="dark theme-locked-dark">{children}</div>
}
