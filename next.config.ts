import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper handling of API routes with Sharp
  serverExternalPackages: ['sharp'],
};

export default nextConfig;
