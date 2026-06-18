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
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Dark Overlay */}
      <div className="absolute inset-0 dark-overlay -z-10"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-pattern -z-10 opacity-50"></div>

      {/* Decorative Background Elements - Cyan/Purple Theme */}
      <div className="absolute inset-0 -z-10 opacity-15">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] bg-cyan-500/10"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] bg-purple-500/10"></div>
      </div>

      {/* Bottom Decorative Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent -z-10"></div>
      
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
