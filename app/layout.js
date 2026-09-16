import localFont from "next/font/local";

import "./globals.css";

import { AuthProvider } from "@/contexts/AuthContext";

import { QueryProvider } from "@/lib/queryClient";

import { WebVitals } from "@/lib/monitoring/web-vitals";

import { siteConfig } from "@/config/site";

import JsonLd from "@/components/seo/JsonLd";

import { getOrganizationJsonLd } from "@/lib/seo/organizationSchema";

const inter = localFont({
  src: [
    {
      path: "../public/fonts/Inter/Inter-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Inter/Inter-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Inter/Inter-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Inter/Inter-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-inter",
});

const dmSans = localFont({
  src: [
    {
      path: "../public/fonts/DM_Sans/DMSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/DM_Sans/DMSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/DM_Sans/DMSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/DM_Sans/DMSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-dm-sans",
});

export const metadata = {
  // Resolves every relative `alternates.canonical` (and relative OG/Twitter
  // image/url) set by any page or layout in the app into an absolute URL
  // against the single configured production origin — see config/site.js.
  // This is what makes `alternates: { canonical: "/about" }` on an
  // individual page render as `<link rel="canonical" href="https://oditoai.com/about" />`
  // without that page ever hardcoding the domain itself.
  metadataBase: new URL(siteConfig.url),

  title: "Odito AI - SEO Analytics Platform",

  description: "Advanced SEO analytics and auditing platform powered by AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        {/* Organization + WebSite JSON-LD, site-wide — see lib/seo/organizationSchema.js
            for the single canonical Organization entity (@id: {siteUrl}/#organization)
            every page shares. Server-rendered here so it's present in the
            initial HTML for any crawler that only fetches/parses HTML. */}
        <JsonLd data={getOrganizationJsonLd()} />
      </head>

      <body className={`${inter.variable} ${dmSans.variable} antialiased`}>
        <WebVitals />

        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
