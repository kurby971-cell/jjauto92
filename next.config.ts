import type { NextConfig } from "next";

// Interrupteur d'indexation Google : le site reste en noindex tant que
// SITE_INDEXABLE n'est pas explicitement "true" (variable Netlify, puis redéploiement).
const INDEXABLE = process.env.SITE_INDEXABLE === 'true'

const nextConfig: NextConfig = {
  async headers() {
    if (INDEXABLE) return []
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet, noimageindex' },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        // Supabase Storage
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
