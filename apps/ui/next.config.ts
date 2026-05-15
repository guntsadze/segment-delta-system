import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  compress: true,
  reactCompiler: true,
};

export default nextConfig;
