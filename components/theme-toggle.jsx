"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full border border-border/40 text-muted-foreground/60">
        <Sun className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const themes = [
    { name: "Light", value: "light", icon: Sun },
    { name: "Dark", value: "dark", icon: Moon },
    { name: "System", value: "system", icon: Monitor },
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[2] // fallback to system
  const CurrentIcon = currentTheme.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-11 w-11 rounded-full border border-border/40 text-foreground/80 hover:text-foreground hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring transition-all cursor-pointer"
        >
          <CurrentIcon className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 p-1 bg-popover border border-border shadow-md rounded-lg z-[200]">
        {themes.map(({ name, value, icon: Icon }) => {
          const isActive = theme === value
          return (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "flex items-center justify-between px-2.5 py-2 text-sm rounded-md cursor-pointer transition-colors outline-none",
                "text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent focus:text-foreground",
                isActive && "text-foreground bg-accent/60 font-medium"
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{name}</span>
              </div>
              {isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
