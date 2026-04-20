import Navbar from "@/components/new-landing/Navbar"
import FeaturesHero from "@/components/features/FeaturesHero"
import FeaturesGrid from "@/components/features/FeaturesGrid"
import FeatureDeepDive from "@/components/features/FeatureDeepDive"
import DashboardShowcase from "@/components/features/DashboardShowcase"
import ComparisonSection from "@/components/features/ComparisonSection"
import UseCases from "@/components/features/UseCases"
import FinalCTA from "@/components/features/FinalCTA"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <FeaturesHero />
      <FeaturesGrid />
      <FeatureDeepDive />
      <DashboardShowcase />
      <ComparisonSection />
      <UseCases />
      <FinalCTA />
    </div>
  )
}
