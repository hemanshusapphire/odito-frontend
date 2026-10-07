import TermsPageClient from "./TermsPageClient";

export const metadata = {
  title: "Terms of Service | Odito.ai — SEO Auditing & Intelligence Platform",
  description:
    "Read the Odito.ai Terms of Service. Understand our terms governing AI-powered SEO audits, crawling permissions, subscription billing, Google API integrations, and acceptable use.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service | Odito.ai",
    description:
      "Understand the terms and conditions governing the use of Odito.ai platform, audits, crawlers, and integrations.",
    url: "https://oditoai.com/terms",
    siteName: "Odito.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Odito.ai",
    description:
      "Review the rules, billing conditions, crawling guidelines, and data policies for Odito.ai.",
  },
};

export default function TermsPage() {
  return <TermsPageClient />;
}
