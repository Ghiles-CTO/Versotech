import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Turbopack that the monorepo root is one level up (must be absolute)
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  // Ensure proper static file handling
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

export default nextConfig