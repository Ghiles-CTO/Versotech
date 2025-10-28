/** @type {import('next').NextConfig} */
const nextConfig = {
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