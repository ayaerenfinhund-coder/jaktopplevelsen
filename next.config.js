/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['mapbox-gl'],
  },
}

module.exports = nextConfig
