import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
  experimental: {
    // see https://nextjs.org/docs/app/api-reference/functions/forbidden
    authInterrupts: true,
  },
};

export default nextConfig;
