import { Suspense } from "react"
import ChoosePlanPageContent from "./page-content"
import ChoosePlanSkeleton from "@/components/upgrade/ChoosePlanSkeleton"

export default function ChoosePlanPage() {
  return (
    <Suspense fallback={<ChoosePlanSkeleton />}>
      <ChoosePlanPageContent />
    </Suspense>
  )
}
