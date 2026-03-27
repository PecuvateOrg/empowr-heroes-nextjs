import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
