/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Keep server-only packages out of the client/edge bundle.
  //    These are used exclusively in API routes / server utilities.
  serverExternalPackages: ['puppeteer', 'pdfkit', 'stripe'],

  // 2. Security headers applied to every response.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // 3. Image optimization defaults.
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // 4. Gzip/brotli compression for responses.
  compress: true,

  // 5. Drop the `X-Powered-By: Next.js` fingerprint.
  poweredByHeader: false,

  // 6. Strict mode surfaces effect/lifecycle bugs in development.
  reactStrictMode: true,

  // 6a. next-auth's parseUrl() does `new URL(process.env.NEXTAUTH_URL ?? defaultUrl)`
  //     at module-load time (node_modules/next-auth/utils/parse-url.js) - `??`
  //     only guards null/undefined, not an empty string. If NEXTAUTH_URL (or
  //     NEXTAUTH_URL_INTERNAL/VERCEL_URL) is defined-but-empty on a build host,
  //     `new URL("")` throws "Invalid URL" and aborts `next build` the moment
  //     SessionProvider (AuthContext.jsx, wraps the whole app in layout.js) is
  //     pulled into any statically-prerendered route. This inlines a guaranteed
  //     non-empty fallback so the build can never crash on host env hygiene,
  //     independent of whatever that host's actual NEXTAUTH_URL is set to.
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://odito.ai',
    NEXTAUTH_URL_INTERNAL: process.env.NEXTAUTH_URL_INTERNAL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://odito.ai',
  },

  // 7. Disable Next.js 15 ISR/Static dev indicator (lightning bolt icon in dev mode).
  devIndicators: {
    appIsrStatus: false,
  },

  // 8. Temporary redirects for the /app prefix migration — every authenticated
  //    route moved from its old unprefixed path to /app/<same path>. Not
  //    `permanent` (308) on purpose: these are meant to be removable later
  //    once no old bookmarks/emails/cached links are left pointing at the
  //    pre-migration paths. `:path*` also carries any nested sub-route
  //    (e.g. /dashboard/issues, /settings/subscription,
  //    /google-visibility/business-profile) and preserves query strings
  //    (e.g. ?issue=..., ?success=true) automatically.
  async redirects() {
    const migratedRoutes = [
      'dashboard',
      'onpage',
      'accessibility',
      'technicalchecks',
      'pagespeed',
      'keywords',
      'google-visibility',
      'aiso',
      'aeo-hub',
      'geo-hub',
      'ai-video',
      'history-logs',
      'analytics',
      'comparison',
      'settings',
      'pre-audit',
      'deleted-projects',
    ]

    return migratedRoutes.map((route) => ({
      source: `/${route}/:path*`,
      destination: `/app/${route}/:path*`,
      permanent: false,
    }))
  },
}

export default nextConfig
