import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/courses',
        destination: '/cursos',
        permanent: true,
      },
      {
        source: '/services',
        destination: '/servicios',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
