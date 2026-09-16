import ContactPageClient from "./ContactPageClient"

// This page needs client-side interactivity (form submission), which is
// incompatible with exporting `metadata`/`generateMetadata` from a Server
// Component — Next.js requires that export to live on a Server Component.
// So the interactive UI is split out into ContactPageClient, and this file
// stays a plain Server Component solely to carry the canonical/description metadata.
export const metadata = {
  description:
    "Contact Odito.ai for help with SEO audits, AI search visibility, technical SEO, accessibility, and website optimization for your business.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return <ContactPageClient />
}
