import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
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
    ];
  },
};

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev({ persist: true });

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
