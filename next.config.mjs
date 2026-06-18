/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Keep server-only packages out of the client/edge bundle.
  //    These are used exclusively in API routes / server utilities.
  serverExternalPackages: ['puppeteer', 'pdfkit', 'stripe', 'handlebars'],

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
}

export default nextConfig
