"use client"

import { SidebarSection } from "./SidebarSection"

export function SidebarNav({ sections, isCollapsed = false }) {
  return (
    <div className="flex flex-col">
      {sections.map((section) => (
        <SidebarSection
          key={section.id}
          section={section}
          isCollapsed={isCollapsed}
        />
      ))}
    </div>
  )
}
