import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  env: {
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY,
  },
}

export default nextConfig
