/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'picsum.photos', // Development domain
 //     'your-production-domain.com', // Replace with your actual production domain
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows any subdomain
        port: '',
        pathname: '/**', // Allows any path
      },
    ],
  },
}

module.exports = nextConfig

