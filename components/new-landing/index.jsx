import Navbar from './Navbar';
import Hero from './Hero';
import TrustBar from './TrustBar';
import Features from './Features';
import Timeline from './Timeline';
import DashboardPreview from './DashboardPreview';
import Pricing from './Pricing';
import CTA from './CTA';
import Footer from './Footer';

export default function NewLandingPage() {
  return (
    <>
      <div className="grain-overlay"></div>
      <div className="min-h-screen bg-black">
        <Navbar />
        <main>
          <Hero />
          <TrustBar />
          <Features />
          <Timeline />
          <DashboardPreview />
          <Pricing />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
}
