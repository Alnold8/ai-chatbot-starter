/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';
const nextConfig = {
  output: 'export',
  // When developing locally, proxy any /api/* requests to the EdgeOne functions
  // running at http://localhost:8088 (edgeone pages dev). This lets you run
  // `npm run dev` (Next) and `edgeone pages dev` (functions) in parallel and
  // keep relative fetch('/api/...') calls working.
  async rewrites() {
    if (isDev) {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8088/api/:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;