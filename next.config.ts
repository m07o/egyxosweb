import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  reactStrictMode: false,

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "a.ltrbxd.com",
      },
      {
        protocol: "https",
        hostname: "s.ltrbxd.com",
      },
      {
        protocol: "https",
        hostname: "vidsrc.xyz",
      },
      {
        protocol: "https",
        hostname: "vidsrc.to",
      },
      {
        protocol: "https",
        hostname: "multiembed.mov",
      },
      {
        protocol: "https",
        hostname: "moviesapi.club",
      },
      {
        protocol: "https",
        hostname: "embed.su",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
