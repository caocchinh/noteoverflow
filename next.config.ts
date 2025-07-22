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
  redirects() {
    return Promise.resolve([
      {
        source: "/admin",
        destination: "/admin/content/upload",
        permanent: true,
      },
      {
        source: "/admin/content",
        destination: "/admin/content/upload",
        permanent: true,
      },
    ]);
  },
  devIndicators: {
    position: "bottom-right",
  },
};

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev({ persist: true });

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
