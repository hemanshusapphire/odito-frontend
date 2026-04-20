import Navbar from "@/components/new-landing/Navbar"
import AboutHero from "@/components/about/AboutHero"
import AboutStory from "@/components/about/AboutStory"
import AboutStats from "@/components/about/AboutStats"
import AboutMission from "@/components/about/AboutMission"
import AboutTeam from "@/components/about/AboutTeam"
import AboutCTA from "@/components/about/AboutCTA"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <AboutHero />
      <AboutStory />
      <AboutStats />
      <AboutMission />
      <AboutTeam />
      <AboutCTA />
    </div>
  )
}
