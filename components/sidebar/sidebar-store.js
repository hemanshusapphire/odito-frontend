"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useSidebarStore = create(
  persist(
    (set, get) => ({
      isCollapsed: false,
      isMobileOpen: false,

      toggleCollapse: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
      setCollapsed: (val) => set({ isCollapsed: val }),
      
      toggleMobile: () => set((s) => ({ isMobileOpen: !s.isMobileOpen })),
      setMobileOpen: (val) => set({ isMobileOpen: val }),
      closeMobile: () => set({ isMobileOpen: false }),
    }),
    {
      name: "odito-sidebar-state",
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    }
  )
)
