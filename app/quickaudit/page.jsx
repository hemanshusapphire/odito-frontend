import Navbar from "@/components/new-landing/Navbar";
import Footer from "@/components/new-landing/Footer";
import QuickAuditHero from "@/components/new-landing/QuickAuditHero";
import QuickAuditInfo from "@/components/new-landing/QuickAuditInfo";

export const metadata = {
  title: "Free Website SEO Audit & Quick Audit Tool | Odito.ai",
  description:
    "Run a free homepage audit with Odito.ai to uncover SEO, technical, accessibility, performance, and AI visibility issues on your website.",
  alternates: {
    canonical: "/quickaudit",
  },
};

export default function QuickAuditPage() {
  return (
    <>
      <Navbar />
      <QuickAuditHero />
      <QuickAuditInfo />
      <Footer />
    </>
  );
}
