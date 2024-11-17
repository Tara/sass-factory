/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add webpack configuration to resolve PostCSS issues
  webpack: (config, { isServer }) => {
    // Ensure proper resolution of PostCSS
    config.resolve.alias = {
      ...config.resolve.alias,
      'postcss': require.resolve('postcss'),
    }
    return config
  },
}

module.exports = nextConfig 