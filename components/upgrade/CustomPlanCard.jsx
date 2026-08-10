"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles, Users, ShieldCheck, Infinity as InfinityIcon, Clock } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMyCustomPlanRequest } from "@/hooks/useDashboardQueries"

const HIGHLIGHTS = [
  { icon: InfinityIcon, label: "Custom Credits" },
  { icon: InfinityIcon, label: "Custom Pages" },
  { icon: Users, label: "Dedicated Support" },
  { icon: ShieldCheck, label: "Enterprise Solution" },
]

/**
 * The 4th card. Phase 4 — status-aware CTA per STEP 8:
 *   no request yet      → "Request Custom Plan" → /subscription/plans/custom
 *   status: 'pending'   → "Request Pending", disabled
 *   status: 'contacted' → "View Request" → same route (its content is
 *                          status-aware too — see page-content.jsx)
 *   status: 'closed'    → "Request Custom Plan" again (allowed)
 *
 * Uses useMyCustomPlanRequest() — the same query the custom-request page
 * itself uses — so both surfaces always agree on the current status without
 * a second, divergent fetch.
 */
export default function CustomPlanCard({ index = 0 }) {
  const router = useRouter()
  const { data: response, isLoading } = useMyCustomPlanRequest()
  const request = response?.data ?? null

  const status = request?.status ?? null
  const isPending = status === "pending"
  const isContacted = status === "contacted"

  const ctaLabel = isPending ? "Request Pending" : isContacted ? "View Request" : "Request Custom Plan"
  const ctaDisabled = isLoading || isPending

  const handleClick = () => {
    router.push("/subscription/plans/custom")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      className="relative h-full"
    >
      <Card className="flex h-full flex-col border-dashed border-border bg-gradient-to-b from-muted/40 to-transparent">
        {(isPending || isContacted) && (
          <Badge
            variant={isPending ? "warning" : "info"}
            className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1 px-3 py-1 shadow-sm"
          >
            <Clock className="size-3" />
            {isPending ? "Request Pending" : "In Progress"}
          </Badge>
        )}

        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="size-5 text-primary" />
            Build Your Own Plan
          </CardTitle>
          <CardDescription>Custom limits tailored to your organization&apos;s scale.</CardDescription>
          <div className="mt-3 text-3xl font-bold tracking-tight text-foreground">Custom</div>
        </CardHeader>

        <CardContent className="flex-1">
          <ul className="space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-foreground/90">
                <Icon className="size-4 shrink-0 text-primary" />
                {label}
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter>
          <Button className="w-full" size="lg" variant="outline" disabled={ctaDisabled} onClick={handleClick}>
            {ctaLabel}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
