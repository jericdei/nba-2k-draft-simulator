import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.nba2kapi.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
