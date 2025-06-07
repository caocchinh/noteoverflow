import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import queueCache from "@opennextjs/cloudflare/overrides/queue/queue-cache";
import doShardedTagCache from "@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache";
import { purgeCache } from "@opennextjs/cloudflare/overrides/cache-purge/index";

export default defineCloudflareConfig({
  // Keep R2 with regional cache for optimal performance
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: "long-lived",
    shouldLazilyUpdateOnCacheHit: true,
  }),

  // Keep queue with cache for efficient revalidation
  queue: queueCache(doQueue, {
    regionalCacheTtlSec: 10,
  }),

  // Replace D1 with sharded DO tag cache for higher scalability
  tagCache: doShardedTagCache({
    baseShardSize: 12,
    regionalCache: true,
    regionalCacheTtlSec: 10,
    shardReplication: {
      numberOfSoftReplicas: 4,
      numberOfHardReplicas: 2,
    },
  }),

  // Disable the cache interception for Partial Prerendering
  enableCacheInterception: false,

  // Add cache purge for automatic clearing on revalidation
  cachePurge: purgeCache({ type: "direct" }),
});
