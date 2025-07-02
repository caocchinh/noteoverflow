import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import { purgeCache } from '@opennextjs/cloudflare/overrides/cache-purge/index';
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import queueCache from '@opennextjs/cloudflare/overrides/queue/queue-cache';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';

export default defineCloudflareConfig({
  // KV Incremental Cache
  incrementalCache: kvIncrementalCache,

  // Keep queue with cache for efficient revalidation
  queue: queueCache(doQueue, {
    regionalCacheTtlSec: 10,
  }),

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
  cachePurge: purgeCache({ type: 'direct' }),
});
