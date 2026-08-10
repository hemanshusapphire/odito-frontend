"use client"

import { Menu, LogOut } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/AuthContext"
import { useSidebarStore } from "@/components/sidebar/sidebar-store"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAdminPageHeader } from "../shared/AdminPageHeaderContext"
import { AdminBreadcrumb } from "../shared/AdminBreadcrumb"

/**
 * Lightweight System Admin header. Reuses the same generic primitives as
 * SiteHeader (Avatar, DropdownMenu, ThemeToggle, useSidebarStore mobile
 * toggle) but drops every project-scoped piece — no PDF export, no credit
 * dialog, no useProject(). The breadcrumb/title comes from
 * AdminPageHeaderContext (set by each page via AdminPagePlaceholder) — this
 * component has zero knowledge of the sidebar config or the route table, so
 * it never needs to change as new pages/nested routes are added.
 */
export function AdminHeader() {
  const { breadcrumbs } = useAdminPageHeader()
  const { user, logout } = useAuth()
  const toggleMobile = useSidebarStore((s) => s.toggleMobile)
  const isMobile = useIsMobile()

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = "/login"
    } catch (e) {
      console.error("Logout failed", e)
    }
  }

  return (
    <header className="bg-card/95 text-foreground flex h-14 shrink-0 items-center gap-2 border-b border-border/40 backdrop-blur transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-1">
          {isMobile && (
            <button
              onClick={toggleMobile}
              className="-ml-1 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />

          <AdminBreadcrumb items={[{ label: "System Admin", href: "/system-admin" }, ...breadcrumbs]} />
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="cursor-pointer outline-none">
                  <Avatar className="h-10 w-10 rounded-full hover:opacity-80 transition-opacity border border-border">
                    <AvatarFallback className="rounded-full text-sm font-semibold bg-accent/40 text-foreground">
                      {`${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 bg-popover border border-border text-popover-foreground">
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-3 px-2.5 py-2.5">
                    <Avatar className="h-11 w-11 rounded-full border border-border">
                      <AvatarFallback className="rounded-full text-base font-bold bg-accent/40 text-foreground">
                        {`${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-sm font-semibold text-foreground leading-tight truncate">
                        {`${user.firstName || ""} ${user.lastName || ""}`.trim() || "Admin"}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5 truncate">
                        {user.email || ""}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1.5" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-3 py-2.5 px-3.5 rounded-lg text-sm text-red-400 hover:text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400 cursor-pointer transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
