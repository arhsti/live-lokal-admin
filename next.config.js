/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-6e91ed575de3432089025632f8ce00c4.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
