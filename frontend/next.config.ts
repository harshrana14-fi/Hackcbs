import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app to avoid mis-detection across multiple lockfiles
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
