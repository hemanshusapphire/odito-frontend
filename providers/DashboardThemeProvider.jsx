"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";

/**
 * Restores the landing dark theme when the user navigates away from the dashboard.
 * Runs as a cleanup effect so the transition is synchronous with React's commit phase —
 * no visible flash between dashboard and landing pages.
 */
function DarkRestorer() {
  useEffect(() => {
    return () => {
      document.documentElement.classList.add("dark");
    };
  }, []);
  return null;
}

/**
 * Isolated ThemeProvider for dashboard routes only.
 *
 * - Uses storageKey "dashboard-theme" so it never touches the landing theme.
 * - Defaults to dark; respects user's stored dashboard preference.
 * - On unmount (leaving dashboard), DarkRestorer adds "dark" back to <html>
 *   so landing pages are always restored to their intended dark appearance.
 */
export function DashboardThemeProvider({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      storageKey="dashboard-theme"
      disableTransitionOnChange
    >
      <DarkRestorer />
      {children}
    </ThemeProvider>
  );
}
