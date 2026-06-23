/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', 'jsonwebtoken', 'cloudinary'],
  },
}

module.exports = nextConfig
