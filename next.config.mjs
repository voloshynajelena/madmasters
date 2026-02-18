/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/videos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Legacy EN prefix redirects
      { source: '/en', destination: '/', permanent: true },
      { source: '/en/:path*', destination: '/:path*', permanent: true },

      // Old URL structure redirects
      { source: '/web', destination: '/services/web', permanent: true },
      { source: '/marketing', destination: '/services/marketing', permanent: true },
      { source: '/programming', destination: '/services/custom', permanent: true },
      { source: '/portfolio', destination: '/work', permanent: true },
      { source: '/portfolio/portfolio-:slug.html', destination: '/work/:slug', permanent: true },
      { source: '/breef', destination: '/brief', permanent: true },
      { source: '/calc', destination: '/calculator', permanent: true },
      { source: '/contacts', destination: '/contact', permanent: true },
    ];
  },
};

export default nextConfig;
