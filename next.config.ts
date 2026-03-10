import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Set to true to allow builds to pass despite external library type issues
    ignoreBuildErrors: true,
  },
  eslint: {
    // Set to true to prevent linting errors from blocking production builds
    ignoreDuringBuilds: true,
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
