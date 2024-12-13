import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.masqueradeatlanta.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.prestoimages.net',
        pathname: '/store30/rd227/**',
      },
      {
        protocol: 'https',
        hostname: '**', 
        pathname: '/**', 
      },
    ],
  },
};

export default nextConfig;
