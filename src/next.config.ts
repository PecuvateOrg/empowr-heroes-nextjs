import type { NextConfig } from 'next'

// Security headers.
//
// These are ALSO declared in ../netlify.toml, and both copies are required.
// netlify.toml `[[headers]]` only apply to files served straight off the CDN
// (favicons, badges, og-image). This site runs through the Next.js runtime
// (`publish = ".next"` + @netlify/plugin-nextjs), and runtime-rendered
// responses bypass netlify.toml entirely — so every HTML page was shipping
// with none of these until 2026-07-30. Verified: /favicon-32x32.png carried
// all of them, / and /become carried none.
//
// Values are kept identical to netlify.toml on purpose. If you change one,
// change both.
//
// Note: `payment` is deliberately absent from Permissions-Policy (i.e.
// allowed) per _config/guides/deployment.md, which lists Empowr Heroes as a
// payment-allowed site.
const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.249'],
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'empowr-cic.s3.us-east-1.amazonaws.com',
      },
    ],
  },
}

export default nextConfig
