import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
