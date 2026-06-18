import { DashboardProviders } from "@/providers/dashboard-providers"
import { DashboardThemeProvider } from "@/providers/DashboardThemeProvider"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { AuthGuard } from "@/components/guards/AuthGuard"

/**
 * Shared layout for all dashboard routes.
 *
 * DashboardThemeProvider is intentionally scoped here — it manages the user's
 * light/dark preference only while they are inside the dashboard. On unmount it
 * restores the landing dark theme automatically.
 */
export default function DashboardGroupLayout({ children }) {
  return (
    <DashboardThemeProvider>
      <AuthGuard>
        <DashboardProviders>
          <DashboardLayout>
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <div className="px-4 lg:px-6">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </DashboardLayout>
        </DashboardProviders>
      </AuthGuard>
    </DashboardThemeProvider>
  )
}
