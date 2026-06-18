import localFont from "next/font/local";

import "./globals.css";

import { AuthProvider } from "@/contexts/AuthContext";

import GlobalPaymentModal from "@/components/modals/GlobalPaymentModal";

import { QueryProvider } from "@/lib/queryClient";

import { WebVitals } from "@/lib/monitoring/web-vitals";

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
      </head>

      <body className={`${inter.variable} ${dmSans.variable} antialiased`}>
        <WebVitals />

        <QueryProvider>
          <AuthProvider>
            {children}
            <GlobalPaymentModal />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
