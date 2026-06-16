const path = require('path')

module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  images: {
    remotePatterns: [],
  },
  experimental: {
    typedRoutes: true,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
}