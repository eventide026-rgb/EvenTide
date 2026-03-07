
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // ENABLE type checking during builds for production stability
    ignoreBuildErrors: false,
  },
  eslint: {
    // ENABLE linting during builds to enforce code quality
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // allowedDevOrigins is now a top-level experimental feature, not nested.
  },
  allowedDevOrigins: ["https://*.cloudworkstations.dev"],
};

export default nextConfig;
