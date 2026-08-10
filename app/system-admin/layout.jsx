import { DashboardThemeProvider } from "@/providers/DashboardThemeProvider"
import { SystemAdminGuard } from "@/components/system-admin/guards/SystemAdminGuard"
import { SystemAdminLayout } from "@/components/system-admin/layout/SystemAdminLayout"

/**
 * Root layout for the entire /system-admin route group. Completely
 * independent from app/(dashboard)/layout.jsx:
 *   - No DashboardProviders / ProjectProvider (no project context here).
 *   - No ProjectAuditGuard.
 *   - AuthProvider + QueryProvider are already available from the true
 *     root layout (app/layout.js) — nothing extra needed for those.
 *
 * DashboardThemeProvider is reused as-is (it is project-independent — just
 * a next-themes ThemeProvider with its own persisted preference key) so the
 * header's ThemeToggle works here exactly like it does in the dashboard.
 *
 * SystemAdminGuard enforces roleId === 1 before SystemAdminLayout (sidebar
 * + header shell) ever mounts, so regular users never load this UI.
 */
export default function SystemAdminRouteLayout({ children }) {
  return (
    <DashboardThemeProvider>
      <SystemAdminGuard>
        <SystemAdminLayout>{children}</SystemAdminLayout>
      </SystemAdminGuard>
    </DashboardThemeProvider>
  )
}
