import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    return [
      // Redirect homepage to maintenance
      {
        source: "/",
        destination: "/maintenance",
        permanent: false,
      },
      // Redirect all topical routes to maintenance
      {
        source: "/topical/:path*",
        destination: "/maintenance",
        permanent: false,
      },
      // Redirect search to maintenance
      {
        source: "/search/:path*",
        destination: "/maintenance",
        permanent: false,
      },
      // Redirect authentication to maintenance
      {
        source: "/authentication/:path*",
        destination: "/maintenance",
        permanent: false,
      },
      // Redirect dashboard to maintenance
      {
        source: "/dashboard/:path*",
        destination: "/maintenance",
        permanent: false,
      },
      // Redirect admin to maintenance
      {
        source: "/admin/:path*",
        destination: "/maintenance",
        permanent: false,
      },
      // Redirect resources to maintenance
      {
        source: "/resources/:path*",
        destination: "/maintenance",
        permanent: false,
      },
      // Redirect disclaimer to maintenance
      {
        source: "/disclaimer",
        destination: "/maintenance",
        permanent: false,
      },
    ];
  },
  devIndicators: {
    position: "bottom-right",
  },
};

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev({ persist: true });

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
