const path = require('path')

module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  images: {
    remotePatterns: [],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
}