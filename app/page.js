import NewLandingPage from '@/components/new-landing';
import { PublicGuard } from "@/components/guards/AuthGuard";

// Next.js's metadataBase resolution normalizes this to a trailing-slash-free
// origin ("https://oditoai.com", not ".../") to match this app's own
// trailing-slash convention — every other route here (/about, /pricing, ...)
// also has no trailing slash, so this keeps the root consistent with the
// rest of the site rather than introducing a one-off mixed convention.
export const metadata = {
  title: "AI-Powered SEO Platform & Website Audit Tool | Odito.ai",
  description:
    "Odito.ai is an AI-powered SEO platform that audits websites, improves search visibility, and helps businesses grow through smarter SEO.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <PublicGuard>
      <NewLandingPage />
    </PublicGuard>
  );
}
