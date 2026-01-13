import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper handling of API routes with Sharp
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
};

export default nextConfig;
