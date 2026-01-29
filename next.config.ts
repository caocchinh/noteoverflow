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

  devIndicators: {
    position: "bottom-right",
  },
};

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev({ persist: true });

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
