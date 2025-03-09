import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.xhscdn.com",
      },
      {
        protocol: "http",
        hostname: "**.xhscdn.com",
      },
    ],
  },
};

export default nextConfig;
