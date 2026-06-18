import { DashboardProviders } from "@/providers/dashboard-providers"
import { DashboardThemeProvider } from "@/providers/DashboardThemeProvider"

/**
 * Layout for all /processing/* routes.
 * DashboardThemeProvider is included so theme preference applies here too,
 * and dark is restored when the user navigates back to landing pages.
 */
export default function ProcessingLayout({ children }) {
  return (
    <DashboardThemeProvider>
      <DashboardProviders>
        {children}
      </DashboardProviders>
    </DashboardThemeProvider>
  )
}
