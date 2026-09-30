import { DashboardProviders } from "@/providers/dashboard-providers"
import { DashboardThemeProvider } from "@/providers/DashboardThemeProvider"
import { LockedDarkTheme } from "@/components/shared/LockedDarkTheme"

// A transient, per-project onboarding-scan status screen tied to one
// specific project — never meaningful as a public search result.
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Layout for all /processing/* routes.
 * DashboardThemeProvider stays so the global theme preference keeps working
 * for the rest of the app (and dark is restored for landing pages on leave),
 * but the screen itself is wrapped in LockedDarkTheme: Processing is always
 * dark, whatever the global theme is. The boundary sits at layout level so it
 * also covers the page-level loading/redirect states, not just ProcessingScreen.
 */
export default function ProcessingLayout({ children }) {
  return (
    <DashboardThemeProvider>
      <DashboardProviders>
        <LockedDarkTheme>{children}</LockedDarkTheme>
      </DashboardProviders>
    </DashboardThemeProvider>
  )
}
